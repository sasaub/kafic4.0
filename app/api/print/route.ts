import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Minimalna validacija
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (!body.type || !body.content) {
      return NextResponse.json(
        { error: "Missing fields: type/content" },
        { status: 400 }
      );
    }

    await query("INSERT INTO print_jobs (payload_json) VALUES (?)", [
      JSON.stringify(body),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("PRINT API ERROR:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
