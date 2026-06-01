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
    <div className="min-h-screen flex bg-slate-50">
      {/* LADO ESQUERDO DESKTOP */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 items-center justify-center relative overflow-hidden">
        {/* Glow circles */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[120px]" />
        
        <div className="flex flex-col items-center z-10 p-8">
          <Image
            src={logo}
            alt="Logo do sistema"
            className="w-48 h-48 rounded-[2rem] shadow-2xl object-cover border border-white/10"
            priority
          />

          <div className="mt-8 text-center">
            <h1 className="text-white text-4xl font-extrabold tracking-tight">
              Sistema Checklist
            </h1>

            <p className="text-indigo-200 text-lg font-medium mt-3">
              Bomba Medidora
            </p>
          </div>
        </div>
      </div>

      {/* LOGIN */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-4 sm:px-6 py-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="
            w-full
            max-w-md
            bg-white
            rounded-[2.5rem]
            shadow-xl
            border
            border-slate-100
            p-8
            sm:p-12
            space-y-6
            transition-all
            duration-300
          "
        >
          {/* LOGO E TEXTO MOBILE */}
          <div className="flex flex-col items-center md:hidden text-center mb-2">
            <Image
              src={logo}
              alt="Logo do sistema"
              className="
                w-24
                h-24
                rounded-[1.5rem]
                shadow-md
                object-cover
                mb-5
                border
                border-slate-100
              "
              priority
            />

            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
              Sistema Checklist
            </h1>
            <p className="text-indigo-600 font-semibold text-sm mt-1">
              Bomba Medidora
            </p>
            <p className="text-slate-400 text-sm mt-2">
              Faça login para acessar o painel
            </p>
          </div>

          {/* TÍTULO DESKTOP */}
          <div className="hidden md:block text-center mb-2">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Bem-vindo</h1>
            <p className="text-slate-400 mt-2 text-sm">Entre com suas credenciais de acesso</p>
          </div>

          {/* USERNAME */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Usuário
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="Digite seu usuário"
              className="input-premium"
            />
          </div>

          {/* PASSWORD */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Senha
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Digite sua senha"
              className="input-premium"
            />
          </div>

          {/* BOTÃO */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              premium-gradient-bg
              hover:opacity-95
              active:scale-[0.98]
              text-white
              font-bold
              py-4
              px-6
              rounded-2xl
              transition-all
              duration-200
              disabled:opacity-50
              disabled:pointer-events-none
              shadow-lg
              shadow-indigo-500/20
              cursor-pointer
            "
          >
            {loading ? "Autenticando..." : "Entrar no Sistema"}
          </button>

          {/* MENSAGEM */}
          {msg && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl">
              <p className="text-rose-600 text-sm font-medium text-center">{msg}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
