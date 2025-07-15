import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const MarkAsDoneModal = ({
  isOpen,
  onClose,
  onConfirm,
  clienteNome,
  responsavelNome,
  dataAgendada,
}) => {
  const [diaRealizado, setDiaRealizado] = useState("");
  const [horaRealizado, setHoraRealizado] = useState("");

  useEffect(() => {
    if (isOpen) {
      setDiaRealizado("");
      setHoraRealizado("");
    }
  }, [isOpen]);

 const handleConfirm = () => {
  if (!diaRealizado) {
    alert("Selecione a data da realização.");
    return;
  }

  if (new Date(diaRealizado) < new Date(dataAgendada)) {
    alert("A coleta só pode ser realizada a partir da data agendada.");
    return;
  }

  onConfirm(diaRealizado, horaRealizado);
};


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Marcar como Realizado
        </h2>
        <p className="text-base text-gray-600 mb-1">
          Cliente:{" "}
          <span className="font-medium text-gray-800">{clienteNome}</span>
        </p>

        <p className="text-base text-gray-600 mb-4">
          Responsável:{" "}
          <span className="font-medium text-gray-800">{responsavelNome}</span>
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data da realização
          </label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-700"
            value={diaRealizado}
            min={dataAgendada}
            onChange={(e) => setDiaRealizado(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hora da realização
          </label>
          <input
            type="time"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-700"
            value={horaRealizado}
            onChange={(e) => setHoraRealizado(e.target.value)}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:opacity-80 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

MarkAsDoneModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  clienteNome: PropTypes.string,
  responsavelNome: PropTypes.string,
  dataAgendada: PropTypes.string,
};

export default MarkAsDoneModal;
