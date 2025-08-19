'use client';

import { useEffect, useMemo, useState } from 'react';
import { API_URL } from '../axios';
import Link from 'next/link';
type ProductoFinal = { id: number; nombre: string; unidad_medida: string };
type Proveedor = { id: number; nombre: string };
type Insumo = { id: number; nombre: string; unidad_medida: string };
type LoteInsumo = {
    id: number;
    lote?: string;
    fecha_elaboracion?: string;
    fecha_vencimiento?: string;
    insumo?: Insumo;
    proveedor?: Proveedor;
};

type ProduccionDetalle = {
    id: number;
    loteInsumo?: LoteInsumo;
    cantidadUsada: number;
};
type Produccion = {
    id: number;
    productoFinalId: number;
    fechaProduccion: string;
    fecha_vencimiento: string;
    fecha_congelado: string;
    cantidadProducida: number;
    productoFinal?: ProductoFinal;
    detalles?: ProduccionDetalle[];
};


export default function ListadoProduccionPro() {
    const [producciones, setProducciones] = useState<Produccion[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [modalOpen, setModalOpen] = useState(false);
    const [modalProduccion, setModalProduccion] = useState<Produccion | null>(null);

    // Modal impresión cantidad manual
    const [modalImprimirOpen, setModalImprimirOpen] = useState(false);
    const [cantidadManual, setCantidadManual] = useState<number>(1);

    useEffect(() => {
        fetchProducciones();
    }, []);

    const fetchProducciones = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/produccion`);
            if (!res.ok) throw new Error('Error cargando producciones');
            const data = await res.json();
            setProducciones(data);
        } catch (e: any) {
            setError(e.message);
        }
        setLoading(false);
    };

    console.log(producciones)
    const formatDate = (isoDate: string) => {
        const d = new Date(isoDate);
        return d.toLocaleDateString('es-AR');
    };

    const openModal = (produccion: Produccion) => {
        setModalProduccion(produccion);
        setCantidadManual(1);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setModalProduccion(null);
        setModalImprimirOpen(false);
    };

    const copiarAlPortapapeles = () => {
        if (!modalProduccion) return;
        let texto = `
Producto Final: ${modalProduccion.productoFinal?.nombre + '' + modalProduccion.productoFinal?.unidad_medida || 'Desconocido'}
Fecha Elaboración: ${modalProduccion.fechaProduccion.split('T')[0]}
Fecha Vencimiento: ${modalProduccion.fecha_vencimiento.split('T')[0]}
Fecha Vencimiento: ${modalProduccion.fecha_congelado.split('T')[0]}

${!modalProduccion.fecha_congelado ? null : "tiene"}
Cantidad Producida: ${modalProduccion.cantidadProducida}

Insumos usados:
`;
        modalProduccion.detalles?.forEach(d => {
            texto += `- Lote: ${d.loteInsumo?.lote || 'N/D'} | Insumo: ${d.loteInsumo?.insumo?.nombre || 'N/D'} | Unidad: ${d.loteInsumo?.insumo?.unidad_medida || 'N/D'} | Proveedor: ${d.loteInsumo?.proveedor?.nombre || 'N/D'} | Cantidad usada: ${d.cantidadUsada} ${d.loteInsumo?.insumo?.unidad_medida || ''}\n`;
        });
        navigator.clipboard.writeText(texto.trim());
        alert('Información copiada al portapapeles');
    };

    const abrirModalImprimir = () => {
        setModalOpen(false);
        setCantidadManual(1);
        setModalImprimirOpen(true);
    };

    const imprimirEtiquetaTermica = () => {
        if (!modalProduccion) return;
        if (cantidadManual <= 0) return alert('Ingresá una cantidad válida mayor a cero');

        const ventana = window.open('', 'Imprimir Etiqueta Térmica', 'width=400,height=700');
        if (!ventana) return alert('No se pudo abrir ventana de impresión');

        ventana.document.write(`
<html>
<head>
  <title>Etiqueta Producción</title>
  <style>
    @page {
      size: 100mm 80mm landscape; /* tamaño real y horizontal */
      margin: 0;
    }
    html, body {
      margin: 0;
      padding: 0; /* eliminamos padding extra */
      width: 100mm;
      height: 80mm;
      font-family: monospace, monospace;
      font-size: 22px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      box-sizing: border-box;
      overflow: hidden; /* evita contenido extra que haga avanzar papel */
    }
    .logo {
      max-width: 50%;
      height: auto;
      margin-bottom: 4px;
    }
    .producto {
      font-weight: bold;
      font-size: 28px;
      margin-bottom: 4px;
    }
    .fechas, .cantidad, .lote {
      font-size: 20px;
      margin-bottom: 4px;
    }
  </style>
</head>
<body>
  <img src="/logo.png" alt="Logo" class="logo" />
  <div class="producto">${modalProduccion.productoFinal?.nombre || 'Producto Desconocido'}</div>
  <div class="cantidad">Cantidad: ${cantidadManual} ${modalProduccion.productoFinal?.unidad_medida || ''}</div>
  <div class="fechas">
    <div><strong>Fecha Elaboración:</strong> ${modalProduccion.fechaProduccion.split('T')[0]}</div>
    <div><strong>Fecha Vencimiento:</strong> ${modalProduccion.fecha_vencimiento.split('T')[0]}</div>
  ${modalProduccion.fecha_congelado
                ? `<div><strong>Fecha Congelado:</strong> ${modalProduccion.fecha_congelado.split('T')[0]}</div>`
                : ''}



  </div>
  <div class="lote">Lote: ${modalProduccion.id}</div>

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
        setModalImprimirOpen(false);
    };


    const eliminarProduccion = async (id: number) => {
        if (!confirm('¿Querés eliminar esta producción? Esta acción no se puede deshacer.')) return;
        try {
            const res = await fetch(`${API_URL}/produccion/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Error eliminando la producción');
            alert('Producción eliminada correctamente');
            setModalOpen(false);
            setModalProduccion(null);
            fetchProducciones();
        } catch (e: any) {
            alert(e.message);
        }
    };

    // Estilo inline para modales (fondo negro difuminado con blur)
    const modalFondoStyle: React.CSSProperties = {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50,
    };
    const [busqueda, setBusqueda] = useState("");
    const [fechaFiltro, setFechaFiltro] = useState("");
    const produccionesFiltradas = useMemo(() => {
        return producciones.filter((p) => {
            const coincideTexto =
                p.productoFinal?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
                String(p.id).includes(busqueda);

            const fechaFormato = (fecha: string | Date | null | undefined): string | null => {
                return fecha ? new Date(fecha).toISOString().slice(0, 10) : null;
            };

            const fechaElab = fechaFormato(p.fechaProduccion);
            const fechaVencimiento = fechaFormato(p.fecha_vencimiento);

            const coincideFecha =
                !fechaFiltro ||
                fechaFiltro === fechaElab 
           

            return coincideTexto && coincideFecha;
        });
    }, [producciones, busqueda, fechaFiltro]);
    const [page, setPage] = useState(1);
    const [rowsPerPage] = useState(15);

    const paginatedData = produccionesFiltradas.slice((page - 1) * rowsPerPage, page * rowsPerPage);
    // Modal de Lote Insumo
    const [modalLoteOpen, setModalLoteOpen] = useState(false);
    const [loteSeleccionado, setLoteSeleccionado] = useState<LoteInsumo | null>(null);

    const abrirModalLote = (lote: LoteInsumo) => {
        setLoteSeleccionado(lote);
        setModalLoteOpen(true);
    };

    const cerrarModalLote = () => {
        setLoteSeleccionado(null);
        setModalLoteOpen(false);
    };


    return (
        <main style={{ maxWidth: '80%', margin: "auto", padding: "24px", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
            <h2 style={{ color: "#15803d" }} className='text-3xl font-bold mb-6 text-center'>
                Listado de Producciones
            </h2>
            <p>Busqueda por fecha de vencimiento / produccion o lote o nombre de insumo</p>

            {/* Barra de filtros */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>

                <input
                    type="text"
                    placeholder="Buscar por lote o producto..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={{
                        flex: "1",
                        padding: "10px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "1rem",
                    }}
                />
                <input
                    type="date"
                    value={fechaFiltro}


                    onChange={(e) => setFechaFiltro(e.target.value)}
                    style={{
                        padding: "10px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "1rem",
                    }}
                />

            </div>
            <div className='flex items-center justify-center'>
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="bg-[#ffdb58] m-4 hover:bg-yellow-400 text-black font-bold py-2 px-4 rounded-xl shadow-md transition-all duration-300 hover:scale-105 active:scale-95">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path fillRule="evenodd" d="M9.53 2.47a.75.75 0 0 1 0 1.06L4.81 8.25H15a6.75 6.75 0 0 1 0 13.5h-3a.75.75 0 0 1 0-1.5h3a5.25 5.25 0 1 0 0-10.5H4.81l4.72 4.72a.75.75 0 1 1-1.06 1.06l-6-6a.75.75 0 0 1 0-1.06l6-6a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                    </svg>
                </button>
                <span>Página {page}</span>
                <button disabled={page * rowsPerPage >= produccionesFiltradas.length} onClick={() => setPage(p => p + 1)} className='m-4 bg-[#ff5757] hover:bg-red-500 text-white font-bold py-2 px-4 rounded-xl shadow-md transition-all duration-300 hover:scale-105 active:scale-95'><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                    <path fillRule="evenodd" d="M14.47 2.47a.75.75 0 0 1 1.06 0l6 6a.75.75 0 0 1 0 1.06l-6 6a.75.75 0 1 1-1.06-1.06l4.72-4.72H9a5.25 5.25 0 1 0 0 10.5h3a.75.75 0 0 1 0 1.5H9a6.75 6.75 0 0 1 0-13.5h10.19l-4.72-4.72a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
                </button>
                <Link href={'/produccion'} className='m-4 bg-[#ff5757] hover:bg-red-500 text-white font-bold py-2 px-4 rounded-xl shadow-md transition-all duration-300 hover:scale-105 active:scale-95' >Nuevo registro</Link>
            </div>
            {loading && <p style={{ textAlign: 'center', color: '#4b5563' }}>Cargando producciones...</p>}
            {error && <p style={{ textAlign: 'center', color: '#dc2626' }}>{error}</p>}

            {!loading && !error && (
                <div style={{ overflowX: 'auto', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #d1d5db', backgroundColor: 'white' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#d1fae5', position: 'sticky', top: 0 }}>
                            <tr>
                                <th style={{ padding: '12px 20px', borderBottom: '1px solid #d1d5db', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem' }}>Lote</th>
                                <th style={{ padding: '12px 20px', borderBottom: '1px solid #d1d5db', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem' }}>Producto Final</th>
                                <th style={{ padding: '12px 20px', borderBottom: '1px solid #d1d5db', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem' }}>Fecha Elaboración</th>
                                <th style={{ padding: '12px 20px', borderBottom: '1px solid #d1d5db', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem' }}>Fecha Vencimiento</th>
                                <th style={{ padding: '12px 20px', borderBottom: '1px solid #d1d5db', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem' }}>Fecha Congelado</th>

                                <th style={{ padding: '12px 20px', borderBottom: '1px solid #d1d5db', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem' }}>Cantidad Producida</th>
                                <th style={{ padding: '12px 20px', borderBottom: '1px solid #d1d5db', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem' }}>U.medida</th>

                                <th style={{ padding: '12px 20px', borderBottom: '1px solid #d1d5db', textAlign: 'center', fontWeight: '600', fontSize: '0.875rem' }}>Acciones</th>

                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.length ? (
                                paginatedData.map(p => (
                                    <tr key={p.id} style={{ transition: 'background-color 0.3s', cursor: 'default' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#d1fae5')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                                        <td style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb' }}>{p.id}</td>
                                        <td style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb' }}>{p.productoFinal?.nombre || 'Desconocido'}</td>
                                        <td style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb' }}>{p.fechaProduccion.split('T')[0]}</td>
                                        <td style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb' }}>{p.fecha_vencimiento.split('T')[0]}</td>
                                        <td style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb' }}>{p.fecha_congelado?.split('T')[0]}</td>

                                        <td style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb' }}>{p.cantidadProducida}</td>
                                        <td style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb' }}>{p.productoFinal?.unidad_medida}</td>

                                        <td style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                            <button
                                                onClick={() => openModal(p)}
                                                title="Ver detalles"
                                                style={{
                                                    backgroundColor: '#16a34a',
                                                    color: 'white',
                                                    padding: '6px 14px',
                                                    borderRadius: '6px',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    transition: 'background-color 0.3s',
                                                }}
                                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#15803d')}
                                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#16a34a')}
                                            >
                                                VER OPCIONES
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                                        No hay producciones registradas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal detalle */}
            {modalOpen && modalProduccion && (
                <div style={modalFondoStyle} onClick={closeModal}>
                    <div
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            maxWidth: '720px',
                            width: '100%',
                            padding: '24px',
                            position: 'relative',
                            maxHeight: '80vh',
                            overflowY: 'auto',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px', textAlign: 'center' }}>
                            Detalle Producción
                        </h2>

                        <div style={{ color: '#1f2937', marginBottom: '16px' }}>
                            <p><strong>Producto Final:</strong> {modalProduccion.productoFinal?.nombre || 'Desconocido'}</p>
                            <p><strong>Fecha Elaboración:</strong> {modalProduccion.fechaProduccion.split('T')[0]}</p>
                            <p><strong>Fecha Vencimiento:</strong> {modalProduccion.fecha_vencimiento.split('T')[0]}</p>
                            {!modalProduccion.fecha_congelado ? null : <p><strong>Fecha Vencimiento Congelado:</strong> {modalProduccion.fecha_congelado.split('T')[0]}</p>
                            }
                            <p><strong>Cantidad Producida:</strong> {modalProduccion.cantidadProducida + ' ' + modalProduccion.productoFinal?.unidad_medida}</p>
                        </div>

                        {modalProduccion.detalles && modalProduccion.detalles.length > 0 ? (
                            <div style={{ overflowX: 'auto', maxHeight: '200px', overflowY: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead style={{ backgroundColor: '#f3f4f6', position: 'sticky', top: 0 }}>
                                        <tr>
                                            <th style={{ padding: '8px', border: '1px solid #d1d5db', textAlign: 'left' }}>Lote</th>
                                            <th style={{ padding: '8px', border: '1px solid #d1d5db', textAlign: 'left' }}>Insumo</th>
                                            <th style={{ padding: '8px', border: '1px solid #d1d5db', textAlign: 'left' }}>Cantidad usada</th>

                                            <th style={{ padding: '8px', border: '1px solid #d1d5db', textAlign: 'left' }}>Unidad</th>
                                            <th style={{ padding: '8px', border: '1px solid #d1d5db', textAlign: 'left' }}>Proveedor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {modalProduccion.detalles.map(det => (
                                            <tr key={det.id}>
                                                <td
                                                    style={{
                                                        padding: '8px',
                                                        border: '1px solid #e5e7eb',
                                                        color: '#2563eb',
                                                        textDecoration: 'underline',
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={() => det.loteInsumo && abrirModalLote(det.loteInsumo)}
                                                >
                                                    {det.loteInsumo?.lote || 'N/D'}
                                                </td>


                                                <td style={{ padding: '8px', border: '1px solid #e5e7eb' }}>
                                                    {det.loteInsumo?.insumo?.nombre || 'N/D'}
                                                </td>
                                                <td style={{ padding: '8px', border: '1px solid #e5e7eb' }}>
                                                    {det.cantidadUsada}
                                                </td>
                                                <td style={{ padding: '8px', border: '1px solid #e5e7eb' }}>
                                                    {det.loteInsumo?.insumo?.unidad_medida || 'N/D'}
                                                </td>

                                                <td style={{ padding: '8px', border: '1px solid #e5e7eb' }}>
                                                    {det.loteInsumo?.proveedor?.nombre || 'N/D'}
                                                </td>

                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p>No hay insumos usados registrados</p>
                        )}


                        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                            <button
                                onClick={copiarAlPortapapeles}
                                style={{
                                    backgroundColor: '#ca8a04',
                                    color: 'white',
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    flexGrow: 1,
                                    minWidth: '120px',
                                    transition: 'background-color 0.3s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#b45309')}
                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#ca8a04')}
                            >
                                Copiar Info
                            </button>
                            <button
                                onClick={abrirModalImprimir}
                                style={{
                                    backgroundColor: '#2563eb',
                                    color: 'white',
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    flexGrow: 1,
                                    minWidth: '120px',
                                    transition: 'background-color 0.3s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#2563eb')}
                            >
                                Imprimir Etiqueta
                            </button>
                            <button
                                onClick={() => modalProduccion && eliminarProduccion(modalProduccion.id)}
                                style={{
                                    backgroundColor: '#dc2626',
                                    color: 'white',
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    flexGrow: 1,
                                    minWidth: '120px',
                                    transition: 'background-color 0.3s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#b91c1c')}
                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#dc2626')}
                            >
                                Eliminar Producción
                            </button>
                            <button
                                onClick={closeModal}
                                style={{
                                    backgroundColor: '#6b7280',
                                    color: 'white',
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    flexGrow: 1,
                                    minWidth: '120px',
                                    transition: 'background-color 0.3s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#4b5563')}
                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#6b7280')}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal cantidad manual impresión */}
            {modalImprimirOpen && modalProduccion && (
                <div style={modalFondoStyle} onClick={() => setModalImprimirOpen(false)}>
                    <div
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            maxWidth: '400px',
                            width: '100%',
                            padding: '24px',
                            position: 'relative',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '24px', textAlign: 'center' }}>
                            Cantidad para etiqueta
                        </h2>

                        <p style={{ marginBottom: '16px', textAlign: 'center' }}>
                            Producto: <strong>{modalProduccion.productoFinal?.nombre || 'Desconocido'}</strong>
                        </p>

                        <input
                            type="number"

                            value={cantidadManual}
                            onChange={(e) => setCantidadManual(Number(e.target.value))}
                            style={{
                                width: '100%',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                padding: '10px',
                                marginBottom: '24px',
                                textAlign: 'center',
                                fontSize: '1rem',
                            }}
                            autoFocus
                        />

                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <button
                                onClick={() => setModalImprimirOpen(false)}
                                style={{
                                    backgroundColor: '#6b7280',
                                    color: 'white',
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    flexGrow: 1,
                                    marginRight: '8px',
                                    transition: 'background-color 0.3s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#4b5563')}
                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#6b7280')}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={imprimirEtiquetaTermica}
                                style={{
                                    backgroundColor: '#2563eb',
                                    color: 'white',
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    flexGrow: 1,
                                    transition: 'background-color 0.3s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#2563eb')}
                            >
                                Imprimir
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {modalLoteOpen && loteSeleccionado && (
                <div style={modalFondoStyle} onClick={cerrarModalLote}>
                    <div
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            maxWidth: '500px',
                            width: '100%',
                            padding: '24px',
                            position: 'relative',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '20px', textAlign: 'center' }}>
                            Detalle Lote {loteSeleccionado.lote}
                        </h2>

                        <p><strong>Insumo:</strong> {loteSeleccionado.insumo?.nombre || 'N/D'}</p>
                        <p><strong>Unidad:</strong> {loteSeleccionado.insumo?.unidad_medida || 'N/D'}</p>
                        <p><strong>Proveedor:</strong> {loteSeleccionado.proveedor?.nombre || 'N/D'}</p>
                        <p><strong>Fecha Elaboración:</strong> {loteSeleccionado.fecha_elaboracion ? loteSeleccionado.fecha_elaboracion.split('T')[0] : 'N/D'}</p>
                        <p><strong>Fecha Vencimiento:</strong> {loteSeleccionado.fecha_vencimiento ? loteSeleccionado.fecha_vencimiento.split('T')[0] : 'N/D'}</p>

                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                            <button
                                onClick={cerrarModalLote}
                                style={{
                                    backgroundColor: '#6b7280',
                                    color: 'white',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </main>
    );
}
