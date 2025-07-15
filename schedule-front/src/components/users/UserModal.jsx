import React, { useState } from "react";
import PropTypes from "prop-types";

const UserModal = ({
  show,
  onClose,
  user,
  onUserChange,
  onSave,
  isLoading,
  isEditing,
  confirmPassword,
  onConfirmPasswordChange,
  value,
  nameOption,
}) => {
  const [errors, setErrors] = useState({});

  if (!show) return null;

  const validate = () => {
    const newErrors = {};

    if (!user.nome || user.nome.trim().length < 2) {
      newErrors.nome = "Nome deve ter pelo menos 2 caracteres.";
    }

    if (!user.email || !/\S+@\S+\.\S+/.test(user.email)) {
      newErrors.email = "Email inválido.";
    }

    if (!isEditing && (!user.senha || user.senha.length < 6)) {
      newErrors.senha = "Senha deve ter pelo menos 6 caracteres.";
    }

    if (!isEditing && user.senha !== confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem.";
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? "Editar Usuário" : "Adicionar Usuário"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
    
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full border ${
                  errors.nome ? "border-red-500" : "border-gray-300"
                } rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-700`}
                value={user.nome}
                onChange={(e) => onUserChange("nome", e.target.value)}
              />
              {errors.nome && (
                <p className="text-red-500 text-xs mt-1">{errors.nome}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className={`w-full border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-700`}
                value={user.email}
                onChange={(e) => onUserChange("email", e.target.value)}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha {!isEditing && <span className="text-red-500">*</span>}
              </label>
              <input
                type="password"
                className={`w-full border ${
                  errors.senha ? "border-red-500" : "border-gray-300"
                } rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-700`}
                value={user.senha}
                onChange={(e) => onUserChange("senha", e.target.value)}
                placeholder={isEditing ? "Deixe em branco para manter" : ""}
              />
              {errors.senha && (
                <p className="text-red-500 text-xs mt-1">{errors.senha}</p>
              )}
            </div>

          
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Senha{" "}
                {!isEditing && <span className="text-red-500">*</span>}
              </label>
              <input
                type="password"
                className={`w-full border ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                } rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-700`}
                value={confirmPassword}
                onChange={onConfirmPasswordChange}
                placeholder={isEditing ? "Deixe em branco para manter" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Usuário <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 focus:border-green-800"
                value={user.tipo_usuario || ""}
                onChange={(e) => onUserChange("tipo_usuario", e.target.value)}
              >
            
                <option value={value}>{nameOption}</option>
       
              </select>
              {errors.tipo_usuario && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.tipo_usuario}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={onClose}
              disabled={isLoading }
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-green-700 text-white rounded-md hover:bg-green-800 transition-colors disabled:bg-green-200 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading
                ? isEditing
                  ? "Salvando..."
                  : "Adicionando..."
                : isEditing
                ? "Salvar"
                : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

UserModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  onUserChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  isEditing: PropTypes.bool,
  confirmPassword: PropTypes.string,
  onConfirmPasswordChange: PropTypes.func,
};

export default UserModal;
