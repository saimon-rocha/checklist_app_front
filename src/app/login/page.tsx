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
            role: payload.role,
            filiais: payload.filiais || [],
          }),
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
    <div className="min-h-screen flex bg-gray-100">
      {/* LADO ESQUERDO DESKTOP */}
      <div className="hidden md:flex md:w-1/2 bg-blue-600 items-center justify-center">
        <div className="flex flex-col items-center">
          <Image
            src={logo}
            alt="Logo do sistema"
            className="w-52 h-52 rounded-3xl shadow-2xl object-cover"
            priority
          />

          <h1 className="text-white text-3xl font-bold mt-6">
            Sistema Checklist
          </h1>
        </div>
      </div>

      {/* LOGIN */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-5 py-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="
            w-full
            max-w-md
            bg-white
            rounded-3xl
            shadow-xl
            p-6
            md:p-10
            space-y-5
          "
        >
          {/* LOGO MOBILE */}
          <div className="flex flex-col items-center md:hidden">
            <Image
              src={logo}
              alt="Logo do sistema"
              className="
                w-28
                h-28
                rounded-2xl
                shadow-lg
                object-cover
                mb-4
              "
              priority
            />

            <h1 className="text-2xl font-bold text-gray-800">
              Sistema Checklist
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Faça login para continuar
            </p>
          </div>

          {/* TÍTULO DESKTOP */}
          <div className="hidden md:block text-center">
            <h1 className="text-3xl font-bold text-gray-800">
              Bem-vindo
            </h1>

            <p className="text-gray-500 mt-2">
              Entre com suas credenciais
            </p>
          </div>

          {/* USERNAME */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Usuário
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="Digite seu usuário"
              className="
                w-full
                border
                border-gray-300
                rounded-xl
                px-4
                py-3
                text-base
                outline-none
                transition
                focus:ring-2
                focus:ring-blue-500
                focus:border-blue-500
              "
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Senha
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Digite sua senha"
              className="
                w-full
                border
                border-gray-300
                rounded-xl
                px-4
                py-3
                text-base
                outline-none
                transition
                focus:ring-2
                focus:ring-blue-500
                focus:border-blue-500
              "
            />
          </div>

          {/* BOTÃO */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              bg-blue-600
              hover:bg-blue-700
              text-white
              font-semibold
              py-3
              rounded-xl
              transition
              disabled:opacity-50
              shadow-md
            "
          >
            {loading ? "Carregando..." : "Entrar"}
          </button>

          {/* MENSAGEM */}
          {msg && (
            <p className="text-red-500 text-sm text-center">
              {msg}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}