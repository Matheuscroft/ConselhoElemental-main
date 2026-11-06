-- Explicit opt-in only. One complete persist archive becomes authoritative for
-- an associated user; legacy rows stay untouched and cannot remain active writers.
-- No XP calculation, completion replay, automatic migration or data deletion.
-- DO NOT release writes until a matching complete-read/bootstrap client is accepted.
begin;
-- Installation only: check the dependencies actually used by this contract.
-- Legacy installations may legitimately differ in other columns. Never replay
-- the initial schema or overwrite an existing integral-progress installation.
do $$
declare legacy_name text; owner_column text; relation_id oid;
begin
  if to_regnamespace('progress_private') is not null
    or exists(select 1 from pg_catalog.pg_proc p join pg_catalog.pg_namespace n on n.oid=p.pronamespace
      where n.nspname='public' and p.proname in ('progress_account_read','progress_account_receipt','progress_account_commit')) then
    raise exception 'progress_installation_exists' using errcode='55000';
  end if;
  if to_regprocedure('auth.uid()') is null
    or to_regprocedure('pg_catalog.sha256(bytea)') is null
    or not exists(select 1 from pg_catalog.pg_roles where rolname='anon')
    or not exists(select 1 from pg_catalog.pg_roles where rolname='authenticated') then
    raise exception 'progress_installation_dependencies' using errcode='55000';
  end if;
  foreach legacy_name in array array['profiles','custom_areas','custom_subareas','tasks','habits','projects','quests','drafts','cycle_sequences','sequence_memberships'] loop
    relation_id := to_regclass(format('public.%I',legacy_name));
    owner_column := case when legacy_name='profiles' then 'id' else 'user_id' end;
    if relation_id is null
      or not exists(select 1 from pg_catalog.pg_class where oid=relation_id and relkind='r' and relrowsecurity)
      or not exists(select 1 from pg_catalog.pg_attribute where attrelid=relation_id and attname=owner_column
        and atttypid='pg_catalog.uuid'::regtype and attnotnull and not attisdropped)
      or exists(select 1 from pg_catalog.pg_trigger where tgrelid=relation_id and tgname='progress_account_write_guard') then
      raise exception 'progress_installation_incompatible: %',legacy_name using errcode='55000';
    end if;
  end loop;
end $$;
create schema progress_private;
revoke all on schema progress_private from public, anon, authenticated;
grant usage on schema progress_private to authenticated;

create table progress_private.release_gate (
  singleton boolean primary key default true check (singleton),
  writes_enabled boolean not null default false
);
insert into progress_private.release_gate(singleton,writes_enabled) values(true,false);
alter table progress_private.release_gate enable row level security;
revoke all on progress_private.release_gate from public, anon, authenticated;

create table progress_private.account_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  revision uuid not null,
  archive text not null check (octet_length(archive) <= 20971520),
  archive_sha256 text not null check (archive_sha256 ~ '^[a-f0-9]{64}$'),
  updated_at timestamptz not null default now()
);
create table progress_private.account_receipts (
  user_id uuid not null references auth.users(id) on delete cascade,
  operation_id uuid not null,
  expected_revision text not null,
  committed_revision uuid not null,
  archive_sha256 text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, operation_id)
);
alter table progress_private.account_state enable row level security;
alter table progress_private.account_receipts enable row level security;
revoke all on progress_private.account_state, progress_private.account_receipts from public, anon, authenticated;

-- Preserve JSON key/array order and original scalar encodings when checking the
-- existing JS archive checksum. jsonb alone would reorder keys and lose this proof.
create function progress_private.compact_json(v json, depth integer default 0)
returns text language plpgsql immutable set search_path = '' as $$
declare result text; kind text := json_typeof(v);
begin
  if depth > 100 then raise exception 'progress_invalid_archive' using errcode='22023'; end if;
  if kind = 'object' then
    if (select count(*) <> count(distinct key) or bool_or(key in ('__proto__','constructor','prototype')) from json_each(v)) then
      raise exception 'progress_invalid_archive' using errcode='22023';
    end if;
    select '{' || coalesce(string_agg(to_json(key)::text || ':' || progress_private.compact_json(value,depth+1), ',' order by n),'') || '}'
      into result from json_each(v) with ordinality as x(key,value,n);
  elsif kind = 'array' then
    select '[' || coalesce(string_agg(progress_private.compact_json(value,depth+1), ',' order by n),'') || ']'
      into result from json_array_elements(v) with ordinality as x(value,n);
  else result := btrim(v::text);
  end if;
  return result;
end $$;

create function progress_private.validate_archive(raw text)
returns text language plpgsql immutable set search_path = '' as $$
declare doc json; b jsonb; compact text; part text; state jsonb; key text;
  core_lists text[] := array['executionLogs','accounts','customAreas','actions','tasks','habits','cycleSequences','sequenceMemberships','commitments','projects','quests','drafts'];
  core_objects text[] := array['accountDataById','user','onboarding','customSubareas','linkedSubareasByAreaId'];
  fields text[];
begin
  if raw is null or octet_length(raw) > 20971520 then raise exception 'invalid'; end if;
  doc := raw::json;
  -- Validates duplicate/unsafe keys and depth across the entire tree as well.
  perform progress_private.compact_json(doc);
  b := doc::jsonb;
  if jsonb_typeof(b) is distinct from 'object' or (select count(*) from jsonb_object_keys(b)) <> 7
    or not b ?& array['format','schemaVersion','appVersion','createdAt','source','stores','checksum']
    or b->>'format' is distinct from 'conselho-elemental-progress' or b->'schemaVersion' is distinct from '1'::jsonb
    or jsonb_typeof(b->'appVersion') is distinct from 'string' or coalesce(b->>'appVersion','') !~ '^0[.]1[.](8[5-9]|9[0-9]|100|101|102|103|104|105|106|107|108|109|110|111|112|113|114|115|116|117|118|119|120)$'
    or jsonb_typeof(b->'createdAt') is distinct from 'string'
    or jsonb_typeof(b->'source') is distinct from 'object' or (select count(*) from jsonb_object_keys(b->'source')) <> 2
    or not (b->'source') ?& array['origin','accountId'] or jsonb_typeof(b#>'{source,origin}') is distinct from 'string'
    or jsonb_typeof(b#>'{source,accountId}') not in ('string','null')
    or jsonb_typeof(b->'stores') is distinct from 'object' or (select count(*) from jsonb_object_keys(b->'stores')) <> 2
    or not (b->'stores') ?& array['core','fitness']
    or jsonb_typeof(b->'checksum') is distinct from 'object' or (select count(*) from jsonb_object_keys(b->'checksum')) <> 2
    or not (b->'checksum') ?& array['algorithm','value'] or b#>>'{checksum,algorithm}' is distinct from 'SHA-256'
    or jsonb_typeof(b#>'{checksum,value}') is distinct from 'string' or coalesce(b#>>'{checksum,value}','') !~ '^[a-f0-9]{64}$' then raise exception 'invalid'; end if;
  perform (b->>'createdAt')::timestamptz;
  foreach part in array array['core','fitness'] loop
    state := b#>array['stores',part];
    if jsonb_typeof(state) is distinct from 'object' or (select count(*) from jsonb_object_keys(state)) <> 3
      or not state ?& array['key','version','state'] or state->'version' is distinct from '0'::jsonb
      or state->>'key' is distinct from (case part when 'core' then 'conselho-elemental-storage' else 'dominio-do-mago-workout-storage-v1' end)
      then raise exception 'invalid'; end if;
    state := state->'state';
    fields := case part when 'core' then core_lists || core_objects || array['currentAccountId'] else array['currentAccountId','accountDataById','nativeDataById'] end;
    if jsonb_typeof(state) is distinct from 'object' or not state ?& fields
      or (select count(*) from jsonb_object_keys(state)) <> cardinality(fields)
      or jsonb_typeof(state->'currentAccountId') not in ('null','string') then raise exception 'invalid'; end if;
    foreach key in array (case part when 'core' then core_lists else array[]::text[] end) loop
      if jsonb_typeof(state->key) is distinct from 'array' then raise exception 'invalid'; end if;
    end loop;
    foreach key in array (case part when 'core' then core_objects else array['accountDataById','nativeDataById'] end) loop
      if jsonb_typeof(state->key) is distinct from 'object' then raise exception 'invalid'; end if;
    end loop;
  end loop;
  if b#>'{source,accountId}' is distinct from b#>'{stores,core,state,currentAccountId}'
    or coalesce(b#>>'{source,accountId}','local') is distinct from b#>>'{stores,fitness,state,currentAccountId}' then raise exception 'invalid'; end if;
  select '{' || string_agg(to_json(x.key)::text || ':' || progress_private.compact_json(x.value), ',' order by x.n) || '}' into compact
    from json_each(doc) with ordinality as x(key,value,n) where x.key <> 'checksum';
  if encode(sha256(convert_to(compact,'UTF8')),'hex') is distinct from b#>>'{checksum,value}' then raise exception 'invalid'; end if;
  return encode(sha256(convert_to(raw,'UTF8')),'hex');
exception when others then raise exception 'progress_invalid_archive' using errcode='22023';
end $$;

create function progress_private.legacy_has_data(owner_id uuid)
returns boolean language sql stable set search_path = '' as $$
  select exists(select 1 from public.tasks where user_id=owner_id)
    or exists(select 1 from public.habits where user_id=owner_id)
    or exists(select 1 from public.projects where user_id=owner_id)
    or exists(select 1 from public.quests where user_id=owner_id)
    or exists(select 1 from public.drafts where user_id=owner_id)
    or exists(select 1 from public.cycle_sequences where user_id=owner_id)
    or exists(select 1 from public.sequence_memberships where user_id=owner_id)
    or exists(select 1 from public.custom_areas where user_id=owner_id)
    or exists(select 1 from public.custom_subareas where user_id=owner_id);
$$;

-- Privileged helpers are private, pinned search_path and owner-bound using auth.uid.
-- They are needed because callers receive no table privileges that bypass CAS/receipts.
create function progress_private.read_account(expected_user_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); row progress_private.account_state;
begin
  if uid is null or expected_user_id is distinct from uid then raise exception 'progress_auth_required' using errcode='42501'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text,72319));
  select * into row from progress_private.account_state where user_id=uid;
  if not found and progress_private.legacy_has_data(uid) then
    return jsonb_build_object('complete',false,'userId',uid,'kind','legacy','revision','legacy');
  end if;
  return jsonb_build_object('complete',true,'userId',uid,'revision',coalesce(row.revision::text,'empty'),
    'kind',case when row.user_id is null then 'empty' else 'snapshot' end,'archive',row.archive,
    'coverage',jsonb_build_object('core',array['executionLogs','accounts','currentAccountId','accountDataById','user','onboarding','customAreas','customSubareas','linkedSubareasByAreaId','actions','tasks','habits','cycleSequences','sequenceMemberships','commitments','projects','quests','drafts'],
      'fitness',array['currentAccountId','accountDataById','nativeDataById']));
end $$;

create function progress_private.receipt(expected_user_id uuid, op uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); r progress_private.account_receipts;
begin
  if uid is null or expected_user_id is distinct from uid then raise exception 'progress_auth_required' using errcode='42501'; end if;
  select * into r from progress_private.account_receipts where user_id=uid and operation_id=op;
  if not found then return null; end if;
  return jsonb_build_object('userId',uid,'operationId',r.operation_id,'revision',r.committed_revision,'archiveSha256',r.archive_sha256,'expectedRevision',r.expected_revision,'createdAt',r.created_at);
end $$;

create function progress_private.commit_account(expected_user_id uuid, expected_revision text, operation_id uuid, archive text, all_profiles_confirmed boolean)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); digest text; saved progress_private.account_receipts; current_row progress_private.account_state; next_revision uuid := gen_random_uuid();
begin
  if uid is null or expected_user_id is distinct from uid then raise exception 'progress_auth_required' using errcode='42501'; end if;
  if not (select writes_enabled from progress_private.release_gate where singleton) then raise exception 'progress_release_closed' using errcode='55000'; end if;
  if all_profiles_confirmed is distinct from true or operation_id is null or expected_revision is null then raise exception 'progress_consent_required' using errcode='22023'; end if;
  digest := progress_private.validate_archive(archive);
  perform pg_advisory_xact_lock(hashtextextended(uid::text,72319));
  select * into saved from progress_private.account_receipts where user_id=uid and account_receipts.operation_id=commit_account.operation_id;
  if found then
    if saved.archive_sha256 <> digest or saved.expected_revision <> commit_account.expected_revision then raise exception 'progress_operation_reused' using errcode='22023'; end if;
    return progress_private.receipt(uid,operation_id);
  end if;
  select * into current_row from progress_private.account_state where user_id=uid;
  if coalesce(current_row.revision::text,'empty') <> expected_revision then raise exception 'progress_revision_conflict' using errcode='40001'; end if;
  if current_row.user_id is null and progress_private.legacy_has_data(uid) then raise exception 'progress_legacy_requires_review' using errcode='55000'; end if;
  insert into progress_private.account_state(user_id,revision,archive,archive_sha256) values(uid,next_revision,archive,digest)
    on conflict(user_id) do update set revision=excluded.revision,archive=excluded.archive,archive_sha256=excluded.archive_sha256,updated_at=now();
  insert into progress_private.account_receipts(user_id,operation_id,expected_revision,committed_revision,archive_sha256)
    values(uid,operation_id,expected_revision,next_revision,digest);
  return progress_private.receipt(uid,operation_id);
end $$;

-- Serialize legacy writes with opt-in. Unassociated users retain existing behavior.
create function progress_private.guard_legacy_write()
returns trigger language plpgsql security definer set search_path = '' as $$
declare owner_id uuid; entry jsonb;
begin
  -- Trusted administrative maintenance/cascade is outside client sync; no session
  -- is deliberately treated as an administrative context only in this trigger.
  if auth.uid() is null then if tg_op='DELETE' then return old; else return new; end if; end if;
  if tg_op <> 'INSERT' then
    entry := to_jsonb(old); owner_id := (entry->>(case when tg_table_name='profiles' then 'id' else 'user_id' end))::uuid;
    perform pg_advisory_xact_lock(hashtextextended(owner_id::text,72319));
    if exists(select 1 from progress_private.account_state where user_id=owner_id) then raise exception 'progress_legacy_write_blocked' using errcode='55000'; end if;
  end if;
  if tg_op <> 'DELETE' then
    entry := to_jsonb(new); owner_id := (entry->>(case when tg_table_name='profiles' then 'id' else 'user_id' end))::uuid;
    perform pg_advisory_xact_lock(hashtextextended(owner_id::text,72319));
    if exists(select 1 from progress_private.account_state where user_id=owner_id) then raise exception 'progress_legacy_write_blocked' using errcode='55000'; end if;
  end if;
  if tg_op='DELETE' then return old; else return new; end if;
end $$;
do $$ declare t text; begin
  foreach t in array array['profiles','custom_areas','custom_subareas','tasks','habits','projects','quests','drafts','cycle_sequences','sequence_memberships'] loop
    execute format('create trigger progress_account_write_guard before insert or update or delete on public.%I for each row execute function progress_private.guard_legacy_write()',t);
  end loop;
end $$;

revoke all on all functions in schema progress_private from public, anon, authenticated;
grant execute on function progress_private.read_account(uuid), progress_private.receipt(uuid,uuid), progress_private.commit_account(uuid,text,uuid,text,boolean) to authenticated;
create function public.progress_account_read(p_expected_user_id uuid) returns jsonb language sql security invoker set search_path='' as $$ select progress_private.read_account(p_expected_user_id) $$;
create function public.progress_account_receipt(p_expected_user_id uuid,p_operation_id uuid) returns jsonb language sql security invoker set search_path='' as $$ select progress_private.receipt(p_expected_user_id,p_operation_id) $$;
create function public.progress_account_commit(p_expected_user_id uuid,p_expected_revision text,p_operation_id uuid,p_archive text,p_all_profiles_confirmed boolean)
returns jsonb language sql security invoker set search_path='' as $$ select progress_private.commit_account(p_expected_user_id,p_expected_revision,p_operation_id,p_archive,p_all_profiles_confirmed) $$;
revoke all on function public.progress_account_read(uuid),public.progress_account_receipt(uuid,uuid),public.progress_account_commit(uuid,text,uuid,text,boolean) from public, anon;
grant execute on function public.progress_account_read(uuid),public.progress_account_receipt(uuid,uuid),public.progress_account_commit(uuid,text,uuid,text,boolean) to authenticated;
comment on function public.progress_account_commit(uuid,text,uuid,text,boolean) is 'Explicit full-profile opt-in; CAS and immutable idempotent receipt. No scoring or legacy replacement.';
commit;
