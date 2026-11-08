-- Additive producer allowlist only. No data, gate, grants or scoring changes.
-- Atomic replacement of the exact reviewed v144 validator, with its ACL retained.
begin;
do $upgrade$
declare definition text;
begin
  if not exists(select 1 from pg_catalog.pg_proc where oid='progress_private.validate_archive(text)'::regprocedure
    and not prosecdef and proconfig=array['search_path=""'] and provolatile='i'
    and encode(pg_catalog.sha256(convert_to(prosrc,'UTF8')),'hex')='a7d8b1f160e36695f218bd8c21dcbcaf3c0b81080306398d73e7573ef3b1939b') then
    raise exception 'progress_validator_revision_changed' using errcode='55000';
  end if;
  definition := pg_catalog.pg_get_functiondef('progress_private.validate_archive(text)'::regprocedure);
  if length(definition)-length(replace(definition,'|142|143|144)$','')) <> length('|142|143|144)$') then
    raise exception 'progress_validator_allowlist_changed' using errcode='55000';
  end if;
  execute replace(definition,'|142|143|144)$','|142|143|144|145)$');
end $upgrade$;
commit;
