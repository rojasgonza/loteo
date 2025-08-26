'use client';

import { useState, useEffect, use } from 'react';
import { API_URL } from '../axios';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
type LoteInsumo = {
  id: number;
  lote: string;
  fecha_elaboracion: string;
  fecha_vencimiento: string;      // <-- nuevo campo
  insumoId: number;
  proveedorId: number;
  Insumo?: { id: number; nombre: string; unidad_medida: string };
  Proveedor?: { id: number; nombre: string };
  cantidadInicial: number;
  stockDisponible: number;

};

type Insumo = { id: number; nombre: string };
type Proveedor = { id: number; nombre: string };

export default function LotesInsumos() {
  const [lotes, setLotes] = useState<LoteInsumo[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [formData, setFormData] = useState({
    lote: '',
    fecha_elaboracion: '',
    fecha_vencimiento: '',       // <-- nuevo campo
    insumoId: '',
    proveedorId: '',
    cantidadInicial: 0
  });
  const { user, token, authFetch } = useAuth()
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Fetch lotes con relaciones
  const fetchLotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`/lotes_insumos`
      );
      if (!res.ok) throw new Error('Error al cargar lotes');
      const data = await res.json();
      setLotes(data);
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    }
    setLoading(false);
  };
  // Fetch insumos
  const fetchInsumos = async () => {
    try {
      const res = await authFetch(`/insumos`);
      if (!res.ok) throw new Error('Error al cargar insumos');
      const data = await res.json();
      setInsumos(data);
    } catch (err: any) {
      console.error(err.message || 'Error cargando insumos');
    }
  };

  // Fetch proveedores
  const fetchProveedores = async () => {
    try {
      const res = await authFetch(`/proveedores`);
      if (!res.ok) throw new Error('Error al cargar proveedores');
      const data = await res.json();
      setProveedores(data);
    } catch (err: any) {
      console.error(err.message || 'Error cargando proveedores');
    }
  };

  useEffect(() => {
    fetchLotes();
    fetchInsumos();
    fetchProveedores();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fecha_elaboracion) return alert('La fecha de elaboración es obligatoria');
    if (!formData.fecha_vencimiento) return alert('La fecha de vencimiento es obligatoria');
    if (!formData.insumoId) return alert('El insumo es obligatorio');
    if (!formData.proveedorId) return alert('El proveedor es obligatorio');

    try {
      const body = {
        lote: formData.lote,
        fecha_elaboracion: formData.fecha_elaboracion,
        fecha_vencimiento: formData.fecha_vencimiento,   // <-- enviar nuevo campo
        insumoId: Number(formData.insumoId),
        proveedorId: Number(formData.proveedorId),
        cantidadInicial: Number(formData.cantidadInicial)
      };

      let res;
      if (editingId) {
        res = await authFetch(`/lotes_insumos/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body),
        });
      } else {
        res = await authFetch(`/lotes_insumos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'

          },
          body: JSON.stringify(body),
        });
      }

      if (!res.ok) throw new Error('Error al guardar lote');

      const saved = await res.json();

      if (editingId) {
        setLotes(lotes.map(l => (l.id === editingId ? saved : l)));
        setEditingId(null);
      } else {
        setLotes([saved, ...lotes]);
      }

      setFormData(prev => ({
        lote: '',
        fecha_elaboracion: prev.fecha_elaboracion,
        fecha_vencimiento: prev.fecha_vencimiento,
        insumoId: '',
        proveedorId: prev.proveedorId,
        cantidadInicial: 0
      }));
    } catch (err: any) {
      alert(err.message || 'Error desconocido');
    }
    await fetchLotes();

  };

  const handleEdit = (lote: LoteInsumo) => {
    setFormData({
      lote: lote.lote,
      fecha_elaboracion: lote.fecha_elaboracion.split('T')[0],
      fecha_vencimiento: lote.fecha_vencimiento.split('T')[0],    // <-- asignar al editar
      insumoId: lote.insumoId.toString(),
      proveedorId: lote.proveedorId.toString(),
      cantidadInicial: lote.cantidadInicial
    });
    setEditingId(lote.id);

  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Querés eliminar este lote?')) return;
    try {
      const res = await authFetch(`/lotes_insumos/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        await Swal.fire({
          title: 'Error al borrar',
          timer: 2000,
          icon: 'error',
        });
      }

      setLotes(lotes.filter(l => l.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setFormData({ lote: '', fecha_elaboracion: '', fecha_vencimiento: '', insumoId: '', proveedorId: '', cantidadInicial: 0 });
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
  proveedores.sort(function (a, b) {
    if (a.nombre < b.nombre) { return -1; }
    if (a.nombre > b.nombre) { return 1; }
    return 0;
  })


  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);


  const handleImprimirEtiqueta = (l: LoteInsumo) => {
    const ventana = window.open('', 'Imprimir Etiqueta Térmica', 'width=400,height=700');
    if (!ventana) return alert('No se pudo abrir ventana de impresión');

    ventana.document.write(`
<html>
<head>
  <title>Etiqueta Lote</title>
  <style>
   @page {
      size: 100mm 80mm landscape; /* tamaño real y horizontal */
      margin: 0;
    }
html, body {
  height: 80mm;
  margin: 0;
  padding-top: 3mm; /* ajuste fino para inicio de impresión */
  padding-bottom: 3mm;
  width: 100mm;
  height: 80mm;
  font-family: monospace, monospace;
  font-size: 22px; /* más grande */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  box-sizing: border-box;
}

.logo {
  max-width: 50%;
  height: auto;
  margin-bottom: 4px;
}

.producto {
  font-weight: bold;
  font-size: 28px; /* más grande */
  margin-bottom: 4px;
}

.fechas {
  font-size: 20px; /* más grande */
  line-height: 1.3;
  margin-bottom: 4px;
}

.lote {
  font-size: 20px; /* más grande */
  letter-spacing: 3px;
  margin-bottom: 4px;
}

.proveedor {
  font-size: 20px; /* más grande */
  margin-bottom: 4px;
}

  </style>
</head>
<body>
  <img src="/logo.png" alt="Logo" class="logo" />
  <div class="producto">${l.Insumo?.nombre || 'Insumo Desconocido'}</div>
  <div class="proveedor">Proveedor: ${l.Proveedor?.nombre || 'Desconocido'}</div>
  <div class="fechas">
    <div><strong>Elab o ingreso:</strong> ${l.fecha_elaboracion?.split('T')[0] || ''}</div>
    <div><strong>Vencimiento:</strong> ${l.fecha_vencimiento?.split('T')[0] || ''}</div>
  </div>
  <div class="lote">Lote: ${l.lote}</div>

  <script>
    window.onload = function() {
      window.print();
      window.close();
    }
  </script>
</body>
</html>
  `);

    ventana.document.close();
  };

  // Agregar al estado:
  const [filtro, setFiltro] = useState({
    fechaDesde: '',
    fechaHasta: '',
    proveedorId: ''
  });

  // Función para manejar cambios en el filtro
  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFiltro(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Filtrar lotes antes de paginar
  const lotesFiltrados = lotes.filter(l => {
    const fechaElab = l.fecha_vencimiento.split('T')[0] || l.fecha_elaboracion.split('T')[0];

    const cumpleFechaDesde = filtro.fechaDesde ? fechaElab >= filtro.fechaDesde : true;
    const cumpleFechaHasta = filtro.fechaHasta ? fechaElab <= filtro.fechaHasta : true;
    const cumpleProveedor = filtro.proveedorId ? l.proveedorId === Number(filtro.proveedorId) : true;

    return cumpleFechaDesde && cumpleFechaHasta && cumpleProveedor;
  });

  const paginatedData = lotesFiltrados.slice((page - 1) * rowsPerPage, page * rowsPerPage);


  return (
    <ProtectedRoute nivelMinimo={2}>
      <main style={{ maxWidth: '80%', margin: "auto", padding: "24px", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
        <h1 className="text-3xl font-bold mb-6 text-center text-green-700">Lotes de Insumos</h1>

        <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">{editingId ? 'Editar Lote' : 'Agregar Lote'}</h2>

          <label className="block mb-2 font-medium text-gray-700">Número de Lote</label>
          <input
            type="text"
            name="lote"
            value={formData.lote}
            readOnly
            placeholder='generado automaticamente'
            className="w-full p-2 mb-4 border rounded bg-gray-100 cursor-not-allowed"
          />


          <label className="block mb-2 font-medium text-gray-700">Fecha de Elaboración / Ingreso</label>
          <input
            type="date"
            name="fecha_elaboracion"
            value={formData.fecha_elaboracion}
            onChange={handleChange}
            className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
            required

          />

          <label className="block mb-2 font-medium text-gray-700">Fecha de Vencimiento</label>   {/* NUEVO CAMPO */}
          <input
            type="date"
            name="fecha_vencimiento"
            value={formData.fecha_vencimiento}
            onChange={handleChange}
            className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
            required
          />

          <label className="block mb-2 font-medium text-gray-700">Insumo</label>
          <select
            name="insumoId"
            value={formData.insumoId}
            onChange={handleChange}
            className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
            required
          >
            <option value="">Seleccionar insumo</option>
            {insumos.map(i => (
              <option key={i.id} value={i.id}>
                {i.nombre}
              </option>
            ))}
          </select>
          <label className="block mb-2 font-medium text-gray-700">Cantidad Inicial</label>
          <input
            type="number"
            name="cantidadInicial"
            value={formData.cantidadInicial}
            onChange={handleChange}
            step="0.01"
            className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
            required
          />

          <label className="block mb-2 font-medium text-gray-700">Proveedor</label>
          <select
            name="proveedorId"
            value={formData.proveedorId}
            onChange={handleChange}
            className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
            required
          >
            <option value="">Seleccionar proveedor</option>
            {proveedores.map(p => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setFormData(prev => ({
                ...prev,
                fecha_elaboracion: '',
                fecha_vencimiento: '',
                proveedorId: '',
              }))}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
            >
              Resetear fechas y proveedor
            </button>

            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              {editingId ? 'Actualizar' : 'Agregar'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({ lote: '', fecha_elaboracion: '', fecha_vencimiento: '', insumoId: '', proveedorId: '', cantidadInicial: 0 });
                }}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        <section className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Lotes Registrados</h2>

          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="bg-[#ffdb58] m-4 hover:bg-yellow-400 text-black font-bold py-2 px-4 rounded-xl shadow-md transition-all duration-300 hover:scale-105 active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
              <path fillRule="evenodd" d="M9.53 2.47a.75.75 0 0 1 0 1.06L4.81 8.25H15a6.75 6.75 0 0 1 0 13.5h-3a.75.75 0 0 1 0-1.5h3a5.25 5.25 0 1 0 0-10.5H4.81l4.72 4.72a.75.75 0 1 1-1.06 1.06l-6-6a.75.75 0 0 1 0-1.06l6-6a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
            </svg>
          </button>
          <span>Página {page}</span>
          <button disabled={page * rowsPerPage >= lotes.length} onClick={() => setPage(p => p + 1)} className='m-4 bg-[#ff5757] hover:bg-red-500 text-white font-bold py-2 px-4 rounded-xl shadow-md transition-all duration-300 hover:scale-105 active:scale-95'><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
            <path fillRule="evenodd" d="M14.47 2.47a.75.75 0 0 1 1.06 0l6 6a.75.75 0 0 1 0 1.06l-6 6a.75.75 0 1 1-1.06-1.06l4.72-4.72H9a5.25 5.25 0 1 0 0 10.5h3a.75.75 0 0 1 0 1.5H9a6.75 6.75 0 0 1 0-13.5h10.19l-4.72-4.72a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
          </button>

          {loading && <p>Cargando lotes...</p>}
          {error && <p className="text-red-600">{error}</p>}
          <div className="mb-4 flex gap-4 flex-wrap items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha Desde</label>
              <input
                type="date"
                name="fechaDesde"
                value={filtro.fechaDesde}
                onChange={handleFiltroChange}
                className="border p-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha Hasta</label>
              <input
                type="date"
                name="fechaHasta"
                value={filtro.fechaHasta}
                onChange={handleFiltroChange}
                className="border p-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Proveedor</label>
              <select
                name="proveedorId"
                value={filtro.proveedorId}
                onChange={handleFiltroChange}
                className="border p-2 rounded"
              >
                <option value="">Todos</option>
                {proveedores.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setFiltro({ fechaDesde: '', fechaHasta: '', proveedorId: '' })}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
            >
              Limpiar filtros
            </button>
          </div>

          {!loading && !error && (
            <div style={{ overflowX: 'auto', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #d1d5db', backgroundColor: 'white' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#d1fae5', position: 'sticky', top: 0 }}>
                  <tr>
                    <th style={{ padding: '12px 20px', borderBottom: '1px solid #d1d5db', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem' }}>Número de Lote</th>
                    <th style={{ padding: '12px 20px', borderBottom: '1px solid #d1d5db', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem' }}>Fecha de Elaboración</th>
                    <th style={{ padding: '12px 20px', borderBottom: '1px solid #d1d5db', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem' }}>Fecha de Vencimiento</th> {/* nuevo */}
                    <th style={{ padding: '12px 20px', borderBottom: '1px solid #d1d5db', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem' }}>Insumo</th>
                    <th style={{ padding: '12px 20px', borderBottom: '1px solid #d1d5db', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem' }}>Inicial</th>
                    <th style={{ padding: '12px 20px', borderBottom: '1px solid #d1d5db', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem' }}>Disponible</th>
                    <th style={{ padding: '12px 20px', borderBottom: '1px solid #d1d5db', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem' }}>U. MED.</th>

                    <th style={{ padding: '12px 20px', borderBottom: '1px solid #d1d5db', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem' }}>Proveedor</th>
                    <th style={{ padding: '12px 20px', borderBottom: '1px solid #d1d5db', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map(l => (
                      <tr key={l.id} className="hover:bg-gray-100">
                        <td style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb' }}>{l.lote}</td>
                        <td style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb' }}>{l.fecha_elaboracion.split('T')[0] || "desconocido"}</td>
                        <td style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb' }}>{l.fecha_vencimiento.split('T')[0]}</td> {/* nuevo */}
                        <td style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb' }}>{l.Insumo?.nombre || 'Desconocido'}</td>
                        <td style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb' }}>{l.cantidadInicial || 'Desconocido'}</td>
                        <td style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb' }}>{l.stockDisponible || 'Desconocido'}</td>
                        <td style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb' }}>{l.Insumo?.unidad_medida || 'Desconocido'}</td>

                        <td style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb' }}>{l.Proveedor?.nombre || 'Desconocido'}</td>
                        <td style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb' }} className="">
                          <button
                            onClick={() => handleEdit(l)}
                            className="bg-yellow-400 px-2 py-1 rounded hover:bg-yellow-500 transition"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                              <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                              <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                            </svg>

                          </button>
                          <button
                            onClick={() => handleDelete(l.id)}
                            className="bg-red-500 px-2 py-1 rounded hover:bg-red-600 text-white transition"

                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                              <path fillRule="evenodd" d="M2.515 10.674a1.875 1.875 0 0 0 0 2.652L8.89 19.7c.352.351.829.549 1.326.549H19.5a3 3 0 0 0 3-3V6.75a3 3 0 0 0-3-3h-9.284c-.497 0-.974.198-1.326.55l-6.375 6.374ZM12.53 9.22a.75.75 0 1 0-1.06 1.06L13.19 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 1 0 1.06-1.06L15.31 12l1.72-1.72a.75.75 0 1 0-1.06-1.06l-1.72 1.72-1.72-1.72Z" clipRule="evenodd" />
                            </svg>

                          </button>


                          <button
                            onClick={() => handleImprimirEtiqueta(l)}
                            className="bg-green-500 px-2 py-1 rounded text-white hover:bg-green-600 transition"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
                            </svg>
                          </button>

                        </td>

                      </tr>

                    ))

                  )
                    : (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-gray-500">
                          No hay lotes registrados.
                        </td>
                      </tr>
                    )}

                </tbody>


              </table>
            </div>
          )}
        </section>
      </main>
    </ProtectedRoute>
  );
}
