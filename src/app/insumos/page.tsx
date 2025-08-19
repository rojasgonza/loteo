'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '../axios';
type Insumo = {
  id: number;
  nombre: string;
  unidad_medida: string;
};

export default function Insumos() {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [formData, setFormData] = useState({ nombre: '', unidad_medida: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const handleEdit = (insumo: Insumo) => {
    setFormData({ nombre: insumo.nombre, unidad_medida: insumo.unidad_medida });
    setEditingId(insumo.id);
  };

  // Cargar insumos desde backend
  const fetchInsumos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/insumos`);
      if (!res.ok) throw new Error('Error al cargar insumos');
      const data = await res.json();
      setInsumos(data);
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInsumos();
  }, []);

  // Manejo inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return alert('El nombre es obligatorio');

    try {
      let res;
      if (editingId) {
        // EDITAR
        res = await fetch(`${API_URL}/insumos/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        // CREAR
        res = await fetch(`${API_URL}/insumos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      if (!res.ok) throw new Error('Error al guardar insumo');

      const saved = await res.json();

      if (editingId) {
        setInsumos(insumos.map(i => (i.id === editingId ? saved : i)));
        setEditingId(null);
      } else {
        setInsumos([...insumos, saved]);
      }

      setFormData({ nombre: '', unidad_medida: '' });
    } catch (err: any) {
      alert(err.message || 'Error desconocido');
    }
  };
  const handleDelete = async (id: number) => {
    if (!confirm('¿Querés eliminar este insumo?')) return;

    try {
      const res = await fetch(`${API_URL}/insumos/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al eliminar insumo');
      setInsumos(insumos.filter(i => i.id !== id));
      // Si estabas editando ese insumo, cancelá la edición
      if (editingId === id) {
        setEditingId(null);
        setFormData({ nombre: '', unidad_medida: '' });
      }
    } catch (err: any) {
      alert(err.message || 'Error desconocido');
    }
  };

  insumos.sort(function (a, b) {
    if (a.nombre < b.nombre) { return -1; }
    if (a.nombre > b.nombre) { return 1; }
    return 0;
  })

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(15);

  const paginatedData = insumos.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <main style={{ maxWidth: '80%', margin: "auto", padding: "24px", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">Lista de Insumos</h1>

      <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? 'Editar Insumo' : 'Agregar Insumo'}
        </h2>

        <label className="block mb-2 font-medium text-gray-700">Nombre</label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <label className="block mb-2 font-medium text-gray-700">Unidad de Medida</label>
        <input
          type="text"
          name="unidad_medida"
          value={formData.unidad_medida}
          onChange={handleChange}
          className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {editingId ? 'Actualizar' : 'Agregar'}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setFormData({ nombre: '', unidad_medida: '' });
            }}
            className="ml-4 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
          >
            Cancelar
          </button>
        )}
      </form>


      <section className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Insumos Registrados</h2>
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="bg-[#ffdb58] m-4 hover:bg-yellow-400 text-black font-bold py-2 px-4 rounded-xl shadow-md transition-all duration-300 hover:scale-105 active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
            <path fillRule="evenodd" d="M9.53 2.47a.75.75 0 0 1 0 1.06L4.81 8.25H15a6.75 6.75 0 0 1 0 13.5h-3a.75.75 0 0 1 0-1.5h3a5.25 5.25 0 1 0 0-10.5H4.81l4.72 4.72a.75.75 0 1 1-1.06 1.06l-6-6a.75.75 0 0 1 0-1.06l6-6a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
          </svg>
        </button>
        <span>Página {page}</span>
        <button disabled={page * rowsPerPage >= insumos.length} onClick={() => setPage(p => p + 1)} className='m-4 bg-[#ff5757] hover:bg-red-500 text-white font-bold py-2 px-4 rounded-xl shadow-md transition-all duration-300 hover:scale-105 active:scale-95'><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
          <path fillRule="evenodd" d="M14.47 2.47a.75.75 0 0 1 1.06 0l6 6a.75.75 0 0 1 0 1.06l-6 6a.75.75 0 1 1-1.06-1.06l4.72-4.72H9a5.25 5.25 0 1 0 0 10.5h3a.75.75 0 0 1 0 1.5H9a6.75 6.75 0 0 1 0-13.5h10.19l-4.72-4.72a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
        </button>
        {loading && <p>Cargando insumos...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && (
          <div style={{ overflowX: 'auto', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #d1d5db', backgroundColor: 'white' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#d1fae5', position: 'sticky', top: 0 }}>
                <tr>
                  <th style={{ padding: '12px 20px', borderBottom: '1px solid #d1d5db', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem' }}>Nombre</th>
                  <th style={{ padding: '12px 20px', borderBottom: '1px solid #d1d5db', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem' }}>Unidad de Medida</th>
                  <th style={{ padding: '12px 20px', borderBottom: '1px solid #d1d5db', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map(i => (
                    <tr key={i.id} className="hover:bg-gray-100">
                      <td style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb' }}>{i.nombre}</td>
                      <td style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb' }}>{i.unidad_medida}</td>
                      <td style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb' }} className='py-2 px-4 space-x-2'>
                        <button
                          onClick={() => handleEdit(i)}
                          className="bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500 transition"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                            <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                            <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(i.id)}
                          className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 text-white transition"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                            <path fillRule="evenodd" d="M2.515 10.674a1.875 1.875 0 0 0 0 2.652L8.89 19.7c.352.351.829.549 1.326.549H19.5a3 3 0 0 0 3-3V6.75a3 3 0 0 0-3-3h-9.284c-.497 0-.974.198-1.326.55l-6.375 6.374ZM12.53 9.22a.75.75 0 1 0-1.06 1.06L13.19 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 1 0 1.06-1.06L15.31 12l1.72-1.72a.75.75 0 1 0-1.06-1.06l-1.72 1.72-1.72-1.72Z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-gray-500">
                      No hay insumos registrados.
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>
        )}
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setFormData({ nombre: '', unidad_medida: '' });
            }}
            className="mt-4 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
          >
            Cancelar
          </button>
        )}

      </section>

    </main>
  );
}
