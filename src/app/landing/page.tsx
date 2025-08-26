"use client";
import { useState } from "react";
import Link from "next/link";
import ProtectedRoute from '../components/ProtectedRoute';

// Definir interfaz para las secciones
interface Section {
  href: string;
  title: string;
  desc: string;
  video: string;
}

export default function Landing() {
  const [activeModal, setActiveModal] = useState<number | null>(null);

  // Datos de cada sección con sus videos
  const sections: Section[] = [
    { 
      href: "/insumos", 
      title: "Insumos", 
      desc: "Gestión de insumos disponibles",
      video: "/videos/insumos.mp4"
    },
    { 
      href: "/proveedores", 
      title: "Proveedores", 
      desc: "Listado y registro de proveedores",
      video: "/videos/proveedores.mp4"
    },
    { 
      href: "/lotes_insumos", 
      title: "Ingreso de insumos", 
      desc: "Registrar lotes de insumos",
      video: "/videos/lotes_insumos.mp4"
    },
    { 
      href: "/productos", 
      title: "Productos", 
      desc: "Registro y control de productos",
      video: "/videos/productos.mp4"
    },
    { 
      href: "/produccion", 
      title: "Producción", 
      desc: "Ingreso de producción",
      video: "/videos/produccion.mp4"
    },
    { 
      href: "/data", 
      title: "Produccion por lotes", 
      desc: "Productos finales con respectivos lotes",
      video: "/videos/produccion_lotes.mp4"
    },
  ];

  const openModal = (index: number) => {
    setActiveModal(index);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <ProtectedRoute>
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
          {sections.map((item, index) => (
            <div key={index} className="relative group">
              <Link
                href={item.href}
                className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow duration-300 border border-blue-100 flex flex-col items-start h-full"
              >
                <h2 className="text-xl font-semibold text-blue-800 mb-2">
                  {item.title}
                </h2>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </Link>
              
              {/* Botón para abrir el modal de video */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openModal(index);
                }}
                className="absolute top-3 right-3 bg-blue-100 text-blue-700 rounded-full p-2 hover:bg-blue-200 transition-colors opacity-0 group-hover:opacity-100"
                aria-label={`Ver video tutorial de ${item.title}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </main>

        {/* Footer */}
        <footer className="mt-auto py-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Gestión de Productos Finales
        </footer>

        {/* Modal para videos */}
        {activeModal !== null && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={closeModal}>
            <div className="bg-white rounded-xl overflow-hidden shadow-2xl w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
              <div className="relative">
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                  aria-label="Cerrar modal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                <div className="relative pt-[56.25%]"> {/* Relación de aspecto 16:9 */}
                  <video 
                    className="absolute top-0 left-0 w-full h-full" 
                    controls 
                    autoPlay
                    key={sections[activeModal].video} // Forzar recarga al cambiar video
                  >
                    <source src={sections[activeModal].video} type="video/mp4" />
                    Tu navegador no soporta la reproducción de videos.
                  </video>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Tutorial: {sections[activeModal].title}</h3>
                <p className="text-gray-600">
                  {sections[activeModal].desc}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}