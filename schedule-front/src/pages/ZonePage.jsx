import React, { useEffect, useState } from "react";
import SideBar from "../components/static/Sidebar";
import ZonaCard from "../components/zone/ZoneCard";
import ZoneModal from "../components/zone/ZoneModal";

export default function ZonePage() {
  const [zonas, setZonas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentZona, setCurrentZona] = useState(null);
  const [newZone, setNewZone] = useState({
    nome_da_zona: "",
    qtd_coletas_esperadas: 0,
    dias: [],
    cor: ""
  });

  const dayOptions = [
    { value: "seg", label: "Segunda-feira" },
    { value: "ter", label: "Terça-feira" },
    { value: "qua", label: "Quarta-feira" },
    { value: "qui", label: "Quinta-feira" },
    { value: "sex", label: "Sexta-feira" },
    { value: "sab", label: "Sábado" },
    { value: "dom", label: "Domingo" }
  ];

  const colorOptions = [
    { value: "azul", label: "Azul" },
    { value: "verde", label: "Verde" },
    { value: "vermelho", label: "Vermelho" },
    { value: "amarelo", label: "Amarelo" }
  ];

  useEffect(() => {
    fetchZonas();
  }, []);

  const fetchZonas = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/zonas`);
      const data = await response.json();
      setZonas(data);
    } catch (err) {
      console.error("Erro ao carregar zonas:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja apagar esta zona?")) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/zonas/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            "x-api-key": import.meta.env.VITE_TOKEN_KEY,
          }
        });
        fetchZonas();
      } catch (err) {
        console.error("Erro ao apagar zona:", err);
      }
    }
  };

  const handleEdit = (zona) => {
    const diasFormatados = zona.dias.map(dia => ({
      value: dia,
      label: dayOptions.find(opt => opt.value === dia)?.label || dia
    }));

    setNewZone({
      nome_da_zona: zona.nome_da_zona,
      qtd_coletas_esperadas: zona.qtd_coletas_esperadas,
      dias: diasFormatados,
      cor: zona.cor
    });
    setCurrentZona(zona);
    setModalOpen(true);
  };

  const handleAddNew = () => {
    setNewZone({
      nome_da_zona: "",
      qtd_coletas_esperadas: 0,
      dias: [],
      cor: "Azul"
    });
    setCurrentZona(null);
    setModalOpen(true);
  };

  const handleZoneChange = (field, value) => {
    setNewZone(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDayChange = (selectedOptions) => {
    setNewZone(prev => ({
      ...prev,
      dias: selectedOptions
    }));
  };

  const handleColorChange = (e) => {
    setNewZone(prev => ({
      ...prev,
      cor: e.target.value
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      const zonaData = {
        ...newZone,
        dias: newZone.dias.map(dia => dia.value)
      };

      const url = currentZona
        ? `${import.meta.env.VITE_API_URL}/zonas/${currentZona.id}`
        : `${import.meta.env.VITE_API_URL}/zonas`;

      const method = currentZona ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          "x-api-key": import.meta.env.VITE_TOKEN_KEY,
        },
        body: JSON.stringify(zonaData)
      });

      if (!response.ok) throw new Error('Erro ao salvar zona');

      setModalOpen(false);
      fetchZonas();
    } catch (err) {
      console.error("Erro ao salvar zona:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="h-full w-64 bg-white border-r border-gray-200 hidden sm:block">
        <SideBar />
      </div>

      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-10">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Zonas de Coleta</h1>
                <p className="text-gray-600">Visualize e gerencie todas as zonas de coleta cadastradas</p>
              </div>
              <button
                onClick={handleAddNew}
                className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
              >
                Adicionar Zona
              </button>
            </div>
            <div className="w-20 h-1 bg-green-700 mt-4 rounded-full"></div>
          </header>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {zonas.map((zona) => (
                <ZonaCard
                  key={zona.id}
                  zona={zona}
                  onEdit={() => handleEdit(zona)}
                  onDelete={() => handleDelete(zona.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ZoneModal
        show={modalOpen}
        onClose={() => setModalOpen(false)}
        newZone={newZone}
        onZoneChange={handleZoneChange}
        onDayChange={handleDayChange}
        onColorChange={handleColorChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        dayOptions={dayOptions}
        colorOptions={colorOptions}
        editingZone={currentZona !== null}
      />
    </div>
  );
}
