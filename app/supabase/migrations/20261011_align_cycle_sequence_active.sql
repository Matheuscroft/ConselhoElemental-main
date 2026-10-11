-- Compatibilidade aditiva para tabelas existentes antes do schema de sequências.
-- CREATE TABLE IF NOT EXISTS não adiciona colunas a tabelas já criadas.
begin;

alter table public.cycle_sequences
  add column if not exists is_active boolean not null default true;

-- Preserva o estado real, inclusive rotações pausadas, guardado no payload.
update public.cycle_sequences
set is_active = (payload ->> 'isActive')::boolean
where jsonb_typeof(payload -> 'isActive') = 'boolean'
  and is_active is distinct from (payload ->> 'isActive')::boolean;

notify pgrst, 'reload schema';
commit;
