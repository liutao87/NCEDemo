import { Icon } from "../../../assets/shared/icon.jsx";
import ChinaMap from "../../components/china-map/index.jsx";
import "./index.css";

// Layer 4: 首页右侧 — 全国设备分布地图(铺满) + 顶部"数据总览"浮层卡片
function StatBlock({ main, sub, desc }) {
  return (
    <div className="stat-block">
      <div className="stat-num">
        <span className="stat-num-main">{main}</span>
        <span className="stat-num-sub">{sub}</span>
      </div>
      <div className="stat-desc">
        <span className="stat-desc-text">{desc}</span>
        <Icon name="circle-question-mark" size="0.75rem" />
      </div>
    </div>
  );
}

export default function OverviewView() {
  // 四组指标(左半 A1/A2,右半 B1/B2);A1 为用户指定,其余为业务占位
  const stats = [
    { main: "124", sub: "/500", desc: "累计生成工作流/全部工作流" },
    { main: "86", sub: "/200", desc: "在线设备/全部设备" },
    { main: "365", sub: "/1465", desc: "自动处置事件/累计事件" },
    { main: "18", sub: "/56", desc: "活跃告警/全部告警" },
  ];

  return (
    <div className="overview-view">
      <div className="map-body">
        <ChinaMap />
      </div>
      <div className="data-overview-card">
        <h3 className="doc-title">数据总览</h3>
        <div className="doc-body">
          <div className="doc-half">
            <div className="doc-stat">
              <StatBlock main={stats[0].main} sub={stats[0].sub} desc={stats[0].desc} />
            </div>
            <div className="doc-divider" />
            <div className="doc-stat doc-stat-fill">
              <StatBlock main={stats[1].main} sub={stats[1].sub} desc={stats[1].desc} />
            </div>
          </div>
          <div className="doc-divider" />
          <div className="doc-half">
            <div className="doc-stat">
              <StatBlock main={stats[2].main} sub={stats[2].sub} desc={stats[2].desc} />
            </div>
            <div className="doc-divider" />
            <div className="doc-stat doc-stat-fill">
              <StatBlock main={stats[3].main} sub={stats[3].sub} desc={stats[3].desc} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
