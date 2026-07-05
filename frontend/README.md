This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Map Integration (MapLibre GL JS)

This project has migrated its map visualization layer from a Google Maps mock to **MapLibre GL JS** using **CartoDB Dark Matter** raster tiles.

- **No API Keys Required**: The maps run completely out-of-the-box using open-source, keyless, and billing-free OpenStreetMap-based tiles hosted by CARTO.
- **Dynamic Threat Layers**: State polygons are highlighted using boundaries from `public/india_states.geojson` and styled in real-time based on calculated threat levels (Low, Moderate, High, Critical) synced directly with the interactive simulation sliders.
- **Animated Indicators**: Flash flood, cyclone, landslide, and heatwave anomalies are plotted as animated pinging markers at the calculated centroid of affected states.
- **Tactical Overlay Tooltip**: Hovering over states shows real-time risk scores, active alerts, and metadata in a dark command-center aesthetic.
- **Zero Configuration**: Simply run `npm install` and `npm run dev` to launch the dashboard locally. No `.env` map configuration or keys are needed.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
