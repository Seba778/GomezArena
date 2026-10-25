import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") || "";

const SITE_URL = "https://www.gomezarenaofficial.com";

// Prices are defined here (server side) so they can't be changed from the browser. Amounts in cents.
// Only events with activo: true can be bought. Keep it in sync with activo in App.jsx.
const EVENTOS: Record<
  string,
  {
    nombre: string;
    activo: boolean;
    categorias: Record<string, { label: string; precio: number; desde: number; hasta: number }>;
  }
> = {
  "los-farmerz-2026": {
    nombre: "Los Farmerz Stage",
    activo: false,
    categorias: {
      red: { label: "Red Table", precio: 70000, desde: 21, hasta: 40 },
      blue: { label: "Blue Table", precio: 60000, desde: 41, hasta: 80 },
      green: { label: "Green Table", precio: 50000, desde: 81, hasta: 100 },
    },
  },
};

// Stripe's minimum session lifetime is 30 minutes. The table hold outlives the session by a
// small buffer, so a table can never be re-sold while its checkout can still be paid.
const CHECKOUT_MINUTES = 31;
const HOLD_BUFFER_MINUTES = 5;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    if (!STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY is not set");
      return json({ error: "server" }, 500);
    }

    const { evento, numero, categoria } = await req.json();
    const ev = EVENTOS[evento];
    const cat = ev?.categorias[categoria];
    const n = Number(numero);
    if (!ev || !ev.activo || !cat || !Number.isInteger(n) || n < cat.desde || n > cat.hasta) {
      return json({ error: "invalid" }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const mesa = { evento, numero: n, categoria };

    // Atomic: only one buyer can hold a table; fails if it's sold, blocked or held by someone else.
    const { data: reserved, error: holdError } = await supabase.rpc("reservar_mesa", {
      p_evento: evento,
      p_numero: n,
      p_categoria: categoria,
      p_nombre: null,
      p_email: null,
    });
    if (holdError) throw holdError;
    if (!reserved) return json({ error: "taken" }, 409);

    const expiresAt = Math.floor(Date.now() / 1000) + CHECKOUT_MINUTES * 60;
    const params = new URLSearchParams({
      mode: "payment",
      client_reference_id: `${evento}__${n}__${categoria}`,
      expires_at: String(expiresAt),
      allow_promotion_codes: "true",
      billing_address_collection: "required",
      "phone_number_collection[enabled]": "true",
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": "usd",
      "line_items[0][price_data][unit_amount]": String(cat.precio),
      "line_items[0][price_data][product_data][name]": `${cat.label} #${n} - ${ev.nombre}`,
      "metadata[evento]": evento,
      "metadata[numero]": String(n),
      "metadata[categoria]": categoria,
      success_url: `${SITE_URL}/success?type=mesa&eventId=${evento}&number=${n}&cat=${categoria}`,
      cancel_url: `${SITE_URL}/#eventos`,
    });

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });
    const session = await res.json();

    if (!res.ok) {
      console.error("Stripe error:", session.error?.message);
      // Release the hold we just took so the table isn't blocked for nothing.
      await supabase.from("mesas").delete().match({ ...mesa, estado: "reservada" });
      return json({ error: "stripe" }, 502);
    }

    // Tie the hold to this checkout session and keep it until the session can no longer be paid.
    const { error: linkError } = await supabase
      .from("mesas")
      .update({
        stripe_session_id: session.id,
        expira_en: new Date((expiresAt + HOLD_BUFFER_MINUTES * 60) * 1000).toISOString(),
      })
      .match({ ...mesa, estado: "reservada" });
    if (linkError) throw linkError;

    return json({ url: session.url });
  } catch (err) {
    console.error(err);
    return json({ error: "server" }, 500);
  }
});
