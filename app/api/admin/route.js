import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { calcularPuntos } from '@/lib/utils';

// PUT /api/admin/resultado - Update match result
export async function PUT(req) {
  const session = await getSession();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const { partidoId, golesLocal, golesVisita } = await req.json();

    // Update the match
    const partido = await prisma.partido.update({
      where: { id: partidoId },
      data: { golesLocal, golesVisita, jugado: true },
    });

    // Recalculate all predictions for this match
    const pronosticos = await prisma.pronostico.findMany({
      where: { partidoId },
    });

    for (const pron of pronosticos) {
      const puntos = calcularPuntos(
        { golesLocal: pron.golesLocal, golesVisita: pron.golesVisita },
        { golesLocal, golesVisita }
      );
      await prisma.pronostico.update({
        where: { id: pron.id },
        data: { puntos },
      });
    }

    return NextResponse.json({ ok: true, partido, updated: pronosticos.length });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error actualizando resultado' }, { status: 500 });
  }
}

// GET /api/admin/resultado - Get all matches for admin
export async function GET() {
  const session = await getSession();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const partidos = await prisma.partido.findMany({
    include: {
      equipoLocal: true,
      equipoVisita: true,
      _count: { select: { pronosticos: true } },
    },
    orderBy: { fechaHora: 'asc' },
  });

  return NextResponse.json(partidos);
}
