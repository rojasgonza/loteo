'use client';

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { Menu, X } from "lucide-react";

export default function Navbar() {
    const { user, isAuthenticated, logout, loading } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    const navigation = [
        { name: 'Insumos', href: '/insumos', nivelMinimo: 2 },
        { name: 'Proveedores', href: '/proveedores', nivelMinimo: 2 },
        { name: 'Ingreso de insumos', href: '/lotes_insumos', nivelMinimo: 2 },
        { name: 'Productos', href: '/productos', nivelMinimo: 2 },
        { name: 'Produccion', href: '/produccion', nivelMinimo: 2 },
        { name: 'Producciones', href: '/data', nivelMinimo: 1 },
    ];

    if (loading) {
        return (
            <nav className="bg-gray-800 h-16 flex items-center justify-between px-6">
                <div className="w-40 h-6 bg-gray-700 rounded-md animate-pulse"></div>
                <div className="flex gap-4">
                    <div className="w-20 h-9 bg-gray-700 rounded-md animate-pulse"></div>
                    <div className="w-24 h-9 bg-gray-700 rounded-md animate-pulse"></div>
                </div>
            </nav>
        );
    }

    // Si es usuario nivel 3, ve todo; si no, solo links permitidos
    const filteredLinks = isAuthenticated && user
        ? user.nivel === 3
            ? navigation // nivel 3 ve todos
            : navigation.filter(link => link.nivelMinimo === 1) // los demás solo nivel 1
        : [];


   return (
  <nav className="bg-gray-800 shadow-md">
    <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
      {/* Logo */}
      <Link
        href={isAuthenticated ? "/" : "/"}
        className="text-white font-bold text-xl"
      >
        Sistema de Producción
      </Link>

      {/* Botón menú (mobile) */}
      <button
        className="md:hidden text-white"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Links desktop */}
      <div className="hidden md:flex items-center gap-6">
        {isAuthenticated ? (
          <>
            {filteredLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white hover:bg-gray-700 px-3 py-2 rounded-md transition"
              >
                {link.name}
              </Link>
            ))}

            {/* Menú de usuario con group-hover */}
            <div className="relative group">
              <button className="flex items-center gap-2 text-white px-3 py-2 rounded-md hover:bg-gray-700 transition">
                👤 {user?.nombre} <span>▼</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:visible group-hover:opacity-100 transition">
                <div className="px-4 py-2 text-gray-700 border-b">
                  Nivel:{" "}
                  {user?.nivel === 1
                    ? "Usuario"
                    : user?.nivel === 2
                    ? "Avanzado"
                    : "Administrador"}
                </div>
                <Link
                  href={"/editar_usuarios"}
                  hidden={user?.nivel !== 3}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                >
                  Usuarios
                </Link>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-white hover:bg-gray-700 px-3 py-2 rounded-md transition"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/registro"
              className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md transition"
            >
              Registrarse
            </Link>
          </>
        )}
      </div>
    </div>

    {/* Menú móvil */}
    {menuOpen && (
      <div className="md:hidden px-6 pb-4 flex flex-col gap-2 bg-gray-800">
        {isAuthenticated ? (
          <>
            {filteredLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white hover:bg-gray-700 px-3 py-2 rounded-md transition"
                onClick={() => setMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="text-white px-3 py-2 border-t border-gray-700">
              Nivel:{" "}
              {user?.nivel === 1
                ? "Usuario visita"
                : user?.nivel === 2
                ? "Avanzado"
                : "Administrador"}
            </div>
            <button
              onClick={() => {
                logout();
                setMenuOpen(false);
              }}
              className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-md text-left"
            >
              Cerrar Sesión
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-white hover:bg-gray-700 px-3 py-2 rounded-md transition"
              onClick={() => setMenuOpen(false)}
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/registro"
              className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md transition"
              onClick={() => setMenuOpen(false)}
            >
              Registrarse
            </Link>
          </>
        )}
      </div>
    )}
  </nav>
);

}
