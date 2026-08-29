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

## Pago / SoftRestaurant

En **Configuración** del panel:

1. **Activar pago** — muestra “Pagar ahora” en el carrito.
2. **Vincular SoftRestaurant** — reenvía la orden al endpoint configurado.
3. Sin endpoint: modo simulación (ticket `SR-SIM-…`).

Sin pago activo, el flujo es solo menú + “Enviar pedido a mi mesa”.

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
