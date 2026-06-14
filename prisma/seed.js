const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// Grupos y equipos oficiales Mundial 2026 (sorteo 5 dic 2025)
const equipos = [
  { nombre: 'Mexico',                  grupo: 'A', bandera: '\u{1F1F2}\u{1F1FD}' },
  { nombre: 'Sudafrica',               grupo: 'A', bandera: '\u{1F1FF}\u{1F1E6}' },
  { nombre: 'Corea del Sur',           grupo: 'A', bandera: '\u{1F1F0}\u{1F1F7}' },
  { nombre: 'Chequia',                 grupo: 'A', bandera: '\u{1F1E8}\u{1F1FF}' },
  { nombre: 'Canada',                  grupo: 'B', bandera: '\u{1F1E8}\u{1F1E6}' },
  { nombre: 'Bosnia y Herzegovina',    grupo: 'B', bandera: '\u{1F1E7}\u{1F1E6}' },
  { nombre: 'Qatar',                   grupo: 'B', bandera: '\u{1F1F6}\u{1F1E6}' },
  { nombre: 'Suiza',                   grupo: 'B', bandera: '\u{1F1E8}\u{1F1ED}' },
  { nombre: 'Brasil',                  grupo: 'C', bandera: '\u{1F1E7}\u{1F1F7}' },
  { nombre: 'Marruecos',               grupo: 'C', bandera: '\u{1F1F2}\u{1F1E6}' },
  { nombre: 'Haiti',                   grupo: 'C', bandera: '\u{1F1ED}\u{1F1F9}' },
  { nombre: 'Escocia',                 grupo: 'C', bandera: '\u{1F3F4}' },
  { nombre: 'Estados Unidos',          grupo: 'D', bandera: '\u{1F1FA}\u{1F1F8}' },
  { nombre: 'Paraguay',                grupo: 'D', bandera: '\u{1F1F5}\u{1F1FE}' },
  { nombre: 'Australia',               grupo: 'D', bandera: '\u{1F1E6}\u{1F1FA}' },
  { nombre: 'Turquia',                 grupo: 'D', bandera: '\u{1F1F9}\u{1F1F7}' },
  { nombre: 'Alemania',                grupo: 'E', bandera: '\u{1F1E9}\u{1F1EA}' },
  { nombre: 'Curazao',                 grupo: 'E', bandera: '\u{1F1E8}\u{1F1FC}' },
  { nombre: 'Costa de Marfil',         grupo: 'E', bandera: '\u{1F1E8}\u{1F1EE}' },
  { nombre: 'Ecuador',                 grupo: 'E', bandera: '\u{1F1EA}\u{1F1E8}' },
  { nombre: 'Paises Bajos',            grupo: 'F', bandera: '\u{1F1F3}\u{1F1F1}' },
  { nombre: 'Japon',                   grupo: 'F', bandera: '\u{1F1EF}\u{1F1F5}' },
  { nombre: 'Suecia',                  grupo: 'F', bandera: '\u{1F1F8}\u{1F1EA}' },
  { nombre: 'Tunisia',                 grupo: 'F', bandera: '\u{1F1F9}\u{1F1F3}' },
  { nombre: 'Belgica',                 grupo: 'G', bandera: '\u{1F1E7}\u{1F1EA}' },
  { nombre: 'Egipto',                  grupo: 'G', bandera: '\u{1F1EA}\u{1F1EC}' },
  { nombre: 'Iran',                    grupo: 'G', bandera: '\u{1F1EE}\u{1F1F7}' },
  { nombre: 'Nueva Zelanda',           grupo: 'G', bandera: '\u{1F1F3}\u{1F1FF}' },
  { nombre: 'Espana',                  grupo: 'H', bandera: '\u{1F1EA}\u{1F1F8}' },
  { nombre: 'Cabo Verde',              grupo: 'H', bandera: '\u{1F1E8}\u{1F1FB}' },
  { nombre: 'Arabia Saudita',          grupo: 'H', bandera: '\u{1F1F8}\u{1F1E6}' },
  { nombre: 'Uruguay',                 grupo: 'H', bandera: '\u{1F1FA}\u{1F1FE}' },
  { nombre: 'Francia',                 grupo: 'I', bandera: '\u{1F1EB}\u{1F1F7}' },
  { nombre: 'Senegal',                 grupo: 'I', bandera: '\u{1F1F8}\u{1F1F3}' },
  { nombre: 'Irak',                    grupo: 'I', bandera: '\u{1F1EE}\u{1F1F6}' },
  { nombre: 'Noruega',                 grupo: 'I', bandera: '\u{1F1F3}\u{1F1F4}' },
  { nombre: 'Argentina',               grupo: 'J', bandera: '\u{1F1E6}\u{1F1F7}' },
  { nombre: 'Argelia',                 grupo: 'J', bandera: '\u{1F1E9}\u{1F1FF}' },
  { nombre: 'Austria',                 grupo: 'J', bandera: '\u{1F1E6}\u{1F1F9}' },
  { nombre: 'Jordania',                grupo: 'J', bandera: '\u{1F1EF}\u{1F1F4}' },
  { nombre: 'Portugal',                grupo: 'K', bandera: '\u{1F1F5}\u{1F1F9}' },
  { nombre: 'Congo RD',                grupo: 'K', bandera: '\u{1F1E8}\u{1F1E9}' },
  { nombre: 'Uzbekistan',              grupo: 'K', bandera: '\u{1F1FA}\u{1F1FF}' },
  { nombre: 'Colombia',                grupo: 'K', bandera: '\u{1F1E8}\u{1F1F4}' },
  { nombre: 'Inglaterra',              grupo: 'L', bandera: '\u{1F3F4}' },
  { nombre: 'Croacia',                 grupo: 'L', bandera: '\u{1F1ED}\u{1F1F7}' },
  { nombre: 'Ghana',                   grupo: 'L', bandera: '\u{1F1EC}\u{1F1ED}' },
  { nombre: 'Panama',                  grupo: 'L', bandera: '\u{1F1F5}\u{1F1E6}' },
];

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

async function main() {
  console.log('Limpiando base de datos...');
  await prisma.pronostico.deleteMany();
  await prisma.partido.deleteMany();
  await prisma.equipo.deleteMany();

  console.log('Creando admin...');
  const adminPass = await bcrypt.hash('admin2026', 10);
  await prisma.user.upsert({
    where: { email: 'admin@polla.com' },
    update: {},
    create: { nombre: 'Administrador', email: 'admin@polla.com', password: adminPass, isAdmin: true },
  });

  console.log('Creando equipos...');
  for (const eq of equipos) {
    await prisma.equipo.create({ data: eq });
  }

  const allEquipos = await prisma.equipo.findMany();
  const eMap = {};
  allEquipos.forEach(e => { eMap[e.nombre] = e.id; });

  console.log('Creando partidos...');
  let ok = 0, fail = 0;
  for (const m of partidos) {
    const localId = eMap[m.local];
    const visitaId = eMap[m.visita];
    if (!localId || !visitaId) {
      console.warn('  No encontrado:', m.local, 'vs', m.visita);
      fail++;
      continue;
    }
    await prisma.partido.create({
      data: { fase: 'Grupos', grupo: m.grupo, localId, visitaId, fechaHora: new Date(m.fecha), estadio: m.estadio },
    });
    ok++;
  }
  console.log(`Partidos: ${ok} ok, ${fail} fallidos`);
  console.log('Seed completo!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
