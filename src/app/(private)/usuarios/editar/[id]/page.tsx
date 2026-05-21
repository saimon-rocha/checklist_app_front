"use client";

import { useEffect, useState } from "react";

import { useRouter, useParams } from "next/navigation";

import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";

import { toast } from "react-toastify";

import validarCPF from "../../../../../utils/validarCPF";

import "../../../../../styles/Usuarios.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function EditarUsuario() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cpf, setCpf] = useState("");
  const [filialSelecionada, setFilialSelecionada] = useState("");
  const [filiais, setFiliais] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const params = useParams();

  const id = params.id;

  useEffect(() => {
    loadPostos();
    loadUsuario();
  }, []);

  async function loadPostos() {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/postos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      setFiliais(data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar postos");
    }
  }

  async function loadUsuario() {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/usuarios/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error();
      }

      const usuario = await response.json();

      setEmail(usuario.username);
      setCpf(usuario.cpf);
      setFilialSelecionada(usuario.id_posto);
    } catch (error) {
      console.error(error);
      toast.error("Usuário não encontrado!");
    }
  }

  async function handleSubmit(e: any) {
    e.preventDefault();

    if (!email || !cpf || !filialSelecionada) {
      toast.warning("Preencha todos os campos!");
      return;
    }

    if (!validarCPF(cpf)) {
      toast.warning("CPF inválido!");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const body: any = {
        username: email.trim(),
        cpf,
        id_posto: filialSelecionada,
      };

      // só envia senha se digitou
      if (senha.trim()) {
        body.password = senha.trim();
      }

      const response = await fetch(`${API_URL}/usuarios/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao atualizar");
      }

      toast.success("Usuário atualizado com sucesso!");

      setTimeout(() => {
        router.push("/usuarios");
      }, 1200);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro ao atualizar usuário.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <Form
        onSubmit={handleSubmit}
        className="p-4 shadow rounded bg-white"
      >
        <h2 className="text-center mb-4">
          Editar Usuário
        </h2>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>

          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>

        <Row className="mb-3">
          <Form.Group as={Col} md={6}>
            <Form.Label>
              Nova senha (opcional)
            </Form.Label>

            <Form.Control
              type="password"
              placeholder="Deixe em branco para manter"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </Form.Group>

          <Form.Group as={Col} md={6}>
            <Form.Label>CPF</Form.Label>

            <Form.Control
              type="text"
              value={cpf}
              disabled
            />
          </Form.Group>
        </Row>

        <Form.Group className="mb-4">
          <Form.Label>Posto</Form.Label>

          <Form.Select
            value={filialSelecionada}
            onChange={(e) =>
              setFilialSelecionada(e.target.value)
            }
            required
          >
            <option value="">Selecione...</option>

            {filiais.map((f: any) => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Button
          type="submit"
          disabled={loading}
          className="w-100"
        >
          {loading ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </Form>
    </Container>
  );
}

export default EditarUsuario;