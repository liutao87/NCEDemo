import { Icon } from "../../../assets/shared/icon.jsx";
import Chart from "../../../assets/shared/chart.jsx";
import { DEVICES } from "../../mock/device.js";
import { ALARMS } from "../../mock/alarm.js";
import { TRAFFIC_TREND, TOP_DEVICE_FLOW } from "../../mock/overview.js";
import "./index.css";

// Layer 4: 总览 — KPI 指标卡 + 流量趋势折线图 + TOP5 设备流量条形图
function buildKpiCards() {
  const total = DEVICES.length;
  const onlineCount = DEVICES.filter((d) => d.status === "online").length;
  const onlineRate = ((onlineCount / total) * 100).toFixed(1);
  const activeAlarms = ALARMS.filter((a) => a.status !== "cleared").length;
  return [
    {
      key: "devices",
      icon: "server",
      tone: "brand",
      label: "纳管设备",
      value: String(total),
      unit: "台",
      trend: "较上周 +2 台",
      trendIcon: "trending-up",
      trendTone: "up",
    },
    {
      key: "online",
      icon: "activity",
      tone: "success",
      label: "设备在线率",
      value: onlineRate,
      unit: "%",
      trend: "较昨日 +0.6%",
      trendIcon: "trending-up",
      trendTone: "up",
    },
    {
      key: "alarms",
      icon: "bell",
      tone: "error",
      label: "活跃告警",
      value: String(activeAlarms),
      unit: "条",
      trend: "较昨日 +1 条",
      trendIcon: "trending-up",
      trendTone: "down",
    },
    {
      key: "port",
      icon: "gauge",
      tone: "warning",
      label: "端口利用率",
      value: "62.4",
      unit: "%",
      trend: "较昨日 -1.8%",
      trendIcon: "trending-up",
      trendTone: "up",
    },
  ];
}

export default function OverviewView() {
  const kpiCards = buildKpiCards();

  return (
    <div className="overview-view">
      <div className="kpi-grid">
        {kpiCards.map((card) => (
          <div key={card.key} className="kpi-card">
            <div className={`kpi-icon ${card.tone}`}>
              <Icon name={card.icon} size="1.25rem" />
            </div>
            <div className="kpi-body">
              <span className="kpi-label">{card.label}</span>
              <span className="kpi-value">
                {card.value}
                <span className="kpi-unit">{card.unit}</span>
              </span>
              <span className={`kpi-trend ${card.trendTone}`}>
                <Icon name={card.trendIcon} size="0.75rem" />
                {card.trend}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="chart-grid">
        <div className="chart-card">
          <h3 className="chart-card-title">24 小时流量趋势</h3>
          <Chart
            name="LineChart"
            option={{
              data: TRAFFIC_TREND,
              xAxis: { data: "时间", name: "时间" },
              yAxisTitle: "流量 (Mbps)",
              smooth: true,
            }}
            style={{ height: "17rem" }}
          />
        </div>
        <div className="chart-card">
          <h3 className="chart-card-title">TOP5 设备流量</h3>
          <Chart
            name="BarChart"
            option={{
              data: TOP_DEVICE_FLOW.map((d) => ({ "设备": d.device, "流量": d.value })),
              xAxis: { data: "设备" },
              yAxisTitle: "流量 (Gbps)",
              direction: "horizontal",
            }}
            style={{ height: "17rem" }}
          />
        </div>
      </div>
    </div>
  );
}
