import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Table,
  Card,
  Row,
  Col,
  Typography,
  Divider,
  Button,
  message,
  Spin,
  Select,
  Tag,
} from "antd";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import moment from "moment";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

Chart.register(...registerables);
moment.locale("pt-br");

const { Title, Text } = Typography;
const { Option } = Select;

const TotalCollects = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [zonaFiltro, setZonaFiltro] = useState(null);
  const [clienteFiltro, setClienteFiltro] = useState(null);
  const [mesAnoFiltro, setMesAnoFiltro] = useState("anoTodo");
  const dashboardRef = useRef(null);

  const gerarOpcoesMesAno = () => {
    const opcoes = [];
    const anoAtual = new Date().getFullYear();
    const anoInicial = anoAtual - 5;
    const anoFinal = anoAtual + 2;

    opcoes.push(
      <Option key="anoTodo" value="anoTodo">
        Ano Todo
      </Option>
    );

    for (let ano = anoInicial; ano <= anoFinal; ano++) {
      for (let mes = 1; mes <= 12; mes++) {
        const label = `${String(mes).padStart(2, "0")}/${ano}`;
        const value = `${ano}-${String(mes).padStart(2, "0")}`;
        opcoes.push(
          <Option key={value} value={value}>
            {label}
          </Option>
        );
      }
    }
    return opcoes;
  };

  const getPeriodoFiltro = () => {
    const anoAtual = new Date().getFullYear();
    if (mesAnoFiltro === "anoTodo") {
      const start = new Date(anoAtual, 0, 1);
      const end = new Date(anoAtual, 11, 31, 23, 59, 59, 999);
      return { start, end };
    }
    const [ano, mes] = mesAnoFiltro.split("-");
    const start = new Date(parseInt(ano), parseInt(mes) - 1, 1);
    const end = new Date(parseInt(ano), parseInt(mes), 0, 23, 59, 59, 999);
    return { start, end };
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { start, end } = getPeriodoFiltro();

        const startDate = start.toISOString().slice(0, 10);
        const endDate = end.toISOString().slice(0, 10);

        const query = `startDate=${startDate}&endDate=${endDate}`;
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/relatorios/coletas-por-cliente?${query}`
        );
        if (!res.ok) throw new Error("Erro ao carregar relatório");

        const json = await res.json();

        const enriched = json.map((item, idx) => ({
          key: idx,
          cliente: item.nome_cliente,
          coletasRealizadas: item.coletasRealizadas || 0,
          coletasPrevistas: item.coletasPrevistas || 0,
          coletasCanceladas: item.coletasCanceladas || 0,
          zona: item.zona || "Indefinida",
          corZona: item.cor || "cinza",
        }));

        setData(enriched);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        message.error("Erro ao carregar dados de coletas");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mesAnoFiltro]);

  const getZonaColor = (cor) => {
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

  const zonasUnicas = useMemo(() => {
    const map = new Map();
    data.forEach(({ zona, corZona }) => {
      if (zona && !map.has(zona)) {
        map.set(zona, corZona || "cinza");
      }
    });
    return Array.from(map.entries());
  }, [data]);

  const clientesUnicos = useMemo(() => {
    return [...new Set(data.map((item) => item.cliente))];
  }, [data]);

  const dadosFiltrados = useMemo(() => {
    return data.filter((item) => {
      const fZ = !zonaFiltro || item.zona === zonaFiltro;
      const fC = !clienteFiltro || item.cliente === clienteFiltro;
      return fZ && fC;
    });
  }, [data, zonaFiltro, clienteFiltro]);

  const totaisFiltrados = useMemo(() => {
    return dadosFiltrados.reduce(
      (acc, curr) => ({
        previstas: acc.previstas + curr.coletasPrevistas,
        realizadas: acc.realizadas + curr.coletasRealizadas,
        canceladas: acc.canceladas + curr.coletasCanceladas,
      }),
      { previstas: 0, realizadas: 0, canceladas: 0 }
    );
  }, [dadosFiltrados]);

  const barChartData = useMemo(
    () => ({
      labels: ["Previstas", "Realizadas", "Canceladas"],
      datasets: [
        {
          label: "Quantidade de Coletas",
          data: [
            totaisFiltrados.previstas,
            totaisFiltrados.realizadas,
            totaisFiltrados.canceladas,
          ],
          backgroundColor: [
            "rgba(54,162,235,0.6)",
            "rgba(75,192,192,0.6)",
            "rgba(255,99,132,0.6)",
          ],
          borderColor: [
            "rgba(54,162,235,1)",
            "rgba(75,192,192,1)",
            "rgba(255,99,132,1)",
          ],
          borderWidth: 1,
        },
      ],
    }),
    [totaisFiltrados]
  );

  const columns = [
    {
      title: "Cliente",
      dataIndex: "cliente",
      key: "cliente",
      fixed: "left",
      width: 180,
      sorter: (a, b) => a.cliente.localeCompare(b.cliente),
    },
    {
      title: "Zona",
      dataIndex: "zona",
      key: "zona",
      width: 100,
      render: (_, record) => (
        <Tag color={getZonaColor(record.corZona)}>{record.zona}</Tag>
      ),
    },
    {
      title: "Previstas",
      dataIndex: "coletasPrevistas",
      key: "coletasPrevistas",
      sorter: (a, b) => a.coletasPrevistas - b.coletasPrevistas,
    },
    {
      title: "Realizadas",
      dataIndex: "coletasRealizadas",
      key: "coletasRealizadas",
      sorter: (a, b) => a.coletasRealizadas - b.coletasRealizadas,
    },
    {
      title: "Canceladas",
      dataIndex: "coletasCanceladas",
      key: "coletasCanceladas",
      sorter: (a, b) => a.coletasCanceladas - b.coletasCanceladas,
    },
  ];

  const gerarPDF = async () => {
    setLoading(true);
    message.loading({ content: "Gerando PDF...", key: "pdf", duration: 0 });
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const margin = 10,
        w = pdf.internal.pageSize.width - margin * 2;
      let y = 20;
      pdf.setFontSize(18);
      pdf.text("Dashboard de Coletas", pdf.internal.pageSize.width / 2, y, {
        align: "center",
      });
      y += 10;
      pdf.setFontSize(11);
      pdf.text(
        `Gerado em: ${moment().format("DD/MM/YYYY HH:mm")}`,
        pdf.internal.pageSize.width / 2,
        y,
        { align: "center" }
      );
      y += 20;
      if (dashboardRef.current) {
        const canvas = await html2canvas(dashboardRef.current, {
          scale: 2,
          useCORS: true,
          scrollY: -window.scrollY,
        });
        const img = canvas.toDataURL("image/png");
        const h = (canvas.height * w) / canvas.width;
        let he = h,
          pos = 0;
        pdf.addImage(img, "PNG", margin, pos, w, h);
        he -= pdf.internal.pageSize.height;
        while (he >= 0) {
          pos = he - h;
          pdf.addPage();
          pdf.addImage(img, "PNG", margin, pos, w, h);
          he -= pdf.internal.pageSize.height;
        }
      }
      pdf.save(`dashboard_coletas_${moment().format("YYYYMMDD_HHmmss")}.pdf`);
      message.success({
        content: "PDF gerado com sucesso!",
        key: "pdf",
        duration: 3,
      });
    } catch (error) {
      console.error(error);
      message.error({ content: "Erro ao gerar PDF.", key: "pdf", duration: 4 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={dashboardRef} style={{ padding: 20 }}>
      <Spin spinning={loading}>
        <Card title="Dashboard de Coletas" style={{ marginBottom: 20 }}>
          <Row gutter={16} style={{ marginBottom: 20 }}>
            <Col xs={24} md={6}>
              <Select
                placeholder="Filtrar Zona"
                onChange={setZonaFiltro}
                allowClear
                style={{ width: "100%" }}
                value={zonaFiltro}
              >
                {zonasUnicas.map(([nome, cor]) => (
                  <Option key={nome} value={nome}>
                    <Tag color={getZonaColor(cor)}>{nome}</Tag>
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} md={6}>
              <Select
                placeholder="Filtrar Cliente"
                onChange={setClienteFiltro}
                allowClear
                style={{ width: "100%" }}
                value={clienteFiltro}
              >
                {clientesUnicos.map((c) => (
                  <Option key={c} value={c}>
                    {c}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} md={6}>
              <Select
                placeholder="Filtrar Mês/Ano"
                onChange={setMesAnoFiltro}
                style={{ width: "100%" }}
                value={mesAnoFiltro}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {gerarOpcoesMesAno()}
              </Select>
            </Col>
            <Col xs={24} md={6} style={{ display: "flex", alignItems: "center" }}>
              <Button
                onClick={() => {
                  setZonaFiltro(null);
                  setClienteFiltro(null);
                  setMesAnoFiltro("anoTodo");
                }}
              >
                Limpar Filtros
              </Button>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginBottom: 20 }}>
            <Col span={8}>
              <Card>
                <Title level={4}>Previstas</Title>
                <Title level={2} style={{ color: "#1890ff" }}>
                  {totaisFiltrados.previstas}
                </Title>
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Title level={4}>Realizadas</Title>
                <Title level={2} style={{ color: "#52c41a" }}>
                  {totaisFiltrados.realizadas}
                </Title>
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Title level={4}>Canceladas</Title>
                <Title level={2} style={{ color: "#f5222d" }}>
                  {totaisFiltrados.canceladas}
                </Title>
              </Card>
            </Col>
          </Row>

          <Divider />

          <Table
            columns={columns}
            dataSource={dadosFiltrados}
            pagination={{ pageSize: 5 }}
            bordered
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={2}>
                    Totais
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    {totaisFiltrados.previstas}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3}>
                    {totaisFiltrados.realizadas}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4}>
                    {totaisFiltrados.canceladas}
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
            scroll={{ x: "max-content" }}
          />

          <Divider />

          <Card title="Distribuição das Coletas">
            <div style={{ height: 300 }}>
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: { y: { beginAtZero: true } },
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
            <Divider />
            <div style={{ textAlign: "center" }}>
              <Title level={5}>Resumo</Title>
              <p>
                <Text strong>Previstas:</Text> {totaisFiltrados.previstas}
              </p>
              <p>
                <Text strong>Realizadas:</Text> {totaisFiltrados.realizadas}
              </p>
              <p>
                <Text strong>Canceladas:</Text> {totaisFiltrados.canceladas}
              </p>
            </div>
          </Card>
        </Card>
      </Spin>
    </div>
  );
};

export default TotalCollects;
