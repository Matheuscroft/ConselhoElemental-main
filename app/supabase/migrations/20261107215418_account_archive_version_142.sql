-- Additive producer allowlist only. No data, gate, grants or scoring changes.
-- Atomic replacement of the exact reviewed v141 validator, with its ACL retained.
begin;
do $upgrade$
declare definition text;
begin
  if not exists(select 1 from pg_catalog.pg_proc where oid='progress_private.validate_archive(text)'::regprocedure
    and not prosecdef and proconfig=array['search_path=""'] and provolatile='i'
    and encode(pg_catalog.sha256(convert_to(prosrc,'UTF8')),'hex')='1e6fb1d65b71b6110ec305b310cfe01c10e627d3d6d6c7fa047f791c18045dda') then
    raise exception 'progress_validator_revision_changed' using errcode='55000';
  end if;
  definition := pg_catalog.pg_get_functiondef('progress_private.validate_archive(text)'::regprocedure);
  if length(definition)-length(replace(definition,'|140|141)$','')) <> length('|140|141)$') then
    raise exception 'progress_validator_allowlist_changed' using errcode='55000';
  end if;
  execute replace(definition,'|140|141)$','|140|141|142)$');
end $upgrade$;
commit;
