"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";

import logo from "../../assets/icon.jpeg";

import CustomButton from "../../components/CustomButton";

import { toast } from "react-toastify";

import api from "../../service/api";

import "../../styles/Login.css";

function parseJwt(token: string) {
  try {
    return JSON.parse(
      atob(token.split(".")[1])
    );
  } catch {
    return null;
  }
}

export default function LoginPage() {

  const router = useRouter();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [msg, setMsg] =
    useState("");

  async function handleLogin() {

    if (!username || !password) {

      setMsg(
        "Preencha usuário e senha!"
      );

      return;
    }

    try {

      setLoading(true);

      setMsg("");

      const response = await api.post(
        "/login",
        {
          username: username.trim(),
          password: password.trim(),
        }
      );

      const data = response.data;

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "expiresAt",
        data.expiresAt
      );

      // guarda infos do usuário
      const payload = parseJwt(data.token);

      if (payload) {

        localStorage.setItem(
          "usuarioLogado",
          JSON.stringify({
            id: payload.id,
            username:
              payload.username,
            filial:
              payload.filial ||
              payload.filial_id,
            isAdmin:
              payload.isAdmin ||
              payload.id_admin,
          })
        );
      }

      toast.success(
        "Login realizado com sucesso!"
      );

      router.push("/checklist");

    } catch (error: any) {

      console.error(error);

      if (
        error.response?.data?.message
      ) {

        setMsg(
          error.response.data.message
        );

      } else if (
        error.response?.data?.error
      ) {

        setMsg(
          error.response.data.error
        );

      } else {

        setMsg(
          "Erro ao realizar login."
        );
      }

    } finally {

      setLoading(false);
    }
  }

  return (
    <div className="root">

      <div className="loginSplit">

        <div className="splitLeft">
          <img
            src={logo.src}
            alt="Logo do sistema"
          />
        </div>

        <div className="splitRight">

          <Form
            className="loginForm"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >

            <h1 className="title">
              Login
            </h1>

            <FloatingLabel
              controlId="floatingUsername"
              label="Usuário"
              className="mb-3"
            >

              <Form.Control
                type="text"
                placeholder="Digite seu usuário"
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value
                  )
                }
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
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                autoComplete="current-password"
              />

            </FloatingLabel>

            <CustomButton
              text={
                loading
                  ? "Carregando..."
                  : "Entrar"
              }
              className="loginButton"
              disabled={loading}
              type="submit"
            />

            {msg && (
              <p className="msg">
                {msg}
              </p>
            )}

          </Form>

        </div>

      </div>

    </div>
  );
}