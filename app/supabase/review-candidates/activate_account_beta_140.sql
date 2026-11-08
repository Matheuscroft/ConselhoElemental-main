-- F6-N10: owner-controlled activation, requested by the user on 2026-11-07.
-- Apply only AFTER archive compatibility140 and reviewed client verification.
-- No domain data, credentials, users or policies are modified.
begin;
do $$
begin
  if not exists(select 1 from pg_proc where oid='progress_private.validate_archive(text)'::regprocedure
    and encode(sha256(convert_to(prosrc,'UTF8')),'hex')='1a9eb5c670d494c12e66fae716146588352e97e83349638a3c476b9cc4f94a04') then
    raise exception 'progress_beta_validator_not_reviewed';
  end if;
  if (select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace
      where n.nspname='progress_private' and c.relname in ('account_state','account_receipts','release_gate') and c.relrowsecurity)<>3
    or exists(select 1 from information_schema.role_table_grants where table_schema='progress_private' and grantee in ('anon','authenticated','PUBLIC')) then
    raise exception 'progress_beta_private_access_changed';
  end if;
  if (select count(*) from pg_trigger where not tgisinternal and tgfoid='progress_private.guard_legacy_write()'::regprocedure and tgenabled='O')<>10 then
    raise exception 'progress_beta_legacy_guards_changed';
  end if;
  if not (select count(*)=1 and bool_and(not writes_enabled) from progress_private.release_gate) then
    raise exception 'progress_beta_gate_changed';
  end if;
  update progress_private.release_gate set writes_enabled=true where singleton and not writes_enabled;
end $$;
commit;
