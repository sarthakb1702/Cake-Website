import { NextResponse } from "next/server";

export async function PUT() {
  return NextResponse.json({ error: "Route removed" }, { status: 404 });
}
