import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

// Max age of a Stripe signature, in seconds (same default as Stripe's SDKs).
const SIGNATURE_TOLERANCE = 300;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

// Verifies the Stripe-Signature header: HMAC-SHA256 of "<timestamp>.<raw body>" with the endpoint secret.
async function verifyStripeSignature(body: string, header: string): Promise<boolean> {
  const parts = header.split(",").map((p) => p.split("="));
  const timestamp = parts.find(([k]) => k === "t")?.[1];
  const signatures = parts.filter(([k]) => k === "v1").map(([, v]) => v);
  if (!timestamp || signatures.length === 0) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > SIGNATURE_TOLERANCE) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(STRIPE_WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${body}`));
  const expected = Array.from(new Uint8Array(mac)).map((b) => b.toString(16).padStart(2, "0")).join("");

  return signatures.some((sig) => {
    if (sig.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
    return diff === 0;
  });
}

serve(async (req) => {
  try {
    if (req.method !== "POST") return new Response("OK", { status: 200 });

    if (!STRIPE_WEBHOOK_SECRET) {
      console.error("STRIPE_WEBHOOK_SECRET is not set");
      return json({ error: "Webhook secret not configured" }, 500);
    }

    const signature = req.headers.get("stripe-signature");
    const body = await req.text();
    if (!signature || !(await verifyStripeSignature(body, signature))) {
      return json({ error: "Invalid signature" }, 400);
    }

    const event = JSON.parse(body);
    if (event.type !== "checkout.session.completed") return json({ received: true });

    const session = event.data.object;
    if (session.payment_status !== "paid") {
      console.log(`Session ${session.id} completed but not paid (${session.payment_status})`);
      return json({ received: true });
    }

    // Set by ModalReserva on the Payment Link: "<eventoId>__<numero>__<categoria>"
    const ref: string | null = session.client_reference_id;
    const [eventoId, numeroStr, categoria] = ref?.split("__") ?? [];
    const numero = parseInt(numeroStr);
    if (!eventoId || !numero || !categoria) {
      console.error(`Session ${session.id} paid without a valid client_reference_id: ${ref}`);
      return json({ received: true });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: existing, error: readError } = await supabase
      .from("mesas")
      .select("estado, stripe_session_id")
      .eq("evento", eventoId)
      .eq("numero", numero)
      .eq("categoria", categoria)
      .maybeSingle();
    if (readError) throw readError;

    if (existing?.estado === "vendida" && existing.stripe_session_id !== session.id) {
      // Someone else already paid for this table (e.g. their hold expired and was re-taken).
      console.error(
        `DOUBLE SALE: ${ref} already sold (session ${existing.stripe_session_id}); new paid session ${session.id}`,
      );
      return json({ received: true, conflict: true });
    }

    const { error: writeError } = await supabase.from("mesas").upsert(
      {
        evento: eventoId,
        numero,
        categoria,
        estado: "vendida",
        nombre: session.customer_details?.name || "",
        email: session.customer_details?.email || "",
        stripe_session_id: session.id,
        monto: (session.amount_total ?? 0) / 100,
        pagado_en: new Date(event.created * 1000).toISOString(),
        expira_en: null,
      },
      { onConflict: "evento,numero,categoria" },
    );
    if (writeError) throw writeError;

    return json({ received: true });
  } catch (err) {
    console.error(err);
    // Non-2xx makes Stripe retry the delivery later.
    return json({ error: (err as Error).message }, 500);
  }
});
