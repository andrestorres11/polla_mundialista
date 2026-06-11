import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { calcularPuntos } from '@/lib/utils';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const partidos = await prisma.partido.findMany({
    include: {
      equipoLocal: true,
      equipoVisita: true,
      pronosticos: {
        where: { userId: session.id },
      },
    },
    orderBy: { fechaHora: 'asc' },
  });

  return NextResponse.json(partidos);
}

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { partidoId, golesLocal, golesVisita, campeonId } = await req.json();

    if (golesLocal < 0 || golesVisita < 0) {
      return NextResponse.json({ error: 'Goles no pueden ser negativos' }, { status: 400 });
    }

    // Check match hasn't started
    const partido = await prisma.partido.findUnique({ where: { id: partidoId } });
    if (!partido) return NextResponse.json({ error: 'Partido no encontrado' }, { status: 404 });

    const now = new Date();
    if (partido.jugado || new Date(partido.fechaHora) <= now) {
      return NextResponse.json({ error: 'No se puede modificar un pronostico de partido ya iniciado' }, { status: 400 });
    }

    // Calculate points if result exists
    let puntos = 0;
    if (partido.jugado && partido.golesLocal !== null) {
      puntos = calcularPuntos(
        { golesLocal, golesVisita },
        { golesLocal: partido.golesLocal, golesVisita: partido.golesVisita }
      );
    }

    const pron = await prisma.pronostico.upsert({
      where: { userId_partidoId: { userId: session.id, partidoId } },
      update: { golesLocal, golesVisita, campeonId: campeonId || null, puntos },
      create: { userId: session.id, partidoId, golesLocal, golesVisita, campeonId: campeonId || null, puntos },
    });

    return NextResponse.json(pron);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error al guardar pronostico' }, { status: 500 });
  }
}
