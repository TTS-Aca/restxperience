# RestXperience — Plan técnico

> Regla de negocio central: **primero se paga, después se envía la comanda a la mesa**.  
> Sin pago confirmado no hay comanda. Sesión sin concretar: **15 minutos** → se cierra.

---

## 1. Tres modos de comercio

| Modo | Qué ve el cliente | Cuándo sale la comanda |
|------|-------------------|------------------------|
| **stripe** (foco actual) | Menú + carrito + Pagar (Stripe / demo) | Solo tras pago confirmado |
| **softrestaurant** | Igual; cobro + envío POS | Solo tras pago; luego stub/endpoint SoftRestaurant |
| **menu_only** | Solo catálogo visual | Nunca (sin carrito ni pedidos) |

Default del seed: **`stripe`**.

---

## 2. Diagrama de flujo (pago primero)

```mermaid
flowchart TD
  start([Cliente escanea QR]) --> session[Abrir o crear Session]
  session --> ttl{Expiro 15 min sin pago?}
  ttl -->|Si| close[Cerrar sesion] --> rescan[Escanear QR de nuevo]
  ttl -->|No| mode{commerceMode?}

  mode -->|menu_only| browseOnly[Explorar menu sin carrito]
  browseOnly --> endView([Fin consulta])

  mode -->|stripe o softrestaurant| menu[Menu + carrito]
  menu --> cart[Armar carrito]
  cart --> payBtn[Pagar y enviar a mi mesa]
  payBtn --> pending[Crear Order pending_payment]
  pending --> checkout{Stripe keys?}
  checkout -->|Si| stripePay[Checkout Stripe]
  checkout -->|No| demoPay[Checkout demo]
  stripePay --> confirm{Pago OK?}
  demoPay --> confirm
  confirm -->|No / cancel| noComanda[NO se envia comanda]
  noComanda --> endCancel([Pedido cancelado o pendiente])
  confirm -->|Si| fulfill[fulfillPaidOrder]
  fulfill --> paid[Order paid + comandaSent=true]
  paid --> kitchen[Comanda visible en admin / mesa]
  paid --> sr{modo softrestaurant?}
  sr -->|Si| pos[Enviar a SoftRestaurant]
  sr -->|No| done
  pos --> done[Session paid + reseña habilitada]
```

---

## 3. Casos de uso (actualizados)

```mermaid
flowchart LR
  cliente((Cliente))
  admin((Admin))
  stripe((Stripe))
  soft((SoftRestaurant))

  subgraph system [RestXperience]
    uc1[UC01 Sesion QR 15min]
    uc2[UC02 Explorar menu]
    uc3[UC03 Carrito - modos pago]
    uc4[UC04 Pagar primero]
    uc5[UC05 Liberar comanda post-pago]
    uc6[UC06 Resena post-pago]
    uc7[UC07 Chatbot]
    uc8[UC08 Configurar commerceMode]
    uc9[UC09 Ver comandas pagadas]
  end

  cliente --> uc1 & uc2 & uc3 & uc4 & uc6 & uc7
  uc4 --> stripe
  uc5 --> soft
  admin --> uc8 & uc9
```

---

## 4. Blueprint — estados de Order

```
pending_payment  →  (pago OK)  →  paid + comandaSent=true
                 →  (cancel)   →  cancelled   [nunca hubo comanda]
```

**Sesión**
- `open` + `expiresAt` = now + 15 min (se renueva con actividad mientras no expire)
- Sin pago en 15 min → `closed`
- Tras pago → `paid` (habilita reseña)

---

## 5. Archivos clave del flujo de pago

| Archivo | Rol |
|---------|-----|
| `src/lib/commerce.ts` | Modos + TTL 15 min |
| `src/lib/session.ts` | Crear/renovar/expirar sesión |
| `src/lib/stripe.ts` | Checkout Stripe o demo |
| `src/lib/fulfill.ts` | **Único** lugar que marca pago y suelta comanda |
| `src/app/api/orders/route.ts` | Crea `pending_payment` + URL checkout |
| `src/app/api/checkout/confirm/route.ts` | Confirma pago → fulfill |
| `/mesa/[token]/pago` | Return URL post-Stripe/demo |

---

## 6. SoftRestaurant (pendiente de params)

Por ahora stub en `src/lib/softrestaurant.ts`. Cuando tengas el contrato Open API / params, se conecta el endpoint en admin. La regla no cambia: **solo se llama después del pago**.
