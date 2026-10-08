# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

VIP table booking site for events at Gomez Western Wear Arena (Mesquite, TX). React 19 + Vite + Tailwind 3 frontend, Supabase (Postgres + one Edge Function) backend, Stripe Payment Links for checkout, deployed on Vercel. The README and code identifiers are in Spanish (`eventos`, `mesas`, `vendida`, `bloqueada`); user-facing UI text is in English.

## Commands

```bash
npm install
npm run dev        # Vite dev server
npm run build      # production build to dist/
npm run lint       # ESLint (flat config, eslint.config.js)
npm run preview    # serve the built dist/
supabase functions deploy webhook-stripe   # deploy the Edge Function
```

There is no test suite.

Env vars (`.env`, see `.env.example`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. `src/lib/supabase.js` falls back to hardcoded project values when they're unset.

## Architecture

- **Routing** (`src/App.jsx`): `/` is the landing page (`MainLanding`), `/success` is the post-payment page (`src/Success.jsx`). `vercel.json` rewrites every path to `index.html` so client-side routing works.
- **Event data is currently hardcoded** in `MainLanding` in `App.jsx` (comment: "EVENT HARDCODED FOR TESTING"). The `useEventos` hook (`src/hooks/useEventos.js`) reads active events from the Supabase `eventos` table. It's imported but not used. If you add or change an event, update the hardcoded array, or switch back to the hook.
- **Event shape uses red/blue categories** (`precio_red`, `mesas_red`, `link_red`, and the same for blue). The README's "add an event" steps still describe the older gold/silver fields. `ModalReserva` only understands `red`/`blue`.
- **Booking flow** (`src/components/ModalReserva.jsx`):
  1. Polls the Supabase `mesas` table every 3s for the event's rows. A table counts as unavailable if `estado` is `vendida` or `bloqueada`, or `reservada` with `expira_en` in the future. Anon can only read the columns `evento, numero, categoria, estado, expira_en`, never customer data, so don't `select('*')`.
  2. Table numbers come from fixed ranges: red is 21–40 and blue is 41–60 (`i + 21` / `i + 41`, length from `mesas_red`/`mesas_blue`, default 20).
  3. On confirm, it calls the `reservar_mesa` RPC, which places a 15-minute `reservada` hold and returns false if the table is taken. Then it redirects to the event's static Stripe Payment Link with `client_reference_id=<evento>__<numero>__<categoria>` and `prefilled_email`. The browser can't write to `mesas` directly.
- **Admin operations** (adding events, blocking tables, viewing sales) are done by hand in the Supabase Table Editor. See the README. A blocked table is a `mesas` row with `estado = bloqueada`, and deleting the row unblocks it.
- **`supabase/functions/webhook-stripe`** (Deno) is the only thing that marks tables `vendida`. It verifies the Stripe signature with the `STRIPE_WEBHOOK_SECRET` secret. On a paid `checkout.session.completed`, it parses `client_reference_id` (`__`-separated) and upserts the row with buyer name/email, `stripe_session_id`, `monto` and `pagado_en`. It logs `DOUBLE SALE` if the table was already sold to another session. `verify_jwt = false` is set in `supabase/config.toml`, because Stripe calls it without a Supabase JWT.
- **`Success.jsx`** reads `type`, `eventId`, `number`, `cat` from the query string and maps them through hardcoded `EVENTS_INFO` / `EVENTS_DATE` / `CATEGORY_NAMES` lookup tables. These need manual updates for new events.
- `supabase/migrations/` only has the changes made from this repo onward. The base `mesas`/`eventos` tables were created by hand in the hosted project.
- Static assets (flyers, table maps) live in `public/` and are referenced by root path, e.g. `evento.flyer` → `/${flyer}`. The table map image in `ModalReserva` is hardcoded to `/mesas-losfarmerz.jpg`.
- `dist/` is local build output and is gitignored.
