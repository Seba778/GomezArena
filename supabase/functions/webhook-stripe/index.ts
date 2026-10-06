import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PROJECT_URL = Deno.env.get("PROJECT_URL") || "";
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  const body = await req.text();
  try {
    const event = JSON.parse(body);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const clienteEmail = session.customer_details?.email || null;
      const clienteNombre = session.customer_details?.name || null;

      const supabase = createClient(PROJECT_URL, SERVICE_ROLE_KEY);

      // Buscar mesa pendiente por email y evento
      const { data: mesaPendiente } = await supabase
        .from("mesas")
        .select("*")
        .eq("email", clienteEmail)
        .eq("estado", "pendiente_pago")
        .limit(1);

      if (mesaPendiente && mesaPendiente.length > 0) {
        await supabase
          .from("mesas")
          .update({
            estado: "vendida",
            nombre: clienteNombre,
            email: clienteEmail,
          })
          .eq("id", mesaPendiente[0].id);
      } else {
        console.log("No se encontró reserva pendiente para", clienteEmail);
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
