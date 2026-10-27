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

// B2 右半第二个子容器:左侧指标块 + 右侧圆环图(SVG 手绘,非图标)
function RingChart() {
  const done = 100;
  const total = 210;
  const pct = (done / total) * 100; // 47.6%
  return (
    <div className="ring-wrap">
      <svg className="ring-svg" viewBox="0 0 36 36">
        <circle
          cx="18"
          cy="18"
          r="15.915"
          fill="none"
          stroke="rgb(32, 112, 243)"
          strokeWidth="3.5"
        />
        <circle
          cx="18"
          cy="18"
          r="15.915"
          fill="none"
          stroke="rgb(54, 193, 141)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={`${pct} ${100 - pct}`}
          transform="rotate(-90 18 18)"
        />
      </svg>
      <div className="ring-legend">
        <div className="ring-legend-item">
          <span className="ring-dot" style={{ background: "rgb(54, 193, 141)" }} />
          <span>下发配置设备</span>
        </div>
        <div className="ring-legend-item">
          <span className="ring-dot" style={{ background: "rgb(32, 112, 243)" }} />
          <span>总设备</span>
        </div>
      </div>
    </div>
  );
}

export default function OverviewView() {
  return (
    <div className="overview-view">
      <div className="map-body">
        <ChinaMap />
      </div>
      <div className="data-overview-card">
        <h3 className="doc-title">数据总览</h3>
        <div className="doc-body">
          {/* 左半:A1 + 分割线 + A2(DC 配置变更推荐) */}
          <div className="doc-half">
            <div className="doc-stat">
              <StatBlock main="124" sub="/500" desc="累计生成工作流/全部工作流" />
            </div>
            <div className="doc-divider" />
            <div className="doc-stat doc-stat-fill">
              <DcStatBlock />
            </div>
          </div>
          <div className="doc-divider" />
          {/* 右半:B1 + 分割线 + B2(指标块 + 圆环图) */}
          <div className="doc-half">
            <div className="doc-stat">
              <StatBlock main="210" sub="/280台" desc="累计试运行设备/总设备" />
            </div>
            <div className="doc-divider" />
            <div className="doc-stat doc-stat-fill b2-row">
              <div className="b2-stat">
                <StatBlock main="100" sub="/210台" desc="累计下发配置设备/总设备" />
              </div>
              <RingChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
