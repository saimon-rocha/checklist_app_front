import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import { toast } from "react-toastify";
import { buscaCEP } from "../../utils/buscaCep";

function EditarFilial() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nomeFilial, setNomeFilial] = useState("");
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState({
    rua: "",
    bairro: "",
    ruaReadOnly: true,
    bairroReadOnly: true,
  });
  const [loading, setLoading] = useState(false);

  const filiaisSalvas = useMemo(() => {
    return JSON.parse(localStorage.getItem("filiais")) || [];
  }, []);


  // 🔹 Carrega dados da filial
  useEffect(() => {
    const filial = filiaisSalvas.find((f) => f.id === id);

    if (!filial) {
      toast.error("Posto não encontrada.");
      navigate("/listafiliais");
      return;
    }

    setNomeFilial(filial.nome);
    setCep(filial.cep);
    setEndereco({
      rua: filial.rua,
      bairro: filial.bairro,
      ruaReadOnly: false,
      bairroReadOnly: false,
    });
  }, [id, navigate, filiaisSalvas]);


  const handleCepChange = async (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setCep(value);

    if (value.length === 8) {
      const data = await buscaCEP(value);

      const ruaFaltando = !data.rua;
      const bairroFaltando = !data.bairro;

      setEndereco({
        rua: data.rua,
        bairro: data.bairro,
        ruaReadOnly: !ruaFaltando,
        bairroReadOnly: !bairroFaltando,
      });

      if (ruaFaltando && bairroFaltando) {
        toast.info("CEP geral: preencha Rua e Bairro manualmente.");
      } else if (ruaFaltando) {
        toast.info("CEP não informa Rua.");
      } else if (bairroFaltando) {
        toast.info("CEP não informa Bairro.");
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nomeFilial.trim() || !cep || !endereco.rua || !endereco.bairro) {
      toast.warning("Preencha todos os campos.");
      return;
    }

    setLoading(true);

    try {
      const indice = filiaisSalvas.findIndex((f) => f.id === id);

      filiaisSalvas[indice] = {
        ...filiaisSalvas[indice],
        nome: nomeFilial.trim(),
        cep,
        rua: endereco.rua,
        bairro: endereco.bairro,
      };

      localStorage.setItem("filiais", JSON.stringify(filiaisSalvas));

      toast.success("Posto atualizado com sucesso!");

      setTimeout(() => {
        navigate("/listfilial");
      }, 1200);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar posto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6}>
          <Form onSubmit={handleSubmit} className="p-4 shadow rounded bg-white form-container">
            <h2 className="text-center mb-4">Editar Posto</h2>

            <Form.Group className="mb-3">
              <Form.Label>Nome do Posto</Form.Label>
              <Form.Control
                value={nomeFilial}
                onChange={(e) => setNomeFilial(e.target.value)}
                required
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>CEP</Form.Label>
                  <Form.Control
                    value={cep}
                    onChange={handleCepChange}
                    maxLength={8}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Rua</Form.Label>
                  <Form.Control
                    value={endereco.rua}
                    onChange={(e) => setEndereco({ ...endereco, rua: e.target.value })}
                    readOnly={endereco.ruaReadOnly}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label>Bairro</Form.Label>
              <Form.Control
                value={endereco.bairro}
                onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })}
                readOnly={endereco.bairroReadOnly}
                required
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

export default EditarFilial;
