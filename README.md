# Regras de Negócio Implementadas

## Gestão de Filiais por Perfil

### Funcionário

* O funcionário possui vínculo com apenas uma filial.
* Ao gerar checklist, a filial é atribuída automaticamente.
* O funcionário visualiza apenas os relatórios/checklists criados por ele.

---

### Gestor

* O gestor pode possuir vínculo com múltiplas filiais.
* O gestor visualiza relatórios e checklists de todas as filiais vinculadas a ele.
* Ao gerar checklist, o gestor pode selecionar qual filial vinculada será utilizada.
* O gestor só consegue visualizar filiais pertencentes às matrizes das quais possui vínculo.
* O gestor só consegue cadastrar ou editar filiais vinculadas às matrizes permitidas para ele.
* O gestor não visualiza matrizes de outros grupos/empresas no sistema.

---

### Master

* O usuário master possui acesso total ao sistema.
* O master pode visualizar todas as filiais, matrizes, relatórios e usuários.
* O master pode selecionar qualquer matriz ao cadastrar ou editar filiais.
* O master pode criar usuários com qualquer perfil.

---

# Checklist e Relatórios

* O checklist agora salva corretamente a filial selecionada.
* Relatórios filtram os dados conforme as permissões do usuário logado.
* Gestores conseguem visualizar checklists de todas as filiais vinculadas.
* Funcionários continuam limitados apenas aos próprios registros.
* O PDF do relatório utiliza os dados filtrados pelas permissões do usuário.

---

# Cadastro e Edição de Usuários

* Usuários do tipo gestor podem possuir múltiplas filiais.
* Funcionários permanecem vinculados a apenas uma filial.
* A interface de seleção de filiais foi ajustada dinamicamente conforme o perfil escolhido.
* Alterações sensíveis no próprio usuário (senha, email, perfil ou filiais) obrigam novo login.

---

# Cadastro e Edição de Filiais

* O sistema limita as matrizes disponíveis conforme o vínculo do usuário.
* Gestores visualizam apenas matrizes relacionadas às suas filiais.
* Masters visualizam todas as matrizes.
* Caso exista apenas uma matriz disponível, ela é selecionada automaticamente.

---

# Melhorias de Interface (UI/UX)

* O seletor de filial foi movido para a área de informações iniciais do checklist.
* O sistema exibe seleção de filial apenas para gestores e masters.
* A interface foi simplificada para funcionários, evitando opções desnecessárias.
* As listagens foram ajustadas para manter visual mais limpo e contextualizado conforme permissões.
