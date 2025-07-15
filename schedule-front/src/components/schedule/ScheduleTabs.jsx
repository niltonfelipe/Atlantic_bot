import React from 'react';
import PropTypes from 'prop-types';

const ScheduleTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'pendentes', label: 'Pendentes' },
    { id: 'cancelados', label: 'Cancelados' },
    { id: 'realizados', label: 'Realizados' },
    { id: 'todos', label: 'Todos' }
  ];

  return (
    <div className="flex border-b border-gray-200 mb-6">
      {tabs.map(tab => (
        <button
          key={tab.id}
          type='button'
          className={`py-2 px-4 font-medium transition-colors duration-200 ${
            activeTab === tab.id
              ? "text-green-700 border-b-2 border-green-700"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

ScheduleTabs.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
};

export default ScheduleTabs;
