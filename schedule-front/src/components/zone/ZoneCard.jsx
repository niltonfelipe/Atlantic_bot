import React from "react";
import { FaTrash } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";

const corZonaClass = (cor) => {
  const colorMap = {
    azul: "bg-blue-100 text-blue-800 border-blue-200",
    verde: "bg-green-100 text-green-800 border-green-200",
    vermelho: "bg-red-100 text-red-800 border-red-200",
    amarelo: "bg-yellow-100 text-yellow-800 border-yellow-200",
    default: "bg-gray-100 text-gray-800 border-gray-200"
  };
  return colorMap[cor?.toLowerCase()] || colorMap.default;
};

const diaSemanaStyle = "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border";

const ZonaCard = ({ zona, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 truncate">
              {zona.nome_da_zona}
            </h2>
          </div>
          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${corZonaClass(zona.cor)}`}>
            {zona.cor}
          </span>
        </div>
        
        <div className="flex items-center mb-4">
          <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          <span className="text-gray-600">
            {zona.qtd_coletas_esperadas} coletas esperadas
          </span>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">DIAS DE COLETA</h3>
          <div className="flex flex-wrap gap-2">
            {zona.dias.map((dias) => (
              <span
                key={dias}
                className={`${diaSemanaStyle} ${corZonaClass(zona.cor)}`}
              >
                {dias.toUpperCase()}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <button 
            onClick={() => onEdit(zona)}
            className="px-3 py-1 text-sm bg-green-700 text-white rounded hover:bg-green-800 transition-colors"
          >
            <FaPencil/>
          </button>
          <button 
            onClick={() => onDelete(endereco.zona.id)}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
           <FaTrash/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ZonaCard;