// Archivo: app/root.tsx
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";

import "./tailwind.css";
import "./fonts.css"; // Vamos a crear este archivo

export const links: LinksFunction = () => [
  { rel: "manifest", href: "/manifest.json" },
  { rel: "icon", href: "/favicon.ico" },
  { rel: "apple-touch-icon", href: "/icons/icon-192x192.png" },
  {
    rel: "apple-touch-startup-image",
    href: "/icons/icon-512x512.png",
  }
];

export const meta: MetaFunction = () => {
  return [
    { title: "TrazApp" },
    { charSet: "utf-8" },
    { name: "viewport", content: "width=device-width,initial-scale=1" },
    { name: "theme-color", content: "#ffffff" },
    { name: "mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-status-bar-style", content: "default" },
    { name: "apple-mobile-web-app-title", content: "TrazApp" },
    { 
      name: "description", 
      content: "Sistema de trazabilidad de exámenes médicos" 
    },
  ];
};

export default function App() {
  return (
    <html lang="es" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}