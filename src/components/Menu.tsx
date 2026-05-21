"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  House,
  FileEarmarkText,
  People,
  BoxArrowRight,
} from "react-bootstrap-icons";

import { Fuel } from "lucide-react";
import { toast } from "react-toastify";

import "../styles/Menu.css";

export default function Menu({ user }: { user?: any }) {
  const router = useRouter();

  const isAdmin = user?.isAdmin === true;

  function handleLogout() {
    localStorage.removeItem("token");

    localStorage.removeItem("usuarioLogado");

    localStorage.removeItem("expiresAt");

    toast.success("Logout realizado!");

    router.replace("/login");
  }

  return (
    <div className="navbarCustom">
      <div className="container-menu">
        <Link href="/checklist" className="navItemCustom">
          <House size={22} />
          <div>Home</div>
        </Link>

        <Link href="/arquivos" className="navItemCustom">
          <FileEarmarkText size={22} />
          <div>Formulários</div>
        </Link>

        <Link href="/relatorios" className="navItemCustom">
          <FileEarmarkText size={22} />
          <div>Relatórios</div>
        </Link>

        <Link href="/usuarios" className="navItemCustom">
          <People size={22} />
          <div>Usuarios</div>
        </Link>

        <Link href="/postos" className="navItemCustom">
          <Fuel size={22} />
          <div>Postos</div>
        </Link>

        {isAdmin && (
          <>
            <Link href="/usuarios" className="navItemCustom">
              <People size={22} />
              <div>Usuários</div>
            </Link>

            <Link href="/postos" className="navItemCustom">
              <Fuel size={22} />
              <div>Postos</div>
            </Link>
          </>
        )}

        <button onClick={handleLogout} className="navItemCustom">
          <BoxArrowRight size={22} />
          <div>Sair</div>
        </button>
      </div>
    </div>
  );
}
