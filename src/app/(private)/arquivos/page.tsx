"use client";

import { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

import gerarPDF from "../../../utils/gerarChecklistPDF";
import { toast } from "react-toastify";

import api from "../../../service/api";
import "../../../styles/Arquivos.css";

type Formulario = {
  id: string;
  titulo: string;
  filial_nome?: string;
  usuario?: string;
  checklist?: any;
  ensaio?: any;
};

export default function Arquivos() {
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [loading, setLoading] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [formularioToDelete, setFormularioToDelete] =
    useState<Formulario | null>(null);

  const [usuarioLogado, setUsuarioLogado] = useState({
    username: "",
    isAdmin: false,
  });

  // =========================
  // PEGA USUÁRIO LOGADO
  // =========================
  useEffect(() => {
    const usuario = localStorage.getItem("usuarioLogado");

    if (usuario) {
      const parsed = JSON.parse(usuario);

      setUsuarioLogado({
        username: parsed.username,
        isAdmin: parsed.isAdmin === true,
      });
    }
  }, []);

  // =========================
  // BUSCA NA API
  // =========================
  async function fetchFormularios() {
    try {
      setLoading(true);

      const response = await api.get("/formularios");
      const data: Formulario[] = response.data;

      const filtrados = usuarioLogado.isAdmin
        ? data
        : data.filter((f) => f.usuario === usuarioLogado.username);

      setFormularios(filtrados);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar formulários");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (usuarioLogado.username) {
      fetchFormularios();
    }
  }, [usuarioLogado]);

  // =========================
  // DELETE (API)
  // =========================
  async function handleConfirmDelete() {
    if (!formularioToDelete) return;

    try {
      await api.put(`/formularios/${formularioToDelete.id}/ativo`);

      toast.success("Formulário excluído com sucesso!");

      setShowConfirm(false);
      setFormularioToDelete(null);

      fetchFormularios();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir formulário");
    }
  }

  // =========================
  // PDF
  // =========================
  function handleDownloadPDF(formulario: Formulario) {
    try {
      const dadosParaPDF = {
        ...formulario,
        bombaId: "Bomba/Bico",
        checklist: Array.isArray(formulario.checklist)
          ? formulario.checklist
          : Object.keys(formulario.checklist || {})
              .filter((key) => key !== "data")
              .map((key) => ({
                id: key,
                label: key,
                resposta: String(formulario.checklist?.[key] || "").toUpperCase(),
              })),
        ensaio: Array.isArray(formulario.ensaio)
          ? formulario.ensaio
          : Object.keys(formulario.ensaio || {})
              .filter((key) => key !== "data")
              .map((key) => ({
                id: key,
                label: key,
                resposta: String(formulario.ensaio?.[key] || "").toUpperCase(),
              })),
      };

      gerarPDF(dadosParaPDF);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar PDF");
    }
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="container-arquivos safeArea">
      <h2 style={{ textAlign: "center" }}>Formulários</h2>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Título</th>
              <th>Posto</th>
              <th>Usuário</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {formularios.length > 0 ? (
              formularios.map((f) => (
                <tr key={f.id}>
                  <td>{f.titulo}</td>
                  <td>{f.filial_nome || "—"}</td>
                  <td title={f.usuario}>{f.usuario || "—"}</td>

                  <td>
                    <div className="tableButtonGroup">
                      <Button
                        variant="info"
                        size="sm"
                        onClick={() => handleDownloadPDF(f)}
                      >
                        PDF
                      </Button>

                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setFormularioToDelete(f);
                          setShowConfirm(true);
                        }}
                      >
                        Excluir
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>Nenhum formulário cadastrado</td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      {/* MODAL */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmação</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Deseja realmente excluir o formulário <br />
          <strong>{formularioToDelete?.titulo}</strong>?
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