import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const links = await prisma.shortLink.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(links);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const code = (body.code ?? "").trim();
  const url = (body.url ?? "").trim();

  if (!code) {
    return NextResponse.json({ error: "code is required" }, { status: 400 });
  }
  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }
  if (code === "api") {
    return NextResponse.json({ error: "'api' is a reserved code" }, { status: 400 });
  }

  try {
    const link = await prisma.shortLink.create({ data: { code, url } });
    return NextResponse.json(link, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: `code '${code}' already exists` },
      { status: 409 }
    );
  }
}
