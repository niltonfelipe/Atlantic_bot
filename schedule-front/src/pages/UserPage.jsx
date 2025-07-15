import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/static/Sidebar";
import Notification from "../components/shared/Notification";
import Pagination from "../components/shared/Pagination";
import SearchBar from "../components/shared/SearchBar";
import ActionButtons from "../components/shared/ActionButtons";
import UserModal from "../components/users/UserModal";
import UserTable from "../components/users/UserTable";
import ButtonAddUserUI from "../components/users/ButtonAddUserUI";

const UserPage = () => {
  const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;
  const API_USERS_URL = `${API_BASE_URL}/usuarios`;
  const API_REGISTER_URL = `${API_USERS_URL}/register`;

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterField, setFilterField] = useState({
    value: "nome",
    label: "Nome",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newUser, setNewUser] = useState({
    nome: "",
    email: "",
    senha: "",
    tipo_usuario: "Coletor",
  });

  const rowsPerPage = 5;
  const filterOptions = [
    { value: "nome", label: "Nome" },
    { value: "email", label: "Email" },
    { value: "tipo_usuario", label: "Tipo" },
  ];

  const userTypeOptions = [
    { value: "Coletor", label: "Coletor" },
    { value: "Analista", label: "Analista" }
  ];

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token de autenticação não encontrado");

      const response = await fetch(`${API_USERS_URL}?sort=id,asc`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`Erro: ${response.status}`);

      let usersData = await response.json();
      
      // Ordena por ID crescente
      usersData = usersData.sort((a, b) => a.id_usuario - b.id_usuario);
      
      setUsers(usersData);
      showNotification("Usuários carregados com sucesso.", "success");
    } catch (error) {
      console.error("Failed to fetch users:", error);
      showNotification(`Erro ao buscar usuários: ${error.message}`, "error");
      if (error.message.includes("401")) window.location.href = "/login";
    } finally {
      setIsLoading(false);
    }
  }, [API_USERS_URL]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter((user) => {
    const searchTerm = search.toLowerCase();
    const fieldValue = user[filterField.value]?.toString().toLowerCase() || "";
    return fieldValue.includes(searchTerm);
  });

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const validateUser = () => {
    if (!newUser.nome.trim()) {
      showNotification("O nome é obrigatório.", "error");
      return false;
    }
    if (!newUser.email.trim()) {
      showNotification("O email é obrigatório.", "error");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      showNotification("Formato de email inválido.", "error");
      return false;
    }
    if (!editingUser && !newUser.senha) {
      showNotification("A senha é obrigatória.", "error");
      return false;
    }
    if (newUser.senha !== confirmPassword) {
      showNotification("As senhas não coincidem.", "error");
      return false;
    }
    return true;
  };

  const handleSaveUser = async () => {
    if (!validateUser()) return;

    setIsLoading(true);
    try {
      let url, payload, response;

      if (editingUser) {
        // Edição de usuário existente
        url = `${API_USERS_URL}/${editingUser.id_usuario}`;
        payload = {
          nome: newUser.nome,
          email: newUser.email,
          ...(newUser.senha && { senha: newUser.senha }),
          tipo_usuario: newUser.tipo_usuario
        };

        response = await fetch(url, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "x-api-key": import.meta.env.VITE_TOKEN_KEY,
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Criação de novo usuário
        url = API_REGISTER_URL;
        payload = {
          nome: newUser.nome,
          email: newUser.email,
          senha: newUser.senha,
          tipo_usuario: newUser.tipo_usuario,
        };

        response = await fetch(url, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-api-key": import.meta.env.VITE_TOKEN_KEY,
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            errorData.message ||
            `HTTP error! status: ${response.status}`
        );
      }

      showNotification(
        `Usuário ${editingUser ? "atualizado" : "adicionado"} com sucesso!`,
        "success"
      );
      fetchUsers();
      closeModal();
    } catch (error) {
      console.error("Failed to save user:", error);
      showNotification(`Erro ao salvar usuário: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRowSelect = (userId) => {
    setSelectedRows((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    const pageIds = paginatedUsers.map((user) => user.id_usuario);
    const allSelected = pageIds.every((id) => selectedRows.includes(id));

    setSelectedRows((prev) =>
      allSelected
        ? prev.filter((id) => !pageIds.includes(id))
        : [...new Set([...prev, ...pageIds])]
    );
  };

  const openAddModal = () => {
    setEditingUser(null);
    setNewUser({ nome: "", email: "", senha: "", tipo_usuario: "Coletor" });
    setConfirmPassword("");
    setShowUserModal(true);
  };

  const openEditModal = () => {
    if (selectedRows.length !== 1) {
      showNotification("Selecione exatamente um usuário para editar.", "error");
      return;
    }

    const selectedId = selectedRows[0];
    const userToEdit = users.find((user) => user.id_usuario === selectedId);

    if (userToEdit) {
      setEditingUser(userToEdit);
      setNewUser({
        nome: userToEdit.nome,
        email: userToEdit.email,
        senha: "",
        tipo_usuario: userToEdit.tipo_usuario || "Coletor",
      });
      setConfirmPassword("");
      setShowUserModal(true);
    }
  };

  const closeModal = () => {
    setShowUserModal(false);
    setEditingUser(null);
  };

  const handleDeleteSelected = async () => {
    if (
      selectedRows.length === 0 ||
      !window.confirm(`Excluir ${selectedRows.length} usuário(s)?`)
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token não encontrado");

      const results = await Promise.allSettled(
        selectedRows.map((id) => {
          return fetch(`${API_USERS_URL}/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "x-api-key": import.meta.env.VITE_TOKEN_KEY,
              "Content-Type": "application/json",
            },
          }).then((res) => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return { status: "fulfilled" };
          });
        })
      );

      const successfulDeletions = results.filter(
        (r) => r.status === "fulfilled"
      ).length;
      const failedDeletions = results.length - successfulDeletions;

      if (successfulDeletions > 0) {
        showNotification(
          `${successfulDeletions} usuário(s) excluído(s) com sucesso!`,
          "success"
        );
      }
      if (failedDeletions > 0) {
        showNotification(
          `${failedDeletions} erro(s) ao excluir usuário(s).`,
          "error"
        );
      }

      fetchUsers();
      setSelectedRows([]);
    } catch (error) {
      console.error("Failed to delete users:", error);
      showNotification(`Erro ao excluir usuários: ${error.message}`, "error");

      if (error.message.includes("401")) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReload = () => {
    setSearch("");
    setCurrentPage(1);
    fetchUsers();
  };

  const handleUserChange = (field, value) => {
    setNewUser((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: "", type: "" })}
        />

        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Painel de Coletores
          </h1>

          <div className="flex flex-col gap-4 mb-6 p-4 bg-white rounded-lg shadow">
            <div className="flex justify-between flex-col md:flex-row">
              <div className="flex">
                <SearchBar
                  filterOptions={filterOptions}
                  filterField={filterField}
                  onFilterChange={(option) => {
                    setFilterField(option);
                    setCurrentPage(1);
                  }}
                  search={search}
                  onSearchChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  onRefresh={handleReload}
                  isLoading={isLoading}
                  placeholder={`Buscar por ${filterField.label.toLowerCase()}...`}
                />
              </div>

              <ButtonAddUserUI
                onAdd={openAddModal}
                addLabel="Adicionar Usuário"
                isLoading={isLoading}
              />
            </div>
          </div>

          {selectedRows.length > 0 && (
            <div>
              <ActionButtons
                selectedRows={selectedRows}
                onEdit={openEditModal}
                onDelete={handleDeleteSelected}
                isLoading={isLoading}
              />
            </div>
          )}
          <UserTable
            users={paginatedUsers}
            selectedRows={selectedRows}
            onRowSelect={handleRowSelect}
            onSelectAllRows={handleSelectAll}
            isLoading={isLoading}
          />
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredUsers.length}
              onPageChange={setCurrentPage}
            />
          )}
        </div>

        <UserModal
          show={showUserModal}
          onClose={closeModal}
          user={newUser}
          onUserChange={handleUserChange}
          onSave={handleSaveUser}
          isLoading={isLoading}
          isEditing={!!editingUser}
          confirmPassword={confirmPassword}
          onConfirmPasswordChange={(e) => setConfirmPassword(e.target.value)}
          userTypeOptions={userTypeOptions}
          value={"Coletor"}
          nameOption={"Coletor"}
        />
      </main>
    </div>
  );
};

export default UserPage;