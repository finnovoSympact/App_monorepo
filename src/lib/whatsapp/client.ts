// Meta Cloud API thin client — all calls are no-ops when WHATSAPP_LIVE !== "1"
// TODO §8: implement sendText / sendButtons / sendTemplate
const LIVE = process.env.WHATSAPP_LIVE === "1";

export async function sendText(to: string, text: string): Promise<void> {
  if (!LIVE) { console.log(`[WhatsApp stub] → ${to}: ${text}`); return; }
  // TODO: axios POST to Meta Cloud API
}

export async function sendButtons(to: string, body: string, buttons: string[]): Promise<void> {
  if (!LIVE) { console.log(`[WhatsApp stub] → ${to} buttons:`, buttons); return; }
}
