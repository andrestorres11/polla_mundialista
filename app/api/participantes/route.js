import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const users = await prisma.user.findMany({
    where: { isAdmin: false },
    select: {
      id: true,
      nombre: true,
      email: true,
      empresa: true,
      createdAt: true,
      _count: { select: { pronosticos: true } },
    },
    orderBy: { nombre: 'asc' },
  });

  return NextResponse.json(users);
}

// DELETE (admin only)
export async function DELETE(req) {
  const session = await getSession();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  const { id } = await req.json();
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
