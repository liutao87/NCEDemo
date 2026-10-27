import { useEffect, useRef, useState } from "react";
import { Steps } from "antd";
import { Icon } from "../../../assets/shared/icon.jsx";
import { useApp } from "../../context.jsx";
import {
  AI_THINKING_TEXT,
  AI_NETRES_DESC,
  AI_NETRES_TAGS,
  AI_TASK_PLAN,
  AI_FINAL_RESULT,
} from "../../mock/ai-chat.js";
import { LEAF_STEPS, FLOW_TIMING } from "../../mock/change-flow.js";

// 每个匹配动作对应的不同实色图标 + 颜色(彩色,每个不一样)
const ACTION_ICON_STYLES = [
  { icon: "search", color: "#5ca2e9" },
  { icon: "plus", color: "#a78bfa" },
  { icon: "link", color: "#55ccd9" },
  { icon: "git-branch", color: "#f69e39" },
  { icon: "settings", color: "#8ecf5c" },
  { icon: "network", color: "#ed448a" },
  { icon: "send", color: "#f4840c" },
];
import { useTypewriter } from "./use-typewriter.js";

// 阶段顺序表:用于判断某个区块是否已进入展示时机
const STAGE_SEQ = [
  "wait",
  "thinking",
  "thinkDone",
  "skill",
  "steps1",
  "orchestrate",
  "plancard",
  "confirm",
  "runSync",
  "result",
  "done",
];
const atLeast = (stage, target) =>
  STAGE_SEQ.indexOf(stage) >= STAGE_SEQ.indexOf(target);

// 与右侧流程组件同步的小步骤数据(由 LEAF_STEPS 派生,数量一致)
const SMALL_STEPS = LEAF_STEPS.map((s, i) => ({
  no: i + 1,
  title: s.type === "branch" ? s.condition : s.title,
  subs:
    s.type === "branch"
      ? ["条件分支", "判断设备版本并路由"]
      : i === 0
        ? ["固定步骤", "获取设备的厂商、型号等信息"]
        : ["固定步骤", s.action],
}));

// 推导动作参数表格数据(与右侧流程步骤同数量)
const ACTION_ROWS = LEAF_STEPS.map((s, i) => ({
  action: s.action,
  step: `${i + 1}.${s.type === "branch" ? s.condition : s.title}`,
  param: (s.params && s.params[0]) || "—",
}));

// 打印中文字的渲染:文字保持原色,上方覆盖一层与原文完全重叠的
// 小矩形渐变蒙层(青→蓝→紫→粉),仅末端约 11em 露出彩色光带
function liveContent(text, typing) {
  if (!typing || !text) return text;
  return (
    <>
      {text}
      <span className="tw-caret" />
      <span className="tw-veil" aria-hidden="true">
        {text}
      </span>
    </>
  );
}

// 打印文本渲染:按行拆分;打印中的末行覆盖渐变蒙层 + 光标闪烁
function TwBlock({ shown, typing }) {
  const lines = shown.split("\n");
  return (
    <div className="ac-tw">
      {lines.map((line, idx) => {
        const live = typing && idx === lines.length - 1;
        const cls = [
          line.indexOf("· ") === 0 ? "is-item" : "",
          live ? "is-live" : "",
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <p key={idx} className={cls ? `ac-tw-line ${cls}` : "ac-tw-line"}>
            {live ? liveContent(line, true) : line || "\u00A0"}
          </p>
        );
      })}
    </div>
  );
}

// 小段文字打印组件(挂载即开始逐字打印,打印完成回调 onDone)
function TwText({ text, speed = 1, onDone }) {
  const { shown, done } = useTypewriter(text, { speed });
  const firedRef = useRef(false);

  useEffect(() => {
    if (done && !firedRef.current) {
      firedRef.current = true;
      if (onDone) onDone();
    }
  }, [done]);

  return <span className="tw-live">{liveContent(shown, !done)}</span>;
}

// ---------- 步骤一:网络资源确定 描述 ----------
function NetResDesc() {
  return (
    <div className="ac-netres">
      <div className="ac-netres-line">
        <Icon name="file-text" size="0.75rem" className="ac-netres-file" />
        <span className="ac-netres-text">{AI_NETRES_DESC}</span>
      </div>
      <div className="ac-netres-tags">
        {AI_NETRES_TAGS.map((t) => (
          <span key={t.label} className="ac-netres-tag">
            <Icon name={t.icon} size="0.75rem" />
            <span>{t.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------- 步骤三:规划步骤生成(与右侧流程同步加载的小步骤) ----------
function SmallStepsList({ shown }) {
  return (
    <div className="ac-small-steps">
      {SMALL_STEPS.slice(0, shown).map((s) => (
        <div key={s.no} className="ac-small-step">
          <div className="ac-small-title">
            {s.no}.{s.title}
          </div>
          {s.subs.map((sub, i) => (
            <div key={i} className="ac-small-sub">
              <span className={i === 0 ? "ac-small-dot" : "ac-small-dot is-dim"} />
              <span>{sub}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ---------- 步骤四:推导动作参数(表格区域) ----------
function ActionTable() {
  return (
    <div className="ac-table">
      <div className="ac-table-head">
        <span className="ac-table-hcell is-action">匹配动作</span>
        <span className="ac-table-hcell is-step">对应步骤</span>
        <span className="ac-table-hcell is-param">匹配参数</span>
      </div>
      {ACTION_ROWS.map((r, i) => {
        const iconStyle = ACTION_ICON_STYLES[i % ACTION_ICON_STYLES.length];
        return (
          <div
            key={i}
            className="ac-table-row"
            style={{ animationDelay: `${i * 150}ms` }}
          >
            <span className="ac-table-cell is-action">
              <span className="ac-table-chip">
                <Icon
                  name={iconStyle.icon}
                  size="0.75rem"
                  color={iconStyle.color}
                  strokeWidth={2.5}
                />
                {r.action}
              </span>
            </span>
            <span className="ac-table-cell is-step">{r.step}</span>
            <span className="ac-table-cell is-param">
              <span className="ac-table-chip is-bare">{r.param}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

// 结果卡片:彩色文档图标 + 标题/待决策标签/下载 + 时间描述 + 确认/忽略按钮
function ResultCard() {
  const [status, setStatus] = useState(null); // null | confirmed | ignored

  return (
    <div className="ac-result-card reveal">
      <svg
        className="rc-doc-icon"
        width="32"
        height="32"
        viewBox="0 0 32 32"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="rc-doc-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4f8bff" />
            <stop offset="100%" stopColor="#1e5fd8" />
          </linearGradient>
        </defs>
        <rect x="5" y="2" width="22" height="28" rx="3" fill="url(#rc-doc-grad)" />
        <path d="M20 2 L27 9 L20 9 Z" fill="rgba(255, 255, 255, 0.35)" />
        <text
          x="16"
          y="19.5"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="700"
          fill="#ffffff"
          fontFamily="inherit"
        >
          W
        </text>
        <rect x="9" y="23" width="6" height="1.5" rx="0.75" fill="rgba(255, 255, 255, 0.55)" />
        <rect x="17" y="23" width="6" height="1.5" rx="0.75" fill="rgba(255, 255, 255, 0.3)" />
      </svg>

      <div className="rc-body">
        <div className="rc-head">
          <span className="rc-title">配置详情 V1.0</span>
          <span className="rc-tag">待决策</span>
          <span className="rc-head-actions">
            <button type="button" className="rc-download">下载</button>
            <span className="rc-v-divider" />
            <Icon name="chevron-down" size="0.875rem" className="rc-caret" />
          </span>
        </div>

        <p className="rc-desc">
          2026-06-23 13:56:32｜方案描述描述描述描述描述描述描述描述描述描述描述描述描述…
        </p>

        {status === null ? (
          <div className="rc-btns">
            <button type="button" className="rc-confirm" onClick={() => setStatus("confirmed")}>
              确认
            </button>
            <button type="button" className="rc-ignore" onClick={() => setStatus("ignored")}>
              忽略
            </button>
          </div>
        ) : (
          <div className={status === "confirmed" ? "rc-status is-ok" : "rc-status"}>
            {status === "confirmed" ? "已确认" : "已忽略"}
          </div>
        )}
      </div>
    </div>
  );
}

// AI 回答卡片流程:
// 思考(逐字打印→自动折叠) → 任务拆解与规划(技能选中匹配 + 子思考 + 四步步骤条:
// 网络资源确定 → 任务编排(规划清单+确认) → 规划步骤生成(与右侧同步) → 推导动作参数(表格))
// → 整段折叠 → 最终结果逐字打印 → 结果卡片 → 底部操作条
export default function AnswerCard({ onDone, onRestart }) {
  const { launchAiFlow } = useApp();
  const [stage, setStage] = useState("wait");
  const [runKey, setRunKey] = useState(0);
  const [thinkOpen, setThinkOpen] = useState(true);
  const [planOpen, setPlanOpen] = useState(true);
  const [planCardOpen, setPlanCardOpen] = useState(true);
  const [skillDone, setSkillDone] = useState(false);
  const [stepIndex, setStepIndex] = useState(-1);
  const [showPlanCard, setShowPlanCard] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [smallShown, setSmallShown] = useState(0);
  const [showTable, setShowTable] = useState(false);
  const [cancelShake, setCancelShake] = useState(false);
  const [copied, setCopied] = useState(false);
  const [vote, setVote] = useState(0);

  const cbRef = useRef({ onDone, onRestart });
  cbRef.current = { onDone, onRestart };

  // 问答流程中内容持续增长:随本卡片每次渲染,把所在对话流滚动到底部
  const rootRef = useRef(null);
  useEffect(() => {
    const el = rootRef.current && rootRef.current.closest(".ai-thread");
    if (el) el.scrollTop = el.scrollHeight;
  });

  const think = useTypewriter(AI_THINKING_TEXT, {
    runKey,
    speed: 1,
    enabled: stage === "thinking",
  });
  const result = useTypewriter(AI_FINAL_RESULT, {
    runKey,
    speed: 2,
    enabled: stage === "result",
  });

  // 阶段推进:confirm 阶段等待用户点击确认,其余阶段定时自动流转
  useEffect(() => {
    const timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));

    if (stage === "wait") {
      later(() => setStage("thinking"), 400);
    } else if (stage === "thinking" && think.done) {
      later(() => {
        setThinkOpen(false); // 思考完成自动折叠
        setStage("thinkDone");
      }, 700);
    } else if (stage === "thinkDone") {
      later(() => setStage("skill"), 500);
    } else if (stage === "skill") {
      later(() => {
        setSkillDone(true);
        setStepIndex(0);
        setStage("steps1"); // 技能匹配完成,步骤条直接出现
      }, 900);
    } else if (stage === "steps1") {
      later(() => {
        setStepIndex(1);
        setStage("orchestrate");
      }, 1100);
    } else if (stage === "orchestrate") {
      later(() => {
        setShowPlanCard(true);
        setStage("plancard");
      }, 900);
    } else if (stage === "plancard") {
      later(() => {
        setShowConfirm(true);
        setStage("confirm"); // 等清单完整展示后再出现确认选项
      }, 1500);
    } else if (stage === "runSync") {
      // 与右侧 ChangeFlow 共用同一条时间线(FLOW_TIMING):
      // 右侧卡片 i 完成时刻 = appearDelay + i*cycle + loadingMs,逐个同步展示小步骤
      const cycle =
        FLOW_TIMING.loadingMs + FLOW_TIMING.revealMs + FLOW_TIMING.arrowGapMs;
      const cardDoneAt = (i) =>
        FLOW_TIMING.appearDelay + i * cycle + FLOW_TIMING.loadingMs;
      const total = SMALL_STEPS.length;
      for (let i = 0; i < total; i++) {
        later(() => setSmallShown(i + 1), cardDoneAt(i));
      }
      const lastDone = cardDoneAt(total - 1);
      later(() => {
        setStepIndex(3); // 进入第四步:推导动作参数
        setShowTable(true);
      }, lastDone + 600);
      later(() => setStepIndex(4), lastDone + 600 + total * 150 + 400);
      later(
        () => {
          setPlanOpen(false); // 全部完成,任务拆解与规划整段折叠
          setStage("result");
        },
        lastDone + 600 + total * 150 + 1000
      );
    } else if (stage === "result" && result.done) {
      setStage("done");
      if (cbRef.current.onDone) cbRef.current.onDone();
    }

    return () => timers.forEach((t) => clearTimeout(t));
  }, [stage, think.done, result.done]);

  const handleConfirm = () => {
    setShowConfirm(false);
    setStage("runSync");
    setStepIndex(2);
    // 右侧画布由「内容生成中」切换为配置变更流程组件(与左侧小步骤同步加载)
    launchAiFlow();
  };

  const handleCancel = () => {
    // 未确认时流程停在原地,取消按钮轻微抖动提示
    setCancelShake(true);
    setTimeout(() => setCancelShake(false), 500);
  };

  const handleRefresh = () => {
    setThinkOpen(true);
    setPlanOpen(true);
    setPlanCardOpen(true);
    setSkillDone(false);
    setStepIndex(-1);
    setShowPlanCard(false);
    setShowConfirm(false);
    setSmallShown(0);
    setShowTable(false);
    setCopied(false);
    setVote(0);
    setRunKey((k) => k + 1);
    setStage("wait");
    if (cbRef.current.onRestart) cbRef.current.onRestart();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(AI_FINAL_RESULT);
    } catch (e) {
      // 剪贴板不可用时静默降级,仍给出已复制反馈
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // 发送后短暂等待:提示正在接收问题
  if (stage === "wait") {
    return (
      <div className="answer-card" ref={rootRef}>
        <div className="ac-wait">
          <span className="ac-lead-icon is-thinking">
            <Icon name="sparkles" size="1rem" />
          </span>
          <span>正在接收问题…</span>
        </div>
      </div>
    );
  }

  const thinking = stage === "thinking";

  // 步骤条四步(确认前仅展示前两步,确认后第三/四步逐步加载)
  const stepItems = [
    {
      title: "网络资源确定",
      icon: <span className="ac-step-icon" />,
      description: <NetResDesc />,
    },
    {
      title: "任务编排",
      icon: <span className="ac-step-icon" />,
      description: atLeast(stage, "orchestrate") ? (
        <div className="ac-orchestrate">
          <div className="ac-orch-line">
            <Icon name="check" size="0.875rem" className="ac-orch-check" />
            <TwText text="任务编排已完成，清单与规划已生成" speed={2} />
          </div>
          {showPlanCard ? (
            <div className="plan-card">
              <div className="plan-card-head">
                <span className="plan-card-title">
                  <Icon name="clipboard-list" size="0.875rem" />
                  <TwText text="总任务规划清单" />
                </span>
                <button
                  type="button"
                  className="plan-fold"
                  title={planCardOpen ? "折叠清单" : "展开清单"}
                  onClick={() => setPlanCardOpen((o) => !o)}
                >
                  <Icon
                    name={planCardOpen ? "chevron-up" : "chevron-down"}
                    size="0.875rem"
                  />
                </button>
              </div>
              {planCardOpen ? (
                <ol className="plan-list">
                  {AI_TASK_PLAN.map((item, i) => (
                    <li
                      key={item}
                      style={{ animationDelay: `${100 * i}ms` }}
                    >
                      <span className="plan-idx">{i + 1}</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null,
    },
    // 以下两步确认后才出现,逐步加载
    {
      title: "规划步骤生成",
      icon: <span className="ac-step-icon" />,
      description: atLeast(stage, "runSync") ? (
        <SmallStepsList shown={smallShown} />
      ) : null,
    },
    {
      title: "推导动作参数",
      icon: <span className="ac-step-icon" />,
      description: showTable ? <ActionTable /> : null,
    },
  ];
  // 步骤条动态增长:确认前仅前两步 → 确认后加入第三步(小步骤与右侧同步加载)
  // → 第三步全部展示完成后才加入第四步(推导动作参数)
  const visibleItems = showTable
    ? stepItems
    : atLeast(stage, "runSync")
      ? stepItems.slice(0, 3)
      : stepItems.slice(0, 2);

  return (
    <div className="answer-card" ref={rootRef}>
      {/* 一、思考过程(可折叠,12px #939393,打印完成后自动折叠) */}
      <div className="ac-section">
        <button
          type="button"
          className="ac-section-head"
          onClick={() => setThinkOpen((o) => !o)}
          title={thinkOpen ? "折叠思考过程" : "展开思考过程"}
        >
          <span className={thinking ? "ac-lead-icon is-thinking" : "ac-lead-icon is-thinking-done"}>
            <Icon name={thinking ? "sparkles" : "check"} size="0.875rem" />
          </span>
          <span className="ac-section-title">
            {thinking ? "思考中" : "已完成思考"}
          </span>
          <span className="ac-head-toggle">
            <Icon
              name={thinkOpen ? "chevron-up" : "chevron-down"}
              size="0.875rem"
            />
          </span>
        </button>
        {thinkOpen ? (
          <div className="ac-think-body">
            <TwBlock shown={think.shown} typing={thinking} />
          </div>
        ) : null}
      </div>

      {/* 二、任务拆解与规划(技能选中匹配 + 四步步骤条) */}
      {atLeast(stage, "skill") ? (
        <div className="ac-block reveal">
          {/* 技能选中匹配【意图分解】(可折叠) */}
          <div className="ac-section">
            <button
              type="button"
              className="ac-section-head"
              onClick={() => setPlanOpen((o) => !o)}
              title={planOpen ? "折叠执行详情" : "展开执行详情"}
            >
              <span className={atLeast(stage, "result") ? "ac-lead-icon is-thinking-done" : "ac-lead-icon is-thinking"}>
                <Icon name={atLeast(stage, "result") ? "check" : "sparkles"} size="0.875rem" />
              </span>
              <span className="ac-section-title">
                <TwText text="技能选中匹配【意图分解】" />
              </span>
              <span className="ac-head-toggle">
                <Icon
                  name={planOpen ? "chevron-up" : "chevron-down"}
                  size="0.875rem"
                />
              </span>
            </button>
            {planOpen ? (
              <div className="ac-plan-body">
                {/* 四步步骤条:确认前仅前两步,确认后三/四步逐步加载 */}
                {atLeast(stage, "steps1") ? (
                  <Steps
                    className="ac-steps"
                    direction="vertical"
                    size="small"
                    current={stepIndex}
                    items={visibleItems}
                  />
                ) : null}

                {/* 确认提示:位于步骤条最下方,点击「确认」后流程才继续 */}
                {showConfirm ? (
                  <div
                    className={
                      cancelShake ? "ac-confirm is-shake" : "ac-confirm"
                    }
                  >
                    <div className="ac-confirm-text">
                      <TwText
                        text="请确认是否按照总任务规划清单执行？"
                        speed={1}
                      />
                    </div>
                    <div className="ac-confirm-btns">
                      <button
                        type="button"
                        className="rc-confirm"
                        onClick={handleConfirm}
                      >
                        确认
                      </button>
                      <button
                        type="button"
                        className="rc-ignore"
                        onClick={handleCancel}
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* 三、最终生成结果(逐字打印 + 彩色蒙层光带) */}
      {atLeast(stage, "result") ? (
        <div className="ac-result">
          <TwBlock shown={result.shown} typing={stage === "result"} />
        </div>
      ) : null}

      {/* 四、结果卡片:结果输出完成后展示(配置详情文档 + 确认/忽略) */}
      {stage === "done" ? <ResultCard /> : null}

      {/* 五、底部操作条:左耗时(12px #939393) | 右五图标(白色 20px,间距 20px) */}
      {stage === "done" ? (
        <div className="ac-footer">
          <span className="ac-cost">
            <Icon name="timer" size="0.75rem" />
            耗时1min50s
          </span>
          <div className="ac-actions">
            <button
              type="button"
              className="ac-action"
              title="重新生成"
              onClick={handleRefresh}
            >
              <Icon name="refresh-cw" size="1.25rem" />
            </button>
            <button
              type="button"
              className="ac-action"
              title={copied ? "已复制" : "复制结果"}
              onClick={handleCopy}
            >
              <Icon name={copied ? "check" : "copy"} size="1.25rem" />
            </button>
            <button
              type="button"
              className={vote === 1 ? "ac-action is-on" : "ac-action"}
              title="点赞"
              onClick={() => setVote((v) => (v === 1 ? 0 : 1))}
            >
              <Icon name="thumbs-up" size="1.25rem" />
            </button>
            <button
              type="button"
              className={vote === 2 ? "ac-action is-on" : "ac-action"}
              title="踩"
              onClick={() => setVote((v) => (v === 2 ? 0 : 2))}
            >
              <Icon name="thumbs-down" size="1.25rem" />
            </button>
            <button type="button" className="ac-action" title="更多">
              <Icon name="ellipsis" size="1.25rem" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
