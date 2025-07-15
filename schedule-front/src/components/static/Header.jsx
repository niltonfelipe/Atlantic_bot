import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiLogOut, FiEdit } from "react-icons/fi";
import { Modal } from "antd";
import Logo from "../../assets/logo.png";
import User from "../../assets/user.png";
import { useAuth } from "../../context/AuthContext";

const Header = ({ onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const menuRef = useRef(null);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!token) return;

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Erro ao carregar usuário");
        const data = await response.json();
        setUserInfo(data);
      } catch (err) {
        console.error("Erro ao buscar dados do usuário:", err);
      }
    };

    fetchUserInfo();
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUpdateUser = () => navigate("/admin/update");
  const handleUser = () => navigate("/admin/profile");

  // Quando o usuário confirma no modal
  const confirmLogout = () => {
    setModalVisible(false);
    if (onLogout) onLogout();
  };

  return (
    <>
      <header className="w-full top-0 z-50 flex justify-between items-center p-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
            <img
              src={Logo}
              alt="Logo"
              className="w-11 h-full ml-4 object-contain hover:opacity-80 transition-opacity"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <img
                src={User}
                alt="User Profile"
                className="w-9 h-9 rounded-full object-cover border-2 border-white hover:bg-gray-200 transition-all"
              />
              <span className="hidden md:inline text-sm font-medium text-gray-700">
                {(userInfo?.nome?.split(" ").slice(0, 2).join(" ")) || "Nome não definido"}
              </span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {userInfo?.nome || "Nome não definido"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {userInfo?.email || "Email não disponível"}
                  </p>
                </div>

                <button
                  onClick={handleUser}
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FiUser className="mr-3 h-4 w-4 text-gray-400" />
                  Meu Perfil
                </button>

                <button
                  onClick={handleUpdateUser}
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FiEdit className="mr-3 h-4 w-4 text-gray-400" />
                  Editar Perfil
                </button>

                <button
                  onClick={() => setModalVisible(true)} // abre modal ao clicar
                  className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-100 transition-colors border-t border-gray-100"
                >
                  <FiLogOut className="mr-3 h-4 w-4" />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal de confirmação */}
      <Modal
        title="Confirmar Logout"
        visible={modalVisible}
        onOk={confirmLogout}
        onCancel={() => setModalVisible(false)}
        okText="Sim, sair"
        cancelText="Cancelar"
        centered
      >
        <p>Tem certeza que deseja sair da sua conta?</p>
      </Modal>
    </>
  );
};

export default Header;
