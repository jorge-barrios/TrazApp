import type { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
  const manifest = {
    name: "TrazApp",
    short_name: "TrazApp",
    description: "Sistema de trazabilidad de exámenes médicos",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      }
    ]
  };

  return new Response(JSON.stringify(manifest), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=31536000",
    },
  });
};