"use client";

import { useEffect, useState } from "react";

import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";

import { toast } from "react-toastify";

import gerarPDF from "../../../utils/gerarChecklistPDF";

import api from "../../../service/api";

import "../../../styles/Arquivos.css";

import { checklistItems } from "../../../utils/checklistStructure";

type Formulario = {
  id: string;
  titulo: string;

  createdAt?: string;

  usuario_id?: number;
  id_posto?: number;

  respostas?: {
    checklist?: any;
    ensaio?: any;
  };

  Usuario?: {
    id: number;
    username: string;
  };

  Posto?: {
    id: number;
    nome: string;
  };
};

function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export default function Arquivos() {
  const [formularios, setFormularios] = useState<Formulario[]>([]);

  const [loading, setLoading] = useState(true);

  const [showConfirm, setShowConfirm] = useState(false);

  const [formularioToDelete, setFormularioToDelete] =
    useState<Formulario | null>(null);

  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);

  // =========================
  // USUÁRIO LOGADO
  // =========================
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    const payload = parseJwt(token);

    setUsuarioLogado(payload);
  }, []);

  // =========================
  // BUSCAR FORMULÁRIOS
  // =========================
  async function fetchFormularios() {
    try {
      setLoading(true);

      const response = await api.get("/arquivos");

      console.log(response);

      const data: Formulario[] = response.data;

      // ADMIN vê tudo
      // usuário comum vê apenas os seus
      const filtrados =
        usuarioLogado?.isAdmin === true
          ? data
          : data.filter(
              (f) => String(f.usuario_id) === String(usuarioLogado?.id),
            );

      setFormularios(filtrados);
    } catch (error: any) {
      console.error(error);

      toast.error(
        error?.response?.data?.error || "Erro ao carregar formulários",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (usuarioLogado) {
      fetchFormularios();
    }
  }, [usuarioLogado]);

  // =========================
  // EXCLUIR
  // =========================
  async function handleConfirmDelete() {
    if (!formularioToDelete) return;

    try {
      await api.put(`/arquivos/${formularioToDelete.id}/desabilitar`);

      toast.success("Formulário excluído com sucesso!");

      setShowConfirm(false);

      setFormularioToDelete(null);

      fetchFormularios();
    } catch (error: any) {
      console.error(error);

      toast.error(error?.response?.data?.error || "Erro ao excluir formulário");
    }
  }

  // =========================
  // PDF
  // =========================
  function handleDownloadPDF(formulario: Formulario) {
    try {
      const checklist = Array.isArray(formulario.respostas?.checklist)
        ? formulario.respostas.checklist
        : [];

      const ensaio = formulario.respostas?.ensaio || [];

      // transforma checklist OBJETO em ARRAY
      const checklistArray = Object.keys(checklist).map((key) => {
        const itemDef = checklistItems.find((item: any) => item.id === key);

        return {
          id: key,

          label: itemDef?.label || itemDef?.placeholder || key,

          resposta: checklist[key],
        };
      });

      const dadosParaPDF = {
        titulo: formulario.titulo,

        filial_nome: formulario.Posto?.nome || "—",

        usuario: formulario.Usuario?.username || "—",

        data: formulario.createdAt,

        bombaId:
          checklist.find((c: any) => c.id === "bombaId")?.resposta || "—",

        checklist,

        ensaio: Array.isArray(ensaio) ? ensaio : [],
      };

      gerarPDF(dadosParaPDF);
    } catch (error) {
      console.error(error);

      toast.error("Erro ao gerar PDF");
    }
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="container-arquivos safeArea">
      <h2 className="text-center mb-4">Formulários</h2>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <Table striped bordered hover responsive className="align-middle">
          <thead>
            <tr>
              <th>Título</th>

              <th>Posto</th>

              <th>Usuário</th>

              <th
                style={{
                  width: "170px",
                  textAlign: "center",
                }}
              >
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {formularios.length > 0 ? (
              formularios.map((f) => (
                <tr key={f.id}>
                  <td>{f.titulo}</td>

                  <td>{f.Posto?.nome || "Não informado"}</td>

                  <td>{f.Usuario?.username || "Não informado"}</td>

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
                <td colSpan={4} className="text-center">
                  Nenhum formulário cadastrado
                </td>
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
          Deseja realmente excluir o formulário?
          <br />
          <strong>{formularioToDelete?.titulo}</strong>
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
