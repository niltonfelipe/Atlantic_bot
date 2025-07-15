import React from "react";
import PropTypes from "prop-types";

const ClientTable = ({
  clients = [],
  isMobile = false,
  selectedRows = [],
  onRowSelect = () => {},
  onSelectAllRows = () => {},
}) => {
  const getSafeAddress = (client) => ({
    nome_rua: client?.endereco?.nome_rua || "",
    bairro: client?.endereco?.bairro || "",
    numero: client?.endereco?.numero || "",
  });

  const areAllClientsOnPageSelected =
    clients &&
    clients.length > 0 &&
    clients.every((client) => selectedRows.includes(client.id_cliente));

  const colorMap = {
    azul: "bg-blue-500",
    verde: "bg-green-500",
    vermelho: "bg-red-500",
    amarelo: "bg-yellow-500",
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-md">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left w-10">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-green-700 border-gray-300 rounded focus:ring-green-700 focus:ring-offset-0"
                onChange={onSelectAllRows}
                checked={areAllClientsOnPageSelected}
                disabled={!clients || clients.length === 0}
              />
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
              ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nome
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo do Cliente
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Telefone
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Zona
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Endereço
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              QR Code
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {!clients || clients.length === 0 ? (
            <tr>
              <td colSpan="7" className="px-4 py-4 text-center text-gray-500">
                Nenhum cliente encontrado.
              </td>
            </tr>
          ) : (
            clients.map((client) => {
              const address = getSafeAddress(client);
              const isSelected = selectedRows.includes(client.id_cliente);

              const zoneName = client.endereco?.zona?.nome_da_zona || "N/A";
              const zoneColorString =
                client.endereco?.zona?.cor?.toLowerCase() || "default";
              const zoneColorClass = colorMap[zoneColorString] || "bg-gray-500"; // Cor padrão

              return (
                <tr
                  key={client.id_cliente}
                  className={`hover:bg-gray-50 ${
                    isSelected ? "bg-green-50 border-l-2 border-green-600" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-green-700 border-gray-300 rounded focus:ring-green-700 focus:ring-offset-0"
                      checked={isSelected}
                      onChange={() => onRowSelect(client.id_cliente)}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    {client.id_cliente || "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm whitespace-nowrap text-gray-600">
                      {client.nome_cliente || "N/A"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm whitespace-nowrap text-gray-600">
                      {client.tipo || "N/A"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                    {client.telefone_cliente || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 text-xs inline-flex text-center font-semibold rounded-md md:rounded-md text-white ${zoneColorClass}`}
                    >
                      {zoneName}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <span className="font-light text-nowrap">
                      {address.nome_rua}
                    </span>
                    <span className="font-light text-wrap">
                      {address.numero ? `, ${address.numero}` : ""}
                    </span>
                    <span className="font-semibold text-nowrap">
                      {address.bairro ? ` - ${address.bairro}` : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                    {client.qr_code || "N/A"}
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

ClientTable.propTypes = {
  clients: PropTypes.array,
  isMobile: PropTypes.bool,
  selectedRows: PropTypes.array,
  onRowSelect: PropTypes.func,
  onSelectAllRows: PropTypes.func,
};

export default ClientTable;
