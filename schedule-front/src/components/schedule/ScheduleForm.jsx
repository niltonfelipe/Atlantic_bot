import React from 'react';
import { FiUser, FiMapPin, FiClock, FiEdit } from 'react-icons/fi';
import DateInput from '../shared/DateInput';
import SelectInput from '../shared/SelectInput';
import PropTypes from 'prop-types';

const ScheduleForm = ({
  clients = [],
  users = [],
  onSubmit,
  isLoading,
  errors = {},
  formData,
  onFormChange,
  onClienteChange,
  zonaCliente,
}) => {
  const turnos = [
    { value: "Manhã", label: "Manhã" },
    { value: "Tarde", label: "Tarde" },
    { value: "Noite", label: "Noite" },
  ];

  const clientOptions = clients.map((cliente) => ({
    value: cliente.id_cliente.toString(),
    label: cliente.nome_cliente,
  }));

  const userOptions = users.map((usuario) => ({
    value: usuario.id_usuario.toString(),
    label: usuario.nome,
  }));

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Cliente */}
      <SelectInput
        label="Cliente"
        name="id_cliente"
        value={formData.id_cliente}
        onChange={onClienteChange}
        options={clientOptions}
        error={errors.id_cliente}
        required
        icon={FiUser}
      />

      {zonaCliente && (
        <div className="mt-2 flex items-center text-sm text-gray-600">
          <FiMapPin className="mr-1" />
          <span>Zona: {zonaCliente}</span>
        </div>
      )}

      {/* Usuário */}
      <SelectInput
        label="Usuário Coletor"
        name="id_usuario"
        value={formData.id_usuario}
        onChange={(e) => onFormChange("id_usuario", e.target.value)}
        options={userOptions}
        error={errors.id_usuario}
        required
        icon={FiUser}
      />

      {/* Data e Turno */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DateInput
          label="Data"
          name="data"
          value={formData.data}
          onChange={(e) => onFormChange('data', e.target.value)}
          error={errors.data}
          required
        />

        <SelectInput
          label="Turno"
          name="turno"
          value={formData.turno}
          onChange={(e) => onFormChange('turno', e.target.value)}
          options={turnos}
          error={errors.turno}
          required
          icon={FiClock}
        />
      </div>

      {/* Observações */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700 md:flex items-center gap-2">
          <FiEdit className="text-gray-500" />
          Observações
        </label>
        <textarea
          name="observacoes"
          value={formData.observacoes}
          onChange={(e) => onFormChange('observacoes', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 focus:outline-none transition-all"
          rows={3}
          placeholder="Informações adicionais (opcional)"
        />
      </div>

      {/* Botão Submit */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 focus:ring-2 focus:ring-green-800 focus:ring-offset-2 focus:outline-none transition disabled:opacity-50"
        >
          {isLoading ? 'Agendando...' : 'Agendar Coleta'}
        </button>
      </div>
    </form>
  );
};

ScheduleForm.propTypes = {
  clients: PropTypes.array.isRequired,
  users: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  errors: PropTypes.object,
  formData: PropTypes.object.isRequired,
  onFormChange: PropTypes.func.isRequired,
  onClienteChange: PropTypes.func.isRequired,
  zonaCliente: PropTypes.string,
};

export default ScheduleForm;
