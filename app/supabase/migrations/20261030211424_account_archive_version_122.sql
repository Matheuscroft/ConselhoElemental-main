-- Reviewed producer 122, same archive schema and no progress rewrite.
-- Apply only over the reviewed validator while account writes remain closed.
begin;
do $$
begin
  if not exists(select 1 from pg_catalog.pg_proc where oid='progress_private.validate_archive(text)'::regprocedure
    and encode(pg_catalog.sha256(convert_to(prosrc,'UTF8')),'hex')='25abb9a4660a380cc09d76f5859804c2335997f70dcc841b53e4b424ffb67275') then
    raise exception 'progress_validator_revision_changed' using errcode='55000';
  end if;
  if not (select count(*)=1 and bool_and(not writes_enabled) from progress_private.release_gate) then
    raise exception 'progress_validator_release_must_remain_closed' using errcode='55000';
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
    or jsonb_typeof(b->'appVersion') is distinct from 'string' or coalesce(b->>'appVersion','') !~ '^0[.]1[.](8[5-9]|9[0-9]|100|101|102|103|104|105|106|107|108|109|110|111|112|113|114|115|116|117|118|119|120|121|122)$'
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
