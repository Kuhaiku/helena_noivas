import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  // Destrói o carimbo de acesso
  response.cookies.delete("admin_session");
  return response;
}