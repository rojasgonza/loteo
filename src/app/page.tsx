"use client";
import {useState } from "react";
import Link from "next/link";
import Image from "next/image";


export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col items-center p-6">
      {/* Encabezado */}
      <header className="w-full max-w-4xl text-center py-10">
        <h1 className="text-4xl font-extrabold text-blue-800 mb-2">
          Gestión de Productos Finales
        </h1>
        <p className="text-lg text-blue-600">
          Accedé rápido a las secciones de tu sistema
        </p>
      </header>

      {/* Grid de opciones */}
      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl w-full">
        {[
          { href: "/insumos", title: "Insumos", desc: "Gestión de insumos disponibles" },
          { href: "/proveedores", title: "Proveedores", desc: "Listado y registro de proveedores" },
          { href: "/lotes_insumos", title: "Ingreso de insumos", desc: "Registrar lotes de insumos" },
          { href: "/productos", title: "Productos", desc: "Registro y control de productos" },
          { href: "/produccion", title: "Producción", desc: "Ingreso de producción" },
          { href: "/data", title: "Produccion por lotes", desc: "Productos finales con respectivos lotes" },
        ].map((item, i) => (
          <Link
            key={i}
            href={item.href}
            className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow duration-300 border border-blue-100 flex flex-col items-start"
          >
            <h2 className="text-xl font-semibold text-blue-800 mb-2">
              {item.title}
            </h2>
            <p className="text-gray-600 text-sm">{item.desc}</p>
          </Link>
        ))}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Gestión de Productos Finales
      </footer>
    </div>
  );
}

