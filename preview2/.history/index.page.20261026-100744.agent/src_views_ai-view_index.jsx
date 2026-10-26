import { useRef, useState } from "react";
import dayjs from "dayjs";
import { Icon } from "../../../assets/shared/icon.jsx";
import { useApp } from "../../context.jsx";
import { AI_CARD_GROUPS } from "../../mock/ai-chat.js";
import Composer from "../session-card/composer.jsx";
import Thread from "./thread.jsx";
import "./index.css";

// Layer 4: AI 会话 — 左侧 540px × 100% 会话面板
// 未发送时:顶部导航 + 居中欢迎内容 + AI 输入框
// 发送后:顶部导航 + 对话流(时间/用户卡片/AI 回答卡片) + AI 输入框
export default function AiChat({ title = "" }) {
  const { setActiveMenu, startAiChat } = useApp();
  const [groupIndex, setGroupIndex] = useState(0);
  const [exchanges, setExchanges] = useState([]);
  const [busy, setBusy] = useState(false);
  const idRef = useRef(0);
  const cards = AI_CARD_GROUPS[groupIndex];

  const refreshCards = () =>
    setGroupIndex((i) => (i + 1) % AI_CARD_GROUPS.length);

  // 发送事件:清空输入框(composer 内处理),追加一组问答并触发右侧画布
  const handleSend = (text) => {
    idRef.current += 1;
    setExchanges((prev) => [
      ...prev,
      {
        id: idRef.current,
        time: dayjs().format("YYYY年M月D日 HH:mm:ss"),
        question: text,
      },
    ]);
    setBusy(true);
    startAiChat();
  };

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

      {/* 会话中心:发送前为欢迎区,发送后变为对话组件区域 */}
      {exchanges.length === 0 ? (
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
      ) : (
        <Thread
          exchanges={exchanges}
          onDone={() => setBusy(false)}
          onRestart={() => setBusy(true)}
        />
      )}

      {/* 底部:AI 输入框(始终展开;回答生成中锁定发送) */}
      <Composer defaultExpanded busy={busy} onSend={handleSend} />
    </section>
  );
}
