"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";

import api from "../../service/api";
import logo from "../../assets/icon.jpeg";

function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleLogin() {
    if (!username || !password) {
      setMsg("Preencha usuário e senha!");
      return;
    }

    try {
      setLoading(true);
      setMsg("");

      const response = await api.post("/login", {
        username: username.trim(),
        password: password.trim(),
      });

      const data = response.data;

      localStorage.setItem("token", data.token);
      localStorage.setItem("expiresAt", data.expiresAt);

      const payload = parseJwt(data.token);

      if (payload) {
        localStorage.setItem(
          "usuarioLogado",
          JSON.stringify({
            id: payload.id,
            username: payload.username,
            filial: payload.filial || payload.id_posto,
            isAdmin: payload.isAdmin || payload.id_admin,
          })
        );
      }

      toast.success(`Bem-vindo, ${username}!`);
      router.push("/checklist");
    } catch (error: any) {
      if (error.response?.data?.message) {
        setMsg(error.response.data.message);
      } else if (error.response?.data?.error) {
        setMsg(error.response.data.error);
      } else {
        setMsg("Erro ao realizar login.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* LADO ESQUERDO */}
      <div className="hidden md:flex w-1/2 bg-blue-600 items-center justify-center">
        <Image
          src={logo}
          alt="Logo do sistema"
          className="w-40 h-40 object-contain"
          priority
        />
      </div>

      {/* LADO DIREITO */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-gray-50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg space-y-5"
        >
          <h1 className="text-2xl font-bold text-center">Login</h1>

          {/* USERNAME */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Usuário
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="Digite seu usuário"
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Digite sua senha"
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* BOTÃO */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Carregando..." : "Entrar"}
          </button>

          {/* MENSAGEM */}
          {msg && (
            <p className="text-red-500 text-sm text-center">{msg}</p>
          )}
        </form>
      </div>
    </div>
  );
}