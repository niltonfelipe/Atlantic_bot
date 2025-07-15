import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiTrash2 } from 'react-icons/fi';
import StatusBadge from '../shared/StatusBadge';
import DateFormatter from '../shared/DateFormatter';

const ITEMS_PER_PAGE = 5;

const ScheduleTable = ({ agendamentos, onDelete, onMarkAsDone }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(agendamentos.length / ITEMS_PER_PAGE);
  const paginatedAgendamentos = agendamentos.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zona</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Agendada</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turno</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsável</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observações</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedAgendamentos.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  Nenhum agendamento encontrado
                </td>
              </tr>
            ) : (
              paginatedAgendamentos.map((agendamento) => {
                const status = (agendamento.status || '').trim().toUpperCase();
                const podeCancelar = status !== 'CANCELADO' && status !== 'REALIZADO';

                return (
                  <tr key={agendamento.id_agendamento} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge agendamento={agendamento} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {agendamento.nome_cliente || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {agendamento.zona || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <DateFormatter dateStr={agendamento.data_agendada} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {agendamento.turno || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {agendamento.responsavel || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {agendamento.observacoes || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {podeCancelar ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onDelete(agendamento.telefone_cliente)}
                            className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                            title="Cancelar agendamento"
                          >
                            <FiTrash2 />
                          </button>
                          <button
                            onClick={() => onMarkAsDone(agendamento)}
                            className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-50 transition-colors"
                            title="Marcar como realizado"
                          >
                            ✓
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 cursor-not-allowed" title="Ação não disponível">
                          <FiTrash2 />
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 py-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span className="text-sm text-gray-700">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
            disabled={currentPage === totalPages}
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
};

ScheduleTable.propTypes = {
  agendamentos: PropTypes.array.isRequired,
  onDelete: PropTypes.func.isRequired,
  onMarkAsDone: PropTypes.func.isRequired,
};

export default ScheduleTable;
