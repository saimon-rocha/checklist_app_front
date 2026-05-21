"use client";

import { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import "../../../styles/Usuarios.css";

export default function ListaUsuarios() {
  const router = useRouter();

  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState<any>(null);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  
  useEffect(() => {
    loadUsuarios();
  }, []);

  async function loadUsuarios() {
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${API_URL}/usuarios`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao carregar usuários");
      }

      const ativos = data.filter((u: any) => u.id_ativo === true);

      setUsuarios(ativos);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar usuários");
    }
  }

  const handleDeleteClick = (usuario: any) => {
    const usuarioLogado = JSON.parse(
      localStorage.getItem("usuarioLogado") || "null",
    );

    if (usuarioLogado?.username === usuario.username) {
      toast.warning("Você não pode excluir seu próprio usuário!");
      return;
    }

    setUsuarioToDelete(usuario);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!usuarioToDelete) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/usuarios/${usuarioToDelete.id}/desabilitar`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao desativar usuário");
      }

      toast.success("Usuário desativado com sucesso!");

      setUsuarios((prev) => prev.filter((u) => u.id !== usuarioToDelete.id));

      setShowConfirm(false);
      setUsuarioToDelete(null);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao desativar usuário");
    }
  };

  return (
    <div className="container-usuarios safeArea">
      <h2 style={{ textAlign: "center" }}>Usuários</h2>

      {usuarios.length === 0 ? (
        <p style={{ textAlign: "center" }}>Nenhum usuário cadastrado</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Email</th>
              <th>Posto</th>
              <th>Perfil</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td title={u.username}>{u.username}</td>

                <td>{u.Postos?.nome || "-"}</td>

                <td>
                  {u.id_admin ? (
                    <span
                      style={{
                        color: "red",
                        fontWeight: "bold",
                      }}
                    >
                      Administrador
                    </span>
                  ) : (
                    <span>Usuário</span>
                  )}
                </td>

                <td>
                  <div className="tableButtonGroup">
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => router.push(`/usuarios/editar/${u.id}`)}
                    >
                      Editar
                    </Button>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteClick(u)}
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

      <div
        style={{
          textAlign: "center",
          marginTop: "20px",
        }}
      >
        <Button onClick={() => router.push("/usuarios/cadastrar")}>
          Cadastrar
        </Button>
      </div>

      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmação</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Deseja realmente excluir o usuário{" "}
          <strong>{usuarioToDelete?.username}</strong>?
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
