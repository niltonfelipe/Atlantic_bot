import Select from "react-select";

const ZoneModal = ({
  show,
  onClose,
  newZone,
  onZoneChange,
  onDayChange,
  onColorChange,
  onSubmit,
  isLoading,
  dayOptions,
  colorOptions,
}) => {
  return (
    show && (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">
            Adicionar Nova Zona
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Zona <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 focus:border-green-800"
                value={newZone.nome_da_zona}
                onChange={(e) => onZoneChange("nome_da_zona", e.target.value)}
                placeholder="Digite o nome da zona"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade de coletas esperadas
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 focus:border-green-800"
                value={newZone.qtd_coletas_esperadas}
                onChange={(e) =>
                  onZoneChange(
                    "qtd_coletas_esperadas",
                    parseInt(e.target.value) || 0
                  )
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dias da Coleta<span className="text-red-500">*</span>
              </label>
              <Select
                className="w-full text-sm"
                placeholder="Selecione os dias"
                isMulti
                options={dayOptions}
                value={newZone.dias}
                onChange={onDayChange}
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: "#cbd5e1",
                    minHeight: 40,
                    borderRadius: 6,
                    fontSize: "0.875rem",
                  }),
                  menu: (base) => ({ ...base, zIndex: 9999 }),
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
                menuPortalTarget={document.body}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cor da Zona <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-800 focus:border-green-700"
                value={newZone.cor}
                onChange={onColorChange}
              >
                {colorOptions.map((color) => (
                  <option key={color.value} value={color.value}>
                    {color.label}
                  </option>
                ))}
              </select>
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
              className="px-4 py-2 text-sm bg-green-700 text-white rounded-md hover:bg-green-800 transition-colors disabled:bg-green-700 disabled:cursor-not-allowed"
              onClick={onSubmit}
              disabled={
                isLoading ||
                !newZone.nome_da_zona.trim() ||
                newZone.dias.length === 0
              }
            >
              {isLoading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default ZoneModal;