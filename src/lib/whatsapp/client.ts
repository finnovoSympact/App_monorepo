// Meta Cloud API client — stubs when WHATSAPP_LIVE !== "1"
const LIVE = process.env.WHATSAPP_LIVE === "1";
const PHONE_ID = process.env.WHATSAPP_PHONE_ID ?? "";
const TOKEN = process.env.WHATSAPP_TOKEN ?? "";
const META_URL = `https://graph.facebook.com/v18.0/${PHONE_ID}/messages`;

async function metaPost(payload: Record<string, unknown>): Promise<void> {
  const res = await fetch(META_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messaging_product: "whatsapp", ...payload }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Meta API ${res.status}: ${text}`);
  }
}

export async function sendText(to: string, text: string): Promise<void> {
  if (!LIVE) {
    console.log(`[WhatsApp stub] → ${to}: ${text}`);
    return;
  }
  await metaPost({ to, type: "text", text: { body: text, preview_url: false } });
}

export async function sendButtons(to: string, body: string, buttons: string[]): Promise<void> {
  if (!LIVE) {
    console.log(`[WhatsApp stub] → ${to} buttons:`, buttons);
    return;
  }
  await metaPost({
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: body },
      action: {
        buttons: buttons.slice(0, 3).map((b, i) => ({
          type: "reply",
          reply: { id: `btn_${i}`, title: b.slice(0, 20) },
        })),
      },
    },
  });
}

export async function markAsRead(messageId: string): Promise<void> {
  if (!LIVE) return;
  await metaPost({ status: "read", message_id: messageId });
}

