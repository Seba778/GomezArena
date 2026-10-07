import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        },
      });
    }

    if (req.headers.get("stripe-signature")) {
      const body = await req.text();
      const event = JSON.parse(body);

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const mesaRef = session.client_reference_id; // Expected: eventoId|numero|categoria
        if (mesaRef) {
          const parts = mesaRef.split("|");
          const eventoId = parts[0];
          const numero = parseInt(parts[1]);
          const categoria = parts[2];

          const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
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
        },
      });
    }

    return new Response("OK", { status: 200 });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
