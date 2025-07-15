import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ResetForm from "../components/resetFormAdmin/ResetForm";

export default function ResetFirstAdmin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { redefinir, setRedefinir } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const id_admin = localStorage.getItem("id_admin");
    if (!redefinir || !id_admin) {
      navigate("/login");
    }
  }, [redefinir, navigate]);

  const handleRedefinir = async ({ nome, email, senha }) => {
    setLoading(true);
    setError("");

    try {
      const id_admin = localStorage.getItem("id_admin");
      if (!id_admin) {
        setError("ID do administrador não encontrado.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": import.meta.env.VITE_TOKEN_KEY },
        body: JSON.stringify({
          id_admin: Number(id_admin),
          nome,
          email,
          senha,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao redefinir.");
        setLoading(false);
        return;
      }

      localStorage.removeItem("id_admin");
      setRedefinir(false);
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError("Erro na redefinição.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Registro
        </h2>
        {error && <p className="text-red-600 mb-2 text-sm">{error}</p>}
        <ResetForm onSubmit={handleRedefinir} loading={loading} />
      </div>
    </div>
  );
}
