"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

import {
  House,
  FileEarmarkText,
  People,
  BoxArrowRight,
} from "react-bootstrap-icons";

import { Building2, Fuel } from "lucide-react";
import { toast } from "react-toastify";

import "../styles/Menu.css";

export default function Menu({ user }: { user?: any }) {
  const router = useRouter();
  const pathname = usePathname() || "";

  const isMaster = user?.perfil === "master";
  const isGestor = user?.perfil === "gestor";
  
  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuarioLogado");
    localStorage.removeItem("expiresAt");
    localStorage.removeItem("ensaioForm");
    localStorage.removeItem("checklistBombaForm");
    toast.success("Sessão encerrada.");
    router.replace("/login");
  }

  // Active status helper
  const isActive = (path: string) => {
    if (path === "/checklist") {
      return pathname === "/checklist" || pathname === "/checklist/ensaio";
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="navbarCustom">
      <div className="container-menu">
        <Link 
          href="/checklist" 
          className={`navItemCustom ${isActive("/checklist") ? "active" : ""}`}
        >
          <House size={20} />
          <div>Home</div>
        </Link>

        <Link 
          href="/formularios" 
          className={`navItemCustom ${isActive("/formularios") ? "active" : ""}`}
        >
          <FileEarmarkText size={20} />
          <div>Formulários</div>
        </Link>

        <Link 
          href="/relatorios" 
          className={`navItemCustom ${isActive("/relatorios") ? "active" : ""}`}
        >
          <FileEarmarkText size={20} />
          <div>Relatórios</div>
        </Link>

        {(isMaster) && (
          <>
            <Link 
              href="/matriz" 
              className={`navItemCustom ${isActive("/matriz") ? "active" : ""}`}
            >
              <Building2 size={20} />
              <div>Matriz</div>
            </Link>

            <Link 
              href="/filiais" 
              className={`navItemCustom ${isActive("/filiais") ? "active" : ""}`}
            >
              <Fuel size={20} />
              <div>Filiais</div>
            </Link>

            <Link 
              href="/usuarios" 
              className={`navItemCustom ${isActive("/usuarios") ? "active" : ""}`}
            >
              <People size={20} />
              <div>Usuários</div>
            </Link>
          </>
        )}

        <button onClick={handleLogout} className="navItemCustom">
          <BoxArrowRight size={20} />
          <div>Sair</div>
        </button>
      </div>
    </div>
  );
}
