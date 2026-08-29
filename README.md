# RestXperience

Menú digital visual por mesa (QR), carrito, reseñas, panel secreto y chatbot de recomendaciones.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Prisma + SQLite
- Framer Motion (microinteracciones)
- Módulo de pago **activable** con stub SoftRestaurant

## Arranque

```bash
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Rutas clave

| Ruta | Uso |
|------|-----|
| `/` | Landing + acceso demo a mesas |
| `/mesa/[token]` | Sesión del cliente al escanear QR |
| `/rx-admin` | Panel secreto (productos, precios, mesas/QR, pedidos, pago) |

## Acceso admin

Contraseña por defecto: `restx-admin`  
Configurable con `ADMIN_PASSWORD` al hacer seed.

## Pago / SoftRestaurant / Solo menú

En **Configuración** del panel elige `commerceMode`:

1. **stripe** (default) — RestXperience cobra. La comanda **solo** sale cuando el pago confirma.
2. **softrestaurant** — Misma regla pago-primero; tras pagar se reenvía al endpoint POS (stub hasta tener params).
3. **menu_only** — Catálogo visual sin carrito.

Sin `STRIPE_SECRET_KEY` el checkout usa **modo demo** (confirma en `/mesa/.../pago`).

Sesiones sin pago se cierran a los **15 minutos**.

## Correo y reseñas

El cliente puede guardar su correo en la sesión. Tras un pedido **pagado**, aparece el panel de reseña.

## Medios

En cada producto puedes cargar `imageUrl` / `videoUrl` desde el panel. Mientras no haya media, se muestra un placeholder elegante.

## Variables de entorno

Copia `.env.example` a `.env`:

```
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD="restx-admin"
ADMIN_SESSION_SECRET="cambia-esto"
```
