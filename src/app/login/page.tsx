"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import logo from "../../assets/icon.jpeg";
import CustomButton from "../../components/CustomButton";
import { toast } from "react-toastify";
import axios from "axios";
import "../../styles/Login.css";

export default function LoginPage() {
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

      const response = await axios.post(`${API_URL}/login`, {
        username: username.trim(),
        password: password.trim(),
      });

      const data = response.data;

      /*
        Backend retorna:

        {
          status,
          message,
          token,
          expiresAt
        }
      */

      localStorage.setItem("token", data.token);

      localStorage.setItem("expiresAt", data.expiresAt);

      toast.success("Login realizado com sucesso!");

      router.push("/checklist");
    } catch (error: any) {
      console.error(error);

      if (error.response?.data?.message) {
        setMsg(error.response.data.message);
      } else {
        setMsg("Erro ao realizar login.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="root">
      <div className="loginSplit">
        {/* ESQUERDA */}
        <div className="splitLeft">
          <img src={logo.src} alt="Logo do sistema" />
        </div>

        {/* DIREITA */}
        <div className="splitRight">
          <Form
            className="loginForm"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <h1 className="title">Login</h1>

            <FloatingLabel
              controlId="floatingUsername"
              label="Usuário"
              className="mb-3"
            >
              <Form.Control
                type="text"
                placeholder="Digite seu usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </FloatingLabel>

            <FloatingLabel
              controlId="floatingPassword"
              label="Senha"
              className="mb-3"
            >
              <Form.Control
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </FloatingLabel>

            <CustomButton
              text={loading ? "Carregando..." : "Entrar"}
              className="loginButton"
              disabled={loading}
              type="submit"
            />

            {msg && <p className="msg">{msg}</p>}
          </Form>
        </div>
      </div>
    </div>
  );
}
