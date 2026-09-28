This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Color y tipo de celebración

En **Dashboard → Diseño de invitación → Datos principales** se eligen el color
principal y el tipo de celebración (XV años, boda u otra celebración). El color
se aplica a Aura, Editorial y al sobre; los textos pequeños usan una variante
más oscura para mantener la legibilidad. Aura adapta sus textos y símbolos al
tipo de evento. Guarda los cambios y abre la vista previa para revisar el resultado.

Se utiliza el JSON existente de `eventos.configuracion`: `tema.colorAcento`
(color hexadecimal `#RRGGBB`) y `tipoEvento` (`xv`, `boda`, `otro`). No requiere
columnas nuevas ni migración con la función `guardar_editor_evento` del repositorio.
El identificador interno `aura_xv` se conserva para las invitaciones existentes;
sin `tipoEvento`, Aura mantiene XV años como valor predeterminado.
