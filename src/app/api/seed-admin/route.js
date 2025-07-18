import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST() {
  const existing = await prisma.adminUser.findUnique({
    where: { username: "admin" },
  });
  if (!existing) {
    const passwordHash = await bcrypt.hash("trio123", 10);
    await prisma.adminUser.create({
      data: { username: "admin", passwordHash },
    });
    return NextResponse.json({ seeded: true });
  }
  return NextResponse.json({ seeded: false, message: "Admin already exists" });
}
