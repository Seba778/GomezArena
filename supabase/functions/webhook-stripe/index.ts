import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@20.1.2";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") || "";
const PROJECT_URL = Deno.env.get("PROJECT_URL") || "";
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  try {
    // Si es webhook de Stripe
    if (req.headers.get("stripe-signature")) {
      const body = await req.text();
      const event = JSON.parse(body);

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const mesaRef = session.client_reference_id; // e.g. "los-farmerz-2026|21|red"
        if (mesaRef) {
          const parts = mesaRef.split("|");
          const eventoId = parts[0];
          const numero = parseInt(parts[1]);
          const categoria = parts[2];

          const supabase = createClient(PROJECT_URL, SERVICE_ROLE_KEY);
          await supabase.from("mesas").upsert({
            evento: eventoId,
            numero: numero,
            categoria: categoria,
            estado: "vendida",
            nombre: session.customer_details?.name || "",
            email: session.customer_details?.email || "",
          });
        }
      }
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    // Si es un request desde el frontend para crear checkout
    const body = await req.json();
    const { eventoId, numero, categoria, nombre, email } = body;

    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-04-10" as any });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      client_reference_id: `${eventoId}|${numero}|${categoria}`,
      success_url: `https://www.gomezarenaofficial.com/?mesa=${eventoId}-${numero}`,
      cancel_url: `https://www.gomezarenaofficial.com/?mesa=${eventoId}-${numero}`,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Mesa ${numero} - ${categoria}`,
            },
            unit_amount: 70000,
          },
          quantity: 1,
        },
      ],
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
