import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { calcularPuntos } from '@/lib/utils';

// GET /api/admin/pronosticos?userId=N  -> todos los pronosticos de un usuario
export async function GET(req) {
  const session = await getSession();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const userId = parseInt(searchParams.get('userId'));
  if (!userId) {
    return NextResponse.json({ error: 'userId requerido' }, { status: 400 });
  }

  // Todos los partidos con el pronostico de este usuario (si existe)
  const partidos = await prisma.partido.findMany({
    include: {
      equipoLocal: true,
      equipoVisita: true,
      pronosticos: { where: { userId } },
    },
    orderBy: [{ grupo: 'asc' }, { fechaHora: 'asc' }],
  });

  return NextResponse.json(partidos);
}

// PUT /api/admin/pronosticos -> crear/editar el pronostico de un usuario para un partido
export async function PUT(req) {
  const session = await getSession();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const { userId, partidoId, golesLocal, golesVisita } = await req.json();

    if (!userId || !partidoId) {
      return NextResponse.json({ error: 'userId y partidoId requeridos' }, { status: 400 });
    }
    if (golesLocal < 0 || golesVisita < 0) {
      return NextResponse.json({ error: 'Goles invalidos' }, { status: 400 });
    }

    // Calcular puntos si el partido ya tiene resultado
    const partido = await prisma.partido.findUnique({ where: { id: partidoId } });
    if (!partido) return NextResponse.json({ error: 'Partido no encontrado' }, { status: 404 });

    let puntos = 0;
    if (partido.jugado && partido.golesLocal !== null) {
      puntos = calcularPuntos(
        { golesLocal, golesVisita },
        { golesLocal: partido.golesLocal, golesVisita: partido.golesVisita }
      );
    }

    const pron = await prisma.pronostico.upsert({
      where: { userId_partidoId: { userId, partidoId } },
      update: { golesLocal, golesVisita, puntos },
      create: { userId, partidoId, golesLocal, golesVisita, puntos },
    });

    return NextResponse.json({ ok: true, pronostico: pron });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error al guardar' }, { status: 500 });
  }
}

// DELETE /api/admin/pronosticos -> eliminar un pronostico
export async function DELETE(req) {
  const session = await getSession();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const { userId, partidoId } = await req.json();
    await prisma.pronostico.deleteMany({ where: { userId, partidoId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}
