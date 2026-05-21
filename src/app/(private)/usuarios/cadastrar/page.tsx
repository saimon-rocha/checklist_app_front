"use client";

import { useState, useEffect } from "react";

import axios from "axios";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import validarCPF from "../../../../utils/validarCPF";
import { toast } from "react-toastify";

export default function CadastroUsuario() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cpf, setCpf] = useState("");
  const [filialSelecionada, setFilialSelecionada] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [filiais, setFiliais] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const filiaisSalvas = JSON.parse(localStorage.getItem("filiais")) || [];
    setFiliais(filiaisSalvas);
  }, []);

  const handleCpfChange = (e) => {
    setCpf(e.target.value.replace(/\D/g, ""));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !senha || !cpf || !filialSelecionada) {
      toast.warning("Preencha todos os campos!");
      return;
    }

    if (!validarCPF(cpf)) {
      toast.warning("CPF inválido!");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${API_URL}/usuarios`,
        {
          username: email.trim(),
          password: senha.trim(),
          cpf: cpf.trim(),
          id_posto: filialSelecionada,
          id_admin: isAdmin,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Usuário cadastrado com sucesso!");

      router.push("/usuarios");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Erro ao cadastrar usuário");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <Form onSubmit={handleSubmit} className="p-4 shadow rounded bg-white form-container">
        <h2 className="text-center mb-4">Cadastro de Usuário</h2>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control value={email} onChange={(e) => setEmail(e.target.value)} />
        </Form.Group>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Label>Senha</Form.Label>
            <Form.Control type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
          </Col>

          <Col md={6}>
            <Form.Label>CPF</Form.Label>
            <Form.Control value={cpf} onChange={handleCpfChange} maxLength={11} />
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Posto</Form.Label>
          <Form.Select value={filialSelecionada} onChange={(e) => setFilialSelecionada(e.target.value)}>
            <option value="">Selecione...</option>
            {filiais.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Check
          type="checkbox"
          label="Administrador"
          checked={isAdmin}
          onChange={(e) => setIsAdmin(e.target.checked)}
        />

        <Button type="submit" disabled={loading} className="w-100 mt-3">
          {loading ? "Salvando..." : "Cadastrar"}
        </Button>
      </Form>
    </Container>
  );
}