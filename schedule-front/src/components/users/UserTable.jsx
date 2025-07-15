import React from 'react';
import PropTypes from 'prop-types';

const UserTable = ({
  users = [],
  selectedRows = [],
  onRowSelect = () => {},
  onSelectAllRows = () => {},
  isLoading = false,
  currentAdminId = null,
}) => {
  const areAllUsersSelected =
    users.length > 0 &&
    users
      .filter(user => user.id_usuario !== currentAdminId)
      .every(user => selectedRows.includes(user.id_usuario));

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left w-10">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-green-700 border-gray-300 rounded focus:ring-green-800"
                onChange={onSelectAllRows}
                checked={areAllUsersSelected}
                disabled={users.length === 0}
              />
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
              ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              NOME
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              EMAIL
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              TIPO USUÁRIO
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.length === 0 ? (
            <tr>
              <td colSpan="5" className="px-4 py-4 text-center text-gray-500">
                {isLoading ? "Carregando..." : "Nenhum usuário encontrado"}
              </td>
            </tr>
          ) : (
            users.map((user) => {
              const isCurrentAdmin = user.id_usuario === currentAdminId;


              return (
                <tr
                  key={user.id_usuario}
                  className={`hover:bg-gray-50 ${
                    selectedRows.includes(user.id_usuario) ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-green-700 border-gray-300 rounded focus:ring-green-800"
                      checked={selectedRows.includes(user.id_usuario)}
                      onChange={() => onRowSelect(user.id_usuario)}
                      disabled={isCurrentAdmin}
                      title={isCurrentAdmin ? "Você não pode excluir a si mesmo" : ""}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {user.id_usuario}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {user.nome}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 font-bold">
                    {user.tipo_usuario}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

UserTable.propTypes = {
  users: PropTypes.array,
  selectedRows: PropTypes.array,
  onRowSelect: PropTypes.func,
  onSelectAllRows: PropTypes.func,
  isLoading: PropTypes.bool,
  currentAdminId: PropTypes.number,
};

export default UserTable;
