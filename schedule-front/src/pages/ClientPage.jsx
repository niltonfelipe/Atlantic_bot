import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/static/Sidebar";
import Notification from "../components/shared/Notification";
import Pagination from "../components/shared/Pagination";
import SearchBar from "../components/shared/SearchBar";
import ActionButtons from "../components/shared/ActionButtons";
import ClientModal from "../components/client/ClientModal";
import ZoneModal from "../components/zone/ZoneModal";
import ClientTable from "../components/client/ClientTable";
import AddMenuDropdown from "../components/client/AddMenuDropdown";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const CLIENTS_URL = `${API_BASE_URL}/clientes`;
const ZONES_URL = `${API_BASE_URL}/zonas`;

const ClientPage = () => {
  const [clients, setClients] = useState([]);
  const [zones, setZones] = useState([]);
  const [search, setSearch] = useState("");
  const [filterField, setFilterField] = useState({
    value: "nome_cliente",
    label: "Nome",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);

  const filteredOptions = [
    { value: "nome_cliente", label: "Nome" },
    { value: "id_cliente", label: "ID" },
    { value: "telefone_cliente", label: "Telefone" },
    { value: "zona", label: "Zona" },
  ];

  const [newClient, setNewClient] = useState({
    nome_cliente: "",
    tipo: "",
    telefone_cliente: "",
    id_zona: "",
    endereco: {
      nome_rua: "",
      bairro: "",
      numero: "",
    },
    qr_code: "",
  });

  const [newZone, setNewZone] = useState({
    nome_da_zona: "",
    qtd_coletas_esperadas: 0,
    dias: [],
    cor: "verde",
  });

  const dayOptions = [
    { value: "seg", label: "Segunda" },
    { value: "ter", label: "Terça" },
    { value: "qua", label: "Quarta" },
    { value: "qui", label: "Quinta" },
    { value: "sex", label: "Sexta" },
    { value: "sab", label: "Sábado" },
    { value: "dom", label: "Domingo" },
  ];

  const colorOptions = [
    { value: "azul", label: "Azul" },
    { value: "verde", label: "Verde" },
    { value: "vermelho", label: "Vermelho" },
    { value: "amarelo", label: "Amarelo" },
  ];

  const rowsPerPage = 5;
  const isMobile = windowWidth < 768;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchClients();
    fetchZones();
  }, []);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(CLIENTS_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setClients(Array.isArray(data) ? data : []);
      showNotification("Clientes carregados com sucesso.", "success");
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      showNotification("Erro ao carregar clientes.", "error");
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchZones = useCallback(async () => {
    try {
      const response = await fetch(ZONES_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setZones(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar zonas:", error);
      showNotification("Erro ao carregar zonas.", "error");
      setZones([]);
    }
  }, []);

  const filteredClients = clients.filter((client) => {
    const searchTerm = search.toLowerCase();
    if (!searchTerm) return true;

    const filterKey = filterField.value;

    if (filterKey === "endereco") {
      const address = client.endereco || {};
      return (
        (address.nome_rua || "").toLowerCase().includes(searchTerm) ||
        (address.bairro || "").toLowerCase().includes(searchTerm) ||
        (String(address.numero) || "").toLowerCase().includes(searchTerm)
      );
    }
    if (filterKey === "telefone_cliente") {
      return String(client.telefone_cliente || "")
        .toLowerCase()
        .includes(searchTerm);
    }
    if (filterKey === "zona") {
      const clientZoneName = client.endereco?.zona?.nome_da_zona || "";
      return clientZoneName.toLowerCase().includes(searchTerm);
    }

    const filterValue = client[filterKey];
    return String(filterValue || "")
      .toLowerCase()
      .includes(searchTerm);
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredClients.length / rowsPerPage)
  );
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const getZoneName = useCallback(
    (zoneId) => {
      if (!zoneId) return "N/A";
      const zone = zones.find((z) => String(z.id_zona) === String(zoneId));
      return zone ? zone.nome_da_zona : "N/A";
    },
    [zones]
  );

  const handleClientChange = (field, value) => {
    if (field.startsWith("endereco.")) {
      const addressField = field.split(".")[1];
      setNewClient((prev) => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          [addressField]: value,
        },
      }));
    } else {
      setNewClient((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleZoneChange = (field, value) => {
    setNewZone({ ...newZone, [field]: value });
  };

  const handleDayChange = (selectedOptions) => {
    setNewZone({ ...newZone, dias: selectedOptions || [] });
  };

  const handleColorChange = (e) => {
    setNewZone({ ...newZone, cor: e.target.value || "verde" });
  };

  const handleAddClient = useCallback(async () => {
    if (
      !newClient.nome_cliente.trim() ||
      !newClient.tipo.trim() ||
      !newClient.telefone_cliente.trim() ||
      !newClient.id_zona ||
      !newClient.endereco.nome_rua.trim() ||
      !newClient.endereco.bairro.trim() ||
      !newClient.endereco.numero.trim()
    ) {
      showNotification("Preencha todos os campos obrigatórios!", "error");
      return;
    }

    setIsLoading(true);
    try {
      const clientData = {
        nome_cliente: newClient.nome_cliente,
        tipo: newClient.tipo,
        telefone_cliente: newClient.telefone_cliente,
        id_zona: parseInt(newClient.id_zona, 10),
        endereco: {
          nome_rua: newClient.endereco.nome_rua,
          bairro: newClient.endereco.bairro,
          numero: newClient.endereco.numero,
        },
        qr_code: newClient.qr_code || null,
      };

      const url = editingClient
        ? `${CLIENTS_URL}/${editingClient.telefone_cliente}`
        : CLIENTS_URL;
      const method = editingClient ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_TOKEN_KEY
           },
        body: JSON.stringify(clientData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      showNotification(
        editingClient
          ? "Cliente atualizado com sucesso!"
          : "Cliente adicionado com sucesso!",
        "success"
      );
      await fetchClients();
      setShowClientModal(false);
      setEditingClient(null);
      setNewClient({
        nome_cliente: "",
        tipo: "",
        telefone_cliente: "",
        id_zona: "",
        endereco: { nome_rua: "", bairro: "", numero: "" },
        qr_code: "",
      });
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      showNotification(`Erro ao salvar cliente: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  }, [newClient, editingClient, fetchClients]);

  const handleAddZone = useCallback(async () => {
    if (!newZone.nome_da_zona.trim() || newZone.dias.length === 0) {
      showNotification(
        "Por favor, preencha o nome da zona e selecione pelo menos um dia.",
        "error"
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(ZONES_URL, {
        method: "POST",
        headers: {
           "Content-Type": "application/json",
           "x-api-key": import.meta.env.VITE_TOKEN_KEY,
            },
        body: JSON.stringify({
          ...newZone,
          dias: newZone.dias.map((d) => d.value),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      showNotification("Zona adicionada com sucesso!", "success");
      await fetchZones();
      setShowZoneModal(false);
      setNewZone({
        nome_da_zona: "",
        qtd_coletas_esperadas: 0,
        dias: [],
        cor: "verde",
      });
    } catch (error) {
      console.error("Erro ao adicionar zona:", error);
      showNotification(`Erro ao adicionar zona: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  }, [newZone, fetchZones]);

  const handleEditClient = (clientToEdit) => {
    if (!clientToEdit) return;

    setEditingClient(clientToEdit);
    const zoneIdFromAddress = clientToEdit.endereco?.id_zona;

    setNewClient({
      nome_cliente: clientToEdit.nome_cliente || "",
      tipo: clientToEdit.tipo || "",
      telefone_cliente: clientToEdit.telefone_cliente || "",
      id_zona: zoneIdFromAddress ? String(zoneIdFromAddress) : "",
      endereco: {
        nome_rua: clientToEdit.endereco?.nome_rua || "",
        bairro: clientToEdit.endereco?.bairro || "",
        numero: String(clientToEdit.endereco?.numero || ""),
      },
      qr_code: clientToEdit.qr_code || "",
    });
    setShowClientModal(true);
  };

  const handleDeleteClient = async (telefoneCliente) => {
    if (!telefoneCliente) {
      showNotification(
        "Telefone do cliente não fornecido para deleção.",
        "error"
      );
      return;
    }

    if (
      !window.confirm(
        `Tem certeza que deseja deletar o cliente com telefone ${telefoneCliente}?`
      )
    )
      return;

    setIsLoading(true);
    try {
      const response = await fetch(`${CLIENTS_URL}/${telefoneCliente}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_TOKEN_KEY,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      showNotification("Cliente deletado com sucesso!", "success");
      await fetchClients();

      setSelectedRows((prev) =>
        prev.filter((id) => {
          const client = clients.find((c) => c.id_cliente === id);
          return client?.telefone_cliente !== telefoneCliente;
        })
      );
    } catch (error) {
      console.error("Erro ao deletar cliente:", error);
      showNotification(`Erro ao deletar cliente: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRowSelect = (id_cliente) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(id_cliente)
        ? prevSelected.filter((id) => id !== id_cliente)
        : [...prevSelected, id_cliente]
    );
  };

  const handleSelectAllRows = () => {
    if (
      selectedRows.length === paginatedClients.length &&
      paginatedClients.length > 0
    ) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedClients.map((client) => client.id_cliente));
    }
  };

  const handleEditSelected = () => {
    if (selectedRows.length !== 1) {
      showNotification("Selecione exatamente um cliente para editar.", "info");
      return;
    }

    const clientToEdit = clients.find((c) => c.id_cliente === selectedRows[0]);
    if (clientToEdit) {
      handleEditClient(clientToEdit);
    } else {
      showNotification("Cliente selecionado não encontrado.", "error");
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) {
      showNotification("Nenhum cliente selecionado para deletar.", "info");
      return;
    }

    if (
      !window.confirm(
        `Tem certeza que deseja deletar ${selectedRows.length} cliente(s) selecionado(s)?`
      )
    )
      return;

    setIsLoading(true);
    let deletedCount = 0;
    const errors = [];

    for (const clientId of selectedRows) {
      const clientToDelete = clients.find((c) => c.id_cliente === clientId);
      if (clientToDelete?.telefone_cliente) {
        try {
          const response = await fetch(
            `${CLIENTS_URL}/${clientToDelete.telefone_cliente}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": import.meta.env.VITE_TOKEN_KEY,
              },
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            errors.push(
              `Falha ao deletar ${clientToDelete.nome_cliente}: ${
                errorData.detail || `HTTP ${response.status}`
              }`
            );
          } else {
            deletedCount++;
          }
        } catch (error) {
          errors.push(
            `Erro ao deletar ${clientToDelete.nome_cliente}: ${error.message}`
          );
        }
      } else {
        errors.push(
          `Cliente com ID ${clientId} não encontrado ou sem telefone cadastrado`
        );
      }
    }

    setIsLoading(false);

    if (deletedCount > 0) {
      showNotification(
        `${deletedCount} cliente(s) deletado(s) com sucesso!`,
        "success"
      );
      await fetchClients();
      setSelectedRows([]);
    }

    if (errors.length > 0) {
      showNotification(
        `Ocorreram ${errors.length} erro(s) ao deletar. Ver console.`,
        "error"
      );
      console.error("Erros ao deletar clientes:", errors);
    }
  };

  const openAddClientModal = () => {
    setEditingClient(null);
    setNewClient({
      nome_cliente: "",
      tipo: "",
      telefone_cliente: "",
      id_zona: "",
      endereco: { nome_rua: "", bairro: "", numero: "" },
      qr_code: "",
    });
    setShowClientModal(true);
    setShowAddMenu(false);
  };

  const openAddZoneModal = () => {
    setNewZone({
      nome_da_zona: "",
      qtd_coletas_esperadas: 0,
      dias: [],
      cor: "verde",
    });
    setShowZoneModal(true);
    setShowAddMenu(false);
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

        <div className="max-w-full mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Painel de Clientes
          </h1>

          <div className="mb-6 p-4 bg-white shadow rounded-lg flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-grow w-full md:w-auto">
              <SearchBar
                filterOptions={filteredOptions}
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
                onRefresh={fetchClients}
                isLoading={isLoading}
              />
            </div>
            <div className="flex-shrink-0">
              <AddMenuDropdown
                show={showAddMenu}
                onToggle={() => setShowAddMenu(!showAddMenu)}
                onAddClient={openAddClientModal}
                onAddZone={openAddZoneModal}
              />
            </div>
          </div>
          {selectedRows.length > 0 && (
            <div>
              <ActionButtons
                selectedRows={selectedRows}
                onEdit={handleEditSelected}
                onDelete={handleDeleteSelected}
                isLoading={isLoading}
              />
            </div>
          )}

          {isLoading && clients.length === 0 ? (
            <div className="text-center py-10 text-gray-600">
              Carregando clientes...
              <span className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-green-600 ml-2"></span>
            </div>
          ) : (
            <>
              <ClientTable
                clients={paginatedClients}
                isMobile={isMobile}
                selectedRows={selectedRows}
                onRowSelect={handleRowSelect}
                onSelectAllRows={handleSelectAllRows}
                onEditAction={handleEditClient}
                onDeleteAction={handleDeleteClient}
              />

              {totalPages > 1 && paginatedClients.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredClients.length}
                  onPageChange={setCurrentPage}
                />
              )}

              {!isLoading &&
                clients.length > 0 &&
                paginatedClients.length === 0 &&
                search && (
                  <div className="mt-4 p-4 bg-white rounded-lg shadow text-center text-gray-500">
                    Nenhum cliente encontrado para sua busca "{search}" com o
                    filtro "{filterField.label}".
                  </div>
                )}
            </>
          )}
        </div>

        <ClientModal
          show={showClientModal}
          onClose={() => {
            setShowClientModal(false);
            setEditingClient(null);
          }}
          newClient={newClient}
          onClientChange={handleClientChange}
          zones={zones}
          onSubmit={handleAddClient}
          isLoading={isLoading}
          editingClient={editingClient}
        />

        <ZoneModal
          show={showZoneModal}
          onClose={() => setShowZoneModal(false)}
          newZone={newZone}
          onZoneChange={handleZoneChange}
          onDayChange={handleDayChange}
          onColorChange={handleColorChange}
          onSubmit={handleAddZone}
          isLoading={isLoading}
          dayOptions={dayOptions}
          colorOptions={colorOptions}
        />
      </main>
    </div>
  );
};

export default ClientPage;
