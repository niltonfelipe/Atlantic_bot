import React, { useState, useEffect } from "react";
import { Card, Table, Typography, Tag, Button, Input, Spin } from "antd";
import { Bar } from "react-chartjs-2";
import moment from "moment";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);
const { Text } = Typography;

export const getZonaColor = (cor) => {
  const colors = {
    azul: "#3B82F6",
    verde: "#10B981", 
    laranja: "#F59E0B", 
    vermelho: "#EF4444", 
    cinza: "#6B7280", 
    roxo: "#8B5CF6",
    amarelo: "#FBBF24", 
  };
  return colors[cor?.toLowerCase()] || "#9CA3AF";
};

// Renomeei aqui para evitar conflito
export const colunasCanceladas = [
  {
    title: "ID",
    dataIndex: "id",
    width: 80,
    sorter: (a, b) => a.id - b.id,
  },
  {
    title: "Data",
    dataIndex: "data_agendada",
    render: (d) => moment(d).format("DD/MM/YYYY"),
    sorter: (a, b) =>
      moment(a.data_agendada).unix() - moment(b.data_agendada).unix(),
  },
  {
    title: "Cliente",
    dataIndex: "cliente",
    sorter: (a, b) => a.cliente.localeCompare(b.cliente),
  },
  {
    title: "Zona",
    dataIndex: ["zona", "nome_da_zona"],
    sorter: (a, b) => a.zona.nome_da_zona.localeCompare(b.zona.nome_da_zona),
    render: (_, record) => (
      <Tag color={getZonaColor(record.zona?.cor)}>
        {record.zona?.nome_da_zona || "Não atribuída"}
      </Tag>
    ),
  },
];

const CanceledCollects = ({ tabelaRef, graficoRef}) => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchAgendamentosCancelados = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/relatorios/agendamentos-cancelados?nomeCliente=${searchText}`
        );
        const data = await response.json();
        setAgendamentos(data);
      } catch (error) {
        console.error("Erro ao buscar agendamentos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgendamentosCancelados();
  }, [searchText]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, 
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: {
          family: "'Inter', sans-serif",
          size: 14,
          weight: "600",
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 12,
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        mode: "index",
        intersect: false,
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.raw}`;
          },
          title: function (context) {
            return `Data: ${context[0].label}`;
          },
        },
      },
      datalabels: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
          drawBorder: false,
          drawTicks: false,
        },
        ticks: {
          color: "#6B7280",
          font: {
            family: "'Inter', sans-serif",
            size: 11,
          },
          stepSize: 1,
          padding: 8,
        },
        title: {
          display: true,
          text: "Quantidade de Coletas",
          color: "#374151",
          font: {
            family: "'Inter', sans-serif",
            size: 12,
            weight: "600",
          },
          padding: { top: 10, bottom: 10 },
        },
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: "#6B7280",
          font: {
            family: "'Inter', sans-serif",
            size: 11,
          },
          padding: 8,
        },
        title: {
          display: true,
          text: "Data do Agendamento",
          color: "#374151",
          font: {
            family: "'Inter', sans-serif",
            size: 12,
            weight: "600",
          },
          padding: { top: 10, bottom: 10 },
        },
      },
    },
    animation: {
      duration: 800,
      easing: "easeOutQuart",
      delay: (context) => {
        if (context.type === "data" && context.mode === "default") {
          return context.dataIndex * 100;
        }
        return 0;
      },
    },
    elements: {
      bar: {
        borderRadius: 6,
        borderSkipped: false,
        backgroundColor: (context) => {
          const cor = agendamentos[context.dataIndex]?.zona?.cor;
          return getZonaColor(cor);
        },
        hoverBackgroundColor: (context) => {
          const cor = agendamentos[context.dataIndex]?.zona?.cor;
          return `${getZonaColor(cor)}CC`;
        },
        borderWidth: 0,
        hoverBorderWidth: 2,
        hoverBorderColor: (context) => {
          const cor = agendamentos[context.dataIndex]?.zona?.cor;
          return getZonaColor(cor);
        },
      },
    },
  };

  const contagemPorData = agendamentos.reduce((acc, agendamento) => {
    const dataFormatada = moment(agendamento.data_agendada).format("DD/MM/YYYY");
    acc[dataFormatada] = (acc[dataFormatada] || 0) + 1;
    return acc;
  }, {});

  const dadosGrafico = {
    labels: Object.keys(contagemPorData),
    datasets: [
      {
        label: "Coletas Canceladas",
        data: Object.values(contagemPorData),
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
        hoverBackgroundColor: 'rgba(239, 68, 68, 0.5)',
        hoverBorderColor: 'rgba(239, 68, 68, 0.7)',
        hoverBorderWidth: 2,
      },
    ],
  };

  return (
    <>
      <Card
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Detalhes das Coletas Canceladas</span>
            <div>
              <Input.Search
                placeholder="Buscar por cliente"
                allowClear
                onSearch={(value) => setSearchText(value)}
                style={{ width: 200, marginRight: 16 }}
              />
         
            </div>
          </div>
        }
        style={{ marginBottom: 20 }}
      >
        <div ref={tabelaRef}>
          <Spin spinning={loading}>
            <Table
              columns={colunasCanceladas}
              dataSource={agendamentos}
              rowKey="id"
              pagination={{
                pageSize: 5,
                showSizeChanger: true,
                pageSizeOptions: ["5", "10", "20", "50"],
                showTotal: (total) => `Total de ${total} itens`,
              }}
              loading={loading}
              locale={{ emptyText: "Nenhum registro encontrado" }}
            />
          </Spin>
        </div>
      </Card>

      <Card
        title="Coletas Canceladas por Dia"
        style={{
          marginBottom: 20,
          minHeight: 300,
          backgroundColor: "#FFFFFF",
        }}
        headStyle={{
          borderBottom: "1px solid #F3F4F6",
          padding: "16px 24px",
          color: "#111827",
        }}
        bodyStyle={{
          padding: "24px",
          backgroundColor: "#FFFFFF",
        }}
      >
        <div ref={graficoRef} style={{ height: 250 }}>
          {agendamentos.length > 0 ? (
            <Bar data={dadosGrafico} options={options} />
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <Text type="secondary">
                {loading ? <Spin size="small" /> : "Nenhum dado disponível"}
              </Text>
            </div>
          )}
        </div>
      </Card>
    </>
  );
};

export default CanceledCollects;
