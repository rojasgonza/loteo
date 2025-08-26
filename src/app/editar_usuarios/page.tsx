'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { API_URL } from '../axios';

type User = {
    id: number;
    nombre: string;
    email: string;
    nivel: number;
    activo: boolean; // 👈 nuevo campo
};

export default function UsuariosPage() {
    const [isLoading, setLoading] = useState(false);
    const { token, authFetch } = useAuth()
    const [usuarios, setUsuarios] = useState<User[]>([]);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const router = useRouter();
    useEffect(() => {
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        try {
            setLoading(true);
            const res = await authFetch(`/usuarios`);
            if (!res.ok) throw new Error("Error al traer los usuarios");
            const data = await res.json();
            setUsuarios(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!editingUser) return;

        try {
            setLoading(true);
            const res = await authFetch(`/usuarios/${editingUser.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(editingUser),
            });

            if (!res.ok) throw new Error("Error al guardar el usuario");

            await fetchUsuarios();
            setEditingUser(null);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const { user, loading } = useAuth();
    useEffect(() => {
        if (!loading) {
            if (user?.nivel !== 3) {
                router.push('/landing');
            }
        }
    });

    return (
        <ProtectedRoute nivelMinimo={3}>
            {isLoading ? <div>cargando.. </div> :
                <div style={{ maxWidth: '80%', margin: "auto", padding: "24px", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
                    <h1 className="text-3xl font-bold mb-6 text-center">Usuarios</h1>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#d1fae5', position: 'sticky', top: 0 }}>
                            <tr>
                                <th style={{ padding: '12px 20px', borderBottom: '1px solid #d1d5db', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem' }}>ID</th>
                                <th style={{ padding: '12px 20px', borderBottom: '1px solid #d1d5db', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem' }}>Nombre</th>
                                <th style={{ padding: '12px 20px', borderBottom: '1px solid #d1d5db', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem' }}>Email</th>
                                <th style={{ padding: '12px 20px', borderBottom: '1px solid #d1d5db', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem' }}>Nivel</th>
                                <th style={{ padding: '12px 20px', borderBottom: '1px solid #d1d5db', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem' }}>Activo</th>
                                <th style={{ padding: '12px 20px', borderBottom: '1px solid #d1d5db', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map((u) => (
                                <tr key={u.id}>
                                    <td style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb' }}>{u.id}</td>
                                    <td style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb' }}>{u.nombre}</td>
                                    <td style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb' }}>{u.email}</td>
                                    <td style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb' }}>{u.nivel}</td>
                                    <td style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb' }}>
                                        {u.activo ? "Sí" : "No"}
                                    </td>
                                    <td style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb' }}>
                                        <button
                                            className="bg-blue-500 text-white px-3 py-1 rounded"
                                            onClick={() => setEditingUser(u)}
                                        >
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Modal de edición */}
                    {editingUser && (
                        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
                            <div className="bg-white p-6 rounded shadow-md w-96">
                                <h2 className="text-xl mb-4">Editar Usuario</h2>
                                <input
                                    type="text"
                                    value={editingUser.nombre}
                                    onChange={(e) =>
                                        setEditingUser({ ...editingUser, nombre: e.target.value })
                                    }
                                    className="border p-2 w-full mb-2"
                                />
                                <input
                                    type="email"
                                    value={editingUser.email}
                                    onChange={(e) =>
                                        setEditingUser({ ...editingUser, email: e.target.value })
                                    }
                                    className="border p-2 w-full mb-2"
                                />
                                <select
                                    value={editingUser.nivel}
                                    onChange={(e) =>
                                        setEditingUser({ ...editingUser, nivel: Number(e.target.value) })
                                    }
                                    className="border p-2 w-full mb-2"
                                >
                                    <option value={1}>Nivel 1</option>
                                    <option value={2}>Nivel 2</option>
                                    <option value={3}>Nivel 3 (Admin)</option>
                                </select>

                                {/* Checkbox de activo */}
                                <label className="flex items-center space-x-2 mb-4">
                                    <input
                                        type="checkbox"
                                        checked={editingUser.activo}
                                        onChange={(e) =>
                                            setEditingUser({ ...editingUser, activo: e.target.checked })
                                        }
                                    />
                                    <span>Activo</span>
                                </label>

                                <div className="flex justify-end space-x-2">
                                    <button
                                        onClick={() => setEditingUser(null)}
                                        className="px-4 py-2 bg-gray-300 rounded"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-4 py-2 bg-green-500 text-white rounded"
                                    >
                                        Guardar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>}
        </ProtectedRoute>
    );
}
