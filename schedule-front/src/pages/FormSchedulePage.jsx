import React, { useState, useEffect } from "react";
import Sidebar from "../components/static/Sidebar";
import Notification from "../components/shared/Notification";
import ScheduleForm from "../components/schedule/ScheduleForm";
import { useAuth } from "../context/AuthContext";

const FormSchedulePage = () => {
  const [formData, setFormData] = useState({
    id_cliente: "",
    data: "",
    turno: "",
    observacoes: "",
    id_usuario: "",
  });

  const [clientes, setClientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [zonaCliente, setZonaCliente] = useState("");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [clientesRes, usuariosRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/clientes`),
          fetch(`${import.meta.env.VITE_API_URL}/usuarios`),
        ]);

        if (!clientesRes.ok || !usuariosRes.ok) {
          throw new Error("Erro ao carregar dados.");
        }

        const [clientesData, usuariosData] = await Promise.all([
          clientesRes.json(),
          usuariosRes.json(),
        ]);

        setClientes(clientesData);
        setUsuarios(usuariosData);
      } catch (error) {
        console.error(error);
        showNotification("Erro ao carregar dados.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const validateField = (name, value) => {
    let errorMsg = "";
    switch (name) {
      case "id_cliente":
        if (!value) errorMsg = "Selecione o cliente.";
        break;
      case "data":
        if (!value) {
          errorMsg = "A data é obrigatória.";
        } else {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const selectedDate = new Date(value + "T00:00:00");
          if (selectedDate < today) {
            errorMsg = "A data não pode ser no passado.";
          }
        }
        break;
      case "turno":
        if (!value) errorMsg = "Selecione o turno.";
        break;
      case "id_usuario":
        if (!value) errorMsg = "Selecione o usuário.";
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    return errorMsg;
  };

  const onFormChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    validateField(name, value);
  };

  const handleClienteChange = (e) => {
    const idCliente = e.target.value;
    onFormChange("id_cliente", idCliente);
    validateField("id_cliente", idCliente);

    const clienteSelecionado = clientes.find(
      (c) => c.id_cliente.toString() === idCliente
    );

    if (clienteSelecionado?.endereco?.zona?.nome_da_zona) {
      setZonaCliente(clienteSelecionado.endereco.zona.nome_da_zona);
    } else {
      setZonaCliente("");
    }
  };

  const showNotification = (message, type) => {
    setNotification({
      show: true,
      message,
      type,
    });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    ["id_cliente", "data", "turno", "id_usuario"].forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showNotification("Corrija os erros no formulário.", "error");
      return;
    }

    try {
      setIsLoading(true);

      const cliente = clientes.find(
        (c) => c.id_cliente.toString() === formData.id_cliente
      );

      if (!cliente) {
        showNotification("Cliente não encontrado.", "error");
        setIsLoading(false);
        return;
      }

      const payload = {
        telefone_cliente: cliente.telefone_cliente,
        dia_agendado: formData.data,
        turno_agendado: formData.turno,
        observacoes: formData.observacoes,
        id_usuario: Number(formData.id_usuario),
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/agendamentos/telefone`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": import.meta.env.VITE_TOKEN_KEY,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro: ${response.status} - ${errorText}`);
      }

      showNotification("Coleta agendada com sucesso!", "success");

      setFormData({
        id_cliente: "",
        data: "",
        turno: "",
        observacoes: "",
        id_usuario: "",
      });
      setZonaCliente("");
      setErrors({});
    } catch (error) {
      console.error("Erro ao agendar:", error);
      showNotification(error.message || "Erro ao agendar", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
        {notification.show && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() =>
              setNotification({ show: false, message: "", type: "" })
            }
          />
        )}

        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Agendamento de Coleta
            </h1>
            <p className="text-gray-600 mt-2">
              Preencha os dados para agendar uma nova coleta
            </p>
          </div>

          <ScheduleForm
            clients={clientes}
            users={usuarios}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            errors={errors}
            formData={formData}
            onFormChange={onFormChange}
            onClienteChange={handleClienteChange}
            zonaCliente={zonaCliente}
          />
        </div>
      </main>
    </div>
  );
};

export default FormSchedulePage;
