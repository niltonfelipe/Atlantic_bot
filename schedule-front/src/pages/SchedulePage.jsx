import React, { useState, useEffect } from "react";
import Sidebar from "../components/static/Sidebar";
import Notification from "../components/shared/Notification";
import ScheduleTable from "../components/schedule/ScheduleTable";
import ScheduleTabs from "../components/schedule/ScheduleTabs";
import MarkAsDoneModal from "../components/schedule/MarkAsDoneModal";

const SchedulePage = () => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [coletores, setColetores] = useState([]); // lista de coletores
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [activeTab, setActiveTab] = useState("pendentes");
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState(null);

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      3000
    );
  };

  useEffect(() => {
    const fetchAgendamentos = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/agendamentos`
        );
        if (!response.ok) throw new Error("Erro ao carregar agendamentos");
        const data = await response.json();
        setAgendamentos(data);
      } catch (error) {
        console.error(error);
        showNotification("Erro ao carregar agendamentos", "error");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchColetores = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/usuarios`
        );
        if (!response.ok) throw new Error("Erro ao carregar coletores");
        const data = await response.json();
        setColetores(data);
      } catch (error) {
        console.error(error);
        showNotification("Erro ao carregar coletores", "error");
      }
    };

    fetchAgendamentos();
    fetchColetores();
  }, []);

  const agendamentosFiltrados = agendamentos.filter((a) => {
    const status = (a.status || "").trim().toUpperCase();
    switch (activeTab) {
      case "pendentes":
        return status === "PENDENTE";
      case "cancelados":
        return status === "CANCELADO";
      case "realizados":
        return status === "REALIZADO";
      case "todos":
      default:
        return true;
    }
  });

  const handleDelete = async (telefone_cliente) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/agendamentos/telefone/${telefone_cliente}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": import.meta.env.VITE_TOKEN_KEY,
          },
        }
      );

      if (
        !window.confirm(
          "Você tem certeza que deseja cancelar este agendamento?"
        )
      ) {
        return;
      }

      if (!response.ok) throw new Error("Erro ao deletar agendamento");
      showNotification("Agendamento cancelado com sucesso", "success");
      setAgendamentos((prev) =>
        prev.filter((a) => a.telefone_cliente !== telefone_cliente)
      );
    } catch (error) {
      console.error(error);
      showNotification("Erro ao deletar agendamento", "error");
    }
  };

  const openMarkAsDoneModal = (agendamento) => {
    setSelectedAgendamento(agendamento);
    setModalOpen(true);
  };

  const closeMarkAsDoneModal = () => {
    setModalOpen(false);
    setSelectedAgendamento(null);
  };
  const handleMarkAsDone = async (dia_realizado, hora_realizado) => {
    if (!selectedAgendamento) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/agendamentos/registro`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": import.meta.env.VITE_TOKEN_KEY,
          },
          body: JSON.stringify({
            qr_code: selectedAgendamento.qr_code,
            dia_realizado,
            hora_realizado,
          }),
        }
      );

      if (!response.ok) throw new Error("Erro ao registrar coleta realizada");

      const atualizado = await response.json();
      showNotification("Coleta marcada como realizada com sucesso", "success");
      setAgendamentos((prev) =>
        prev.map((a) =>
          a.id_agendamento === atualizado.id_agendamento ? atualizado : a
        )
      );
      closeMarkAsDoneModal();
    } catch (error) {
      console.error(error);
      showNotification("Erro ao registrar coleta realizada", "error");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Agendamentos de Coleta
            </h1>
            <p className="text-gray-600 mt-2">
              {activeTab === "pendentes"
                ? "Coletas pendentes de realização"
                : activeTab === "cancelados"
                ? "Coletas canceladas"
                : activeTab === "realizados"
                ? "Coletas realizadas"
                : "Todos os agendamentos de coleta"}
            </p>
          </div>

          <ScheduleTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
              <p className="mt-2 text-gray-600">Carregando agendamentos...</p>
            </div>
          ) : (
            <ScheduleTable
              agendamentos={agendamentosFiltrados}
              onDelete={handleDelete}
              onMarkAsDone={openMarkAsDoneModal}
            />
          )}

          <Notification
            show={notification.show}
            message={notification.message}
            type={notification.type}
            onClose={() =>
              setNotification({ show: false, message: "", type: "" })
            }
          />

          <MarkAsDoneModal
            isOpen={modalOpen}
            onClose={closeMarkAsDoneModal}
            onConfirm={handleMarkAsDone}
            clienteNome={selectedAgendamento?.nome_cliente}
            responsavelNome={selectedAgendamento?.responsavel}
            dataAgendada={selectedAgendamento?.data_agendada?.split("T")[0]}
          />
        </div>
      </main>
    </div>
  );
};

export default SchedulePage;
