const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const equipos = [
  // Grupo A
  { nombre: 'Mexico',          grupo: 'A', bandera: '🇲🇽' },
  { nombre: 'Estados Unidos',  grupo: 'A', bandera: '🇺🇸' },
  { nombre: 'Canada',          grupo: 'A', bandera: '🇨🇦' },
  { nombre: 'Nueva Zelanda',   grupo: 'A', bandera: '🇳🇿' },
  // Grupo B
  { nombre: 'Argentina',       grupo: 'B', bandera: '🇦🇷' },
  { nombre: 'Chile',           grupo: 'B', bandera: '🇨🇱' },
  { nombre: 'Peru',            grupo: 'B', bandera: '🇵🇪' },
  { nombre: 'Australia',       grupo: 'B', bandera: '🇦🇺' },
  // Grupo C
  { nombre: 'Brasil',          grupo: 'C', bandera: '🇧🇷' },
  { nombre: 'Colombia',        grupo: 'C', bandera: '🇨🇴' },
  { nombre: 'Paraguay',        grupo: 'C', bandera: '🇵🇾' },
  { nombre: 'Ecuador',         grupo: 'C', bandera: '🇪🇨' },
  // Grupo D
  { nombre: 'Francia',         grupo: 'D', bandera: '🇫🇷' },
  { nombre: 'Alemania',        grupo: 'D', bandera: '🇩🇪' },
  { nombre: 'Japon',           grupo: 'D', bandera: '🇯🇵' },
  { nombre: 'Belgica',         grupo: 'D', bandera: '🇧🇪' },
  // Grupo E
  { nombre: 'Espana',          grupo: 'E', bandera: '🇪🇸' },
  { nombre: 'Portugal',        grupo: 'E', bandera: '🇵🇹' },
  { nombre: 'Turquia',         grupo: 'E', bandera: '🇹🇷' },
  { nombre: 'Argelia',         grupo: 'E', bandera: '🇩🇿' },
  // Grupo F
  { nombre: 'Inglaterra',      grupo: 'F', bandera: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { nombre: 'Paises Bajos',    grupo: 'F', bandera: '🇳🇱' },
  { nombre: 'Senegal',         grupo: 'F', bandera: '🇸🇳' },
  { nombre: 'Serbia',          grupo: 'F', bandera: '🇷🇸' },
  // Grupo G
  { nombre: 'Uruguay',         grupo: 'G', bandera: '🇺🇾' },
  { nombre: 'Marruecos',       grupo: 'G', bandera: '🇲🇦' },
  { nombre: 'Arabia Saudita',  grupo: 'G', bandera: '🇸🇦' },
  { nombre: 'Irak',            grupo: 'G', bandera: '🇮🇶' },
  // Grupo H
  { nombre: 'Croacia',         grupo: 'H', bandera: '🇭🇷' },
  { nombre: 'Dinamarca',       grupo: 'H', bandera: '🇩🇰' },
  { nombre: 'Suiza',           grupo: 'H', bandera: '🇨🇭' },
  { nombre: 'Polonia',         grupo: 'H', bandera: '🇵🇱' },
  // Grupo I
  { nombre: 'Italia',          grupo: 'I', bandera: '🇮🇹' },
  { nombre: 'Mexico (I)',       grupo: 'I', bandera: '🇲🇽' },
  { nombre: 'Corea del Sur',   grupo: 'I', bandera: '🇰🇷' },
  { nombre: 'Arabia Saudita (I)', grupo: 'I', bandera: '🇸🇦' },
  // Grupo J
  { nombre: 'Portugal (J)',    grupo: 'J', bandera: '🇵🇹' },
  { nombre: 'Ghana',           grupo: 'J', bandera: '🇬🇭' },
  { nombre: 'Nigeria',         grupo: 'J', bandera: '🇳🇬' },
  { nombre: 'Camerun',         grupo: 'J', bandera: '🇨🇲' },
  // Grupo K
  { nombre: 'Iran',            grupo: 'K', bandera: '🇮🇷' },
  { nombre: 'Uzbekistan',      grupo: 'K', bandera: '🇺🇿' },
  { nombre: 'Costa Rica',      grupo: 'K', bandera: '🇨🇷' },
  { nombre: 'Eslovaquia',      grupo: 'K', bandera: '🇸🇰' },
  // Grupo L
  { nombre: 'Austria',         grupo: 'L', bandera: '🇦🇹' },
  { nombre: 'Egipto',          grupo: 'L', bandera: '🇪🇬' },
  { nombre: 'Indonesia',       grupo: 'L', bandera: '🇮🇩' },
  { nombre: 'Escocia',         grupo: 'L', bandera: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
];

// Partidos de fase de grupos (72 partidos)
// Cada grupo tiene 6 partidos: 1v2, 1v3, 1v4, 2v3, 2v4, 3v4
// Fechas aproximadas del Mundial 2026 (11 Jun - 2 Jul fase de grupos)
const matchSchedule = [
  // Grupo A
  { grupo: 'A', local: 'Mexico', visita: 'Nueva Zelanda', fecha: '2026-06-11T19:00:00-05:00', estadio: 'SoFi Stadium' },
  { grupo: 'A', local: 'Estados Unidos', visita: 'Canada', fecha: '2026-06-12T20:00:00-05:00', estadio: 'MetLife Stadium' },
  { grupo: 'A', local: 'Mexico', visita: 'Canada', fecha: '2026-06-16T18:00:00-05:00', estadio: 'AT&T Stadium' },
  { grupo: 'A', local: 'Estados Unidos', visita: 'Nueva Zelanda', fecha: '2026-06-17T15:00:00-05:00', estadio: 'Gillette Stadium' },
  { grupo: 'A', local: 'Canada', visita: 'Nueva Zelanda', fecha: '2026-06-21T18:00:00-05:00', estadio: 'BC Place' },
  { grupo: 'A', local: 'Mexico', visita: 'Estados Unidos', fecha: '2026-06-22T19:00:00-05:00', estadio: 'Azteca' },
  // Grupo B
  { grupo: 'B', local: 'Argentina', visita: 'Peru', fecha: '2026-06-12T12:00:00-05:00', estadio: 'Rose Bowl' },
  { grupo: 'B', local: 'Chile', visita: 'Australia', fecha: '2026-06-13T18:00:00-05:00', estadio: 'Arrowhead Stadium' },
  { grupo: 'B', local: 'Argentina', visita: 'Australia', fecha: '2026-06-17T19:00:00-05:00', estadio: 'Rose Bowl' },
  { grupo: 'B', local: 'Chile', visita: 'Peru', fecha: '2026-06-18T15:00:00-05:00', estadio: 'Arrowhead Stadium' },
  { grupo: 'B', local: 'Australia', visita: 'Peru', fecha: '2026-06-22T15:00:00-05:00', estadio: 'Rose Bowl' },
  { grupo: 'B', local: 'Argentina', visita: 'Chile', fecha: '2026-06-23T19:00:00-05:00', estadio: 'Rose Bowl' },
  // Grupo C
  { grupo: 'C', local: 'Brasil', visita: 'Paraguay', fecha: '2026-06-12T15:00:00-05:00', estadio: 'SoFi Stadium' },
  { grupo: 'C', local: 'Colombia', visita: 'Ecuador', fecha: '2026-06-13T15:00:00-05:00', estadio: 'Levi\'s Stadium' },
  { grupo: 'C', local: 'Brasil', visita: 'Ecuador', fecha: '2026-06-17T12:00:00-05:00', estadio: 'SoFi Stadium' },
  { grupo: 'C', local: 'Colombia', visita: 'Paraguay', fecha: '2026-06-18T19:00:00-05:00', estadio: 'Levi\'s Stadium' },
  { grupo: 'C', local: 'Ecuador', visita: 'Paraguay', fecha: '2026-06-22T12:00:00-05:00', estadio: 'SoFi Stadium' },
  { grupo: 'C', local: 'Brasil', visita: 'Colombia', fecha: '2026-06-23T15:00:00-05:00', estadio: 'SoFi Stadium' },
  // Grupo D
  { grupo: 'D', local: 'Francia', visita: 'Japon', fecha: '2026-06-13T12:00:00-05:00', estadio: 'MetLife Stadium' },
  { grupo: 'D', local: 'Alemania', visita: 'Belgica', fecha: '2026-06-14T18:00:00-05:00', estadio: 'Lincoln Financial Field' },
  { grupo: 'D', local: 'Francia', visita: 'Belgica', fecha: '2026-06-18T12:00:00-05:00', estadio: 'MetLife Stadium' },
  { grupo: 'D', local: 'Alemania', visita: 'Japon', fecha: '2026-06-19T15:00:00-05:00', estadio: 'Lincoln Financial Field' },
  { grupo: 'D', local: 'Belgica', visita: 'Japon', fecha: '2026-06-23T12:00:00-05:00', estadio: 'Lincoln Financial Field' },
  { grupo: 'D', local: 'Francia', visita: 'Alemania', fecha: '2026-06-24T19:00:00-05:00', estadio: 'MetLife Stadium' },
  // Grupo E
  { grupo: 'E', local: 'Espana', visita: 'Turquia', fecha: '2026-06-14T12:00:00-05:00', estadio: 'Allegiant Stadium' },
  { grupo: 'E', local: 'Portugal', visita: 'Argelia', fecha: '2026-06-15T12:00:00-05:00', estadio: 'Empower Field' },
  { grupo: 'E', local: 'Espana', visita: 'Argelia', fecha: '2026-06-19T12:00:00-05:00', estadio: 'Allegiant Stadium' },
  { grupo: 'E', local: 'Portugal', visita: 'Turquia', fecha: '2026-06-20T15:00:00-05:00', estadio: 'Empower Field' },
  { grupo: 'E', local: 'Argelia', visita: 'Turquia', fecha: '2026-06-24T12:00:00-05:00', estadio: 'Allegiant Stadium' },
  { grupo: 'E', local: 'Espana', visita: 'Portugal', fecha: '2026-06-25T19:00:00-05:00', estadio: 'Allegiant Stadium' },
  // Grupo F
  { grupo: 'F', local: 'Inglaterra', visita: 'Senegal', fecha: '2026-06-14T15:00:00-05:00', estadio: 'AT&T Stadium' },
  { grupo: 'F', local: 'Paises Bajos', visita: 'Serbia', fecha: '2026-06-15T15:00:00-05:00', estadio: 'NRG Stadium' },
  { grupo: 'F', local: 'Inglaterra', visita: 'Serbia', fecha: '2026-06-19T19:00:00-05:00', estadio: 'AT&T Stadium' },
  { grupo: 'F', local: 'Paises Bajos', visita: 'Senegal', fecha: '2026-06-20T12:00:00-05:00', estadio: 'NRG Stadium' },
  { grupo: 'F', local: 'Serbia', visita: 'Senegal', fecha: '2026-06-24T15:00:00-05:00', estadio: 'NRG Stadium' },
  { grupo: 'F', local: 'Inglaterra', visita: 'Paises Bajos', fecha: '2026-06-25T15:00:00-05:00', estadio: 'AT&T Stadium' },
  // Grupo G
  { grupo: 'G', local: 'Uruguay', visita: 'Arabia Saudita', fecha: '2026-06-15T18:00:00-05:00', estadio: 'Estadio Azteca' },
  { grupo: 'G', local: 'Marruecos', visita: 'Irak', fecha: '2026-06-16T12:00:00-05:00', estadio: 'Estadio BBVA' },
  { grupo: 'G', local: 'Uruguay', visita: 'Irak', fecha: '2026-06-20T18:00:00-05:00', estadio: 'Estadio Azteca' },
  { grupo: 'G', local: 'Marruecos', visita: 'Arabia Saudita', fecha: '2026-06-21T12:00:00-05:00', estadio: 'Estadio BBVA' },
  { grupo: 'G', local: 'Arabia Saudita', visita: 'Irak', fecha: '2026-06-25T12:00:00-05:00', estadio: 'Estadio Azteca' },
  { grupo: 'G', local: 'Uruguay', visita: 'Marruecos', fecha: '2026-06-26T19:00:00-05:00', estadio: 'Estadio Azteca' },
  // Grupo H
  { grupo: 'H', local: 'Croacia', visita: 'Suiza', fecha: '2026-06-15T12:00:00-05:00', estadio: 'Estadio Akron' },
  { grupo: 'H', local: 'Dinamarca', visita: 'Polonia', fecha: '2026-06-16T15:00:00-05:00', estadio: 'BC Place' },
  { grupo: 'H', local: 'Croacia', visita: 'Polonia', fecha: '2026-06-20T15:00:00-05:00', estadio: 'Estadio Akron' },
  { grupo: 'H', local: 'Dinamarca', visita: 'Suiza', fecha: '2026-06-21T15:00:00-05:00', estadio: 'BC Place' },
  { grupo: 'H', local: 'Suiza', visita: 'Polonia', fecha: '2026-06-25T18:00:00-05:00', estadio: 'BC Place' },
  { grupo: 'H', local: 'Croacia', visita: 'Dinamarca', fecha: '2026-06-26T15:00:00-05:00', estadio: 'Estadio Akron' },
  // Grupo I
  { grupo: 'I', local: 'Italia', visita: 'Corea del Sur', fecha: '2026-06-16T19:00:00-05:00', estadio: 'Gillette Stadium' },
  { grupo: 'I', local: 'Mexico (I)', visita: 'Arabia Saudita (I)', fecha: '2026-06-17T15:00:00-05:00', estadio: 'Levi\'s Stadium' },
  { grupo: 'I', local: 'Italia', visita: 'Arabia Saudita (I)', fecha: '2026-06-21T19:00:00-05:00', estadio: 'Gillette Stadium' },
  { grupo: 'I', local: 'Mexico (I)', visita: 'Corea del Sur', fecha: '2026-06-22T15:00:00-05:00', estadio: 'Levi\'s Stadium' },
  { grupo: 'I', local: 'Arabia Saudita (I)', visita: 'Corea del Sur', fecha: '2026-06-26T12:00:00-05:00', estadio: 'Levi\'s Stadium' },
  { grupo: 'I', local: 'Italia', visita: 'Mexico (I)', fecha: '2026-06-27T19:00:00-05:00', estadio: 'Gillette Stadium' },
  // Grupo J
  { grupo: 'J', local: 'Portugal (J)', visita: 'Nigeria', fecha: '2026-06-17T18:00:00-05:00', estadio: 'Empower Field' },
  { grupo: 'J', local: 'Ghana', visita: 'Camerun', fecha: '2026-06-18T12:00:00-05:00', estadio: 'NRG Stadium' },
  { grupo: 'J', local: 'Portugal (J)', visita: 'Camerun', fecha: '2026-06-22T18:00:00-05:00', estadio: 'Empower Field' },
  { grupo: 'J', local: 'Ghana', visita: 'Nigeria', fecha: '2026-06-23T18:00:00-05:00', estadio: 'NRG Stadium' },
  { grupo: 'J', local: 'Nigeria', visita: 'Camerun', fecha: '2026-06-27T12:00:00-05:00', estadio: 'NRG Stadium' },
  { grupo: 'J', local: 'Portugal (J)', visita: 'Ghana', fecha: '2026-06-28T19:00:00-05:00', estadio: 'Empower Field' },
  // Grupo K
  { grupo: 'K', local: 'Iran', visita: 'Costa Rica', fecha: '2026-06-18T15:00:00-05:00', estadio: 'Lincoln Financial Field' },
  { grupo: 'K', local: 'Uzbekistan', visita: 'Eslovaquia', fecha: '2026-06-19T18:00:00-05:00', estadio: 'Allegiant Stadium' },
  { grupo: 'K', local: 'Iran', visita: 'Eslovaquia', fecha: '2026-06-23T15:00:00-05:00', estadio: 'Lincoln Financial Field' },
  { grupo: 'K', local: 'Uzbekistan', visita: 'Costa Rica', fecha: '2026-06-24T18:00:00-05:00', estadio: 'Allegiant Stadium' },
  { grupo: 'K', local: 'Eslovaquia', visita: 'Costa Rica', fecha: '2026-06-28T12:00:00-05:00', estadio: 'Allegiant Stadium' },
  { grupo: 'K', local: 'Iran', visita: 'Uzbekistan', fecha: '2026-06-29T19:00:00-05:00', estadio: 'Lincoln Financial Field' },
  // Grupo L
  { grupo: 'L', local: 'Austria', visita: 'Indonesia', fecha: '2026-06-19T19:00:00-05:00', estadio: 'SoFi Stadium' },
  { grupo: 'L', local: 'Egipto', visita: 'Escocia', fecha: '2026-06-20T19:00:00-05:00', estadio: 'AT&T Stadium' },
  { grupo: 'L', local: 'Austria', visita: 'Escocia', fecha: '2026-06-24T19:00:00-05:00', estadio: 'SoFi Stadium' },
  { grupo: 'L', local: 'Egipto', visita: 'Indonesia', fecha: '2026-06-25T19:00:00-05:00', estadio: 'AT&T Stadium' },
  { grupo: 'L', local: 'Escocia', visita: 'Indonesia', fecha: '2026-06-29T15:00:00-05:00', estadio: 'AT&T Stadium' },
  { grupo: 'L', local: 'Austria', visita: 'Egipto', fecha: '2026-06-30T19:00:00-05:00', estadio: 'SoFi Stadium' },
];

async function main() {
  console.log('Seeding database...');

  // Admin user
  const adminPass = await bcrypt.hash('admin2026', 10);
  await prisma.user.upsert({
    where: { email: 'admin@polla.com' },
    update: {},
    create: {
      nombre: 'Administrador',
      email: 'admin@polla.com',
      password: adminPass,
      isAdmin: true,
    },
  });

  // Create teams
  for (const eq of equipos) {
    await prisma.equipo.upsert({
      where: { id: equipos.indexOf(eq) + 1 },
      update: eq,
      create: eq,
    });
  }
  console.log(`Created ${equipos.length} teams`);

  const allEquipos = await prisma.equipo.findMany();
  const equipoMap = {};
  allEquipos.forEach(e => { equipoMap[e.nombre] = e.id; });

  // Create matches
  let created = 0;
  for (const m of matchSchedule) {
    const localId = equipoMap[m.local];
    const visitaId = equipoMap[m.visita];
    if (!localId || !visitaId) {
      console.warn(`Equipo no encontrado: ${m.local} o ${m.visita}`);
      continue;
    }
    await prisma.partido.create({
      data: {
        fase: 'Grupos',
        grupo: m.grupo,
        localId,
        visitaId,
        fechaHora: new Date(m.fecha),
        estadio: m.estadio,
      },
    });
    created++;
  }
  console.log(`Created ${created} matches`);
  console.log('Seed complete!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
