// GET?bank_id= → ranked leads | POST { lead_id, action } → log event
// TODO §9: implement matching engine + lead actions
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const bankId = url.searchParams.get("bank_id");
  if (!bankId) return NextResponse.json({ error: "bank_id required" }, { status: 400 });
  return NextResponse.json({ leads: [] });
}

export async function POST(req: Request) {
  const body = await req.json() as { lead_id?: string; action?: string };
  if (!body.lead_id || !body.action) return NextResponse.json({ error: "lead_id + action required" }, { status: 400 });
  return NextResponse.json({ status: "ok" });
}
