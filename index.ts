// Código para rodar no servidor (Edge Function)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Evita erros de CORS (Permite que seu site chame a API)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { numero, mensagem, gateway_url, gateway_key, instancia } =
      await req.json();

    // Formata o número (garante que tenha o @s.whatsapp.net se o gateway exigir)
    const remoteJid = numero.includes('@') ? numero : `${numero}@s.whatsapp.net`;

    const res = await fetch(`${gateway_url}/message/sendText/${instancia}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": gateway_key,
      },
      body: JSON.stringify({
        number: remoteJid,
        text: mensagem,
        linkPreview: true,
        delay: 1200 // Pequeno delay interno no servidor
      }),
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
