import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ResetForm from "../components/resetFormAdmin/ResetForm";
import Notification from "../components/shared/Notification";

export default function UpdateAdmin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [adminData, setAdminData] = useState(null);
  const [notification, setNotification] = useState(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();

    const fetchAdminData = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao buscar dados");

        setAdminData(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setError("Erro ao carregar dados do administrador.");
        }
      }
    };

    fetchAdminData();

    return () => controller.abort();
  }, [token]);

  const handleUpdate = async ({ nome, email, senha }) => {
    if (!adminData?.id_admin) {
      setError("Dados do administrador inválidos.");
      return;
    }

    setLoading(true);
    setError("");
    setNotification(null);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/${adminData.id_admin}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": import.meta.env.VITE_TOKEN_KEY,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ nome, email, senha }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao atualizar.");
        setLoading(false);
        return;
      }

      setNotification({
        message: "Admin atualizado com sucesso.",
        type: "success",
      });

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError("Erro na atualização.");
    } finally {
      setLoading(false);
    }
  };

  if (!adminData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex pt-10 justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md relative">
        <h2 className="text-xl font-semibo  ld mb-4 text-center">Editar Admin</h2>
        <p className="text-red-600 mb-2 text-sm text-center">
          É necessário confirmar sua senha para continuar, mesmo que não deseje
          alterá-la.
        </p>

        {error && <p className="text-red-600 mb-2 text-sm">{error}</p>}

        <ResetForm
          onSubmit={handleUpdate}
          loading={loading}
          initialValues={{
            nome: adminData.nome,
            email: adminData.email,
          }}
        />

        <Notification
          message={notification?.message}
          type={notification?.type}
          onClose={() => setNotification(null)}
        />
      </div>
    </div>
  );
}
