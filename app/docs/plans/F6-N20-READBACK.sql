-- Read-only personal verification after the existing adoption attempt.
-- Replace the placeholder with the same Authentication → Users ID used for snapshot_legacy.
with target as (select 'SEU_USER_ID'::uuid as id),
saved as (
  select s.archive, s.archive_sha256, s.archive::jsonb as doc
  from progress_private.account_state s
  join target t on t.id = s.user_id
)
select
  encode(sha256(convert_to(s.archive,'UTF8')),'hex') = s.archive_sha256 as checksum_ok,
  (select count(*) from progress_private.account_receipts r join target t on t.id=r.user_id) as recibos,
  (select count(*) from progress_private.legacy_adoptions a join target t on t.id=a.user_id) as copia_legacy,
  jsonb_array_length(s.doc #> '{stores,core,state,tasks}') as rituais,
  jsonb_array_length(s.doc #> '{stores,core,state,habits}') as ciclos,
  jsonb_array_length(s.doc #> '{stores,core,state,actions}') as acoes,
  jsonb_array_length(s.doc #> '{stores,core,state,executionLogs}') as execucoes,
  jsonb_array_length(s.doc #> '{stores,core,state,cycleSequences}') as sequencias,
  coalesce((s.doc #>> '{stores,core,state,user,xp_earth}')::numeric,0)
    + coalesce((s.doc #>> '{stores,core,state,user,xp_fire}')::numeric,0)
    + coalesce((s.doc #>> '{stores,core,state,user,xp_water}')::numeric,0)
    + coalesce((s.doc #>> '{stores,core,state,user,xp_air}')::numeric,0) as xp,
  (select coalesce(sum(jsonb_array_length(value->'workouts')),0)
   from jsonb_each(s.doc #> '{stores,fitness,state,accountDataById}')) as treinos,
  (select coalesce(sum(jsonb_array_length(value->'sessions')),0)
   from jsonb_each(s.doc #> '{stores,fitness,state,accountDataById}')) as sessoes,
  (select coalesce(sum(jsonb_array_length(value->'nativeHistory')),0)
   from jsonb_each(s.doc #> '{stores,fitness,state,nativeDataById}')) as historico_treinos
from saved s;
