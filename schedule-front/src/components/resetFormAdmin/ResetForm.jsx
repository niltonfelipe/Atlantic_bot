import { LucideEye, LucideEyeClosed } from "lucide-react";
import { useState } from "react";

function ResetForm({ onSubmit, loading, initialValues = {} }) {
  const [nome, setNome] = useState(initialValues.nome || "");
  const [email, setEmail] = useState(initialValues.email || "");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [error, setError] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nome || !email || !senha || !confirmarSenha) {
      setError("Preencha todos os campos.");
      return;
    }

    if (senha !== confirmarSenha) {
      setError("As senhas não coincidem.");
      return;
    }

    setError("");
    onSubmit({ nome, email, senha });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome
        </label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-800 focus:border-green-700 pr-10"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-800 focus:border-green-700 pr-10"
          required
        />
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nova senha
        </label>
        <input
          type={mostrarSenha ? "text" : "password"}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-800 focus:border-green-700 pr-10"
          required
        />
        <button
          type="button"
          onClick={() => setMostrarSenha(!mostrarSenha)}
          className="absolute inset-y-0 right-0 px-3  top-6 flex items-center text-gray-600"
          tabIndex={-1}
        >
          {mostrarSenha ? <LucideEyeClosed /> : <LucideEye />}
        </button>
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirmar senha
        </label>
        <input
          type={mostrarConfirmarSenha ? "text" : "password"}
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
          className="w-full px-4 py-2 border rounded pr-10"
          required
        />
        <button
          type="button"
          onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
          className="absolute inset-y-0 right-0 top-6 px-3 flex items-center text-gray-600"
          tabIndex={-1}
        >
          {mostrarConfirmarSenha ? <LucideEyeClosed /> : <LucideEye />}
        </button>
      </div>

      {error && <div className="text-red-600">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-green-700 text-white rounded hover:bg-green-800"
      >
        {loading ? "Redefinindo..." : "Redefinir"}
      </button>
    </form>
  );
}

export default ResetForm;
