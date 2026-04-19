import { NextResponse } from "next/server";
import { getAllLeads } from "@/lib/wa-leads-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ leads: getAllLeads() });
}
