"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import Menu from "../../components/Menu";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return (
    <>
      <Menu />

      <main className="layoutContent">
        {children}
      </main>
    </>
  );
}