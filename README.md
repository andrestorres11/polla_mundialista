# Polla Mundialista 2026 - Vercel/Next.js

App de pronosticos del Mundial FIFA 2026 construida con Next.js 14 + Prisma + PostgreSQL.

## Stack

- **Frontend/Backend**: Next.js 14 (App Router, Server Components, API Routes)
- **ORM**: Prisma
- **Base de datos**: PostgreSQL (Vercel Postgres, Neon, o Supabase)
- **Auth**: JWT con cookies httpOnly
- **Deploy**: Vercel

## Inicio rapido

### 1. Base de datos PostgreSQL

Opciones recomendadas (tier gratuito disponible):
- **Neon** → https://neon.tech (recomendado para Vercel)
- **Supabase** → https://supabase.com
- **Vercel Postgres** → desde el panel de Vercel

### 2. Variables de entorno

```bash
cp .env.example .env
# Editar .env con tus credenciales
```

### 3. Instalar y configurar

```bash
npm install

# Crear tablas en la base de datos
npx prisma db push

# Cargar datos iniciales (equipos + partidos)
node prisma/seed.js
```

### 4. Correr en desarrollo

```bash
npm run dev
# http://localhost:3000
```

## Deploy en Vercel

1. Subir el proyecto a GitHub
2. Importar en Vercel → https://vercel.com/new
3. Agregar variables de entorno en Vercel:
   - `DATABASE_URL`
   - `DIRECT_URL`  
   - `JWT_SECRET`
4. Deploy automatico

Despues del primer deploy, ejecutar el seed:
```bash
# Con Vercel CLI:
vercel env pull .env.local
npx prisma db push
node prisma/seed.js
```

## Credenciales por defecto

| Campo | Valor |
|-------|-------|
| Email | admin@polla.com |
| Password | admin2026 |

> **Cambiar la contrasena del admin inmediatamente despues del primer login.**

## Estructura de archivos

```
app/
  (auth)/login/      → Pagina de login
  (auth)/registro/   → Registro de jugadores
  (dashboard)/       → Todas las paginas con navbar
    pronosticos/     → Entrada de pronosticos por partido
    partidos/        → Lista de partidos
    standings/       → Tabla de posiciones
    participantes/   → Lista de jugadores
    equipos/         → Grupos y equipos
    admin/           → Panel de ingreso de resultados
  api/               → API Routes
    auth/            → login, registro, logout
    pronosticos/     → CRUD pronosticos
    admin/           → Resultados (solo admin)
    participantes/   → Lista participantes
lib/
  prisma.js          → Cliente Prisma singleton
  auth.js            → JWT sessions
  utils.js           → Calculo de puntos
prisma/
  schema.prisma      → Modelos de BD
  seed.js            → Datos iniciales
```

## Sistema de puntos

| Resultado | Puntos |
|-----------|--------|
| Marcador exacto | 3 pts |
| Ganador o empate correcto | 1 pt |
| Incorrecto | 0 pts |

## Inscripcion

Valor fijo: **$20.000 COP** por participante.  
La bolsa total se calcula automaticamente: `N participantes x $20.000`.
