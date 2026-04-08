/**
 * WhatsApp Business Cloud API endpoint.
 *
 * To enable real sending:
 *   1. Set output: "hybrid" in astro.config.mjs and add @astrojs/node adapter.
 *   2. Add to .env:
 *        WHATSAPP_TOKEN=<Meta permanent token>
 *        WHATSAPP_PHONE_ID=<Phone Number ID from Meta Business dashboard>
 *
 * In static/demo mode (no adapter or no env vars) this endpoint is unreachable
 * and WhatsAppPanel falls back to a simulated "sent" state.
 */
export const prerender = false;

import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  const body = (await request.json()) as { phone?: unknown; message?: unknown };
  const phone = String(body.phone ?? "").replace(/\D/g, "");
  const message = String(body.message ?? "").trim();

  if (!phone || !message) {
    return new Response(
      JSON.stringify({ ok: false, error: "phone and message are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const token = import.meta.env.WHATSAPP_TOKEN as string | undefined;
  const phoneId = import.meta.env.WHATSAPP_PHONE_ID as string | undefined;

  // Demo mode: no credentials configured
  if (!token || !phoneId) {
    return new Response(JSON.stringify({ ok: true, demo: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${phoneId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: { body: message },
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    return new Response(JSON.stringify({ ok: false, error: err }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
};
