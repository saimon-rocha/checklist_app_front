import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import { toast } from "react-toastify";
import { buscaCEP } from "../../utils/buscaCep"; // importa a função

function Filial() {
  const [nomeFilial, setNomeFilial] = useState("");
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState({
    rua: "",
    bairro: "",
    ruaReadOnly: true,
    bairroReadOnly: true,
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const filiaisSalvas = JSON.parse(localStorage.getItem("filiais")) || [];

  const handleCepChange = async (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setCep(value);

    if (value.length === 8) {
      const data = await buscaCEP(value);

      // flags de edição
      const ruaFaltando = !data.rua;
      const bairroFaltando = !data.bairro;

      setEndereco({
        rua: data.rua,
        bairro: data.bairro,
        ruaReadOnly: !ruaFaltando,
        bairroReadOnly: !bairroFaltando,
      });

      // Mensagem conforme o que está faltando
      if (ruaFaltando && bairroFaltando) {
        toast.info("CEP geral: preencha manualmente Rua e Bairro.");
      } else if (ruaFaltando) {
        toast.info("CEP não informa Rua. Preencha o campo Rua manualmente.");
      } else if (bairroFaltando) {
        toast.info("CEP não informa Bairro. Preencha o campo Bairro manualmente.");
      }
    } else {
      setEndereco({
        rua: "",
        bairro: "",
        ruaReadOnly: true,
        bairroReadOnly: true,
      });
    }
  };



  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nomeFilial.trim() || !cep.trim() || !endereco.rua.trim() || !endereco.bairro.trim()) {
      toast.warning("Preencha todos os campos antes de cadastrar.");
      return;
    }

    setLoading(true);

    try {
      const existe = filiaisSalvas.find(
        (f) => f.nome.toLowerCase() === nomeFilial.trim().toLowerCase()
      );

      if (existe) {
        toast.warning("Posto já cadastrado!");
      } else {
        const proximoId = filiaisSalvas.length + 1;
        const novaFilial = {
          id: String(proximoId),
          nome: nomeFilial.trim(),
          cep,
          rua: endereco.rua,
          bairro: endereco.bairro,
        };

        filiaisSalvas.push(novaFilial);
        localStorage.setItem("filiais", JSON.stringify(filiaisSalvas));

        toast.success("Posto cadastrado com sucesso!");

        // limpa campos
        setNomeFilial("");
        setCep("");
        setEndereco({ rua: "", bairro: "" });

        // redireciona após 1.5s
        setTimeout(() => {
          navigate("/listfilial");
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar posto localmente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6}>
          <Form onSubmit={handleSubmit} className="p-4 shadow rounded bg-white form-container">
            <h2 className="text-center mb-4">Cadastro de Posto</h2>

            <Form.Group className="mb-3" controlId="formNomeFilial">
              <Form.Label>Nome do Posto</Form.Label>
              <Form.Control
                type="text"
                placeholder="Digite o nome do Posto"
                value={nomeFilial}
                onChange={(e) => setNomeFilial(e.target.value)}
                required
              />
            </Form.Group>

            <Row className="mb-3">
              <Col xs={12} md={6} className="mb-3 mb-md-0">
                <Form.Group controlId="formCep">
                  <Form.Label>CEP</Form.Label>
                  <Form.Control
                    type="text"
                    value={cep}
                    onChange={handleCepChange}
                    maxLength={8}
                    placeholder="Digite o CEP"
                    required
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group controlId="formRua">
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

            <Form.Group className="mb-3 mt-2" controlId="formBairro">
              <Form.Label>Bairro</Form.Label>
              <Form.Control
                value={endereco.bairro}
                onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })}
                readOnly={endereco.bairroReadOnly}
                required
              />
            </Form.Group>

            <Button className="btn btn-primary"
              type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Cadastrar"}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default Filial;
