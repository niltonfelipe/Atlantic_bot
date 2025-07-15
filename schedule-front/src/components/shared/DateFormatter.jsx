import React from 'react';
import PropTypes from 'prop-types';

const DateFormatter = ({ dateStr }) => {
  if (!dateStr) return "-";

  const formatDate = () => {
    try {
      const onlyDate = dateStr.split('T')[0];
      const [year, month, day] = onlyDate.split('-');
      const date = new Date(Number(year), Number(month) - 1, Number(day));

      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "-";
    }
  };

  return <span>{formatDate()}</span>;
};

DateFormatter.propTypes = {
  dateStr: PropTypes.string,
};

export default DateFormatter;
