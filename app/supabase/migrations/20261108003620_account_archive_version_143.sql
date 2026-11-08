-- Additive producer allowlist only. No data, gate, grants or scoring changes.
-- Atomic replacement of the exact reviewed v142 validator, with its ACL retained.
begin;
do $upgrade$
declare definition text;
begin
  if not exists(select 1 from pg_catalog.pg_proc where oid='progress_private.validate_archive(text)'::regprocedure
    and not prosecdef and proconfig=array['search_path=""'] and provolatile='i'
    and encode(pg_catalog.sha256(convert_to(prosrc,'UTF8')),'hex')='bf63b6461cbbeea06a401940c68ddf957f73ffe1f8bd8782a5f482fbbea47080') then
    raise exception 'progress_validator_revision_changed' using errcode='55000';
  end if;
  definition := pg_catalog.pg_get_functiondef('progress_private.validate_archive(text)'::regprocedure);
  if length(definition)-length(replace(definition,'|141|142)$','')) <> length('|141|142)$') then
    raise exception 'progress_validator_allowlist_changed' using errcode='55000';
  end if;
  execute replace(definition,'|141|142)$','|141|142|143)$');
end $upgrade$;
commit;
