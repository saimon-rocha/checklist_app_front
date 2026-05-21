"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Menu from "../components/Menu";
import { parseJwt } from "../utils/jwt";

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const payload = parseJwt(token);

    if (!payload) {
      router.push("/login");
      return;
    }

    setUser(payload);
    setAuthorized(true);
  }, [router]);

  if (!authorized) return null;

  return (
    <>
      <Menu user={user} />

      <div className="layoutContent">{children}</div>
    </>
  );
}