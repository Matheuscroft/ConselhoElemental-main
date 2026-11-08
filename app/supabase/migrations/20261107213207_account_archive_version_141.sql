-- Additive producer allowlist only. No data, gate, grants or scoring changes.
-- Atomic replacement of the exact reviewed v140 validator, with its ACL retained.
begin;
do $upgrade$
declare definition text;
begin
  if not exists(select 1 from pg_catalog.pg_proc where oid='progress_private.validate_archive(text)'::regprocedure
    and not prosecdef and proconfig=array['search_path=""'] and provolatile='i'
    and encode(pg_catalog.sha256(convert_to(prosrc,'UTF8')),'hex')='1a9eb5c670d494c12e66fae716146588352e97e83349638a3c476b9cc4f94a04') then
    raise exception 'progress_validator_revision_changed' using errcode='55000';
  end if;
  definition := pg_catalog.pg_get_functiondef('progress_private.validate_archive(text)'::regprocedure);
  if length(definition)-length(replace(definition,'|139|140)$','')) <> length('|139|140)$') then
    raise exception 'progress_validator_allowlist_changed' using errcode='55000';
  end if;
  execute replace(definition,'|139|140)$','|139|140|141)$');
end $upgrade$;
commit;
