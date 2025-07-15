import { IMaskInput } from "react-imask";
import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";
const ClientModal = ({
  show,
  onClose,
  newClient,
  onClientChange,
  zones,
  onSubmit,
  isLoading,
  editingClient,
}) => {
  const formatarTelefone = (telefone) => {
  return telefone.startsWith("+") ? telefone.slice(1) : telefone;
};

  return (
    show && (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">
            {editingClient ? "Editar Cliente" : "Adicionar Novo Cliente"}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 focus:border-green-800 outline-none"
                value={newClient.nome_cliente}
                onChange={(e) => onClientChange("nome_cliente", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo do Cliente <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 focus:border-green-800 outline-none"
                value={newClient.tipo || ""}
                onChange={(e) => onClientChange("tipo", e.target.value)}
              >
                <option value="">Selecione o tipo do cliente</option>
                <option value="GRANDE_GERADOR">Grande Gerador</option>
                <option value="PEQUENO_GERADOR">Pequeno Gerador</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone <span className="text-red-500">*</span>
              </label>
              <PhoneInput
                country={"br"}
                enableSearch={true}
                value={newClient.telefone_cliente}
                onChange={(value) =>
  onClientChange("telefone_cliente", formatarTelefone(value))
}

                inputClass="!w-full !border !border-gray-300 rounded-md px-3 py-2 !text-sm focus:!ring-2 focus:!ring-green-700 focus:border-green-800 !outline-none"
                buttonClass="!border-green-6  00"
                dropdownClass="!text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zona <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 focus:border-green-800 outline-none"
                value={
                  newClient.id_zona !== null ? newClient.id_zona.toString() : ""
                }
                onChange={(e) =>
                  onClientChange(
                    "id_zona",
                    e.target.value !== "" ? parseInt(e.target.value, 10) : null
                  )
                }
              >
                <option value="">Selecione uma zona</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id.toString()}>
                    {zone.nome_da_zona}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rua <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 focus:border-green-800 outline-none"
                value={newClient.endereco.nome_rua}
                onChange={(e) =>
                  onClientChange("endereco", {
                    ...newClient.endereco,
                    nome_rua: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bairro <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 focus:border-green-800 outline-none"
                value={newClient.endereco.bairro}
                onChange={(e) =>
                  onClientChange("endereco", {
                    ...newClient.endereco,
                    bairro: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 focus:border-green-800 outline-none"
                value={newClient.endereco.numero}
                onChange={(e) =>
                  onClientChange("endereco", {
                    ...newClient.endereco,
                    numero: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                QR Code  <span className="text-red-500">*</span>
                <span className="block text-gray-600 font-normal text-xs mt-1">
                  (Opcional) - Se deixado vazio, geraremos um QR Code aleatório
                  automaticamente.
                </span>
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 focus:border-green-800 outline-none"
                value={newClient.qr_code || ""}
                onChange={(e) => onClientChange("qr_code", e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-800 transition-colors disabled:bg-green-200 disabled:cursor-not-allowed"
              onClick={onSubmit}
              disabled={
                isLoading ||
                !newClient.nome_cliente.trim() ||
                !newClient.telefone_cliente.trim() ||
                !newClient.id_zona ||
                !newClient.endereco.nome_rua.trim() ||
                !newClient.endereco.bairro.trim() ||
                !newClient.endereco.numero.trim()
              }
            >
              {isLoading
                ? editingClient
                  ? "Salvando..."
                  : "Adicionando..."
                : editingClient
                ? "Salvar"
                : "Adicionar"}
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default ClientModal;
