"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import Menu from "../../components/Menu";

import { parseJwt } from "../../utils/jwt";

import { toast } from "react-toastify";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // =====================================
    // SEM TOKEN
    // =====================================

    if (!token) {
      toast.warning("Por favor, faça login.");

      setTimeout(() => {
        router.replace("/login");
      }, 1200);

      return;
    }

    // =====================================
    // TOKEN
    // =====================================

    const payload = parseJwt(token);

    // TOKEN INVALIDO

    if (!payload) {
      localStorage.removeItem("token");

      localStorage.removeItem("usuarioLogado");

      localStorage.removeItem("checklistBombaForm");

      localStorage.removeItem("ensaioForm");

      localStorage.setItem(
        "sessionExpired",
        "Sessão inválida. Faça login novamente.",
      );

      router.replace("/login");

      return;
    }

    // =====================================
    // TOKEN EXPIRADO
    // =====================================

    if (payload.exp) {
      const currentTime = Date.now() / 1000;

      if (payload.exp < currentTime) {
        // LIMPA STORAGE

        localStorage.removeItem("token");

        localStorage.removeItem("usuarioLogado");

        localStorage.removeItem("expiresAt");

        localStorage.removeItem("checklistBombaForm");

        localStorage.removeItem("ensaioForm");

        // SALVA MSG

        localStorage.setItem(
          "sessionExpired",
          "Tempo expirado. Faça login novamente.",
        );

        // REDIRECIONA

        router.replace("/login");

        return;
      }
    }

    // =====================================
    // AUTORIZADO
    // =====================================

    setUser(payload);

    setAuthorized(true);
  }, [router]);

  // =====================================
  // LOADING
  // =====================================

  if (!authorized) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Carregando...
      </div>
    );
  }

  return (
    <>
      <Menu user={user} />

      <div className="layoutContent">{children}</div>
    </>
  );
}
