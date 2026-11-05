# RestXperience 1.0

Menú digital para restaurantes. Cada mesa cuenta con un código QR: el comensal lo escanea con su celular, consulta los platillos con fotografía o video, realiza su pedido, paga y califica. La cocina recibe la comanda en una pantalla y el dueño administra todo desde un panel privado.

> **Esta versión del sistema es suya.** La versión 1.0, entregada en el archivo ZIP, pertenece a su restaurante desde la fecha de entrega. No tiene costo y usted puede usarla, modificarla e instalarla a su criterio. Solo se cobra si usted solicita la instalación, el mantenimiento o algún cambio. Consulte la sección 8 y el archivo [`LICENSE`](LICENSE).

Esta guía explica cómo poner RestXperience en línea, qué cuentas se requieren y dónde se obtienen. También se incluye una versión en Word: [`docs/RestXperience-Guia-de-arranque.docx`](docs/RestXperience-Guia-de-arranque.docx).

### Demostración

La dirección [https://restxperience-cxdx.onrender.com](https://restxperience-cxdx.onrender.com) sirve **únicamente para conocer el aspecto y el funcionamiento** del sistema. No es la instalación de su restaurante: puede suspenderse o reiniciarse en cualquier momento, y la información capturada en ella se borra. Para operar, instale su propia copia siguiendo la sección 4.

---

## 1. Las tres pantallas del sistema

| Usuario | Dirección | Función |
|---|---|---|
| Comensal | `/mesa/...` (se abre al escanear el QR) | Consultar el menú, pedir, pagar y calificar |
| Cocina | `/rx-cocina` | Ver las comandas pagadas y marcarlas como servidas |
| Dueño | `/rx-admin` | Consultar ventas y pedidos; administrar menú, precios, fotografías, mesas y códigos QR |

Para verlas en la demostración:

- Panel del dueño: [https://restxperience-cxdx.onrender.com/rx-admin](https://restxperience-cxdx.onrender.com/rx-admin)
- Pantalla de cocina: [https://restxperience-cxdx.onrender.com/rx-cocina](https://restxperience-cxdx.onrender.com/rx-cocina)

En su propia instalación las rutas son las mismas, con la dirección de su página.

Las direcciones del dueño y de la cocina no aparecen en el menú de los comensales. Solo puede entrar quien las conozca y tenga la contraseña. La cocina no tiene acceso a ventas ni a la configuración.

## 2. Cómo funciona un pedido

1. El comensal escanea el QR de su mesa y se abre el menú.
2. Agrega platillos al carrito y, si lo desea, registra su correo.
3. Paga con tarjeta desde su celular.
4. **La comanda llega a cocina únicamente cuando el pago se confirma.** Sin pago, no se envía nada.
5. La cocina marca el pedido como servido.
6. El comensal puede calificar los platillos que pidió.

Si un comensal abre el menú y no paga, su sesión se cierra automáticamente a los 15 minutos.

En el panel del dueño, en **Configuración → Modo de comercio**, se elige la forma de trabajo:

| Modo | Descripción |
|---|---|
| Stripe | El comensal paga con tarjeta desde su celular. Es el modo recomendado. |
| SoftRestaurant | Funciona igual que Stripe y además envía el pedido al punto de venta SoftRestaurant. Esta conexión aún opera en modo de simulación. |
| Solo menú | Carta digital, sin carrito ni pagos. |

## 3. Cuentas necesarias

Todas las cuentas se abren **a nombre del restaurante** y se pagan directamente a cada empresa. Nuestro equipo no cobra ni recibe comisión por ellas.

| Servicio | Función | ¿Obligatorio? | Dónde se crea | Costo |
|---|---|---|---|---|
| GitHub | Resguardar el código del sistema. Render lo toma de ahí. | Sí | [github.com](https://github.com) | Gratuito |
| Render | Alojar la página y la base de datos (menú, pedidos y ventas) | Sí | [render.com](https://render.com) | Gratuito para pruebas; consulte la sección 6 |
| Stripe | Cobrar con tarjeta y depositar en su cuenta bancaria | Para cobrar | [stripe.com/mx](https://stripe.com/mx) | Comisión por cada cobro |
| Cloudflare R2 | Guardar las fotografías y videos de los platillos | Muy recomendable | [dash.cloudflare.com](https://dash.cloudflare.com) | Gratuito hasta 10 GB |

No se requiere contratar ningún servicio de inteligencia artificial: el asistente del menú funciona de manera interna. Los códigos QR también se generan sin costo.

## 4. Instalación paso a paso

La primera instalación toma entre 30 y 60 minutos. Tenga a la mano el archivo ZIP, un correo electrónico y una tarjeta bancaria.

### Paso 1. Subir el código a GitHub

Render lee el sistema desde GitHub, por lo que primero debe guardarse ahí.

1. Cree una cuenta gratuita en [github.com](https://github.com).
2. Descomprima el archivo ZIP en una carpeta de su computadora.
3. Descargue e instale [GitHub Desktop](https://desktop.github.com) e inicie sesión con su cuenta.
4. En GitHub Desktop, abra el menú **File → Add local repository** y seleccione la carpeta.
5. Aparecerá el aviso de que la carpeta no es un repositorio. Pulse **create a repository** y después **Create repository**.
6. Pulse **Publish repository**. Se recomienda mantener marcada la opción **Keep this code private**.

No utilice la opción de "subir archivos" de la página web de GitHub: el sistema contiene carpetas y esa opción no las conserva correctamente.

### Paso 2. Crear la página y la base de datos en Render

1. Cree una cuenta en [render.com](https://render.com). Lo más sencillo es registrarse con su cuenta de GitHub.
2. En el panel de Render, pulse **New → Blueprint**.
3. Seleccione su repositorio `restxperience` y la rama `main`. Si no aparece, pulse **Configure GitHub** y otorgue permiso a Render para verlo.
4. Render mostrará lo que va a crear:
   - **restxperience-db**: la base de datos.
   - **restxperience**: la página.
5. Se le pedirá llenar algunas claves. Por ahora, llene únicamente estas dos:

   | Clave | Qué escribir |
   |---|---|
   | `ADMIN_PASSWORD` | La contraseña del panel del dueño |
   | `KITCHEN_PASSWORD` | La contraseña de la pantalla de cocina |

   Deje las demás en blanco; se completan en los pasos 3 y 4. Las claves de la base de datos y de seguridad las genera Render automáticamente.
6. Pulse **Apply** (o **Deploy Blueprint**) y espere entre 5 y 10 minutos.
7. Cuando aparezca el estado **Live**, en la parte superior se mostrará la dirección de su página, por ejemplo `https://restxperience-xxxx.onrender.com`. Las letras finales las agrega Render cuando el nombre ya está ocupado.
8. Para comprobar que funciona, abra esa dirección agregando `/api/health` al final. Debe mostrarse `"ok":true`.

**Importante:** utilice siempre la opción **Blueprint**. Si crea la página manualmente con "New → Web Service", la base de datos no se conecta y la página no arranca (en el registro aparece el aviso "falta DATABASE_URL").

Al terminar, el sistema incluye un menú de ejemplo y 12 mesas para realizar pruebas.

### Paso 3. Conectar Stripe para cobrar con tarjeta

Sin este paso, la página funciona en **modo demostración**: el pago se simula y la comanda sí llega a cocina. Sirve para mostrar el sistema, no para cobrar.

**3.1 Obtener las llaves de Stripe**

1. Cree una cuenta en [stripe.com/mx](https://stripe.com/mx).
2. Active el **Modo de prueba** (Test mode) para comenzar sin movimientos de dinero real.
3. Entre a **Desarrolladores → Claves de API**. Ahí encontrará:
   - **Clave publicable**: comienza con `pk_test_`
   - **Clave secreta**: comienza con `sk_test_` (pulse "Mostrar")
4. En Render, abra el servicio **restxperience → Environment → Edit** y capture:

   | Clave | Valor |
   |---|---|
   | `STRIPE_SECRET_KEY` | La clave secreta `sk_test_...` |
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | La clave publicable `pk_test_...` |

5. Pulse **Save, rebuild, and deploy** y espere a que el estado vuelva a **Live**.

**3.2 Notificar a la página cuando se realiza un pago**

Este paso permite que la comanda se envíe a cocina en cuanto el pago se confirma.

1. En Stripe, entre a **Desarrolladores → Webhooks → Agregar destino** (Add endpoint).
2. Escriba la dirección de su página seguida de `/api/webhooks/stripe`. Ejemplo: `https://restxperience-xxxx.onrender.com/api/webhooks/stripe`
3. Seleccione los siguientes 4 eventos:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.expired`
   - `checkout.session.async_payment_failed`
4. Guarde. Stripe mostrará un **secreto de firma** que comienza con `whsec_`.
5. En Render, capture ese valor en `STRIPE_WEBHOOK_SECRET` y guarde nuevamente con **Save, rebuild, and deploy**.

Para confirmar, abra `/api/health`: debe mostrar `"stripe":true` y `"webhook":true`.

**3.3 Realizar un pago de prueba**

Utilice la tarjeta de prueba `4242 4242 4242 4242`, cualquier fecha futura y cualquier código de 3 dígitos. No se realiza ningún cargo.

**3.4 Activar cobros reales**

1. En Stripe, complete **Activar cuenta**: datos del negocio, RFC y la cuenta bancaria (CLABE) donde recibirá los pagos.
2. Desactive el modo de prueba y copie las llaves **reales** (`pk_live_...` y `sk_live_...`).
3. Repita el paso 3.2 en modo real. El secreto `whsec_` será distinto.
4. Sustituya las tres claves en Render y guarde.

### Paso 4. Guardar fotografías y videos en Cloudflare R2

Sin este paso es posible subir fotografías, pero **se borran cada vez que Render reinicia la página**. El menú, los precios y los pedidos no se pierden, porque se guardan en la base de datos.

1. Cree una cuenta en [dash.cloudflare.com](https://dash.cloudflare.com).
2. En el menú lateral, entre a **R2 Object Storage** y actívelo. Cloudflare puede solicitar una tarjeta, aunque no realiza cargos dentro del uso gratuito.
3. Pulse **Create bucket** y asígnele el nombre `restxperience-media`.
4. Dentro del bucket, entre a **Settings → Public access** y active la dirección pública (**r2.dev**). Copie esa dirección; tiene la forma `https://pub-xxxxxxxx.r2.dev`.
5. Regrese a R2 y abra **Manage API tokens → Create API token**:
   - Permiso: **Object Read & Write**
   - Bucket: únicamente `restxperience-media`
   - Al crearlo se mostrarán el **Access Key ID** y el **Secret Access Key**. Cópielos en ese momento; el secreto no vuelve a mostrarse.
6. En la página principal de R2 aparece su **Account ID**.
7. En Render, entre a **Environment → Edit** y capture:

   | Clave | Valor |
   |---|---|
   | `R2_ACCOUNT_ID` | Su Account ID |
   | `R2_ACCESS_KEY_ID` | El Access Key ID |
   | `R2_SECRET_ACCESS_KEY` | El Secret Access Key |
   | `R2_BUCKET` | `restxperience-media` |
   | `R2_PUBLIC_BASE_URL` | La dirección pública, sin `/` al final |

8. Guarde con **Save, rebuild, and deploy**.

### Paso 5. Configurar su restaurante

Entre a `https://<su-página>.onrender.com/rx-admin` con la contraseña del dueño.

1. **Configuración**: capture el nombre del restaurante, la frase de presentación y el mensaje de bienvenida. Elija el modo de comercio y, si lo desea, la comida del día.
2. **Productos**: cargue su menú.
   - Forma rápida: pulse **Descargar plantilla**, llénela en Excel con categoría, nombre, precio, descripción, ingredientes y calorías, guárdela en formato CSV y pulse **Subir CSV**. Si un platillo ya existe, solo se actualizan su precio y su descripción.
   - Uno por uno: cree una categoría y pulse **Nuevo producto**.
   - Seleccione cualquier platillo para cambiar precio, descripción, fotografía o video (de 15 a 35 segundos), o para ocultarlo cuando se agote.
3. **Mesas / QR**: elimine las mesas de ejemplo que no necesite y cree las suyas. Cada mesa muestra su código QR para imprimirlo y colocarlo en la mesa.
4. **Resumen** y **Pedidos**: aquí se consultan las ventas y el historial.

### Paso 6. Prueba completa antes de abrir al público

1. Escanee el QR de una mesa con su celular.
2. Realice un pedido y páguelo con la tarjeta de prueba.
3. Abra `/rx-cocina` en otra pantalla: debe aparecer la comanda. Márquela como servida.
4. Desde el celular, califique el platillo.
5. En `/rx-admin → Resumen`, verifique que aparezca la venta.

Si prefiere no realizar estos pasos, nuestro equipo puede hacer la instalación como servicio opcional.

## 5. Contraseñas

- Las contraseñas del dueño y de la cocina se cambian en Render: **Environment → `ADMIN_PASSWORD` / `KITCHEN_PASSWORD`**, y después **Save, rebuild, and deploy**.
- Si no se captura ninguna, se aplican las de demostración (`restx-admin` y `restx-kitchen`). **Cámbielas antes de atender a comensales.**

## 6. Costos y límites del plan gratuito

El sistema no tiene costo. Lo único que se paga son los servicios de otras empresas, y solo cuando decida dejarlo operando de forma permanente.

El plan gratuito de Render sirve para pruebas, pero tiene tres límites:

- La página se suspende tras 15 minutos sin visitas. La siguiente persona espera cerca de un minuto mientras se reactiva.
- **La base de datos gratuita se elimina a los 30 días.** Antes de esa fecha debe cambiarse a un plan de pago; de lo contrario, se pierden el menú, los pedidos y las ventas.
- Solo se permite una base de datos gratuita por cuenta.

Para operar con comensales se recomiendan los siguientes planes (precios aproximados; consulte [render.com/pricing](https://render.com/pricing)):

| Servicio | Plan | Costo mensual aproximado |
|---|---|---|
| Página (Render) | Starter | 7 USD |
| Base de datos (Render) | Basic | 6 USD |
| Fotografías (Cloudflare R2) | Gratuito hasta 10 GB | 0 USD |
| Cobros (Stripe) | Por transacción | Comisión por cobro; consulte [stripe.com/mx/pricing](https://stripe.com/mx/pricing) |

Para cambiar de plan: en Render, abra la página o la base de datos y entre a **Settings → Instance type**.

## 7. Solución de problemas

| Situación | Causa | Qué hacer |
|---|---|---|
| La página tarda un minuto en abrir | Estaba suspendida (plan gratuito) | Esperar, o cambiar al plan Starter |
| En Render aparece "falta DATABASE_URL" | La página no está conectada a la base de datos | Crear todo con Blueprint, o copiar la **Internal Database URL** de la base de datos y capturarla en la clave `DATABASE_URL` de la página |
| Las fotografías desaparecieron | Cloudflare R2 no está configurado | Realizar el paso 4 y volver a subirlas |
| Se cobró, pero la comanda no llegó a cocina | Falta el webhook de Stripe o su secreto | Revisar el paso 3.2 y que `/api/health` muestre `"webhook":true` |
| No es posible entrar al panel | La contraseña no coincide con la guardada en Render | Revisar `ADMIN_PASSWORD` en Render |
| El sistema dejó de funcionar al mes | Venció la base de datos gratuita | Cambiar la base de datos a un plan de pago antes de los 30 días |

## 8. Licencia

El texto completo se encuentra en [`LICENSE`](LICENSE). En resumen:

| Tema | Qué significa |
|---|---|
| Propiedad | La versión 1.0, entregada en el archivo ZIP, es de su restaurante desde la fecha de entrega. |
| Uso | Puede utilizarla en uno o varios establecimientos, modificarla, cambiarle nombre y logotipo, e instalarla a su criterio, sin solicitar autorización. |
| Costo del sistema | Ninguno. No hay licencia, mensualidad ni porcentaje sobre sus ventas. |
| Servicios con costo | Solo si usted los solicita: instalación, mantenimiento o modificaciones. Se acuerdan por separado y son opcionales. |
| Servicios de terceros | Render, Stripe y Cloudflare se contratan y pagan directamente a cada empresa. |
| Garantía | El sistema se entrega en su estado actual. Sin un contrato de mantenimiento, no incluye soporte. |
| Responsabilidades | Usted resguarda sus contraseñas, los datos de sus comensales y su aviso de privacidad. |

---

## Anexo técnico (para el personal de soporte)

### Tecnología

- Next.js (App Router) + TypeScript + Tailwind, Framer Motion
- Prisma + PostgreSQL 16
- Stripe Checkout + webhook
- Cloudflare R2 (compatible con S3) para fotografías y videos; sin R2 se guardan en `public/uploads`
- Docker. `render.yaml` define el servicio web (Docker) y la base de datos.

Al arrancar, el contenedor aplica las migraciones (`prisma migrate deploy`) y carga el menú de ejemplo solo si la base de datos está vacía.

### Variables de entorno

| Variable | Obligatoria | Origen |
|---|---|---|
| `DATABASE_URL` | Sí | Render la conecta desde `restxperience-db` |
| `ADMIN_PASSWORD` | Sí (por omisión, `restx-admin`) | La define el dueño |
| `ADMIN_SESSION_SECRET` | Sí | Render la genera |
| `KITCHEN_PASSWORD` | Sí (por omisión, `restx-kitchen`) | La define el dueño |
| `KITCHEN_SESSION_SECRET` | Sí | Render la genera |
| `STRIPE_SECRET_KEY` | Para cobrar | Stripe → Claves de API |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Para cobrar | Stripe → Claves de API |
| `STRIPE_WEBHOOK_SECRET` | Para cobrar | Stripe → Webhooks |
| `R2_ACCOUNT_ID` | Para fotografías | Cloudflare R2 |
| `R2_ACCESS_KEY_ID` | Para fotografías | Cloudflare R2 → API tokens |
| `R2_SECRET_ACCESS_KEY` | Para fotografías | Cloudflare R2 → API tokens |
| `R2_BUCKET` | Para fotografías | `restxperience-media` |
| `R2_PUBLIC_BASE_URL` | Para fotografías | URL pública del bucket |

`PORT` la asigna Render; no se configura.

### Rutas de la API

| Ruta | Uso |
|---|---|
| `GET /api/health` | Estado del servicio y de la configuración de Stripe y del webhook |
| `/api/session` | Abre o consulta la sesión de una mesa |
| `/api/orders`, `/api/orders/cancel` | Crear y cancelar pedidos |
| `/api/checkout/confirm` | Confirma el pago con Stripe al regresar del checkout |
| `POST /api/webhooks/stripe` | Recibe los eventos de Stripe y libera la comanda |
| `/api/purchases`, `/api/ratings`, `/api/reviews` | Historial del comensal, calificaciones y opiniones |
| `/api/chat` | Asistente del menú (reglas internas, sin servicio externo) |
| `/api/kitchen/login`, `/api/kitchen/orders` | Acceso y comandas de cocina |
| `/api/admin/login`, `/api/admin/data`, `/api/admin/upload` | Acceso, datos y carga de fotografías y videos del panel |

Servicios externos: Stripe, Cloudflare R2 y `api.qrserver.com` (genera las imágenes QR; no requiere llave).

### Ejecución local con Docker

No es necesario instalar Node.

```bash
docker compose up
```

Abra [http://localhost:3000](http://localhost:3000). La primera vez se instalan las dependencias, se aplican las migraciones y se carga el menú de ejemplo. PostgreSQL queda disponible en el puerto 5432.

Para volver a cargar el menú de ejemplo (borra menú, mesas y pedidos):

```bash
docker compose exec app sh -c "FORCE_SEED=1 npm run db:seed"
```

Para probar la imagen de producción:

```bash
docker compose --profile prod up --build web db
```

Para usar claves locales, copie `.env.example` como `.env`.
