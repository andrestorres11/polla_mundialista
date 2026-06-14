// RECONSTRUYE LOS PUNTOS DE ANOCHE (4 partidos jugados)
// NO DESTRUCTIVO: crea pronosticos sinteticos solo para los 4 partidos jugados
// que reproducen EXACTAMENTE los puntos de la tabla, sin alterar otros datos.
//
// IMPORTANTE: Los marcadores son sinteticos (no los reales que cada persona puso),
// pero los PUNTOS totales quedan identicos a la tabla de anoche.

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Resultados reales de los 4 partidos jugados
const RESULTADOS = [
  { local: 'Mexico',          visita: 'Sudafrica',            gl: 2, gv: 0 },
  { local: 'Corea del Sur',   visita: 'Chequia',              gl: 2, gv: 1 },
  { local: 'Canada',          visita: 'Bosnia y Herzegovina', gl: 1, gv: 1 },
  { local: 'Estados Unidos',  visita: 'Paraguay',             gl: 4, gv: 1 },
];

// Plantillas de pronostico por categoria (indexado igual que RESULTADOS)
const EXACTO  = [[2,0],[2,1],[1,1],[4,1]];  // 3 pts
const PARCIAL = [[1,0],[3,0],[2,2],[2,0]];  // 1 pt
const FALLIDO = [[0,2],[0,1],[3,0],[0,1]];  // 0 pts

// Jugadores: nombre exacto + cuantos exactos/parciales/fallidos
const JUGADORES = [
  { nombre: 'andres felipe torres vega', ex: 1, pa: 1, fa: 2 },
  { nombre: 'Zarlock',                   ex: 1, pa: 1, fa: 2 },
  { nombre: 'Damian Gomez',              ex: 1, pa: 1, fa: 2 },
  { nombre: 'Gina torres',               ex: 1, pa: 1, fa: 2 },
  { nombre: 'BASG',                      ex: 0, pa: 2, fa: 2 },
  { nombre: 'Zory Arteaga',              ex: 0, pa: 1, fa: 2 },
  { nombre: 'Tatiana Vega',              ex: 0, pa: 1, fa: 2 },
  { nombre: 'alvaro torres bonilla',     ex: 0, pa: 1, fa: 3 },
  { nombre: 'Darklas',                   ex: 0, pa: 0, fa: 1 },
  { nombre: 'Diana Maria Torres',        ex: 0, pa: 0, fa: 0 },
];

async function main() {
  console.log('=== RECONSTRUCCION DE PUNTOS (no destructivo) ===\n');

  // 1. Asegurar que los 4 partidos tengan su resultado cargado
  const eqs = await prisma.equipo.findMany();
  const eMap = {};
  eqs.forEach(e => { eMap[e.nombre] = e.id; });

  const partidoIds = [];
  for (const r of RESULTADOS) {
    const localId = eMap[r.local], visitaId = eMap[r.visita];
    if (!localId || !visitaId) { console.error('Falta equipo:', r.local, r.visita); process.exit(1); }
    const partido = await prisma.partido.findFirst({ where: { localId, visitaId } });
    if (!partido) { console.error('Falta partido:', r.local, 'vs', r.visita); process.exit(1); }
    await prisma.partido.update({
      where: { id: partido.id },
      data: { golesLocal: r.gl, golesVisita: r.gv, jugado: true },
    });
    partidoIds.push(partido.id);
    console.log(`Partido OK: ${r.local} ${r.gl}-${r.gv} ${r.visita}`);
  }
  console.log('');

  // 2. Buscar cada jugador y crear sus pronosticos sinteticos
  let okJug = 0, faltan = [];
  for (const j of JUGADORES) {
    const user = await prisma.user.findFirst({ where: { nombre: j.nombre } });
    if (!user) { faltan.push(j.nombre); continue; }

    // Construir lista de categorias por partido
    const cats = [];
    for (let i = 0; i < j.ex; i++) cats.push('E');
    for (let i = 0; i < j.pa; i++) cats.push('P');
    for (let i = 0; i < j.fa; i++) cats.push('F');
    // cats tiene length = numero de partidos pronosticados (<=4)

    let puntosTotal = 0;
    for (let idx = 0; idx < cats.length; idx++) {
      const partidoId = partidoIds[idx];
      let marcador, pts;
      if (cats[idx] === 'E')      { marcador = EXACTO[idx];  pts = 3; }
      else if (cats[idx] === 'P') { marcador = PARCIAL[idx]; pts = 1; }
      else                        { marcador = FALLIDO[idx]; pts = 0; }
      puntosTotal += pts;

      await prisma.pronostico.upsert({
        where: { userId_partidoId: { userId: user.id, partidoId } },
        update: { golesLocal: marcador[0], golesVisita: marcador[1], puntos: pts },
        create: { userId: user.id, partidoId, golesLocal: marcador[0], golesVisita: marcador[1], puntos: pts },
      });
    }
    console.log(`${j.nombre}: ${puntosTotal} pts (${cats.length} pronosticos)`);
    okJug++;
  }

  console.log(`\n${okJug} jugadores reconstruidos`);
  if (faltan.length) {
    console.log('\nNO ENCONTRADOS (revisa el nombre exacto en la BD):');
    faltan.forEach(n => console.log('  -', n));
    console.log('\nListado de usuarios en la BD:');
    const all = await prisma.user.findMany({ where: { isAdmin: false }, select: { nombre: true } });
    all.forEach(u => console.log('  *', u.nombre));
  }
  console.log('\nReconstruccion completa!');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());