import React from 'react';
import PropTypes from 'prop-types';

const SelectInput = ({ 
  label, 
  value, 
  onChange, 
  options, 
  error, 
  required, 
  icon: Icon 
}) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700 md:flex items-center gap-2">
        {Icon && <Icon className="text-gray-500" />}
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2 border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 focus:outline-none transition-all`}
        required={required}
      >
        <option value="">Selecione...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

SelectInput.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  error: PropTypes.string,
  required: PropTypes.bool,
  icon: PropTypes.elementType,
};

export default SelectInput;