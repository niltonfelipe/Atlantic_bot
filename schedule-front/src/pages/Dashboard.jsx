import Sidebar from "../components/static/Sidebar";
import React, { useState, useMemo, useRef } from "react";
import {
  Table,
  Typography,
  Tabs,
  Spin,
  message,
  Select,
  Form,
  Tag,
  Button,
  ConfigProvider,
} from "antd";
import html2canvas from "html2canvas";

import moment from "moment";
import { jsPDF } from "jspdf";
import "moment/locale/pt-br";

// Componentes ajustados
import TotalCollects from "../components/collects/TotalCollects";
import CanceledCollects, {
  colunasCanceladas,
} from "../components/collects/CanceledCollects";
import ExpectedCollects from "../components/collects/ExpectedCollects";
import CarriedOutCollects from "../components/collects/CarriedOutCollects";

moment.locale("pt-br");

const { Title } = Typography;
const { Option } = Select;

const dadosPrevistas = [
  {
    id: 1,
    data: "2023-06-01",
    usuario: "João Silva",
    zona: "Norte",
    status: "Agendada",
  },
  {
    id: 2,
    data: "2023-06-02",
    usuario: "Maria Souza",
    zona: "Sul",
    status: "Confirmada",
  },
  {
    id: 3,
    data: "2023-06-03",
    usuario: "Carlos Oliveira",
    zona: "Leste",
    status: "Pendente",
  },
  {
    id: 4,
    data: "2023-06-04",
    usuario: "Ana Costa",
    zona: "Oeste",
    status: "Agendada",
  },
];

const dadosCanceladas = [
  { id: 1, data: "2023-05-10", usuario: "João Silva", zona: "Norte" },
  { id: 2, data: "2023-05-12", usuario: "Maria Souza", zona: "Sul" },
  { id: 3, data: "2023-05-15", usuario: "Carlos Oliveira", zona: "Leste" },
  { id: 4, data: "2023-05-18", usuario: "João Silva", zona: "Oeste" },
  { id: 5, data: "2023-05-20", usuario: "Ana Costa", zona: "Norte" },
  { id: 6, data: "2023-05-22", usuario: "Maria Souza", zona: "Sul" },
  { id: 7, data: "2023-05-25", usuario: "Pedro Rocha", zona: "Leste" },
];

const Dashboard = () => {
  const [periodo, setPeriodo] = useState([]);
  const [usuariosSelecionados, setUsuariosSelecionados] = useState([]);
  const [zonasSelecionadas, setZonasSelecionadas] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState("canceladas");
  const [carregando, setCarregando] = useState(false);
  const [form] = Form.useForm();
  const tabelaRef = useRef(null);
  const graficoRef = useRef(null);

  const gerarPDF = async () => {
    setCarregando(true);
    message.loading({ content: "Gerando PDF...", key: "pdf", duration: 0 });

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const margin = 10;
      const pageWidth = pdf.internal.pageSize.getWidth() - margin * 2;
      let yPos = 20;

      const paginacaoEl = document.querySelector(".ant-pagination");
      if (paginacaoEl) paginacaoEl.style.display = "none";

      pdf.setFontSize(18);
      pdf.setTextColor(40);
      pdf.text(
        `Relatório de Coletas - ${
          abaAtiva.charAt(0).toUpperCase() + abaAtiva.slice(1)
        }`,
        pdf.internal.pageSize.getWidth() / 2,
        yPos,
        { align: "center" }
      );
      yPos += 10;

      pdf.setFontSize(11);
      pdf.text(
        `Período: ${
          periodo.length === 2
            ? `${moment(periodo[0]).format("DD/MM/YYYY")} - ${moment(
                periodo[1]
              ).format("DD/MM/YYYY")}`
            : "Todos os períodos"
        }`,
        pdf.internal.pageSize.getWidth() / 2,
        yPos,
        { align: "center" }
      );
      yPos += 10;

      pdf.text(
        `Gerado em: ${moment().format("DD/MM/YYYY HH:mm")}`,
        pdf.internal.pageSize.getWidth() / 2,
        yPos,
        { align: "center" }
      );
      yPos += 20;

      if (tabelaRef.current) {
        const canvasTabela = await html2canvas(tabelaRef.current, {
          scale: 3,
          logging: false,
          useCORS: true,
          scrollY: -window.scrollY,
          windowWidth: document.documentElement.offsetWidth,
          windowHeight: document.documentElement.offsetHeight,
        });

        const imgDataTabela = canvasTabela.toDataURL("image/png");
        const imgHeight =
          (canvasTabela.height * pageWidth) / canvasTabela.width;

        if (yPos + imgHeight > pdf.internal.pageSize.getHeight() - margin) {
          pdf.addPage();
          yPos = margin;
        }

        pdf.addImage(imgDataTabela, "PNG", margin, yPos, pageWidth, imgHeight);
        yPos += imgHeight + 10;
      }

      if (graficoRef.current) {
        const canvasGrafico = await html2canvas(graficoRef.current, {
          scale: 3,
          logging: false,
          useCORS: true,
          backgroundColor: "#ffffff",
        });

        const imgDataGrafico = canvasGrafico.toDataURL("image/png");
        const imgHeight =
          (canvasGrafico.height * pageWidth) / canvasGrafico.width;

        if (yPos + imgHeight > pdf.internal.pageSize.getHeight() - margin) {
          pdf.addPage();
          yPos = margin;
        }

        pdf.addImage(imgDataGrafico, "PNG", margin, yPos, pageWidth, imgHeight);
      }

      pdf.save(`relatorio_coletas_${moment().format("YYYYMMDD_HHmmss")}.pdf`);
      message.success({
        content: "PDF gerado com sucesso!",
        key: "pdf",
        duration: 3,
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      message.error({
        content: "Erro ao gerar PDF. Verifique o console para detalhes.",
        key: "pdf",
        duration: 4,
      });
    } finally {
      setCarregando(false);
    }
  };

  const dadosAtuais = useMemo(() => {
    switch (abaAtiva) {
      case "canceladas":
        return dadosCanceladas;
      case "previstas":
        return dadosPrevistas;
      case "realizadas":
        return [];
      case "totais":
        return [...dadosCanceladas, ...dadosPrevistas];
      default:
        return [];
    }
  }, [abaAtiva]);

  const usuariosUnicos = useMemo(
    () => [...new Set(dadosAtuais.map((d) => d.usuario))],
    [dadosAtuais]
  );
  const zonasUnicas = useMemo(
    () => [...new Set(dadosAtuais.map((d) => d.zona))],
    [dadosAtuais]
  );

  const colunasTabela = useMemo(() => {
    if (abaAtiva === "canceladas") {
      return colunasCanceladas;
    }

    const baseColumns = [
      {
        title: "ID",
        dataIndex: "id",
        width: 80,
        sorter: (a, b) => a.id - b.id,
      },
      {
        title: "Data",
        dataIndex: "data",
        render: (d) => moment(d).format("DD/MM/YYYY"),
        sorter: (a, b) => moment(a.data).unix() - moment(b.data).unix(),
      },
      {
        title: "Usuário",
        dataIndex: "usuario",
        sorter: (a, b) => a.usuario.localeCompare(b.usuario),
      },
      {
        title: "Zona",
        dataIndex: "zona",
        sorter: (a, b) => a.zona.localeCompare(b.zona),
        render: (zona) => {
          const cores = {
            Norte: "blue",
            Sul: "red",
            Leste: "green",
            Oeste: "orange",
          };
          return <Tag color={cores[zona] || "gray"}>{zona}</Tag>;
        },
      },
    ];

    if (abaAtiva === "previstas") {
      return [
        ...baseColumns,
        {
          title: "Status",
          dataIndex: "status",
          sorter: (a, b) => a.status.localeCompare(b.status),
        },
      ];
    }

    if (abaAtiva === "totais") {
      return [
        ...baseColumns,
        {
          title: "Tipo",
          dataIndex: "motivo",
          render: (_, record) =>
            dadosCanceladas.some((d) => d.id === record.id)
              ? "Cancelada"
              : "Prevista",
          sorter: (a, b) => {
            const aType = dadosCanceladas.some((d) => d.id === a.id)
              ? "Cancelada"
              : "Prevista";
            const bType = dadosCanceladas.some((d) => d.id === b.id)
              ? "Cancelada"
              : "Prevista";
            return aType.localeCompare(bType);
          },
        },
      ];
    }

    return baseColumns;
  }, [abaAtiva]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1a5632",
          colorLink: "#1a5632",
          colorSuccess: "#1a5632",
        },
      }}
    >
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <div className="flex-1 p-4 md:p-6 overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Dasboard de Coletas
            </h1>
          </div>

          <Tabs
            activeKey={abaAtiva}
            onChange={setAbaAtiva}
            className="mb-5"
            items={[
              { label: "Canceladas", key: "canceladas" },
              { label: "Previstas", key: "previstas" },
              { label: "Realizadas", key: "realizadas" },
              { label: "Totais", key: "totais" },
            ]}
          />

          <Spin spinning={carregando} tip="Carregando..." size="large">
            {abaAtiva === "realizadas" ? (
              <CarriedOutCollects />
            ) : abaAtiva === "previstas" ? (
              <ExpectedCollects />
            ) : abaAtiva === "totais" ? (
              <TotalCollects />
            ) : abaAtiva === "canceladas" ? (
              <CanceledCollects
                tabelaRef={tabelaRef}
                graficoRef={graficoRef}
                onExportPDF={gerarPDF}
              />
            ) : null}
          </Spin>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default Dashboard;
