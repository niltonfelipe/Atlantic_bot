// src/components/Sidebar.jsx
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import {
  FaUsers,
  FaUserTie,
  FaCalendarAlt,
  FaHome,
  FaMapMarker,
  FaList,
} from "react-icons/fa";
import { RiAdminFill } from "react-icons/ri";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      if (window.innerWidth >= 640) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const linkClasses = ({ isActive }) =>
    `flex items-center space-x-3 px-4 py-3 text-sm rounded-lg font-medium transition-all duration-200 ease-in-out 
    ${
      isActive
        ? "bg-gradient-to-r from-green-700 to-green-600 text-white shadow-lg hover:from-green-800 hover:to-green-700"
        : "text-slate-700 hover:bg-slate-200 hover:text-slate-900"
    }`;

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        onClick={toggleSidebar}
        className={`absolute z-50 md:z-0 bg-white-700 invert sm:hidden h-10 top-5 left-4 p-2 rounded-lg  text-white transition-all duration-300 ease-in-out ${
          isOpen ? "transform rotate-90" : ""
        }`}
      >
        {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      <aside
        className={`flex-shrink-0 w-64 h-full
                   bg-white border-r border-slate-200 
                   p-4 space-y-3
                   transition-all duration-300 ease-in-out 
                   ${isMobile ? (isOpen ? "block" : "hidden") : "block"}
                   flex flex-col`}
      >
        <nav className="flex-1 flex flex-col space-y-2 overflow-y-auto">
          <NavLink to="/" end className={linkClasses}>
            <FaHome className="h-4 w-4" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/users" className={linkClasses}>
            <FaUsers className="h-4 w-4" />
            <span>Coletores</span>
          </NavLink>
          <NavLink to="/admins" className={linkClasses}>
            <RiAdminFill className="h-4 w-4" />
            <span>Administradores</span>
          </NavLink>
          <NavLink to="/clients" className={linkClasses}>
            <FaUserTie className="h-4 w-4" />
            <span>Clientes</span>
          </NavLink>
          <NavLink to="/scheduleforms" className={linkClasses}>
            <FaCalendarAlt className="h-4 w-4" />
            <span>Agendamentos</span>
          </NavLink>
          <NavLink to="/schedule" className={linkClasses}>
            <FaList className="h-4 w-4" />
            <span>Lista de Agendamentos</span>
          </NavLink>
          <NavLink to="/zones" className={linkClasses}>
            <FaMapMarker className="h-4 w-4" />
            <span>Zonas</span>
          </NavLink>

          <div className="border-t border-slate-200 my-2"></div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
