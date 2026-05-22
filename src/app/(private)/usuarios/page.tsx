"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function ListaUsuarios() {
  const router = useRouter();

  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState<any>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    loadUsuarios();
  }, []);

  async function loadUsuarios() {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/usuarios`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao carregar usuários");
      }

      const ativos = data.filter((u: any) => u.id_ativo === true);
      setUsuarios(ativos);
    } catch {
      toast.error("Erro ao carregar usuários");
    }
  }

  function handleDeleteClick(usuario: any) {
    const usuarioLogado = JSON.parse(
      localStorage.getItem("usuarioLogado") || "null"
    );

    if (usuarioLogado?.username === usuario.username) {
      toast.warning("Você não pode excluir seu próprio usuário!");
      return;
    }

    setUsuarioToDelete(usuario);
    setShowConfirm(true);
  }

  async function handleConfirmDelete() {
    if (!usuarioToDelete) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/usuarios/${usuarioToDelete.id}/desabilitar`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error();

      toast.success("Usuário desativado com sucesso!");

      setUsuarios((prev) =>
        prev.filter((u) => u.id !== usuarioToDelete.id)
      );

      setShowConfirm(false);
      setUsuarioToDelete(null);
    } catch {
      toast.error("Erro ao desativar usuário");
    }
  }

  return (
    <div className="min-h-screen px-4 py-6 flex flex-col items-center">
      {/* HEADER */}
      <h2 className="text-2xl font-bold mb-6 text-center">
        Usuários
      </h2>

      {/* EMPTY STATE */}
      {usuarios.length === 0 ? (
        <p className="text-gray-500 text-center">
          Nenhum usuário cadastrado
        </p>
      ) : (
        <div className="w-full max-w-5xl overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Email</th>
                <th className="p-3">Posto</th>
                <th className="p-3">Perfil</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>

            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-3 truncate max-w-[200px]" title={u.username}>
                    {u.username}
                  </td>

                  <td className="p-3">
                    {u.Postos?.nome || "-"}
                  </td>

                  <td className="p-3">
                    {u.id_admin ? (
                      <span className="text-red-500 font-bold">
                        Administrador
                      </span>
                    ) : (
                      <span>Usuário</span>
                    )}
                  </td>

                  <td className="p-3">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() =>
                          router.push(`/usuarios/editar/${u.id}`)
                        }
                        className="px-3 py-1 rounded bg-yellow-500 hover:bg-yellow-600 text-white text-sm"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => handleDeleteClick(u)}
                        className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-sm"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* BOTÃO CADASTRAR */}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => router.push("/usuarios/cadastrar")}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
            >
              Cadastrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold">Confirmação</h3>

            <p>
              Deseja realmente excluir o usuário{" "}
              <strong>{usuarioToDelete?.username}</strong>?
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Não
              </button>

              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded bg-red-500 text-white"
              >
                Sim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}