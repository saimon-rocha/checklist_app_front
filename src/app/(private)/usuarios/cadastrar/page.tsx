"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import validarCPF from "../../../../utils/validarCPF";
import api from "../../../../service/api";

export default function CadastroUsuario() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cpf, setCpf] = useState("");

  const [postosSelecionados, setPostosSelecionados] = useState<number[]>([]);
  const [role, setRole] = useState("funcionario");

  const [postos, setPostos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function carregarPostos() {
      try {
        const [postosResponse] = await Promise.all([api.get("/postos")]);
        const postosAtivos = postosResponse.data.filter((p: any) =>
          Boolean(p.id_ativo),
        );
        setPostos(postosAtivos);
      } catch {
        toast.error("Erro ao carregar postos");
      }
    }

    carregarPostos();
  }, []);

  function handleCpfChange(e: any) {
    setCpf(e.target.value.replace(/\D/g, ""));
  }

  function handlePostoChange(postoId: number) {
    setPostosSelecionados((prev) => {
      if (prev.includes(postoId)) {
        return prev.filter((id) => id !== postoId);
      }

      return [...prev, postoId];
    });
  }

  async function handleSubmit(e: any) {
    e.preventDefault();

    if (!email || !senha || !cpf || postosSelecionados.length === 0) {
      toast.warning("Preencha todos os campos!");
      return;
    }

    if (!validarCPF(cpf)) {
      toast.warning("CPF inválido!");
      return;
    }

    setLoading(true);

    try {
      await api.post("/usuarios", {
        username: email.trim(),
        password: senha.trim(),
        cpf: cpf.trim(),
        role,
        postos: postosSelecionados, // array de IDs
      });

      toast.success("Usuário cadastrado com sucesso!");
      router.push("/usuarios");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Erro ao cadastrar usuário");
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
        <h2 className="text-2xl font-bold text-center">Cadastro de Usuário</h2>

        {/* EMAIL */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">Email</label>

          <input
            className="border rounded-lg px-3 py-2 mt-1"
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
              className="border rounded-lg px-3 py-2 mt-1"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium">CPF</label>

            <input
              className="border rounded-lg px-3 py-2 mt-1"
              value={cpf}
              onChange={handleCpfChange}
              maxLength={11}
            />
          </div>
        </div>

        {/* PERFIL */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">Perfil</label>

          <select
            className="border rounded-lg px-3 py-2 mt-1"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="funcionario">Funcionário</option>

            <option value="gestor">Gestor</option>

            <option value="master">Master</option>
          </select>
        </div>

        {/* POSTOS */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-2">Postos</label>

          <div className="space-y-2 border rounded-lg p-3 max-h-52 overflow-y-auto">
            {postos.map((p) => (
              <label key={p.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={postosSelecionados.includes(p.id)}
                  onChange={() => handlePostoChange(p.id)}
                />

                {p.nome}
              </label>
            ))}
          </div>
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-lg font-semibold transition ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {loading ? "Salvando..." : "Cadastrar"}
        </button>
      </form>
    </div>
  );
}
