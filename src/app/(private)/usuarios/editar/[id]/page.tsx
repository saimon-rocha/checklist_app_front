"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";

import validarCPF from "../../../../../utils/validarCPF";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EditarUsuario() {
  const router = useRouter();
  const params = useParams();

  const id = params.id;

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cpf, setCpf] = useState("");
  const [filialSelecionada, setFilialSelecionada] = useState("");
  const [filiais, setFiliais] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPostos();
    loadUsuario();
  }, []);

  async function loadPostos() {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/postos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setFiliais(data);
    } catch {
      toast.error("Erro ao carregar postos");
    }
  }

  async function loadUsuario() {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/usuarios/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error();

      const usuario = await res.json();

      setEmail(usuario.username);
      setCpf(usuario.cpf);
      setFilialSelecionada(usuario.id_posto);
    } catch {
      toast.error("Usuário não encontrado!");
    }
  }

  async function handleSubmit(e: any) {
    e.preventDefault();

    if (!email || !cpf || !filialSelecionada) {
      toast.warning("Preencha todos os campos!");
      return;
    }

    if (!validarCPF(cpf)) {
      toast.warning("CPF inválido!");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const body: any = {
        username: email.trim(),
        cpf,
        id_posto: filialSelecionada,
      };

      if (senha.trim()) {
        body.password = senha.trim();
      }

      const res = await fetch(`${API_URL}/usuarios/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao atualizar");
      }

      toast.success("Usuário atualizado com sucesso!");

      setTimeout(() => router.push("/usuarios"), 1200);
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar usuário.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white shadow-lg rounded-2xl p-6 space-y-4"
      >
        {/* TITLE */}
        <h2 className="text-2xl font-bold text-center">
          Editar Usuário
        </h2>

        {/* EMAIL */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">Email</label>

          <input
            type="email"
            className="border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* SENHA + CPF */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="text-sm font-medium">
              Nova senha (opcional)
            </label>

            <input
              type="password"
              placeholder="Deixe em branco para manter"
              className="border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium">CPF</label>

            <input
              type="text"
              className="border rounded-lg px-3 py-2 mt-1 bg-gray-100 cursor-not-allowed"
              value={cpf}
              disabled
            />
          </div>
        </div>

        {/* POSTO */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">Posto</label>

          <select
            className="border rounded-lg px-3 py-2 mt-1"
            value={filialSelecionada}
            onChange={(e) => setFilialSelecionada(e.target.value)}
            required
          >
            <option value="">Selecione...</option>

            {filiais.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </select>
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-lg font-semibold transition ${
            loading
              ? "bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {loading ? "Salvando..." : "Salvar Alterações"}
        </button>
      </form>
    </div>
  );
}