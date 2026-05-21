"use client";

import { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import "../../../styles/Posto.css";

function ListaPostos() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [postos, setPostos] = useState<any[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [postoToDelete, setPostoToDelete] = useState<any>(null);

  const router = useRouter();

  const fetchData = () => {
    const usuariosSalvos = JSON.parse(localStorage.getItem("usuarios") || "[]");
    const postosSalvos = JSON.parse(localStorage.getItem("postos") || "[]");

    setUsuarios(usuariosSalvos);
    setPostos(postosSalvos);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =========================
  // NAVIGATIONS
  // =========================
  const handleCadastrar = () => {
    router.push("/postos/cadastrar");
  };

  const handleEditar = (id: string) => {
    router.push(`/postos/editar/${id}`);
  };

  // =========================
  // DELETE
  // =========================
  const handleDeleteClick = (posto: any) => {
    const usuariosVinculados = usuarios.filter(
      (u) => u.posto === posto.id
    );

    if (usuariosVinculados.length > 0) {
      toast.warning("Não é possível excluir este posto, pois há usuários vinculados.");
      return;
    }

    setPostoToDelete(posto);
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (!postoToDelete) return;

    try {
      const postosSalvos = JSON.parse(localStorage.getItem("postos") || "[]");

      const filtrados = postosSalvos.filter(
        (p: any) => p.id !== postoToDelete.id
      );

      localStorage.setItem("postos", JSON.stringify(filtrados));
      setPostos(filtrados);

      toast.success("Posto excluído com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir posto.");
    } finally {
      setShowConfirm(false);
      setPostoToDelete(null);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="container-filial safeArea">
      <h2 style={{ textAlign: "center" }}>Postos</h2>

      {postos.length === 0 ? (
        <p style={{ textAlign: "center" }}>Nenhum posto cadastrado</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Posto</th>
              <th>CEP</th>
              <th>Rua</th>
              <th>Bairro</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {postos.map((p) => (
              <tr key={p.id}>
                <td>{p.nome}</td>
                <td>{p.cep}</td>
                <td>{p.rua}</td>
                <td>{p.bairro}</td>
                <td>
                  <div className="tableButtonGroup">
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => handleEditar(p.id)}
                    >
                      Editar
                    </Button>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteClick(p)}
                    >
                      Excluir
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <Button variant="primary" onClick={handleCadastrar}>
          Cadastrar
        </Button>
      </div>

      {/* MODAL */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmação</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Deseja realmente excluir o posto "{postoToDelete?.nome}"?
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Não
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Sim
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ListaPostos;