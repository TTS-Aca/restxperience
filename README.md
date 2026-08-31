# RestXperience

Menú digital visual por mesa (QR), carrito, reseñas, panel secreto y chatbot de recomendaciones.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Prisma + **PostgreSQL** (Docker)
- Framer Motion (microinteracciones)
- Módulo de pago **activable** con stub SoftRestaurant

## Arranque (solo Docker)

No hace falta instalar Node ni Next en el host.

```bash
docker compose up
```

La primera vez instala dependencias, aplica migraciones y hace seed. Abre [http://localhost:3000](http://localhost:3000).

| Servicio | Puerto |
|----------|--------|
| App Next (dev, hot reload) | 3000 |
| PostgreSQL | 5432 |

Admin: `/rx-admin` — contraseña `restx-admin` (o `ADMIN_PASSWORD` en el entorno).

Reseed (borra y vuelve a cargar menú/mesas):

```bash
docker compose exec app sh -c "FORCE_SEED=1 npm run db:seed"
```

Imagen de producción (build optimizado):

```bash
docker compose --profile prod up --build web db
```

## Rutas clave

| Ruta | Uso |
|------|-----|
| `/` | Landing + acceso demo a mesas |
| `/mesa/[token]` | Sesión del cliente al escanear QR |
| `/rx-admin` | Panel secreto (productos, precios, mesas/QR, pedidos, pago) |

## Pago / SoftRestaurant / Solo menú

En **Configuración** del panel elige `commerceMode`:

1. **stripe** (default) — RestXperience cobra. La comanda **solo** sale cuando el pago confirma.
2. **softrestaurant** — Misma regla pago-primero; tras pagar se reenvía al endpoint POS (stub hasta tener params).
3. **menu_only** — Catálogo visual sin carrito.

Sin `STRIPE_SECRET_KEY` el checkout usa **modo demo local** (confirma en `/mesa/.../pago`).

Con keys de **test**, Stripe Checkout cobra en modo visual (tarjeta `ACCT-000015`). El webhook `/api/webhooks/stripe` marca la orden pagada y suelta la comanda. Si el cliente vuelve a la web antes, `/api/checkout/confirm` verifica la sesión contra Stripe.

Sesiones sin pago se cierran a los **15 minutos**.

## Deploy en Render (MVP)

El repo incluye `render.yaml` (web + Postgres). En [Render](https://dashboard.render.com): **New → Blueprint** y apunta a este repositorio.

Variables que debes pegar en el dashboard (no van en git):

| Variable | Dónde sale |
|----------|------------|
| `ADMIN_PASSWORD` | La eliges tú |
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys (`sk_test_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Misma pantalla (`pk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | **Después** del primer deploy (abajo) |

Cuando el servicio tenga URL (`https://….onrender.com`):

1. Stripe → Developers → Webhooks → Add endpoint  
2. URL: `https://<tu-servicio>.onrender.com/api/webhooks/stripe`  
3. Eventos: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired`, `checkout.session.async_payment_failed`  
4. Copia el `whsec_...` a `STRIPE_WEBHOOK_SECRET` y redespliega  

Tarjeta de prueba: `ACCT-000015`, fecha futura, CVC cualquiera.

Si Render no ofrece Postgres free, crea una DB (Render o Neon) y pega `DATABASE_URL` en el web service. Prisma suele necesitar `?sslmode=require` en URLs externas.

## Variables de entorno

Copia `.env.example` a `.env` si quieres sobreescribir secretos. Compose ya inyecta `DATABASE_URL` apuntando al servicio `db`. En el host (Prisma Studio) usa `localhost:5432`.
