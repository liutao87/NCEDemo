import { useState } from "react";
import { Icon } from "../../../assets/shared/icon.jsx";
import { useApp } from "../../context.jsx";
import { AI_CARD_GROUPS } from "../../mock/ai-chat.js";
import Composer from "../session-card/composer.jsx";
import "./index.css";

// Layer 4: AI 会话 — 左侧 540px × 100% 会话卡片
// 结构:顶部导航栏(50px) + 会话中心(水平垂直居中) + 底部 AI 输入框(始终展开)
export default function AiChat({ title = "" }) {
  const { setActiveMenu } = useApp();
  const [groupIndex, setGroupIndex] = useState(0);
  const cards = AI_CARD_GROUPS[groupIndex];

  const refreshCards = () =>
    setGroupIndex((i) => (i + 1) % AI_CARD_GROUPS.length);

  return (
    <section className="ai-chat">
      {/* 顶部导航栏:返回 + 会话标题(无标题则不展示) | 更多 */}
      <nav className="ai-nav">
        <div className="ai-nav-left">
          <button
            type="button"
            className="ai-nav-btn"
            title="返回"
            onClick={() => setActiveMenu("overview")}
          >
            <Icon name="arrow-left" size="1rem" />
          </button>
          {title ? <span className="ai-nav-title">{title}</span> : null}
        </div>
        <button type="button" className="ai-nav-btn" title="更多">
          <Icon name="ellipsis" size="1rem" />
        </button>
      </nav>

      {/* 会话中心:水平垂直居中 */}
      <div className="ai-center">
        <div className="ai-brand">
          <img
            className="ai-gem"
            src="./assets/uploads/aico-gem.svg"
            alt="Aico 五色石"
          />
          <span className="ai-brand-name">Aico</span>
        </div>
        <p className="ai-intro">我是Aico，可以帮你解决以下问题</p>
        <div className="ai-scene-bar">
          <span className="ai-scene-title">智能运维场景</span>
          <button type="button" className="ai-refresh" onClick={refreshCards}>
            <Icon name="refresh-cw" size="0.875rem" />
            <span>换一批</span>
          </button>
        </div>
        <div className="ai-cards">
          {cards.map((card) => (
            <div key={card.key} className="ai-card">
              <span className="ai-card-icon">
                <Icon name={card.icon} size="1.75rem" />
              </span>
              <div className="ai-card-body">
                <div className="ai-card-title">{card.title}</div>
                <div className="ai-card-desc">{card.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 底部:AI 输入框(与总览展开态一致,始终为大输入框) */}
      <Composer defaultExpanded />
    </section>
  );
}
