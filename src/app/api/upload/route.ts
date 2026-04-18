// Handles file uploads — writes to public/demo/uploads/ during hackathon (R2 when R2_BUCKET is set)
// TODO §5: implement multipart form parsing + storage
import { NextResponse } from "next/server";

export async function POST() {
  // TODO §5: parse FormData, store file, return { id, kind, bytes, storage_key }
  return NextResponse.json({ error: "Not yet implemented" }, { status: 501 });
}
