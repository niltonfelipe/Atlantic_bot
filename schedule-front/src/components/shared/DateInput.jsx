import React from 'react';
import PropTypes from 'prop-types';
import { FiCalendar } from 'react-icons/fi';

const DateInput = ({ label, value, onChange, error, required }) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700 md:flex items-center gap-2">
        <FiCalendar className="text-gray-500" />
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="date"
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2 border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 focus:outline-none transition-all`}
        required={required}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

DateInput.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  required: PropTypes.bool,
};

export default DateInput;