import { Icon } from "../../../assets/shared/icon.jsx";
import ChinaMap from "../../components/china-map/index.jsx";
import "./index.css";

// Layer 4: 首页右侧 — 全国设备分布地图(铺满) + 顶部"数据总览"浮层卡片

// A1/B1 式指标块:大数字 + 小数字 + 描述文本 + 提示图标
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

// A2:DC 配置变更推荐次数 — 标题 + 三组(数字/圆+文本)并排 + 底部分段进度条
function DcStatBlock() {
  const items = [
    { num: "209", label: "外高桥", color: "rgb(32, 112, 243)" },
    { num: "103", label: "嘉定", color: "rgb(92, 162, 233)" },
    { num: "120", label: "前海", color: "rgb(140, 163, 250)" },
  ];
  const total = items.reduce((s, i) => s + Number(i.num), 0);
  return (
    <div className="dc-block">
      <div className="dc-title">DC配置变更推荐次数</div>
      <div className="dc-items">
        {items.map((it) => (
          <div className="dc-item" key={it.label}>
            <div className="dc-num">{it.num}</div>
            <div className="dc-label">
              <span className="dc-dot" style={{ background: it.color }} />
              <span className="dc-text">{it.label}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="dc-bar">
        {items.map((it) => (
          <span
            key={it.label}
            className="dc-bar-seg"
            style={{
              flexGrow: Number(it.num),
              flexBasis: 0,
              background: it.color,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function OverviewView() {
  // A1 为用户指定,B1/B2 为业务占位;A2 为 DC 配置变更推荐
  const stats = [
    { main: "124", sub: "/500", desc: "累计生成工作流/全部工作流" },
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
              <DcStatBlock />
            </div>
          </div>
          <div className="doc-divider" />
          <div className="doc-half">
            <div className="doc-stat">
              <StatBlock main={stats[1].main} sub={stats[1].sub} desc={stats[1].desc} />
            </div>
            <div className="doc-divider" />
            <div className="doc-stat doc-stat-fill">
              <StatBlock main={stats[2].main} sub={stats[2].sub} desc={stats[2].desc} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
