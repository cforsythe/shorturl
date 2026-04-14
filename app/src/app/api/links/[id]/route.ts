import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const body = await req.json();
  const code = (body.code ?? "").trim();
  const url = (body.url ?? "").trim();

  if (!code || !url) {
    return NextResponse.json(
      { error: "code and url are required" },
      { status: 400 }
    );
  }

  try {
    const link = await prisma.shortLink.update({
      where: { id: numId },
      data: { code, url },
    });
    return NextResponse.json(link);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Record to update not found")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    if (msg.includes("Unique constraint")) {
      return NextResponse.json(
        { error: `code '${code}' already exists` },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  try {
    await prisma.shortLink.delete({ where: { id: numId } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
