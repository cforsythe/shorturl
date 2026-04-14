import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const link = await prisma.shortLink.findUnique({ where: { code } });

  if (!link) {
    return new NextResponse(`Short code '${code}' not found`, { status: 404 });
  }

  return NextResponse.redirect(link.url, { status: 302 });
}
