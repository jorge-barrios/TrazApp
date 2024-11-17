// Archivo: /app/root.tsx

import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { json, redirect } from '@remix-run/node';
import type { LinksFunction, MetaFunction, LoaderFunction, LoaderArgs } from "@remix-run/node";
import { createServerSupabase } from "~/lib/supabase.server";
import { useEffect, useState } from 'react';
import { validateSession } from '~/utils/auth.server';

// Importamos nuestros estilos
import "./tailwind.css";
import "./fonts.css";

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

// Loader para manejar la sesión global
export const loader: LoaderFunction = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  
  // No validar sesión en rutas públicas
  if (url.pathname === '/login' || url.pathname === '/register') {
    return null;
  }

  try {
    const user = await validateSession(request);
    return json({ user });
  } catch (error) {
    // Redirigir a login si no hay sesión válida
    return redirect('/login');
  }
};

// Componente para manejar errores
function RootError() {
  return (
    <html>
      <head>
        <title>¡Ups! Algo salió mal</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              ¡Ups! Algo salió mal
            </h1>
            <p className="text-gray-600 mb-4">
              Lo sentimos, ha ocurrido un error. Por favor, intenta de nuevo.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Recargar página
            </button>
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  // Estado para el tema
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Efecto para cargar el tema guardado
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
    }
  }, []);

  // Efecto para registrar el Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/entry.worker.js')
        .then(() => {
          console.log('Service Worker registrado exitosamente');
        })
        .catch((error) => {
          console.error('Error al registrar el Service Worker:', error);
        });
    }
  }, []);

  return (
    <html lang="es" className={`h-full ${isDarkMode ? 'dark' : ''}`}>
      <head>
        <Meta />
        <Links />
      </head>
      <body className={`h-full ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// Manejo de errores
export function ErrorBoundary() {
  return <RootError />;
}