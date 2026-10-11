-- Additive repair for databases whose membership order exists only in payload.
begin;
alter table public.sequence_memberships
  add column if not exists position integer not null default 0;
update public.sequence_memberships
set position = (payload->>'position')::integer
where jsonb_typeof(payload->'position') = 'number'
  and (payload->>'position') ~ '^[0-9]{1,9}$'
  and position is distinct from (payload->>'position')::integer;
notify pgrst, 'reload schema';
commit;
