'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '../axios';
import ProtectedRoute from '../components/ProtectedRoute';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
type ProductoFinal = { id: number; nombre: string; unidad_medida: string };
type LoteInsumo = {
    id: number;
    lote: string;
    fecha_elaboracion: string;
    Insumo?: { nombre: string; unidad_medida: string };
    Proveedor?: { nombre: string };
    stockDisponible: number;
};


type InsumoUsado = {
    loteInsumoId: string; // string porque viene del select
    cantidadUsada: string; // input number como string
};

export default function ProduccionCompuesta() {
    const [productos, setProductos] = useState<ProductoFinal[]>([]);
    const [lotes, setLotes] = useState<LoteInsumo[]>([]);
    const [productoFinalId, setProductoFinalId] = useState('');
    const [fechaProduccion, setFechaProduccion] = useState('');
    const [fechaVencimiento, setFechaVencimiento] = useState('');
    const [fechaCongelado, setFechaVencimientoCongelado] = useState('');
    const router = useRouter();
    const [cantidadProducida, setCantidadProducida] = useState('');
    const [insumosUsados, setInsumosUsados] = useState<InsumoUsado[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [estado, setEstado] = useState('')
    const { user, token, authFetch } = useAuth()
    useEffect(() => {
        async function fetchData() {
            try {
                const [resProd, resLotes] = await Promise.all([
                    authFetch(`/productos_finales`),
                    authFetch(`/lotes_insumos`),
                ]);
                if (!resProd.ok || !resLotes.ok) throw new Error('Error cargando datos');
                const [dataProd, dataLotes] = await Promise.all([resProd.json(), resLotes.json()]);
                setProductos(dataProd);
                setLotes(dataLotes);
            } catch (e: any) {
                setError(e.message);
            }
        }
        fetchData();
    }, []);
    type InsumoUsado = {
        insumoId: string;
        loteInsumoId: string;
        cantidadUsada: string;
    };

    const agregarInsumo = () => {
        setInsumosUsados([...insumosUsados, { insumoId: '', loteInsumoId: '', cantidadUsada: '' }]);
    };

    const cambiarInsumo = (index: number, campo: keyof InsumoUsado, valor: string) => {
        const newInsumos = [...insumosUsados];
        newInsumos[index][campo] = valor;
        // Si se cambia el insumo, reseteamos el lote
        if (campo === 'insumoId') newInsumos[index].loteInsumoId = '';
        setInsumosUsados(newInsumos);
    };

    const quitarInsumo = (index: number) => {
        setInsumosUsados(insumosUsados.filter((_, i) => i !== index));
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!productoFinalId) return Swal.fire('Error', 'Seleccioná un producto final', 'error');
        if (!fechaProduccion) return Swal.fire('Error', 'Ingresá la fecha de producción', 'error');
        if (!fechaVencimiento) return Swal.fire('Error', 'Ingresá la fecha de vencimiento', 'error');
        if (!cantidadProducida || Number(cantidadProducida) <= 0) return Swal.fire('Error', 'Ingresá una cantidad producida válida', 'error');
        if (insumosUsados.length === 0) return Swal.fire('Error', 'Agregá al menos un insumo usado', 'error');

        for (const insumo of insumosUsados) {
            if (!insumo.loteInsumoId) return Swal.fire('Error', 'Seleccioná todos los lotes de insumos', 'error');
            if (!insumo.cantidadUsada || Number(insumo.cantidadUsada) <= 0) return Swal.fire('Error', 'Ingresá cantidades válidas para los insumos', 'error');
        }

        const produccionData = {
            productoFinalId: Number(productoFinalId),
            fechaProduccion,
            fechaVencimiento,
            fechaCongelado: fechaCongelado || null,
            cantidadProducida: Number(cantidadProducida),
            insumosUsados: insumosUsados.map(i => ({
                loteInsumoId: Number(i.loteInsumoId),
                cantidadUsada: Number(i.cantidadUsada),
            })),
        };

        try {
            setLoading(true);
            const res = await authFetch(`/produccion/compuesta`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(produccionData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Error guardando producción');
            }

            // SweetAlert con confirmación de redirección
            Swal.fire({
                title: 'Producción guardada',
                text: '¿Querés ir a la página de producciones o quedarte acá?',
                icon: 'success',
                showCancelButton: true,
                confirmButtonText: 'Ir al listado',
                cancelButtonText: 'Quedarme aquí',
            }).then((result) => {
                if (result.isConfirmed) {
                    router.push('/data'); // 🔹 Cambiá la ruta según corresponda
                }
            });

            // Limpiar formulario
            setProductoFinalId('');
            setFechaProduccion('');
            setFechaVencimiento('');
            setFechaVencimientoCongelado('');
            setCantidadProducida('');
            setInsumosUsados([]);

        } catch (error: any) {
            Swal.fire('Error', error.message || 'Error desconocido', 'error');
        } finally {
            setLoading(false);
        }
    };
    productos.sort(function (a, b) {
        if (a.nombre < b.nombre) { return -1; }
        if (a.nombre > b.nombre) { return 1; }
        return 0;
    })







    return (
        <ProtectedRoute nivelMinimo={2}>
            <main style={{ maxWidth: '80%', margin: "auto", padding: "24px", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
                <h1 className="text-3xl font-bold mb-6 text-center">Registrar Producción </h1>

                {error && <p className="text-red-600 mb-4">{error}</p>}

                <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
                    <div>
                        <label className="block mb-1 font-semibold">Producto Final</label>
                        <select
                            value={productoFinalId}
                            onChange={e => setProductoFinalId(e.target.value)}
                            className="w-full border rounded p-2"
                            required
                        >
                            <option value="">Seleccionar producto final</option>
                            {productos.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1 font-semibold">Fecha de Producción</label>
                        <input
                            type="date"
                            value={fechaProduccion}
                            onChange={e => setFechaProduccion(e.target.value)}
                            className="w-full border rounded p-2"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-semibold">Fecha de Vencimiento</label>
                        <input
                            type="date"
                            value={fechaVencimiento}
                            onChange={e => setFechaVencimiento(e.target.value)}
                            className="w-full border rounded p-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-semibold">Es congelado?</label>

                        <select
                            value={estado}
                            onChange={e => setEstado(e.target.value)}
                            className="w-full border rounded p-2"
                            required
                        >
                            <option value="0">No</option>
                            <option value="1">Sí</option>
                        </select>
                    </div>
                    <div hidden={estado !== "1"}>
                        <label className="block mb-1 font-semibold">Fecha de Vencimiento Congelado</label>
                        <input
                            type="date"
                            value={fechaCongelado}
                            onChange={e => setFechaVencimientoCongelado(e.target.value)}
                            className="w-full border rounded p-2"
                            required={estado === "1"}
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-semibold">
                            Cantidad Producida ({productos.find(p => p.id === Number(productoFinalId))?.unidad_medida || ''})
                        </label>
                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={cantidadProducida}
                            onChange={e => setCantidadProducida(e.target.value)}
                            className="w-full border rounded p-2"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-semibold">Insumos Usados</label>

                        {insumosUsados.map((insumo, i) => {
                            // Lista única de insumos (nombre + id)
                            const insumosUnicos = Array.from(
                                new Map(lotes.map(l => [l.Insumo?.nombre, { id: l.Insumo?.nombre, nombre: l.Insumo?.nombre }])).values()
                            );

                            // Lotes filtrados por insumo seleccionado
                            // Lotes filtrados por insumo seleccionado y con stock disponible
                            const lotesFiltrados = lotes
                                .filter(l => l.Insumo?.nombre === insumo.insumoId)
                                .filter(l => l.stockDisponible && l.stockDisponible > 0); // <-- solo los que tienen stock


                            return (
                                <div key={i} className="flex gap-2 mb-2 items-center">
                                    {/* Select de Insumo */}
                                    <select
                                        value={insumo.insumoId}
                                        onChange={e => cambiarInsumo(i, 'insumoId', e.target.value)}
                                        className="flex-1 border rounded p-2"
                                        required
                                    >
                                        <option value="">Seleccionar insumo</option>
                                        {insumosUnicos.map(ins => (
                                            <option key={ins.id} value={ins.nombre}>
                                                {ins.nombre}
                                            </option>
                                        ))}
                                    </select>

                                    {/* Select de Lote (filtrado) */}
                                    <select
                                        value={insumo.loteInsumoId}
                                        onChange={e => cambiarInsumo(i, 'loteInsumoId', e.target.value)}
                                        className="flex-1 border rounded p-2"
                                        required
                                    >
                                        <option value="">Seleccionar lote</option>
                                        {lotesFiltrados.map(l => (
                                            <option key={l.id} value={l.id}>
                                                {l.lote}  ing: {l.fecha_elaboracion.split('T')[0]}
                                            </option>
                                        ))}
                                    </select>

                                    {/* Cantidad */}
                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        placeholder="Cantidad usada"
                                        value={insumo.cantidadUsada}
                                        onChange={e => cambiarInsumo(i, 'cantidadUsada', e.target.value)}
                                        className="w-32 border rounded p-2"
                                        required
                                    />

                                    {/* Botón quitar */}
                                    <button
                                        type="button"
                                        onClick={() => quitarInsumo(i)}
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                            <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                                            <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                                        </svg>
                                    </button>
                                </div>
                            );
                        })}


                    </div>
                    <button
                        type="button"
                        onClick={agregarInsumo}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clipRule="evenodd" />
                        </svg>

                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        {loading ? 'Guardando...' : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                            <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z" clipRule="evenodd" />
                        </svg>
                        }
                    </button>
                </form>
            </main>
        </ProtectedRoute>
    );
}
