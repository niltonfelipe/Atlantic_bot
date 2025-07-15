import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Card,
  Row,
  Col,
  Tag,
  Select,
  Button,
  message,
  Spin,
} from "antd";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import moment from "moment";

Chart.register(...registerables);
moment.locale("pt-br");

const { Option } = Select;

const ANO_INICIAL = 2025;
const ANO_FINAL = 2030;

const ExpectedCollects = () => {
  const [mesSelecionado, setMesSelecionado] = useState(moment().month());
  const [anoSelecionado, setAnoSelecionado] = useState(moment().year());
  const [zonaFiltro, setZonaFiltro] = useState(null);
  const [clienteFiltro, setClienteFiltro] = useState(null);
  const [dadosAPI, setDadosAPI] = useState([]);
  const [loading, setLoading] = useState(false);
  const [zonasUnicas, setZonasUnicas] = useState([]);
  const [clientesUnicos, setClientesUnicos] = useState([]);

  const mesAnoSelecionado = useMemo(() => {
    return moment().year(anoSelecionado).month(mesSelecionado).startOf("month");
  }, [mesSelecionado, anoSelecionado]);

  useEffect(() => {
    async function fetchColetas() {
      setLoading(true);
      try {
        const startDate = mesAnoSelecionado.format("YYYY-MM-DD");
        const endDate = mesAnoSelecionado
          .clone()
          .endOf("month")
          .format("YYYY-MM-DD");

        let url = `${
          import.meta.env.VITE_API_URL
        }/relatorios/coletas-previstas?startDate=${startDate}&endDate=${endDate}`;
        if (zonaFiltro) url += `&nomeZona=${encodeURIComponent(zonaFiltro)}`;
        if (clienteFiltro)
          url += `&nomeCliente=${encodeURIComponent(clienteFiltro)}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Erro na API: ${response.statusText}`);
        }

        const json = await response.json();

        if (!Array.isArray(json)) {
          throw new Error("Resposta da API inesperada: não é um array");
        }

        setDadosAPI(json);

        const zonas = [...new Set(json.map((item) => item.zona))].filter(
          Boolean
        );
        const clientes = [
          ...new Set(json.map((item) => item.nome_cliente)),
        ].filter(Boolean);

        setZonasUnicas(zonas);
        setClientesUnicos(clientes);
      } catch (error) {
        console.error(error);
        message.error("Erro ao buscar coletas: " + error.message);
        setDadosAPI([]);
      } finally {
        setLoading(false);
      }
    }

    fetchColetas();
  }, [mesAnoSelecionado, zonaFiltro, clienteFiltro]);

  const datasParaExibir = useMemo(() => {
    const datas = [];
    const data = mesAnoSelecionado.clone();
    const end = data.clone().endOf("month");

    while (data.isSameOrBefore(end)) {
      datas.push(data.format("YYYY-MM-DD"));
      data.add(1, "day");
    }

    return datas;
  }, [mesAnoSelecionado]);

  const tabelaClientes = useMemo(() => {
    if (!Array.isArray(dadosAPI)) return [];

    return dadosAPI.map((cliente) => {
      const row = {
        key: cliente.nome_cliente,
        cliente: cliente.nome_cliente,
        zona: cliente.zona,
        total: cliente.datas_previstas?.length || 0,
      };

      datasParaExibir.forEach((data) => {
        if (!cliente.datas_previstas?.includes(data)) {
          row[data] = "-";
          return;
        }

        const isRealizada = cliente.datas_realizadas?.includes(data);
        const isCancelada = cliente.datas_canceladas?.includes(data);
        const isFutura = moment(data).isAfter(moment());

        if (isRealizada) row[data] = "✔";
        else if (isCancelada) row[data] = "C";
        else if (!isFutura) row[data] = "X";
        else row[data] = "P";
      });

      return row;
    });
  }, [dadosAPI, datasParaExibir]);

  const chartData = useMemo(() => {
    if (!Array.isArray(dadosAPI)) return { labels: [], datasets: [] };

    const counts = datasParaExibir.map(
      (data) =>
        dadosAPI.filter((cliente) => cliente.datas_previstas?.includes(data))
          .length
    );

    return {
      labels: datasParaExibir.map((d) => moment(d).format("DD/MM")),
      datasets: [
        {
          label: "Coletas Previstas",
          data: counts,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
      ],
    };
  }, [dadosAPI, datasParaExibir]);

  const columns = [
    {
      title: "Cliente",
      dataIndex: "cliente",
      key: "cliente",
      fixed: "left",
      width: 150,
      sorter: (a, b) => a.cliente.localeCompare(b.cliente),
    },
    {
      title: "Zona",
      dataIndex: "zona",
      key: "zona",
      width: 100,
      filters: zonasUnicas.map((zona) => ({ text: zona, value: zona })),
      onFilter: (value, record) => record.zona === value,
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      width: 80,
      sorter: (a, b) => a.total - b.total,
    },
    ...datasParaExibir.map((data) => ({
      title: moment(data).format("DD"),
      dataIndex: data,
      key: data,
      width: 50,
      align: "center",
      render: (text) => {
        let color = "default";
        if (text === "✔") color = "green";
        else if (text === "P") color = "blue";
        else if (text === "X") color = "volcano";
        else if (text === "C") color = "red";
        return <Tag color={color}>{text}</Tag>;
      },
    })),
  ];

  return (
    <Card
      title={`Coletas Previstas e Realizadas - ${mesAnoSelecionado.format(
        "MMMM [de] YYYY"
      )}`}
    >
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col xs={12} md={6}>
          <Select
            value={mesSelecionado}
            onChange={setMesSelecionado}
            style={{ width: "100%" }}
          >
            {moment.months().map((mes, idx) => (
              <Option key={idx} value={idx}>
                {mes.charAt(0).toUpperCase() + mes.slice(1)}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={12} md={6}>
          <Select
            value={anoSelecionado}
            onChange={setAnoSelecionado}
            style={{ width: "100%" }}
          >
            {[...Array(ANO_FINAL - ANO_INICIAL + 1)].map((_, i) => {
              const ano = ANO_INICIAL + i;
              return (
                <Option key={ano} value={ano}>
                  {ano}
                </Option>
              );
            })}
          </Select>
        </Col>

        <Col xs={12} md={6}>
          <Select
            value={zonaFiltro}
            onChange={setZonaFiltro}
            style={{ width: "100%" }}
            allowClear
            placeholder="Filtrar por zona"
          >
            {zonasUnicas.map((z) => (
              <Option key={z} value={z}>
                {z}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={12} md={6}>
          <Select
            value={clienteFiltro}
            onChange={setClienteFiltro}
            style={{ width: "100%" }}
            allowClear
            placeholder="Filtrar por cliente"
          >
            {clientesUnicos.map((c) => (
              <Option key={c} value={c}>
                {c}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      <div className="mb-6 font-semibold text-sm flex items-center justify-center">
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-lg shadow-sm">
            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-red-600 text-white font-bold shadow-md">
              X
            </span>
            <span>Não realizada</span>
          </div>

          <div className="flex items-center gap-2 bg-red-50 text-red-800 px-3 py-1 rounded-lg shadow-sm">
            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white font-bold shadow-md">
              C
            </span>
            <span>Cancelada</span>
          </div>

          <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-lg shadow-sm">
            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-green-600 text-white font-bold shadow-md">
              ✔
            </span>
            <span>Realizada</span>
          </div>

          <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-lg shadow-sm">
            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold shadow-md">
              P
            </span>
            <span>Pendente</span>
          </div>
        </div>
      </div>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={tabelaClientes}
          pagination={tabelaClientes.length > 5 ? { pageSize: 5 } : false}
          scroll={{ x: "max-content" }}
          bordered
        />
        <div style={{ height: 350, marginTop: 50 }}>
          <Bar
            data={chartData}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </div>
      </Spin>
    </Card>
  );
};

export default ExpectedCollects;
