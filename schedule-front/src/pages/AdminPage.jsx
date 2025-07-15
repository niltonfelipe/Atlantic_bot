import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/static/Sidebar";
import Notification from "../components/shared/Notification";
import Pagination from "../components/shared/Pagination";
import SearchBar from "../components/shared/SearchBar";
import ActionButtons from "../components/shared/ActionButtons";
import UserModal from "../components/users/UserModal";
import UserTable from "../components/users/UserTable";
import ButtonAddUserUI from "../components/users/ButtonAddUserUI";

const AdminPage = () => {
  const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;
  const API_ADMINS_URL = `${API_BASE_URL}/admin`;
  const API_ADMIN_REGISTER_URL = `${API_ADMINS_URL}/register`;

  const [admins, setAdmins] = useState([]);
  const [search, setSearch] = useState("");
  const [filterField, setFilterField] = useState({ value: "nome", label: "Nome" });
  const [currentPage, setCurrentPage] = useState(1);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loggedAdminId, setLoggedAdminId] = useState(null);
  const [newAdmin, setNewAdmin] = useState({
    nome: "",
    email: "",
    senha: "",
  });

  const rowsPerPage = 5;
  const filterOptions = [
    { value: "nome", label: "Nome" },
    { value: "email", label: "Email" },
  ];

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  const fetchAdmins = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token de autenticação não encontrado");

      const response = await fetch(`${API_ADMINS_URL}?sort=id,asc`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`Erro: ${response.status}`);

      let adminsData = await response.json();

      adminsData = adminsData.sort((a, b) => a.id_admin - b.id_admin);

      const adminsWithType = adminsData.map(admin => ({
        ...admin,
        tipo_usuario: "Admin",
        id_usuario: admin.id_admin,
      }));

      setAdmins(adminsWithType);
      showNotification("Administradores carregados com sucesso.", "success");
    } catch (error) {
      console.error("Failed to fetch admins:", error);
      showNotification(`Erro ao buscar administradores: ${error.message}`, "error");
      if (error.message.includes("401")) window.location.href = "/login";
    } finally {
      setIsLoading(false);
    }
  }, [API_ADMINS_URL]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const payloadBase64 = token.split('.')[1];
      const decoded = JSON.parse(atob(payloadBase64));
      setLoggedAdminId(decoded.id_admin || decoded.id);
    } catch (error) {
      console.error("Erro ao decodificar token:", error);
    }
  }, []);

  const filteredAdmins = admins.filter((admin) => {
    const searchTerm = search.toLowerCase();
    const fieldValue = admin[filterField.value]?.toString().toLowerCase() || "";
    return fieldValue.includes(searchTerm);
  });

  const totalPages = Math.ceil(filteredAdmins.length / rowsPerPage);
  const paginatedAdmins = filteredAdmins.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const validateAdmin = () => {
    if (!newAdmin.nome.trim()) {
      showNotification("O nome é obrigatório.", "error");
      return false;
    }
    if (!newAdmin.email.trim()) {
      showNotification("O email é obrigatório.", "error");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(newAdmin.email)) {
      showNotification("Formato de email inválido.", "error");
      return false;
    }
    if (!editingAdmin && !newAdmin.senha) {
      showNotification("A senha é obrigatória.", "error");
      return false;
    }
    if (newAdmin.senha !== confirmPassword) {
      showNotification("As senhas não coincidem.", "error");
      return false;
    }
    return true;
  };

  const handleSaveAdmin = async () => {
    if (!validateAdmin()) return;

    setIsLoading(true);
    try {
      let url, payload, response;

      if (editingAdmin) {
        url = `${API_ADMINS_URL}/${editingAdmin.id_admin}`;
        payload = {
          nome: newAdmin.nome,
          email: newAdmin.email,
          ...(newAdmin.senha && { senha: newAdmin.senha }),
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
        url = API_ADMIN_REGISTER_URL;
        payload = {
          nome: newAdmin.nome,
          email: newAdmin.email,
          senha: newAdmin.senha,
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
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      showNotification(`Administrador ${editingAdmin ? "atualizado" : "adicionado"} com sucesso!`, "success");
      fetchAdmins();
      closeModal();
    } catch (error) {
      console.error("Failed to save admin:", error);
      showNotification(`Erro ao salvar administrador: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRowSelect = (adminId) => {
    if (adminId === 1) return;
    if (adminId === loggedAdminId) {
      showNotification("Você não pode excluir a si mesmo.", "error");
      return;
    }

    setSelectedRows((prev) =>
      prev.includes(adminId)
        ? prev.filter((id) => id !== adminId)
        : [...prev, adminId]
    );
  };

  const handleSelectAll = () => {
    const pageIds = paginatedAdmins
      .map((admin) => admin.id_admin)
      .filter((id) => id !== 1 && id !== loggedAdminId);

    const allSelected = pageIds.every((id) => selectedRows.includes(id));

    setSelectedRows((prev) =>
      allSelected
        ? prev.filter((id) => !pageIds.includes(id))
        : [...new Set([...prev, ...pageIds])]
    );
  };

  const openAddModal = () => {
    setEditingAdmin(null);
    setNewAdmin({ nome: "", email: "", senha: "" });
    setConfirmPassword("");
    setShowUserModal(true);
  };

  const openEditModal = () => {
    if (selectedRows.length !== 1) {
      showNotification("Selecione exatamente um administrador para editar.", "error");
      return;
    }

    const selectedId = selectedRows[0];
    const adminToEdit = admins.find((admin) => admin.id_admin === selectedId);

    if (adminToEdit) {
      setEditingAdmin(adminToEdit);
      setNewAdmin({
        nome: adminToEdit.nome,
        email: adminToEdit.email,
        senha: "",
      });
      setConfirmPassword("");
      setShowUserModal(true);
    }
  };

  const closeModal = () => {
    setShowUserModal(false);
    setEditingAdmin(null);
  };

  const handleDeleteSelected = async () => {
    if (
      selectedRows.length === 0 ||
      !window.confirm(`Excluir ${selectedRows.length} administrador(es)?`)
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token não encontrado");

      const results = await Promise.allSettled(
        selectedRows.map((id) =>
          fetch(`${API_ADMINS_URL}/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "x-api-key": import.meta.env.VITE_TOKEN_KEY,
              "Content-Type": "application/json",
            },
          }).then((res) => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return { status: "fulfilled" };
          })
        )
      );

      const successfulDeletions = results.filter((r) => r.status === "fulfilled").length;
      const failedDeletions = results.length - successfulDeletions;

      if (successfulDeletions > 0) {
        showNotification(`${successfulDeletions} administrador(es) excluído(s) com sucesso!`, "success");
      }
      if (failedDeletions > 0) {
        showNotification(`${failedDeletions} erro(s) ao excluir administrador(es).`, "error");
      }

      fetchAdmins();
      setSelectedRows([]);
    } catch (error) {
      console.error("Failed to delete admins:", error);
      showNotification(`Erro ao excluir administradores: ${error.message}`, "error");
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
    fetchAdmins();
  };

  const handleAdminChange = (field, value) => {
    setNewAdmin((prev) => ({ ...prev, [field]: value }));
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Painel de Administradores</h1>

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
                addLabel="Adicionar Administrador"
                isLoading={isLoading}
              />
            </div>
          </div>

          {selectedRows.length > 0 && (
            <ActionButtons
              selectedRows={selectedRows}
              onEdit={openEditModal}
              onDelete={handleDeleteSelected}
              isLoading={isLoading}
            />
          )}

          <UserTable
            users={paginatedAdmins}
            selectedRows={selectedRows}
            onRowSelect={handleRowSelect}
            onSelectAllRows={handleSelectAll}
            isLoading={isLoading}
            currentAdminId={loggedAdminId}
          />

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredAdmins.length}
              onPageChange={setCurrentPage}
            />
          )}
        </div>

        <UserModal
          show={showUserModal}
          onClose={closeModal}
          user={newAdmin}
          onUserChange={handleAdminChange}
          onSave={handleSaveAdmin}
          isLoading={isLoading}
          isEditing={!!editingAdmin}
          confirmPassword={confirmPassword}
          onConfirmPasswordChange={(e) => setConfirmPassword(e.target.value)}
          isEditingAdmin={true}
          hideUserType={true}
          value={"Admin"}
          nameOption={"Admin"}
        />
      </main>
    </div>
  );
};

export default AdminPage;
