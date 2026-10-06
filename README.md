# Suites Gomez Arena

Web para reserva de mesas VIP en Gomez Western Wear Arena, Mesquite TX.

## Tecnologías

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **Pagos:** Stripe (links predefinidos)
- **Deploy:** Vercel

## Estructura

```
suites-gomez-main/
├── src/
│   ├── components/     # Componentes React
│   ├── hooks/          # Hooks personalizados
│   ├── lib/            # Configuración (Supabase)
│   ├── App.jsx         # Componente principal
│   └── main.jsx        # Entry point
├── supabase/
│   ├── migrations/     # SQL de tablas
│   └── functions/      # Edge Functions
├── public/             # Assets estáticos
└── package.json
```

## Cómo agregar un evento nuevo

1. Ir a Supabase → Table Editor → `eventos`
2. Click en **Insert row**
3. Completar:
   - `id`: identificador único (ej: `stage-night-2026`)
   - `nombre`: nombre del evento
   - `fecha`: fecha del evento
   - `activo`: `true`
   - `precio_gold`: precio mesa gold
   - `precio_silver`: precio mesa silver
   - `mesas_gold`: cantidad de mesas gold
   - `mesas_silver`: cantidad de mesas silver
   - `flyer`: nombre del archivo en `/public`
   - `link_gold`: link de pago Stripe para gold
   - `link_silver`: link de pago Stripe para silver
4. Guardar

## Cómo bloquear mesas

1. Ir a Supabase → Table Editor → `mesas`
2. Click en **Insert row**
3. Completar:
   - `evento`: el id del evento
   - `numero`: número de mesa
   - `categoria`: `gold` o `silver`
   - `estado`: `bloqueada`
4. Guardar

Para desbloquear: borrar la fila.

## Cómo ver ventas

1. Ir a Supabase → Table Editor → `mesas`
2. Filtrar por `estado = vendida`

## Variables de entorno

Copiá `.env.example` a `.env` y completá las claves.

## Desarrollo

```bash
npm install
npm run dev
```

## Deploy

El sitio se despliega en Vercel. La Edge Function de Supabase se despliega con:

```bash
supabase functions deploy webhook-stripe
```
