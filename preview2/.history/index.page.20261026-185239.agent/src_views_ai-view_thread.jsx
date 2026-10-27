import { useEffect, useRef } from "react";
import AnswerCard from "./answer-card.jsx";

// 对话流:每组问答 = 顶部居中时间 + 右侧用户蓝色卡片(三圆角) + AI 回答卡片
export default function Thread({ exchanges, onDone, onRestart }) {
  const listRef = useRef(null);

  // 内容增长(打印/阶段推进)时保持滚动到底部
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  });

  return (
    <div className="ai-thread" ref={listRef}>
      {exchanges.map((ex) => (
        <div key={ex.id} className="ai-exchange">
          <div className="ai-chat-time">{ex.time}</div>
          <div className="ai-msg-user">{ex.question}</div>
          <AnswerCard onDone={onDone} onRestart={onRestart} />
        </div>
      ))}
    </div>
  );
}
