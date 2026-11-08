-- Additive producer allowlist only. No data, gate, grants or scoring changes.
-- Atomic replacement of the exact reviewed v143 validator, with its ACL retained.
begin;
do $upgrade$
declare definition text;
begin
  if not exists(select 1 from pg_catalog.pg_proc where oid='progress_private.validate_archive(text)'::regprocedure
    and not prosecdef and proconfig=array['search_path=""'] and provolatile='i'
    and encode(pg_catalog.sha256(convert_to(prosrc,'UTF8')),'hex')='35514778593a6cd20ec4c73cab93f7604f7f58b6711d30e5e1a28eff5efbceb6') then
    raise exception 'progress_validator_revision_changed' using errcode='55000';
  end if;
  definition := pg_catalog.pg_get_functiondef('progress_private.validate_archive(text)'::regprocedure);
  if length(definition)-length(replace(definition,'|142|143)$','')) <> length('|142|143)$') then
    raise exception 'progress_validator_allowlist_changed' using errcode='55000';
  end if;
  execute replace(definition,'|142|143)$','|142|143|144)$');
end $upgrade$;
commit;
