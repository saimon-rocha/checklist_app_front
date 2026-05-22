"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import validarCPF from "../../../../utils/validarCPF";

export default function CadastroUsuario() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cpf, setCpf] = useState("");
  const [filialSelecionada, setFilialSelecionada] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [filiais, setFiliais] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const filiaisSalvas = JSON.parse(
      localStorage.getItem("filiais") || "[]"
    );
    setFiliais(filiaisSalvas);
  }, []);

  function handleCpfChange(e: any) {
    setCpf(e.target.value.replace(/\D/g, ""));
  }

  async function handleSubmit(e: any) {
    e.preventDefault();

    if (!email || !senha || !cpf || !filialSelecionada) {
      toast.warning("Preencha todos os campos!");
      return;
    }

    if (!validarCPF(cpf)) {
      toast.warning("CPF inválido!");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${API_URL}/usuarios`,
        {
          username: email.trim(),
          password: senha.trim(),
          cpf: cpf.trim(),
          id_posto: filialSelecionada,
          id_admin: isAdmin,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Usuário cadastrado com sucesso!");
      router.push("/usuarios");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.error || "Erro ao cadastrar usuário"
      );
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
          Cadastro de Usuário
        </h2>

        {/* EMAIL */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">Email</label>
          <input
            className="border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />
        </div>

        {/* SENHA + CPF */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="text-sm font-medium">Senha</label>
            <input
              type="password"
              className="border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium">CPF</label>
            <input
              className="border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
              value={cpf}
              onChange={handleCpfChange}
              maxLength={11}
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
          >
            <option value="">Selecione...</option>

            {filiais.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </select>
        </div>

        {/* ADMIN */}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
          />
          Administrador
        </label>

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
          {loading ? "Salvando..." : "Cadastrar"}
        </button>
      </form>
    </div>
  );
}