import { useMemo, useState } from "react";
import { Dropdown } from "antd";
import { Icon } from "../../../assets/shared/icon.jsx";
import { useApp } from "../../context.jsx";
import { ATTENTION_ITEMS, RANGE_OPTIONS } from "../../mock/session.js";
import Composer from "./composer.jsx";
import "./index.css";

// Layer 4: 会话卡片 — 总览核心区左侧的 AI 助手面板(540px × 100%, 背景图 + 32px 内边距)
const ATTENTION_TABS = [
  { key: "all", label: "全部" },
  { key: "manual", label: "人工待接管" },
  { key: "processing", label: "处置中" },
];

export default function SessionCard() {
  const { setActiveMenu, setPendingQuestion } = useApp();
  const [range, setRange] = useState("week");
  const [tab, setTab] = useState("all");

  // 首页发送(输入框发送或点击模板库直接发送):携带输入文字跳转到 AI 侧边栏,自动开始问答;
  // meta.tplName(模板库点击时携带)会作为会话标题
  const handleSend = (text, meta) => {
    setPendingQuestion({
      text,
      title: meta && meta.tplName ? meta.tplName : null,
    });
    setActiveMenu("ai");
  };

  const counts = useMemo(
    () => ({
      all: ATTENTION_ITEMS.length,
      manual: ATTENTION_ITEMS.filter((i) => i.status === "manual").length,
      processing: ATTENTION_ITEMS.filter((i) => i.status === "processing").length,
    }),
    []
  );

  const list = useMemo(
    () => ATTENTION_ITEMS.filter((i) => tab === "all" || i.status === tab),
    [tab]
  );

  return (
    <section className="session-card">
      <div className="session-main">
        {/* 五色石动图:定位在背景图的发光位置(像素亮度分析:水平居中,纵向约 8.4%) */}
        <img
          className="session-gem"
          src="./assets/uploads/aico-gem.gif"
          alt=""
          aria-hidden="true"
        />
        {/* 区域一:标题 + 时间范围下拉(无边框,白字 + 下拉图标) */}
        <header className="session-head">
          <h2 className="session-title">单域网络智能体</h2>
          <Dropdown
            trigger={["click"]}
            overlayClassName="range-dd-menu"
            popupClassName="range-dd-menu"
            menu={{
              items: RANGE_OPTIONS.map((o) => ({
                key: o.value,
                label: (
                  /* 内联字号,确保 12px 不被 antd 运行时样式弹回 14px */
                  <span
                    style={{
                      fontSize: "var(--font-size-base)",
                      lineHeight: "2rem",
                    }}
                  >
                    {o.label}
                  </span>
                ),
              })),
              selectedKeys: [range],
              onClick: ({ key }) => setRange(key),
              /* 菜单根节点内联样式:优先级最高,深色卡片底必定生效 */
              style: {
                background: "var(--surface-container-high)",
                borderRadius: "0.75rem",
                padding: "0.25rem",
                boxShadow: "var(--shadow-popover)",
              },
            }}
          >
            <button type="button" className="range-dd">
              {RANGE_OPTIONS.find((o) => o.value === range)?.label}
              <Icon name="chevron-down" size="0.875rem" />
            </button>
          </Dropdown>
        </header>

        {/* 区域二:守护概览(左文本 + 右示意图片) */}
        <div className="session-hero">
          <div className="session-hero-text">
            <div className="hero-title">
              本周处理 <em className="hero-num">465</em> 件
            </div>
            <p className="hero-line">
              当前网络状态良好，已经连续守护<strong className="hero-strong">158</strong> 天
            </p>
            <p className="hero-line">累计共处置1465个事件。</p>
          </div>
          <img
            className="hero-art"
            src="./assets/uploads/work.png"
            alt="网络守护示意"
          />
        </div>

        {/* 区域三:左右指标小卡片 */}
        <div className="session-metrics">
          <div className="metric-card">
            <div className="metric-head">
              <span className="metric-icon is-fault">
                <Icon name="wrench" size="0.875rem" />
              </span>
              <span className="metric-title">故障自处置</span>
            </div>
            <div className="metric-value">12/24/20</div>
            <div className="metric-label">待分析/分析中/已处置</div>
          </div>
          <div className="metric-card">
            <div className="metric-head">
              <span className="metric-icon is-network">
                <Icon name="network" size="0.875rem" />
              </span>
              <span className="metric-title">网络配置辅助生成</span>
            </div>
            <div className="metric-value">4/12</div>
            <div className="metric-label">处置中/处置完成</div>
          </div>
        </div>

        {/* 区域四:待您关注(标题 + 胶囊tab + 数据列表) */}
        <div className="session-attention">
          <div className="attention-head">
            <h3 className="attention-title">待您关注</h3>
            <a
              className="attention-more"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              更多
            </a>
          </div>
          <div className="pill-tabs">
            {ATTENTION_TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                className={t.key === tab ? "pill-tab is-active" : "pill-tab"}
                onClick={() => setTab(t.key)}
              >
                {t.label}
                <span className="pill-count">{counts[t.key]}</span>
              </button>
            ))}
          </div>
          <div className="attention-list">
            {list.map((item) => (
              <div key={item.key} className="attention-card">
                <div className="attention-top">
                  <span className={`attention-icon ${item.iconTone}`}>
                    <Icon name="bot" size="1rem" />
                  </span>
                  <div className="attention-card-title">{item.title}</div>
                </div>
                <div className="attention-bottom">
                  <Icon name="map-pin" size="0.875rem" />
                  <div className="attention-card-desc" title={item.desc}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 底部:AI 输入框(背景图区域内,固定最底部;发送后带文字跳转 AI 会话) */}
        <Composer onSend={handleSend} />
      </div>
    </section>
  );
}
