-- Explicit, non-destructive adoption of a reviewed local archive by an account
-- that still has rows in the former per-table sync. The former rows are copied
-- into a private snapshot and remain in place; account_state then freezes them
-- through the already-installed legacy write guards.
begin;

do $preflight$
begin
  if to_regprocedure('progress_private.validate_archive(text)') is null
    or to_regprocedure('progress_private.legacy_has_data(uuid)') is null
    or to_regprocedure('progress_private.receipt(uuid,uuid)') is null
    or to_regclass('progress_private.account_state') is null
    or to_regclass('progress_private.account_receipts') is null
    or to_regclass('progress_private.release_gate') is null then
    raise exception 'progress_adoption_protocol_missing' using errcode='55000';
  end if;
  if to_regclass('progress_private.legacy_adoptions') is not null
    or to_regprocedure('progress_private.adopt_legacy_account(uuid,text,uuid,text,boolean,boolean)') is not null
    or to_regprocedure('public.progress_account_adopt_legacy(uuid,text,uuid,text,boolean,boolean)') is not null then
    raise exception 'progress_adoption_already_installed' using errcode='55000';
  end if;
  if (select count(*) from pg_catalog.pg_trigger
      where not tgisinternal and tgfoid='progress_private.guard_legacy_write()'::regprocedure and tgenabled='O') <> 10 then
    raise exception 'progress_legacy_guards_changed' using errcode='55000';
  end if;
end $preflight$;

create table progress_private.legacy_adoptions (
  user_id uuid primary key,
  operation_id uuid not null unique,
  committed_revision uuid not null unique,
  archive_sha256 text not null check (archive_sha256 ~ '^[a-f0-9]{64}$'),
  legacy_snapshot jsonb not null,
  legacy_snapshot_sha256 text not null check (legacy_snapshot_sha256 ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now()
);
alter table progress_private.legacy_adoptions enable row level security;
revoke all on table progress_private.legacy_adoptions from public, anon, authenticated;

create function progress_private.snapshot_legacy(owner_id uuid)
returns jsonb language sql stable set search_path = '' as $snapshot$
  select jsonb_build_object(
    'profiles',coalesce((select jsonb_agg(to_jsonb(x) order by to_jsonb(x)::text) from public.profiles x where x.id=owner_id),'[]'::jsonb),
    'custom_areas',coalesce((select jsonb_agg(to_jsonb(x) order by to_jsonb(x)::text) from public.custom_areas x where x.user_id=owner_id),'[]'::jsonb),
    'custom_subareas',coalesce((select jsonb_agg(to_jsonb(x) order by to_jsonb(x)::text) from public.custom_subareas x where x.user_id=owner_id),'[]'::jsonb),
    'tasks',coalesce((select jsonb_agg(to_jsonb(x) order by to_jsonb(x)::text) from public.tasks x where x.user_id=owner_id),'[]'::jsonb),
    'habits',coalesce((select jsonb_agg(to_jsonb(x) order by to_jsonb(x)::text) from public.habits x where x.user_id=owner_id),'[]'::jsonb),
    'projects',coalesce((select jsonb_agg(to_jsonb(x) order by to_jsonb(x)::text) from public.projects x where x.user_id=owner_id),'[]'::jsonb),
    'quests',coalesce((select jsonb_agg(to_jsonb(x) order by to_jsonb(x)::text) from public.quests x where x.user_id=owner_id),'[]'::jsonb),
    'drafts',coalesce((select jsonb_agg(to_jsonb(x) order by to_jsonb(x)::text) from public.drafts x where x.user_id=owner_id),'[]'::jsonb),
    'cycle_sequences',coalesce((select jsonb_agg(to_jsonb(x) order by to_jsonb(x)::text) from public.cycle_sequences x where x.user_id=owner_id),'[]'::jsonb),
    'sequence_memberships',coalesce((select jsonb_agg(to_jsonb(x) order by to_jsonb(x)::text) from public.sequence_memberships x where x.user_id=owner_id),'[]'::jsonb)
  )
$snapshot$;

create function progress_private.adopt_legacy_account(
  expected_user_id uuid,
  expected_revision text,
  operation_id uuid,
  archive text,
  all_profiles_confirmed boolean,
  legacy_replacement_confirmed boolean
) returns jsonb language plpgsql security definer set search_path = '' as $adopt$
declare
  uid uuid := auth.uid();
  digest text;
  saved progress_private.account_receipts;
  current_row progress_private.account_state;
  next_revision uuid := gen_random_uuid();
  legacy_copy jsonb;
  legacy_digest text;
begin
  if uid is null or expected_user_id is distinct from uid then
    raise exception 'progress_auth_required' using errcode='42501';
  end if;
  if not (select writes_enabled from progress_private.release_gate where singleton) then
    raise exception 'progress_release_closed' using errcode='55000';
  end if;
  if expected_revision is distinct from 'legacy' or operation_id is null
    or all_profiles_confirmed is distinct from true or legacy_replacement_confirmed is distinct from true then
    raise exception 'progress_legacy_consent_required' using errcode='22023';
  end if;
  digest := progress_private.validate_archive(archive);
  perform pg_advisory_xact_lock(hashtextextended(uid::text,72319));

  select * into saved from progress_private.account_receipts
    where user_id=uid and account_receipts.operation_id=adopt_legacy_account.operation_id;
  if found then
    if saved.archive_sha256 <> digest or saved.expected_revision <> 'legacy' then
      raise exception 'progress_operation_reused' using errcode='22023';
    end if;
    return progress_private.receipt(uid,operation_id);
  end if;

  select * into current_row from progress_private.account_state where user_id=uid;
  if found then raise exception 'progress_revision_conflict' using errcode='40001'; end if;
  if not progress_private.legacy_has_data(uid) then raise exception 'progress_legacy_state_changed' using errcode='40001'; end if;

  legacy_copy := progress_private.snapshot_legacy(uid);
  legacy_digest := encode(pg_catalog.sha256(convert_to(legacy_copy::text,'UTF8')),'hex');
  insert into progress_private.legacy_adoptions(user_id,operation_id,committed_revision,archive_sha256,legacy_snapshot,legacy_snapshot_sha256)
    values(uid,operation_id,next_revision,digest,legacy_copy,legacy_digest);
  insert into progress_private.account_state(user_id,revision,archive,archive_sha256)
    values(uid,next_revision,archive,digest);
  insert into progress_private.account_receipts(user_id,operation_id,expected_revision,committed_revision,archive_sha256)
    values(uid,operation_id,'legacy',next_revision,digest);
  return progress_private.receipt(uid,operation_id);
end $adopt$;

create function public.progress_account_adopt_legacy(
  p_expected_user_id uuid,
  p_expected_revision text,
  p_operation_id uuid,
  p_archive text,
  p_all_profiles_confirmed boolean,
  p_legacy_replacement_confirmed boolean
) returns jsonb language sql security invoker set search_path = '' as $public_rpc$
  select progress_private.adopt_legacy_account(
    p_expected_user_id,p_expected_revision,p_operation_id,p_archive,
    p_all_profiles_confirmed,p_legacy_replacement_confirmed
  )
$public_rpc$;

revoke all on function progress_private.snapshot_legacy(uuid),
  progress_private.adopt_legacy_account(uuid,text,uuid,text,boolean,boolean),
  public.progress_account_adopt_legacy(uuid,text,uuid,text,boolean,boolean) from public, anon;
grant execute on function progress_private.adopt_legacy_account(uuid,text,uuid,text,boolean,boolean),
  public.progress_account_adopt_legacy(uuid,text,uuid,text,boolean,boolean) to authenticated;

comment on table progress_private.legacy_adoptions is 'Private immutable safety snapshot captured before explicit adoption of a complete local archive.';
comment on function public.progress_account_adopt_legacy(uuid,text,uuid,text,boolean,boolean) is 'Explicit non-destructive adoption: snapshots and freezes former table rows, then commits the reviewed complete archive.';

commit;
