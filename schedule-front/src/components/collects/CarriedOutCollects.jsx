import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Table,
  Card,
  Row,
  Col,
  Tag,
  Select,
  Button,
  Spin,
  message,
} from "antd";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import moment from "moment";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

Chart.register(...registerables);
const { Option } = Select;

moment.locale("pt-br");

const getZonaColor = (zonaCor) => {
  const cores = {
    azul: "#3B82F6",
    verde: "#10B981",
    laranja: "#F59E0B",
    vermelho: "#EF4444",
    cinza: "#6B7280",
    roxo: "#8B5CF6",
    amarelo: "#FBBF24",
    "azona nsaorte": "#3B82F6",
  };
  return cores[zonaCor?.toLowerCase()] || "gray";
};

const gerarMesesAnos = (minMoment, maxMoment) => {
  const meses = [];
  const atual = minMoment.clone().startOf("month");
  const fim = maxMoment.clone().startOf("month");
  while (atual.isSameOrBefore(fim)) {
    meses.push(atual.format("MM/YYYY"));
    atual.add(1, "month");
  }
  return meses;
};

const CarriedOutCollects = () => {
  const dashboardRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState([]);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [zonaFiltro, setZonaFiltro] = useState(null);
  const [clienteFiltro, setClienteFiltro] = useState(null);

  const [mesesAnosOptions, setMesesAnosOptions] = useState([]);

  const fetchDados = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/relatorios/coletas-realizadas`
      );
      if (!res.ok) throw new Error("Erro na requisição");
      const json = await res.json();
      setDados(json || []);

      const todasDatas = json.flatMap((item) => item.dias_realizados || []);
      if (todasDatas.length > 0) {
        const datasMoment = todasDatas.map((d) => moment(d, "YYYY-MM-DD"));
        const minData = moment.min(datasMoment);
        const maxData = moment.max(datasMoment);

        setStartDate(minData.format("MM/YYYY"));
        setEndDate(maxData.format("MM/YYYY"));

        const meses = gerarMesesAnos(minData, maxData);
        setMesesAnosOptions(meses);
      } else {
        const now = moment();
        setStartDate(now.format("MM/YYYY"));
        setEndDate(now.format("MM/YYYY"));
        setMesesAnosOptions([now.format("MM/YYYY")]);
      }
    } catch (e) {
      message.error("Erro ao buscar dados da API");
      console.error(e);
      const now = moment();
      setStartDate(now.format("MM/YYYY"));
      setEndDate(now.format("MM/YYYY"));
      setMesesAnosOptions([now.format("MM/YYYY")]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDados();
  }, []);

  const startMoment = useMemo(
    () => (startDate ? moment(startDate, "MM/YYYY").startOf("month") : null),
    [startDate]
  );
  const endMoment = useMemo(
    () =>
      endDate
        ? moment(endDate, "MM/YYYY").endOf("month") // inclui o mês inteiro
        : null,
    [endDate]
  );

  const dadosFiltrados = useMemo(() => {
    if (!startMoment || !endMoment) return [];

    return dados.filter((item) => {
      const zonaNome = item.zona?.nome_da_zona?.toLowerCase() || "";
      const zonaFiltroLower = zonaFiltro?.toLowerCase() || "";

      const zonaMatch = !zonaFiltro || zonaNome === zonaFiltroLower;
      const clienteMatch =
        !clienteFiltro || item.nome_cliente === clienteFiltro;

      const dataMatch = (item.dias_realizados || []).some((dia) => {
        const m = moment(dia, "YYYY-MM-DD");
        return m.isBetween(startMoment, endMoment, "day", "[]");
      });

      return zonaMatch && clienteMatch && dataMatch;
    });
  }, [dados, zonaFiltro, clienteFiltro, startMoment, endMoment]);

  const datasUnicas = useMemo(() => {
    if (!startMoment || !endMoment) return [];

    const setDatas = new Set();
    dadosFiltrados.forEach((item) => {
      (item.dias_realizados || []).forEach((d) => {
        const m = moment(d, "YYYY-MM-DD");
        if (m.isBetween(startMoment, endMoment, "day", "[]")) {
          setDatas.add(m.format("YYYY-MM-DD"));
        }
      });
    });
    return Array.from(setDatas).sort((a, b) => moment(a).diff(moment(b)));
  }, [dadosFiltrados, startMoment, endMoment]);

  const tabelaClientes = useMemo(() => {
    return dadosFiltrados
      .map((item, idx) => {
        const zonaNome = item.zona?.nome_da_zona || "Sem zona";
        const zonaCor = item.zona?.cor || "cinza";

        const row = {
          key: `${item.nome_cliente}-${idx}`,
          cliente: item.nome_cliente || "Desconhecido",
          zona: zonaNome,
          zonaCor,
          totalRealizadas: item.realizadas || 0,
        };

        datasUnicas.forEach((d) => {
          row[d] = (item.dias_realizados || []).includes(d) ? "✓" : "-";
        });

        return row;
      })
      .filter((row) => row.totalRealizadas > 0);
  }, [dadosFiltrados, datasUnicas]);

  const chartData = useMemo(() => {
    const data = datasUnicas.map(
      (d) =>
        dadosFiltrados.filter((item) =>
          (item.dias_realizados || []).includes(d)
        ).length
    );

    return {
      labels: datasUnicas.map((d) => moment(d).format("DD/MM/YYYY")),
      datasets: [
        {
          label: "Coletas Realizadas",
          data,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };
  }, [dadosFiltrados, datasUnicas]);

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
      width: 120,
      filters: [...new Set(dados.map((d) => d.zona?.nome_da_zona))]
        .filter(Boolean)
        .map((z) => ({ text: z, value: z })),
      onFilter: (value, record) => record.zona === value,
      render: (_, record) => (
        <Tag color={getZonaColor(record.zonaCor)}>{record.zona}</Tag>
      ),
    },
    {
      title: "Realizadas",
      dataIndex: "totalRealizadas",
      key: "totalRealizadas",
      width: 90,
      sorter: (a, b) => a.totalRealizadas - b.totalRealizadas,
    },
    ...datasUnicas.map((d) => ({
      title: moment(d).format("DD/MM/YYYY"),
      dataIndex: d,
      key: d,
      width: 100,
      align: "center",
      render: (text) => (
        <Tag color={text === "✓" ? "green" : "default"}>{text}</Tag>
      ),
    })),
  ];

  const zonasUnicas = useMemo(() => {
    const setZonas = new Set();
    dados.forEach((d) => {
      if (d.zona?.nome_da_zona) setZonas.add(d.zona.nome_da_zona);
    });
    return Array.from(setZonas);
  }, [dados]);

  const clientesUnicos = useMemo(() => {
    const setClientes = new Set();
    dados.forEach((d) => {
      if (d.nome_cliente) setClientes.add(d.nome_cliente);
    });
    return Array.from(setClientes);
  }, [dados]);

  const limparFiltros = () => {
    setZonaFiltro(null);
    setClienteFiltro(null);
    if (dados.length > 0 && mesesAnosOptions.length > 0) {
      setStartDate(mesesAnosOptions[0]);
      setEndDate(mesesAnosOptions[mesesAnosOptions.length - 1]);
    }
  };

  const gerarPDF = async () => {
    setLoading(true);
    message.loading({ content: "Gerando PDF...", key: "pdf", duration: 0 });
    try {
      await new Promise((r) => setTimeout(r, 500));
      const pdf = new jsPDF("l", "mm", "a4");
      const margin = 10;
      const pageWidth = pdf.internal.pageSize.getWidth() - margin * 2;
      let yPos = 20;

      pdf.setFontSize(18);
      pdf.text(
        "Relatório de Coletas Realizadas",
        pdf.internal.pageSize.getWidth() / 2,
        yPos,
        { align: "center" }
      );
      yPos += 10;
      pdf.setFontSize(11);
      pdf.text(
        `Período: ${startDate} a ${endDate}`,
        pdf.internal.pageSize.getWidth() / 2,
        yPos,
        { align: "center" }
      );
      yPos += 5;
      pdf.text(
        `Gerado em: ${moment().format("DD/MM/YYYY HH:mm")}`,
        pdf.internal.pageSize.getWidth() / 2,
        yPos,
        { align: "center" }
      );
      yPos += 15;

      if (dashboardRef.current) {
        const canvas = await html2canvas(dashboardRef.current, {
          scale: 2,
          scrollY: -window.scrollY,
          windowWidth: document.documentElement.offsetWidth,
          windowHeight: dashboardRef.current.scrollHeight,
          useCORS: true,
        });

        const imgData = canvas.toDataURL("image/png");
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", margin, yPos, imgWidth, imgHeight);
      }

      pdf.save(`coletas_realizadas_${moment().format("YYYYMMDD_HHmmss")}.pdf`);
      message.success({
        content: "PDF gerado com sucesso!",
        key: "pdf",
        duration: 3,
      });
    } catch (error) {
      console.error(error);
      message.error({
        content: "Erro ao gerar PDF. Veja console para detalhes.",
        key: "pdf",
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={dashboardRef}>
      <Spin spinning={loading} tip="Carregando...">
        <Card
          title={`Coletas Realizadas ${
            startDate && endDate ? `(${startDate} a ${endDate})` : ""
          }`}
          extra={
            <Button
              
              onClick={limparFiltros}
              style={{ width: "100%"}}
            >
              Limpar Filtros
            </Button>
          }
          style={{ marginBottom: 20, width: "100%" }}
        >
          <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
            <Col xs={24} sm={12} md={8}>
              <Select
                showSearch
                placeholder="Data Início (MM/YYYY)"
                value={startDate}
                onChange={(value) => {
                  if (
                    endDate &&
                    moment(value, "MM/YYYY").isAfter(moment(endDate, "MM/YYYY"))
                  ) {
                    message.warning(
                      "Data Início não pode ser maior que Data Fim"
                    );
                    return;
                  }
                  setStartDate(value);
                }}
                style={{ width: "100%" }}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
                allowClear={false}
              >
                {mesesAnosOptions.map((m) => (
                  <Option key={m} value={m}>
                    {m}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                showSearch
                placeholder="Data Fim (MM/YYYY)"
                value={endDate}
                onChange={(value) => {
                  if (
                    startDate &&
                    moment(value, "MM/YYYY").isBefore(
                      moment(startDate, "MM/YYYY")
                    )
                  ) {
                    message.warning(
                      "Data Fim não pode ser menor que Data Início"
                    );
                    return;
                  }
                  setEndDate(value);
                }}
                style={{ width: "100%" }}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
                allowClear={false}
              >
                {mesesAnosOptions.map((m) => (
                  <Option key={m} value={m}>
                    {m}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="Filtrar por Zona"
                value={zonaFiltro}
                onChange={setZonaFiltro}
                allowClear
                style={{ width: "100%" }}
              >
                {zonasUnicas.map((z) => (
                  <Option key={z} value={z}>
                    {z}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8}></Col>
          </Row>

          <Card
            title="Coletas Realizadas por Cliente"
            style={{ marginBottom: 20 }}
          >
            <Table
              columns={columns}
              dataSource={tabelaClientes}
              pagination={false}
              bordered
              scroll={{ x: "max-content", y: 400 }}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}>
                      Total de Coletas por Dia
                    </Table.Summary.Cell>
                    {datasUnicas.map((d) => (
                      <Table.Summary.Cell key={d} index={d} align="center">
                        {
                          dadosFiltrados.filter((item) =>
                            (item.dias_realizados || []).includes(d)
                          ).length
                        }
                      </Table.Summary.Cell>
                    ))}
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </Card>

          <Card title="Gráfico de Coletas Realizadas por Dia">
            <div style={{ height: 400 }}>
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: { display: true, text: "Quantidade" },
                    },
                    x: {
                      title: { display: true, text: "Data" },
                    },
                  },
                }}
              />
            </div>
          </Card>
        </Card>
      </Spin>
    </div>
  );
};

export default CarriedOutCollects;
