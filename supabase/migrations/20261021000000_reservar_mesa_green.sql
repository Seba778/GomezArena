-- Adds the 'green' category (tables 81–100). Only the function changes; no rows are touched.
-- create or replace keeps the existing grants (execute stays revoked from anon/authenticated).
create or replace function public.reservar_mesa(
  p_evento text,
  p_numero int,
  p_categoria text,
  p_nombre text,
  p_email text
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  ok boolean;
begin
  if p_categoria not in ('red', 'blue', 'green') or p_numero is null then
    return false;
  end if;

  insert into mesas (evento, numero, categoria, estado, nombre, email, expira_en)
  values (p_evento, p_numero, p_categoria, 'reservada', left(p_nombre, 200), left(p_email, 200),
          now() + interval '15 minutes')
  on conflict (evento, numero, categoria) do update
    set estado = 'reservada',
        nombre = excluded.nombre,
        email = excluded.email,
        expira_en = excluded.expira_en
    -- Only take over an expired hold; sold/blocked/active holds are left untouched.
    where mesas.estado = 'reservada' and mesas.expira_en < now()
  returning true into ok;

  return coalesce(ok, false);
end;
$$;
