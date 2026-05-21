import { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../../styles/Filial.css";

function ListaFilial() {
    const [usuarios, setUsuarios] = useState([]);
    const [filiais, setFiliais] = useState([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [filialToDelete, setFilialToDelete] = useState(null);

    const navigate = useNavigate();

    const fetchData = () => {
        const usuariosSalvos = JSON.parse(localStorage.getItem("usuarios")) || [];
        const filiaisSalvas = JSON.parse(localStorage.getItem("filiais")) || [];
        setUsuarios(usuariosSalvos);
        setFiliais(filiaisSalvas);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCadastrar = () => {
        navigate("/cadfilial");
    };

    const handleEditar = (id) => {
        navigate(`/editFilial/${id}`)
    }

    // Abre o modal de confirmação
    const handleDeleteClick = (filial) => {
        // Verifica se há usuários vinculados
        const usuariosVinculados = usuarios.filter(u => u.filial === filial.id);
        if (usuariosVinculados.length > 0) {
            toast.warning("Não é possível excluir este posto, pois há usuários vinculados a ela.");
            return;
        }

        setFilialToDelete(filial);
        setShowConfirm(true);
    };

    // Confirma exclusão
    const handleConfirmDelete = () => {
        if (!filialToDelete) return;

        try {
            const filiaisSalvas = JSON.parse(localStorage.getItem("filiais")) || [];
            const filtradas = filiaisSalvas.filter(f => f.id !== filialToDelete.id);
            localStorage.setItem("filiais", JSON.stringify(filtradas));
            setFiliais(filtradas);
            toast.success("Posto excluído com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao excluir posto.");
        } finally {
            setShowConfirm(false);
            setFilialToDelete(null);
        }
    };

    return (
        <div className="container-filial safeArea">
            <h2 style={{ textAlign: "center" }}>Postos</h2>

            {filiais.length === 0 ? (
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
                        {filiais.map((f) => (
                            <tr key={f.id}>
                                <td>{f.nome}</td>
                                <td>{f.cep}</td>
                                <td>{f.rua}</td>
                                <td>{f.bairro}</td>
                                <td>
                                    <div className="tableButtonGroup">
                                        <Button variant="warning" size="sm" onClick={() => handleEditar(f.id)}>Editar</Button>
                                        <Button variant="danger" size="sm" onClick={() => handleDeleteClick(f)}>Excluir</Button>
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


            {/* Modal de confirmação */}
            <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmação</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Deseja realmente excluir o posto "{filialToDelete?.nome}"?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirm(false)}>Não</Button>
                    <Button variant="danger" onClick={handleConfirmDelete}>Sim</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default ListaFilial;
