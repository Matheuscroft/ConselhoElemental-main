-- LOCAL CANDIDATE ONLY: consolidated reviewed upgrade 122 -> 135; F6-N02, not applied.
-- Reviewed producer 135, same archive schema and no progress rewrite.
-- Apply only over the reviewed validator while account writes remain closed.
begin;
do $$
begin
  -- 122 is the hosted baseline; 134 is the archived sequential-review fixture.
  if not exists(select 1 from pg_catalog.pg_proc where oid='progress_private.validate_archive(text)'::regprocedure
    and not prosecdef and proconfig=array['search_path=""'] and provolatile='i'
    and encode(pg_catalog.sha256(convert_to(prosrc,'UTF8')),'hex') in ('a1673918e5294ced9b1f5e17f2cac08e0bddf681f3a6ba8fed2cc9bf565216cb','d8f101650671d67a0a4f39e5207d13ea093c23f6d28d6a71812f690d658ac66a')) then
    raise exception 'progress_validator_revision_changed' using errcode='55000';
  end if;
  if not (select count(*)=1 and bool_and(not writes_enabled) from progress_private.release_gate) then
    raise exception 'progress_validator_release_must_remain_closed' using errcode='55000';
  end if;
  if exists(select 1 from (values
      ('progress_private.commit_account(uuid,text,uuid,text,boolean)','5ca23de1ce879c2f7156dcc053c22513f0ae036096c2afe9f9d4a55f6911f3b2',true,true),
      ('progress_private.compact_json(json,integer)','4a3082acc8ceb282c55db4fc439d9b145da49524921f939abdd970788b30c3a1',false,false),
      ('progress_private.guard_legacy_write()','98e6780038307408ceba29fcfd2346ec3d88953ae0247220fa64cda3cc0ac4c9',false,true),
      ('progress_private.legacy_has_data(uuid)','9070bf147d76b11128dca8e7f613297582cb8a5046d272b51a4abfc96e3f5cc2',false,false),
      ('progress_private.read_account(uuid)','197508415352ad2cee5b5552d62a171af0fdad4cba6dcd267867d06deda3b7f1',true,true),
      ('progress_private.receipt(uuid,uuid)','3f1391bc263d433c2d9d5cf872cd0150a613438d5f2a6caf2544e50d5e17e0e4',true,true),
      ('public.progress_account_commit(uuid,text,uuid,text,boolean)','b08e3296f15abebb58ff652e7f5e5021fa527b08a80d093eca7c78ea4bae016e',true,false),
      ('public.progress_account_read(uuid)','c2e9ab2de8fea49c37dc4cefe1af46f810fde233d9f7d9646e4f1f05d58d9491',true,false),
      ('public.progress_account_receipt(uuid,uuid)','9e284feaf600a0735622b3349ad34952e51bc84adbf3b556c9ffab95bf9bf122',true,false)
    ) as expected(signature,sha256,auth_execute,definer)
    left join pg_catalog.pg_proc p on p.oid=to_regprocedure(expected.signature)
    where p.oid is null or encode(pg_catalog.sha256(convert_to(p.prosrc,'UTF8')),'hex')<>expected.sha256
      or p.prosecdef<>expected.definer or p.proconfig is distinct from array['search_path=""']
      or has_function_privilege('anon',p.oid,'EXECUTE')
      or has_function_privilege('authenticated',p.oid,'EXECUTE')<>expected.auth_execute
      or exists(select 1 from aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a where a.grantee=0 and a.privilege_type='EXECUTE')) then
    raise exception 'progress_protocol_revision_changed' using errcode='55000';
  end if;
  if has_function_privilege('anon','progress_private.validate_archive(text)','EXECUTE')
    or has_function_privilege('authenticated','progress_private.validate_archive(text)','EXECUTE')
    or exists(select 1 from pg_proc p, lateral aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a where p.oid='progress_private.validate_archive(text)'::regprocedure and a.grantee=0 and a.privilege_type='EXECUTE')
    or has_schema_privilege('anon','progress_private','USAGE')
    or (select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='progress_private' and c.relkind='r' and c.relname in ('account_state','account_receipts','release_gate') and c.relrowsecurity)<>3
    or exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='progress_private' and c.relkind='r' and c.relname in ('account_state','account_receipts','release_gate')
      and (has_table_privilege('anon',c.oid,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') or has_table_privilege('authenticated',c.oid,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER'))) then
    raise exception 'progress_private_access_changed' using errcode='55000';
  end if;
  if (select count(*) from pg_trigger where not tgisinternal and tgfoid='progress_private.guard_legacy_write()'::regprocedure)<>10
    or (select count(*) from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace
      where not t.tgisinternal and t.tgfoid='progress_private.guard_legacy_write()'::regprocedure and t.tgenabled='O' and t.tgtype=31
      and t.tgname='progress_account_write_guard' and n.nspname='public'
      and c.relname in ('profiles','custom_areas','custom_subareas','drafts','tasks','habits','projects','quests','cycle_sequences','sequence_memberships'))<>10 then
    raise exception 'progress_legacy_guards_changed' using errcode='55000';
  end if;
end $$;
create or replace function progress_private.validate_archive(raw text)
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
    or jsonb_typeof(b->'appVersion') is distinct from 'string' or coalesce(b->>'appVersion','') !~ '^0[.]1[.](8[5-9]|9[0-9]|100|101|102|103|104|105|106|107|108|109|110|111|112|113|114|115|116|117|118|119|120|121|122|123|124|125|126|127|128|129|130|131|132|133|134|135)$'
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

commit;
