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

    // sem token
    if (!token) {
      toast.warning("Por favor, faça login.");

      setTimeout(() => {
        router.replace("/login");
      }, 1500);

      return;
    }

    const payload = parseJwt(token);

    // token inválido
    if (!payload) {
      localStorage.removeItem("token");

      localStorage.removeItem("usuarioLogado");

      router.replace("/login");

      return;
    }

    // verifica expiração JWT
    if (payload.exp) {
      const currentTime = Date.now() / 1000;

      if (payload.exp < currentTime) {
        localStorage.removeItem("token");

        localStorage.removeItem("usuarioLogado");

        localStorage.removeItem("expiresAt");

        router.replace("/login");

        return;
      }
    }

    setUser(payload);

    setAuthorized(true);
  }, [router]);

  // loading
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
