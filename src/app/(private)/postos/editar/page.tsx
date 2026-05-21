"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import { toast } from "react-toastify";
import { buscaCEP } from "../../../../utils/buscaCep";

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

  useEffect(() => {
    if (!id) return;

    const postos = JSON.parse(localStorage.getItem("postos") || "[]");

    const posto = postos.find((p: any) => p.id === id);

    if (!posto) {
      toast.error("Posto não encontrado");
      router.push("/postos");
      return;
    }

    setNomePosto(posto.nome);
    setCep(posto.cep);

    setEndereco({
      rua: posto.rua,
      bairro: posto.bairro,
      ruaReadOnly: false,
      bairroReadOnly: false,
    });
  }, [id, router]);

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

      if (ruaFaltando && bairroFaltando) {
        toast.info("Preencha Rua e Bairro manualmente.");
      }
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (!nomePosto || !cep || !endereco.rua || !endereco.bairro) {
      toast.warning("Preencha todos os campos.");
      return;
    }

    setLoading(true);

    try {
      const postos = JSON.parse(localStorage.getItem("postos") || "[]");

      const index = postos.findIndex((p: any) => p.id === id);

      if (index === -1) {
        toast.error("Posto não encontrado.");
        return;
      }

      postos[index] = {
        ...postos[index],
        nome: nomePosto,
        cep,
        rua: endereco.rua,
        bairro: endereco.bairro,
      };

      localStorage.setItem("postos", JSON.stringify(postos));

      toast.success("Posto atualizado com sucesso!");

      setTimeout(() => {
        router.push("/postos");
      }, 1200);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar posto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6}>
          <Form onSubmit={handleSubmit} className="p-4 shadow rounded bg-white">
            <h2 className="text-center mb-4">Editar Posto</h2>

            <Form.Group className="mb-3">
              <Form.Label>Nome do Posto</Form.Label>
              <Form.Control
                value={nomePosto}
                onChange={(e) => setNomePosto(e.target.value)}
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
                    setEndereco({ ...endereco, rua: e.target.value })
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
                  setEndereco({ ...endereco, bairro: e.target.value })
                }
              />
            </Form.Group>

            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}