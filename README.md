# RestXperience

Menú digital para restaurantes. Cada mesa tiene su código QR: el comensal lo escanea con su celular, ve los platillos con foto o video, pide, paga y califica. La cocina recibe la comanda en una pantalla, y el dueño administra todo desde un panel privado.

> **Este código es tuyo.** Se entrega sin costo y puedes usarlo, cambiarlo e instalarlo donde quieras. Solo se cobra si pides que te lo pongamos en línea o que le demos mantenimiento. Los detalles están en [`LICENSE`](LICENSE) y en la sección 8.

Este documento explica cómo poner RestXperience en línea para tu restaurante, qué cuentas necesitas y dónde se consiguen. También existe una versión en Word para compartir: [`docs/RestXperience-Guia-de-arranque.docx`](docs/RestXperience-Guia-de-arranque.docx).

### Demo de muestra

[https://restxperience-cxdx.onrender.com](https://restxperience-cxdx.onrender.com) sirve **solo para ver cómo se ve y cómo funciona**. No es tu restaurante: puede apagarse o reiniciarse en cualquier momento y lo que se capture ahí se borra. Para operar, instala tu propia copia siguiendo la sección 4.

---

## 1. Las tres pantallas

| Quién la usa | Dirección | Para qué |
|---|---|---|
| Comensal | `/mesa/...` (se abre al escanear el QR) | Ver el menú, pedir, pagar y calificar |
| Cocina | `/rx-cocina` | Ver las comandas ya pagadas y marcarlas como servidas |
| Dueño | `/rx-admin` | Ventas, pedidos, menú, precios, fotos, mesas y QR |

Para verlas en la demo de muestra:

- Panel del dueño: [https://restxperience-cxdx.onrender.com/rx-admin](https://restxperience-cxdx.onrender.com/rx-admin)
- Pantalla de cocina: [https://restxperience-cxdx.onrender.com/rx-cocina](https://restxperience-cxdx.onrender.com/rx-cocina)

En tu propia instalación son las mismas rutas, pero con tu dirección.

Las direcciones del dueño y de la cocina no aparecen en ningún botón del menú. Solo entra quien las conoce y tiene la contraseña.

## 2. Cómo funciona un pedido

1. El comensal escanea el QR de su mesa y se abre el menú.
2. Agrega platillos al carrito. Si quiere, deja su correo.
3. Paga con tarjeta.
4. **Solo cuando el pago se confirma**, la comanda aparece en la pantalla de cocina. Sin pago no llega nada.
5. La cocina marca el pedido como servido.
6. El comensal puede calificar lo que pidió y pagó.

Si alguien abre el menú y no paga, su sesión se cierra sola a los 15 minutos.

En el panel del dueño (Configuración → Modo de comercio) se elige cómo trabaja el restaurante:

| Modo | Qué hace |
|---|---|
| Stripe | El comensal paga con tarjeta desde su celular. Es el modo normal. |
| SoftRestaurant | Igual que Stripe, y además envía el pedido al punto de venta SoftRestaurant. La conexión con SoftRestaurant todavía está en simulación. |
| Solo menú | Menú visual sin carrito ni pagos. Sirve como carta digital. |

## 3. Cuentas que necesitas

Todas las cuentas se abren **a nombre del restaurante** y se pagan directamente a cada empresa. Nosotros no cobramos ni recibimos comisión por ellas.

| Servicio | Para qué sirve | ¿Obligatorio? | Dónde se crea | Costo |
|---|---|---|---|---|
| GitHub | Guardar tu copia del código. Render la toma de ahí. | Sí | [github.com](https://github.com) | Gratis |
| Render | Donde vive la página y la base de datos (menú, pedidos, ventas) | Sí | [render.com](https://render.com) | Gratis para probar; ver sección 6 |
| Stripe | Cobrar con tarjeta | Para cobrar | [stripe.com/mx](https://stripe.com/mx) | Comisión por cada cobro |
| Cloudflare R2 | Guardar las fotos y videos de los platillos | Muy recomendado | [dash.cloudflare.com](https://dash.cloudflare.com) | Gratis hasta 10 GB |

No necesitas pagar ningún servicio de inteligencia artificial: el asistente del menú funciona por su cuenta. Los códigos QR también se generan gratis.

## 4. Paso a paso para ponerlo en línea

Calcula entre 30 y 60 minutos la primera vez.

### Paso 1. Guardar tu copia del código en GitHub

Render necesita leer el código desde GitHub. Primero crea una cuenta gratis en [github.com](https://github.com). Luego elige una opción:

**Opción A (la más fácil): que te lo pasemos a tu cuenta**

1. Envíanos tu nombre de usuario de GitHub.
2. Te llega un correo de GitHub con la invitación o la transferencia del repositorio. Acéptala.
3. Listo: el repositorio `restxperience` ya aparece en tu cuenta.

**Opción B: subirlo tú desde el archivo .zip**

1. Descomprime el .zip que recibiste en una carpeta de tu computadora.
2. Instala [GitHub Desktop](https://desktop.github.com) y entra con tu cuenta.
3. Menú **File → Add local repository** y elige la carpeta. Si te dice que no es un repositorio, pulsa **create a repository** y luego **Create repository**.
4. Pulsa **Publish repository**. Puedes dejar marcada la casilla **Keep this code private**.

No uses la opción de "subir archivos" de la página de GitHub: el proyecto tiene carpetas y esa opción no las respeta bien.

### Paso 2. Crear la página y la base de datos en Render

1. Crea una cuenta en [render.com](https://render.com). Lo más fácil es entrar con tu cuenta de GitHub.
2. En el panel de Render pulsa **New → Blueprint**.
3. Elige tu repositorio `restxperience` y la rama `main`. Si no aparece, pulsa **Configure GitHub** y dale permiso a Render para verlo.
4. Render lee el archivo del proyecto y te muestra lo que va a crear:
   - **restxperience-db**: la base de datos.
   - **restxperience**: la página.
5. Te pedirá llenar algunas claves. Por ahora llena solo estas dos:

   | Clave | Qué escribir |
   |---|---|
   | `ADMIN_PASSWORD` | La contraseña del panel del dueño |
   | `KITCHEN_PASSWORD` | La contraseña de la pantalla de cocina |

   Deja las demás vacías; se llenan en los pasos 3 y 4. Las claves de la base de datos y de seguridad las crea Render solo.
6. Pulsa **Apply** (o **Deploy Blueprint**) y espera entre 5 y 10 minutos.
7. Cuando diga **Live**, arriba aparece la dirección de tu página, por ejemplo `https://restxperience-xxxx.onrender.com`. Las letras del final las pone Render si el nombre ya estaba ocupado.
8. Para comprobar que funciona, abre esa dirección y agrégale `/api/health`. Debe aparecer `"ok":true`.

**Importante:** usa siempre **Blueprint**. Si creas la página a mano con "New → Web Service", la base de datos no se conecta sola y la página no arranca (en el registro sale "falta DATABASE_URL").

Al terminar, el sistema ya trae un menú de ejemplo y 12 mesas para que lo pruebes.

### Paso 3. Conectar Stripe para cobrar

Sin este paso la página funciona en **modo demostración**: el pago se simula y la comanda sí llega a cocina. Sirve para enseñarlo, no para cobrar.

**3.1 Obtener las llaves**

1. Crea una cuenta en [stripe.com/mx](https://stripe.com/mx).
2. Activa **Modo de prueba** (Test mode) para empezar sin cobrar dinero real.
3. Ve a **Desarrolladores → Claves de API**. Ahí están:
   - **Clave publicable**: empieza con `pk_test_`
   - **Clave secreta**: empieza con `sk_test_` (pulsa "Mostrar")
4. En Render, abre el servicio **restxperience → Environment → Edit** y pega:

   | Clave | Valor |
   |---|---|
   | `STRIPE_SECRET_KEY` | La clave secreta `sk_test_...` |
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | La clave publicable `pk_test_...` |

5. Pulsa **Save, rebuild, and deploy** y espera a que vuelva a decir **Live**.

**3.2 Avisarle a la página cuando alguien paga**

Esto es lo que hace que la comanda salga a cocina en cuanto se confirma el pago.

1. En Stripe ve a **Desarrolladores → Webhooks → Agregar destino** (Add endpoint).
2. En la dirección escribe la de tu página seguida de `/api/webhooks/stripe`. Ejemplo: `https://restxperience-xxxx.onrender.com/api/webhooks/stripe`
3. Selecciona estos 4 eventos:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.expired`
   - `checkout.session.async_payment_failed`
4. Guarda. Stripe te muestra un **secreto de firma** que empieza con `whsec_`.
5. En Render, pégalo en `STRIPE_WEBHOOK_SECRET` y vuelve a guardar con **Save, rebuild, and deploy**.

Para confirmar, abre `/api/health`: debe decir `"stripe":true` y `"webhook":true`.

**3.3 Probar un pago**

Usa la tarjeta de prueba `4242 4242 4242 4242`, cualquier fecha futura y cualquier código de 3 dígitos. No se cobra nada.

**3.4 Pasar a cobros reales**

1. En Stripe completa **Activar cuenta**: datos del negocio, RFC y la cuenta bancaria (CLABE) donde quieres recibir el dinero.
2. Desactiva el modo de prueba y copia las llaves **reales** (`pk_live_...` y `sk_live_...`).
3. Repite el webhook del paso 3.2 en modo real. El secreto `whsec_` es distinto.
4. Reemplaza las tres claves en Render y guarda.

### Paso 4. Guardar fotos y videos en Cloudflare R2

Sin este paso puedes subir fotos, pero **se borran cada vez que Render reinicia la página**. El menú, los precios y los pedidos no se pierden, porque viven en la base de datos.

1. Crea una cuenta en [dash.cloudflare.com](https://dash.cloudflare.com).
2. En el menú lateral entra a **R2 Object Storage** y actívalo. Cloudflare puede pedir una tarjeta aunque no cobra dentro del uso gratuito.
3. Pulsa **Create bucket** y nómbralo `restxperience-media`.
4. Dentro del bucket ve a **Settings → Public access** y activa la dirección pública (**r2.dev**). Copia esa dirección; se ve como `https://pub-xxxxxxxx.r2.dev`.
5. Regresa a R2 y abre **Manage API tokens → Create API token**:
   - Permiso: **Object Read & Write**
   - Bucket: solo `restxperience-media`
   - Al crearlo te muestra **Access Key ID** y **Secret Access Key**. Cópialos en ese momento; el secreto no se vuelve a mostrar.
6. En la página principal de R2 aparece tu **Account ID**.
7. En Render, **Environment → Edit**, pega:

   | Clave | Valor |
   |---|---|
   | `R2_ACCOUNT_ID` | Tu Account ID |
   | `R2_ACCESS_KEY_ID` | El Access Key ID |
   | `R2_SECRET_ACCESS_KEY` | El Secret Access Key |
   | `R2_BUCKET` | `restxperience-media` |
   | `R2_PUBLIC_BASE_URL` | La dirección pública, sin `/` al final |

8. Guarda con **Save, rebuild, and deploy**.

### Paso 5. Preparar tu restaurante

Entra a `https://<tu-página>.onrender.com/rx-admin` con tu contraseña de dueño.

1. **Configuración**: escribe el nombre del restaurante, la frase de presentación y el mensaje de bienvenida. Elige el modo de comercio y, si quieres, la comida del día.
2. **Productos**: carga tu menú.
   - Rápido: pulsa **Descargar plantilla**, llénala en Excel con categoría, nombre, precio, descripción, ingredientes y calorías, guárdala como CSV y pulsa **Subir CSV**. Si un platillo ya existe, solo se actualiza su precio y texto.
   - Uno por uno: crea una categoría y pulsa **Nuevo producto**.
   - Toca cualquier platillo para cambiar precio, texto, foto o video (de 15 a 35 segundos), u ocultarlo.
3. **Mesas / QR**: borra las mesas de ejemplo si no te sirven y crea las tuyas. Cada mesa muestra su QR: imprímelo y colócalo en la mesa.
4. **Resumen** y **Pedidos**: aquí ves ventas e historial.

### Paso 6. Prueba completa antes de abrir

1. Escanea el QR de una mesa con tu celular.
2. Pide algo y paga con la tarjeta de prueba.
3. Abre `/rx-cocina` en otra pantalla: debe aparecer la comanda. Márcala como servida.
4. En el celular, califica el platillo.
5. En `/rx-admin → Resumen` revisa que aparezca la venta.

## 5. Contraseñas

- Las contraseñas del dueño y de la cocina se cambian en Render: **Environment → `ADMIN_PASSWORD` / `KITCHEN_PASSWORD`**, y luego **Save, rebuild, and deploy**.
- Si no escribes ninguna, quedan las de demostración (`restx-admin` y `restx-kitchen`). **Cámbialas antes de usarlo con clientes.**
- La cocina no ve dinero ni configuración, solo comandas.

## 6. Costos y límites del plan gratis

El código no cuesta nada. Lo único que se paga son los servicios de otras empresas, y eso solo cuando decides dejarlo funcionando de forma permanente.

El plan gratuito de Render sirve para probar, pero tiene tres límites:

- La página se "duerme" tras 15 minutos sin visitas. La siguiente persona espera cerca de un minuto a que despierte.
- **La base de datos gratuita se borra a los 30 días.** Antes de esa fecha hay que pasarla a un plan de pago o se pierden menú, pedidos y ventas.
- Solo se permite una base de datos gratuita por cuenta.

Para operar con clientes reales se recomienda (precios aproximados, revisa [render.com/pricing](https://render.com/pricing)):

| Servicio | Plan | Costo aproximado al mes |
|---|---|---|
| Página (Render) | Starter | 7 USD |
| Base de datos (Render) | Basic | 6 USD |
| Fotos (Cloudflare R2) | Gratis hasta 10 GB | 0 USD |
| Cobros (Stripe) | Por transacción | Comisión por cobro; revisa [stripe.com/mx/pricing](https://stripe.com/mx/pricing) |

Para cambiar de plan: en Render abre el servicio o la base de datos → **Settings → Instance type**.

## 7. Problemas comunes

| Lo que ves | Qué pasa | Qué hacer |
|---|---|---|
| La página tarda un minuto en abrir | Estaba dormida (plan gratis) | Esperar, o pasar al plan Starter |
| En Render sale "falta DATABASE_URL" | La página no está conectada a la base de datos | Crear todo con Blueprint, o en la base de datos copiar **Internal Database URL** y pegarla en la clave `DATABASE_URL` de la página |
| Las fotos desaparecieron | No está configurado Cloudflare R2 | Hacer el paso 4 y volver a subir las fotos |
| Se pagó pero la comanda no llegó a cocina | Falta el webhook de Stripe o su secreto | Revisar el paso 3.2 y que `/api/health` diga `"webhook":true` |
| No me deja entrar al panel | Contraseña distinta a la guardada en Render | Revisar `ADMIN_PASSWORD` en Render |
| Todo dejó de funcionar al mes | Venció la base de datos gratuita | Pasar la base a un plan de pago antes de 30 días |

## 8. Licencia: qué es tuyo y qué se cobra

El texto completo está en [`LICENSE`](LICENSE). En resumen:

- **El código es del restaurante** desde que se entrega. Puedes usarlo en uno o varios locales, cambiarle el nombre y el logo, modificarlo, venderlo o pedirle a cualquier persona que lo instale.
- **No cobramos por el código**: no hay licencia, mensualidad ni porcentaje de tus ventas.
- **Solo cobramos si tú lo pides**: ponerlo en línea, darle mantenimiento o hacerle cambios. Se acuerda aparte y es opcional.
- **Los servicios de otras empresas** (Render, Stripe, Cloudflare) los contratas y pagas tú directamente.
- **Se entrega tal como está.** Sin un contrato de mantenimiento no hay garantía de soporte.
- Eres responsable de tus contraseñas, de los datos de tus comensales y de tu aviso de privacidad.

---

## Anexo técnico (para quien dé soporte)

### Tecnología

- Next.js (App Router) + TypeScript + Tailwind, Framer Motion
- Prisma + PostgreSQL 16
- Stripe Checkout + webhook
- Cloudflare R2 (compatible con S3) para fotos y videos; sin R2 se guarda en `public/uploads`
- Docker. `render.yaml` define el web (Docker) y la base de datos.

Al arrancar, el contenedor aplica migraciones (`prisma migrate deploy`) y carga el menú de ejemplo solo si la base está vacía.

### Variables de entorno

| Variable | Obligatoria | Origen |
|---|---|---|
| `DATABASE_URL` | Sí | Render la conecta desde `restxperience-db` |
| `ADMIN_PASSWORD` | Sí (si no, `restx-admin`) | La define el dueño |
| `ADMIN_SESSION_SECRET` | Sí | Render la genera |
| `KITCHEN_PASSWORD` | Sí (si no, `restx-kitchen`) | La define el dueño |
| `KITCHEN_SESSION_SECRET` | Sí | Render la genera |
| `STRIPE_SECRET_KEY` | Para cobrar | Stripe → Claves de API |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Para cobrar | Stripe → Claves de API |
| `STRIPE_WEBHOOK_SECRET` | Para cobrar | Stripe → Webhooks |
| `R2_ACCOUNT_ID` | Para fotos | Cloudflare R2 |
| `R2_ACCESS_KEY_ID` | Para fotos | Cloudflare R2 → API tokens |
| `R2_SECRET_ACCESS_KEY` | Para fotos | Cloudflare R2 → API tokens |
| `R2_BUCKET` | Para fotos | `restxperience-media` |
| `R2_PUBLIC_BASE_URL` | Para fotos | URL pública del bucket |

`PORT` la pone Render; no se configura.

### Rutas de la API

| Ruta | Uso |
|---|---|
| `GET /api/health` | Estado del servicio y si Stripe y el webhook están configurados |
| `/api/session` | Abre o consulta la sesión de una mesa |
| `/api/orders`, `/api/orders/cancel` | Crear y cancelar pedidos |
| `/api/checkout/confirm` | Confirma el pago contra Stripe al volver del checkout |
| `POST /api/webhooks/stripe` | Recibe los eventos de Stripe y libera la comanda |
| `/api/purchases`, `/api/ratings`, `/api/reviews` | Historial del comensal, calificaciones y opiniones |
| `/api/chat` | Asistente del menú (reglas internas, sin servicio externo) |
| `/api/kitchen/login`, `/api/kitchen/orders` | Acceso y comandas de cocina |
| `/api/admin/login`, `/api/admin/data`, `/api/admin/upload` | Acceso, datos y subida de fotos/videos del panel |

Servicios externos: Stripe, Cloudflare R2 y `api.qrserver.com` (genera las imágenes QR, sin llave).

### Correr en una computadora (Docker)

No hace falta instalar Node.

```bash
docker compose up
```

Abre [http://localhost:3000](http://localhost:3000). La primera vez instala dependencias, aplica migraciones y carga el menú de ejemplo. Postgres queda en el puerto 5432.

Volver a cargar el menú de ejemplo (borra menú, mesas y pedidos):

```bash
docker compose exec app sh -c "FORCE_SEED=1 npm run db:seed"
```

Probar la imagen de producción:

```bash
docker compose --profile prod up --build web db
```

Para claves locales copia `.env.example` a `.env`.
