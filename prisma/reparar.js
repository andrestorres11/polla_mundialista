// SCRIPT DE REPARACION - NO DESTRUCTIVO
// - Crea equipos que falten (no los borra)
// - Crea partidos que falten / corrige fechas de los existentes
// - Carga resultados reales de partidos ya jugados
// - NO borra pronosticos ni usuarios
// - Recalcula puntos de los pronosticos existentes segun resultados

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function calcularPuntos(pron, res) {
  if (pron.golesLocal === res.golesLocal && pron.golesVisita === res.golesVisita) return 3;
  const gp = pron.golesLocal > pron.golesVisita ? 'L' : pron.golesLocal < pron.golesVisita ? 'V' : 'E';
  const gr = res.golesLocal > res.golesVisita ? 'L' : res.golesLocal < res.golesVisita ? 'V' : 'E';
  return gp === gr ? 1 : 0;
}

const equipos = [
  ['Mexico','A'],['Sudafrica','A'],['Corea del Sur','A'],['Chequia','A'],
  ['Canada','B'],['Bosnia y Herzegovina','B'],['Qatar','B'],['Suiza','B'],
  ['Brasil','C'],['Marruecos','C'],['Haiti','C'],['Escocia','C'],
  ['Estados Unidos','D'],['Paraguay','D'],['Australia','D'],['Turquia','D'],
  ['Alemania','E'],['Curazao','E'],['Costa de Marfil','E'],['Ecuador','E'],
  ['Paises Bajos','F'],['Japon','F'],['Suecia','F'],['Tunisia','F'],
  ['Belgica','G'],['Egipto','G'],['Iran','G'],['Nueva Zelanda','G'],
  ['Espana','H'],['Cabo Verde','H'],['Arabia Saudita','H'],['Uruguay','H'],
  ['Francia','I'],['Senegal','I'],['Irak','I'],['Noruega','I'],
  ['Argentina','J'],['Argelia','J'],['Austria','J'],['Jordania','J'],
  ['Portugal','K'],['Congo RD','K'],['Uzbekistan','K'],['Colombia','K'],
  ['Inglaterra','L'],['Croacia','L'],['Ghana','L'],['Panama','L'],
];

// Partidos con fecha UTC correcta (ET+4)
const partidos = [
  { grupo:'A', local:'Mexico', visita:'Sudafrica', fecha:'2026-06-11T19:00:00Z', estadio:"Estadio Azteca, Ciudad de Mexico" },
  { grupo:'A', local:'Corea del Sur', visita:'Chequia', fecha:'2026-06-12T02:00:00Z', estadio:"Estadio Akron, Guadalajara" },
  { grupo:'B', local:'Canada', visita:'Bosnia y Herzegovina', fecha:'2026-06-12T19:00:00Z', estadio:"BMO Field, Toronto" },
  { grupo:'D', local:'Estados Unidos', visita:'Paraguay', fecha:'2026-06-13T01:00:00Z', estadio:"SoFi Stadium, Los Angeles" },
  { grupo:'C', local:'Haiti', visita:'Escocia', fecha:'2026-06-14T01:00:00Z', estadio:"Gillette Stadium, Boston" },
  { grupo:'D', local:'Australia', visita:'Turquia', fecha:'2026-06-14T01:00:00Z', estadio:"BC Place, Vancouver" },
  { grupo:'C', local:'Brasil', visita:'Marruecos', fecha:'2026-06-13T22:00:00Z', estadio:"MetLife Stadium, Nueva York" },
  { grupo:'B', local:'Qatar', visita:'Suiza', fecha:'2026-06-13T19:00:00Z', estadio:"Levis Stadium, San Francisco" },
  { grupo:'E', local:'Costa de Marfil', visita:'Ecuador', fecha:'2026-06-14T23:00:00Z', estadio:"Lincoln Financial Field, Filadelfia" },
  { grupo:'E', local:'Alemania', visita:'Curazao', fecha:'2026-06-14T17:00:00Z', estadio:"NRG Stadium, Houston" },
  { grupo:'F', local:'Paises Bajos', visita:'Japon', fecha:'2026-06-14T20:00:00Z', estadio:"AT&T Stadium, Dallas" },
  { grupo:'F', local:'Suecia', visita:'Tunisia', fecha:'2026-06-15T02:00:00Z', estadio:"Estadio BBVA, Monterrey" },
  { grupo:'H', local:'Arabia Saudita', visita:'Uruguay', fecha:'2026-06-15T22:00:00Z', estadio:"Hard Rock Stadium, Miami" },
  { grupo:'H', local:'Espana', visita:'Cabo Verde', fecha:'2026-06-15T16:00:00Z', estadio:"Mercedes-Benz Stadium, Atlanta" },
  { grupo:'G', local:'Iran', visita:'Nueva Zelanda', fecha:'2026-06-16T01:00:00Z', estadio:"SoFi Stadium, Los Angeles" },
  { grupo:'G', local:'Belgica', visita:'Egipto', fecha:'2026-06-15T19:00:00Z', estadio:"Lumen Field, Seattle" },
  { grupo:'I', local:'Francia', visita:'Senegal', fecha:'2026-06-16T19:00:00Z', estadio:"MetLife Stadium, Nueva York" },
  { grupo:'I', local:'Irak', visita:'Noruega', fecha:'2026-06-16T22:00:00Z', estadio:"Gillette Stadium, Boston" },
  { grupo:'J', local:'Argentina', visita:'Argelia', fecha:'2026-06-17T01:00:00Z', estadio:"Arrowhead Stadium, Kansas City" },
  { grupo:'J', local:'Austria', visita:'Jordania', fecha:'2026-06-16T16:00:00Z', estadio:"Levis Stadium, San Francisco" },
  { grupo:'L', local:'Ghana', visita:'Panama', fecha:'2026-06-17T23:00:00Z', estadio:"BMO Field, Toronto" },
  { grupo:'L', local:'Inglaterra', visita:'Croacia', fecha:'2026-06-17T20:00:00Z', estadio:"AT&T Stadium, Dallas" },
  { grupo:'K', local:'Portugal', visita:'Congo RD', fecha:'2026-06-17T17:00:00Z', estadio:"NRG Stadium, Houston" },
  { grupo:'K', local:'Uzbekistan', visita:'Colombia', fecha:'2026-06-18T02:00:00Z', estadio:"Estadio Azteca, Ciudad de Mexico" },
  { grupo:'A', local:'Chequia', visita:'Sudafrica', fecha:'2026-06-18T16:00:00Z', estadio:"Mercedes-Benz Stadium, Atlanta" },
  { grupo:'B', local:'Suiza', visita:'Bosnia y Herzegovina', fecha:'2026-06-18T19:00:00Z', estadio:"SoFi Stadium, Los Angeles" },
  { grupo:'B', local:'Canada', visita:'Qatar', fecha:'2026-06-18T22:00:00Z', estadio:"BC Place, Vancouver" },
  { grupo:'A', local:'Mexico', visita:'Corea del Sur', fecha:'2026-06-19T01:00:00Z', estadio:"Estadio Akron, Guadalajara" },
  { grupo:'C', local:'Brasil', visita:'Haiti', fecha:'2026-06-20T00:30:00Z', estadio:"Lincoln Financial Field, Filadelfia" },
  { grupo:'C', local:'Escocia', visita:'Marruecos', fecha:'2026-06-19T22:00:00Z', estadio:"Gillette Stadium, Boston" },
  { grupo:'D', local:'Turquia', visita:'Paraguay', fecha:'2026-06-20T03:00:00Z', estadio:"Levis Stadium, San Francisco" },
  { grupo:'D', local:'Estados Unidos', visita:'Australia', fecha:'2026-06-19T19:00:00Z', estadio:"Lumen Field, Seattle" },
  { grupo:'E', local:'Alemania', visita:'Costa de Marfil', fecha:'2026-06-20T20:00:00Z', estadio:"BMO Field, Toronto" },
  { grupo:'E', local:'Ecuador', visita:'Curazao', fecha:'2026-06-21T00:00:00Z', estadio:"Arrowhead Stadium, Kansas City" },
  { grupo:'F', local:'Paises Bajos', visita:'Suecia', fecha:'2026-06-20T17:00:00Z', estadio:"NRG Stadium, Houston" },
  { grupo:'F', local:'Tunisia', visita:'Japon', fecha:'2026-06-20T16:00:00Z', estadio:"Estadio BBVA, Monterrey" },
  { grupo:'H', local:'Uruguay', visita:'Cabo Verde', fecha:'2026-06-21T22:00:00Z', estadio:"Hard Rock Stadium, Miami" },
  { grupo:'H', local:'Espana', visita:'Arabia Saudita', fecha:'2026-06-21T16:00:00Z', estadio:"Mercedes-Benz Stadium, Atlanta" },
  { grupo:'G', local:'Belgica', visita:'Iran', fecha:'2026-06-21T19:00:00Z', estadio:"SoFi Stadium, Los Angeles" },
  { grupo:'G', local:'Nueva Zelanda', visita:'Egipto', fecha:'2026-06-22T01:00:00Z', estadio:"BC Place, Vancouver" },
  { grupo:'I', local:'Noruega', visita:'Senegal', fecha:'2026-06-23T00:00:00Z', estadio:"MetLife Stadium, Nueva York" },
  { grupo:'I', local:'Francia', visita:'Irak', fecha:'2026-06-22T21:00:00Z', estadio:"Lincoln Financial Field, Filadelfia" },
  { grupo:'J', local:'Argentina', visita:'Austria', fecha:'2026-06-22T17:00:00Z', estadio:"AT&T Stadium, Dallas" },
  { grupo:'J', local:'Jordania', visita:'Argelia', fecha:'2026-06-23T03:00:00Z', estadio:"Levis Stadium, San Francisco" },
  { grupo:'L', local:'Inglaterra', visita:'Ghana', fecha:'2026-06-23T20:00:00Z', estadio:"Gillette Stadium, Boston" },
  { grupo:'L', local:'Panama', visita:'Croacia', fecha:'2026-06-23T23:00:00Z', estadio:"BMO Field, Toronto" },
  { grupo:'K', local:'Portugal', visita:'Uzbekistan', fecha:'2026-06-23T17:00:00Z', estadio:"NRG Stadium, Houston" },
  { grupo:'K', local:'Colombia', visita:'Congo RD', fecha:'2026-06-24T02:00:00Z', estadio:"Estadio Akron, Guadalajara" },
  { grupo:'C', local:'Escocia', visita:'Brasil', fecha:'2026-06-24T22:00:00Z', estadio:"Hard Rock Stadium, Miami" },
  { grupo:'C', local:'Marruecos', visita:'Haiti', fecha:'2026-06-24T22:00:00Z', estadio:"Mercedes-Benz Stadium, Atlanta" },
  { grupo:'B', local:'Suiza', visita:'Canada', fecha:'2026-06-24T19:00:00Z', estadio:"BC Place, Vancouver" },
  { grupo:'B', local:'Bosnia y Herzegovina', visita:'Qatar', fecha:'2026-06-24T19:00:00Z', estadio:"Lumen Field, Seattle" },
  { grupo:'A', local:'Chequia', visita:'Mexico', fecha:'2026-06-25T01:00:00Z', estadio:"Estadio Azteca, Ciudad de Mexico" },
  { grupo:'A', local:'Sudafrica', visita:'Corea del Sur', fecha:'2026-06-25T01:00:00Z', estadio:"Estadio BBVA, Monterrey" },
  { grupo:'E', local:'Curazao', visita:'Costa de Marfil', fecha:'2026-06-25T20:00:00Z', estadio:"Lincoln Financial Field, Filadelfia" },
  { grupo:'E', local:'Ecuador', visita:'Alemania', fecha:'2026-06-25T20:00:00Z', estadio:"MetLife Stadium, Nueva York" },
  { grupo:'F', local:'Japon', visita:'Suecia', fecha:'2026-06-25T23:00:00Z', estadio:"AT&T Stadium, Dallas" },
  { grupo:'F', local:'Tunisia', visita:'Paises Bajos', fecha:'2026-06-25T23:00:00Z', estadio:"Arrowhead Stadium, Kansas City" },
  { grupo:'D', local:'Turquia', visita:'Estados Unidos', fecha:'2026-06-26T02:00:00Z', estadio:"SoFi Stadium, Los Angeles" },
  { grupo:'D', local:'Paraguay', visita:'Australia', fecha:'2026-06-26T02:00:00Z', estadio:"Levis Stadium, San Francisco" },
  { grupo:'I', local:'Noruega', visita:'Francia', fecha:'2026-06-26T19:00:00Z', estadio:"Gillette Stadium, Boston" },
  { grupo:'I', local:'Senegal', visita:'Irak', fecha:'2026-06-26T19:00:00Z', estadio:"BMO Field, Toronto" },
  { grupo:'G', local:'Egipto', visita:'Iran', fecha:'2026-06-27T03:00:00Z', estadio:"Lumen Field, Seattle" },
  { grupo:'G', local:'Nueva Zelanda', visita:'Belgica', fecha:'2026-06-27T03:00:00Z', estadio:"BC Place, Vancouver" },
  { grupo:'H', local:'Cabo Verde', visita:'Arabia Saudita', fecha:'2026-06-27T00:00:00Z', estadio:"NRG Stadium, Houston" },
  { grupo:'H', local:'Uruguay', visita:'Espana', fecha:'2026-06-27T00:00:00Z', estadio:"Estadio Akron, Guadalajara" },
  { grupo:'L', local:'Panama', visita:'Inglaterra', fecha:'2026-06-27T21:00:00Z', estadio:"MetLife Stadium, Nueva York" },
  { grupo:'L', local:'Croacia', visita:'Ghana', fecha:'2026-06-27T21:00:00Z', estadio:"Lincoln Financial Field, Filadelfia" },
  { grupo:'J', local:'Argelia', visita:'Austria', fecha:'2026-06-28T02:00:00Z', estadio:"Arrowhead Stadium, Kansas City" },
  { grupo:'J', local:'Jordania', visita:'Argentina', fecha:'2026-06-28T02:00:00Z', estadio:"AT&T Stadium, Dallas" },
  { grupo:'K', local:'Colombia', visita:'Portugal', fecha:'2026-06-27T23:30:00Z', estadio:"Hard Rock Stadium, Miami" },
  { grupo:'K', local:'Congo RD', visita:'Uzbekistan', fecha:'2026-06-27T23:30:00Z', estadio:"Mercedes-Benz Stadium, Atlanta" },
];

// Resultados reales ya jugados
const resultados = [
  ['Mexico','Sudafrica',2,0],
  ['Corea del Sur','Chequia',2,1],
  ['Canada','Bosnia y Herzegovina',1,1],
  ['Estados Unidos','Paraguay',4,1],
  ['Qatar','Suiza',1,1],
  ['Brasil','Marruecos',1,1],
];

async function main() {
  console.log('=== REPARACION NO DESTRUCTIVA ===\n');

  // 1. Equipos (crea los que falten)
  const eqExist = await prisma.equipo.findMany();
  const eMap = {};
  eqExist.forEach(e => { eMap[e.nombre] = e.id; });
  let eqCreados = 0;
  for (const [nombre, grupo] of equipos) {
    if (!eMap[nombre]) {
      const nuevo = await prisma.equipo.create({ data: { nombre, grupo } });
      eMap[nombre] = nuevo.id;
      eqCreados++;
    }
  }
  console.log(`Equipos: ${eqCreados} creados, ${eqExist.length} ya existian`);

  // 2. Partidos (crea faltantes, corrige fecha de existentes)
  let pCreados = 0, pActualizados = 0;
  for (const m of partidos) {
    const localId = eMap[m.local], visitaId = eMap[m.visita];
    if (!localId || !visitaId) { console.warn('  Equipo faltante:', m.local, m.visita); continue; }

    const existe = await prisma.partido.findFirst({
      where: { localId, visitaId },
    });
    if (existe) {
      await prisma.partido.update({
        where: { id: existe.id },
        data: { fechaHora: new Date(m.fecha), estadio: m.estadio, grupo: m.grupo },
      });
      pActualizados++;
    } else {
      await prisma.partido.create({
        data: { fase: 'Grupos', grupo: m.grupo, localId, visitaId, fechaHora: new Date(m.fecha), estadio: m.estadio },
      });
      pCreados++;
    }
  }
  console.log(`Partidos: ${pCreados} creados, ${pActualizados} con fecha corregida`);

  // 3. Cargar resultados reales + recalcular puntos
  let rCargados = 0;
  for (const [local, visita, gl, gv] of resultados) {
    const localId = eMap[local], visitaId = eMap[visita];
    const partido = await prisma.partido.findFirst({ where: { localId, visitaId } });
    if (!partido) { console.warn('  Partido no hallado:', local, visita); continue; }

    await prisma.partido.update({
      where: { id: partido.id },
      data: { golesLocal: gl, golesVisita: gv, jugado: true },
    });

    // Recalcular puntos de pronosticos existentes
    const prons = await prisma.pronostico.findMany({ where: { partidoId: partido.id } });
    for (const p of prons) {
      const pts = calcularPuntos(
        { golesLocal: p.golesLocal, golesVisita: p.golesVisita },
        { golesLocal: gl, golesVisita: gv }
      );
      await prisma.pronostico.update({ where: { id: p.id }, data: { puntos: pts } });
    }
    rCargados++;
    console.log(`  ${local} ${gl}-${gv} ${visita} (${prons.length} pronosticos recalculados)`);
  }
  console.log(`\nResultados cargados: ${rCargados}`);

  const totalP = await prisma.partido.count();
  const totalPron = await prisma.pronostico.count();
  console.log(`\n=== ESTADO FINAL ===`);
  console.log(`Total partidos: ${totalP}`);
  console.log(`Total pronosticos: ${totalPron}`);
  console.log('Reparacion completa!');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());