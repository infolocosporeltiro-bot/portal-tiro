# Portal Tiro España · V1

Primer frontend funcional conectado al proyecto Supabase `Portal Tiro España`.

## Arranque local

1. `npm install`
2. Copia `.env.example` a `.env.local` y añade la publishable key de Supabase.
3. `npm run dev`
4. Abre `http://localhost:3000`

## Autenticación

La app usa `@supabase/ssr`, cookies y `getClaims()` para validación del usuario en servidor.
Para confirmación de email en Supabase, configura el template `Confirm signup` para usar:

`{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`

Durante desarrollo, Site URL: `http://localhost:3000`.

## Alcance de esta V1

- navegación pública
- login/registro por email y contraseña
- cuenta y perfil
- listado público de tiradas, campos, empresas y anuncios aprobados
- conexión real a Supabase
- estructura responsive

El portal no procesa pagos de bienes anunciados ni formaliza transmisiones entre particulares.
