-- Tables are only marked 'vendida' by the Stripe webhook after payment.
-- The website can only create a temporary hold ('reservada') through reservar_mesa().

alter table public.mesas
  add column if not exists expira_en timestamptz,
  add column if not exists stripe_session_id text,
  add column if not exists monto numeric,
  add column if not exists pagado_en timestamptz;

-- One row per table per event (required by the upserts / on conflict below).
create unique index if not exists mesas_evento_numero_categoria_key
  on public.mesas (evento, numero, categoria);

-- Permissions: visitors may only read availability, never customer data, and never write directly.
drop policy if exists mesas_insertar_anon on public.mesas;
drop policy if exists mesas_lectura_public on public.mesas; -- duplicate of mesas_lectura_anon

revoke all on public.mesas from anon, authenticated;
grant select (evento, numero, categoria, estado, expira_en) on public.mesas to anon, authenticated;

-- Places a 15-minute hold on a table. Returns false if the table is sold, blocked or held by someone else.
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
  if p_categoria not in ('red', 'blue') or p_numero is null then
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

revoke all on function public.reservar_mesa(text, int, text, text, text) from public;
grant execute on function public.reservar_mesa(text, int, text, text, text) to anon, authenticated;
