"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";

import { toast } from "react-toastify";

import { buscaCEP } from "../../../../../utils/buscaCep";

import api from "../../../../../service/api";

export default function EditarPosto() {
  const router = useRouter();

  const params = useParams();

  const id = params?.id;

  const [nomePosto, setNomePosto] = useState("");

  const [cep, setCep] = useState("");

  const [loading, setLoading] = useState(false);

  const [endereco, setEndereco] = useState({
    rua: "",
    bairro: "",
    ruaReadOnly: true,
    bairroReadOnly: true,
  });

  // =========================
  // CARREGA POSTO
  // =========================
  useEffect(() => {
    async function loadPosto() {
      try {
        if (!id) return;

        const response = await api.get("/postos");

        const posto = response.data.find(
          (p: any) => String(p.id) === String(id),
        );

        if (!posto) {
          toast.error("Posto não encontrado");

          router.push("/postos");

          return;
        }

        setNomePosto(posto.nome || "");

        setCep(posto.cep || "");

        setEndereco({
          rua: posto.rua || "",
          bairro: posto.bairro || "",
          ruaReadOnly: false,
          bairroReadOnly: false,
        });
      } catch (error: any) {
        console.error(error);

        toast.error(
          error?.response?.data?.error ||
            "Erro ao carregar posto",
        );
      }
    }

    loadPosto();
  }, [id, router]);

  // =========================
  // BUSCA CEP
  // =========================
  const handleCepChange = async (e: any) => {
    const value = e.target.value.replace(/\D/g, "");

    setCep(value);

    if (value.length === 8) {
      const data = await buscaCEP(value);

      const ruaFaltando = !data.rua;

      const bairroFaltando = !data.bairro;

      setEndereco({
        rua: data.rua || "",
        bairro: data.bairro || "",
        ruaReadOnly: !ruaFaltando,
        bairroReadOnly: !bairroFaltando,
      });

      if (ruaFaltando || bairroFaltando) {
        toast.info(
          "Complete os dados manualmente.",
        );
      }
    }
  };

  // =========================
  // SALVAR
  // =========================
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (
      !nomePosto ||
      !cep ||
      !endereco.rua ||
      !endereco.bairro
    ) {
      toast.warning("Preencha todos os campos.");

      return;
    }

    try {
      setLoading(true);

      await api.put(`/postos/${id}`, {
        nome: nomePosto.trim(),
        cep,
        rua: endereco.rua.trim(),
        bairro: endereco.bairro.trim(),
      });

      toast.success(
        "Posto atualizado com sucesso!",
      );

      setTimeout(() => {
        router.push("/postos");
      }, 1200);
    } catch (error: any) {
      console.error(error);

      toast.error(
        error?.response?.data?.error ||
          "Erro ao atualizar posto.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6}>
          <Form
            onSubmit={handleSubmit}
            className="p-4 shadow rounded bg-white"
          >
            <h2 className="text-center mb-4">
              Editar Posto
            </h2>

            <Form.Group className="mb-3">
              <Form.Label>
                Nome do Posto
              </Form.Label>

              <Form.Control
                value={nomePosto}
                onChange={(e) =>
                  setNomePosto(e.target.value)
                }
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>CEP</Form.Label>

                <Form.Control
                  value={cep}
                  onChange={handleCepChange}
                  maxLength={8}
                />
              </Col>

              <Col md={6}>
                <Form.Label>Rua</Form.Label>

                <Form.Control
                  value={endereco.rua}
                  readOnly={endereco.ruaReadOnly}
                  onChange={(e) =>
                    setEndereco({
                      ...endereco,
                      rua: e.target.value,
                    })
                  }
                />
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label>Bairro</Form.Label>

              <Form.Control
                value={endereco.bairro}
                readOnly={endereco.bairroReadOnly}
                onChange={(e) =>
                  setEndereco({
                    ...endereco,
                    bairro: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Button
              type="submit"
              disabled={loading}
              className="w-100"
            >
              {loading
                ? "Salvando..."
                : "Salvar Alterações"}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}