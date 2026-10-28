import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { Icon } from "../../../assets/shared/icon.jsx";
import { useApp } from "../../context.jsx";
import { AI_CARD_GROUPS } from "../../mock/ai-chat.js";
import Composer from "../session-card/composer.jsx";
import Thread from "./thread.jsx";
import "./index.css";

// 从用户输入提炼简短会话标题:去口语前缀(请/帮我/我想…) → 取首个分句 → 超长截断
function summarizeTitle(text, maxLen = 14) {
  const clean = String(text).replace(/\s+/g, " ").trim();
  if (!clean) return "AI 对话";
  const stripped =
    clean.replace(/^(请|麻烦|帮我|帮忙|我想|我想要|我要|给我)/, "").trim() ||
    clean;
  const firstClause =
    stripped.split(/[，。！？；、:,.!?;\n]/)[0].trim() || stripped;
  return firstClause.length > maxLen
    ? `${firstClause.slice(0, maxLen)}…`
    : firstClause;
}

// Layer 4: AI 会话 — 左侧 540px × 100% 会话面板
// 未发送时:顶部导航 + 居中欢迎内容 + AI 输入框
// 发送后:顶部导航 + 对话流(时间/用户卡片/AI 回答卡片) + AI 输入框
// 导航标题为动态会话主题:默认「AI 对话」;模板发送取模板名,手动输入取提炼短标题
export default function AiChat() {
  const { setActiveMenu, startAiChat, pendingQuestion, setPendingQuestion } =
    useApp();
  const [groupIndex, setGroupIndex] = useState(0);
  const [exchanges, setExchanges] = useState([]);
  const [busy, setBusy] = useState(false);
  const [chatTitle, setChatTitle] = useState("AI 对话");
  const idRef = useRef(0);
  const cards = AI_CARD_GROUPS[groupIndex];

  const refreshCards = () =>
    setGroupIndex((i) => (i + 1) % AI_CARD_GROUPS.length);

  // 追加一组问答并触发右侧画布;标题优先取模板名,手动输入则提炼短标题
  const sendQuestion = (text, titleText) => {
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
    setChatTitle(titleText || summarizeTitle(text));
    startAiChat();
  };

  // 发送事件:清空输入框(composer 内处理),追加一组问答并触发右侧画布
  const handleSend = (text, meta) =>
    sendQuestion(text, meta && meta.tplName ? meta.tplName : "");

  // 首页输入框/模板库携带的内容:进入 AI 页后自动作为首条消息发送并开始问答
  // pendingQuestion 形如 { text, title },title 为模板名(可选) → 直接用作会话标题
  useEffect(() => {
    if (pendingQuestion) {
      sendQuestion(pendingQuestion.text, pendingQuestion.title || "");
      setPendingQuestion(null);
    }
  }, [pendingQuestion]);

  return (
    // 根节点带 dark 类:AI 面板固定深色皮肤(独立于应用主题),
    // 继承 dark.css 的 --color-* 深色值,antd 皮肤亦按 .dark 后代规则走深色
    <section className="ai-chat dark">
      {/* 顶部导航栏:返回 + 会话标题(无标题则不展示) | 更多 */}
      <nav className="ai-nav">
        <div className="ai-nav-left">
          <button
            type="button"
            className="ai-nav-btn"
            title="返回"
            onClick={() => setActiveMenu("overview")}
          >
            <Icon name="arrow-left" size="1.25rem" />
          </button>
          {chatTitle ? <span className="ai-nav-title">{chatTitle}</span> : null}
        </div>
        <button type="button" className="ai-nav-btn" title="更多">
          <Icon name="ellipsis" size="1.25rem" />
        </button>
      </nav>

      {/* 会话中心:发送前为欢迎区,发送后变为对话组件区域 */}
      {exchanges.length === 0 ? (
        <div className="ai-center">
          <div className="ai-brand">
            <img
              className="ai-gem"
              src="./assets/uploads/aico-gem.gif"
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
