import React from "react";
import PropTypes from "prop-types";
import { FiCalendar, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

const StatusBadge = ({ agendamento }) => {
  const getStatus = () => {
    const status = (agendamento.status || "").toUpperCase();

    switch (status) {
      case "PENDENTE":
        return {
          text: "Pendente",
          icon: <FiAlertCircle className="text-yellow-500" />,
          className: "bg-yellow-100 text-yellow-800",
        };
      case "REALIZADO":
        return {
          text: "Realizado",
          icon: <FiCheckCircle className="text-green-500" />,
          className: "bg-green-100 text-green-800",
        };
      case "CANCELADO":
        return {
          text: "Cancelado",
          icon: <FiCalendar className="text-red-500" />,
          className: "bg-red-100 text-red-800",
        };
      default:
        return {
          text: "Desconhecido",
          icon: <FiCalendar className="text-gray-500" />,
          className: "bg-gray-100 text-gray-800",
        };
    }
  };

  const status = getStatus();
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${status.className}`}>
      {status.icon}
      {status.text}
    </span>
  );
};

StatusBadge.propTypes = {
  agendamento: PropTypes.object.isRequired,
};

export default StatusBadge;
