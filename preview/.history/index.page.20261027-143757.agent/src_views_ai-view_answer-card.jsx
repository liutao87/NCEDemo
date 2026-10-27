import { useEffect, useRef, useState } from "react";
import { Button, Steps } from "antd";
import { Icon } from "../../../assets/shared/icon.jsx";
import { useApp } from "../../context.jsx";
import {
  AI_THINKING_TEXT,
  AI_FINAL_RESULT,
  AI_TASK_PLAN,
  AI_STEP_CHIPS,
} from "../../mock/ai-chat.js";
import { FLOW_TIMING } from "../../mock/change-flow.js";
import { useTypewriter } from "./use-typewriter.js";

// 阶段顺序表:用于判断某个区块是否已进入展示时机
const STAGE_SEQ = [
  "wait",
  "thinking",
  "thinkDone",
  "skill",
  "steps",
  "orchestrate",
  "plancard",
  "confirm",
  "runMore",
  "result",
  "done",
];
const atLeast = (stage, target) =>
  STAGE_SEQ.indexOf(stage) >= STAGE_SEQ.indexOf(target);

// 步骤条数据:确认前运行第 0-1 步,用户点击「确认」后继续第 2-7 步(与右侧流程卡片同内容)
// 图标统一为成功色 16px 圆点(完成态白勾,进行中呼吸,等待态半透明)
const STEP_ITEMS = [
  {
    title: "网络资源确定",
    icon: <span className="ac-step-icon" />,
    description: (
      <div className="ac-chips">
        {AI_STEP_CHIPS.map((chip) => (
          <span key={chip.label} className="ac-chip">
            <Icon name={chip.icon} size="0.75rem" />
            <span>{chip.label}</span>
          </span>
        ))}
      </div>
    ),
  },
  { title: "任务编排", icon: <span className="ac-step-icon" />, description: "解析意图依赖，编排执行链路与执行顺序" },
  { title: "配置生成", icon: <span className="ac-step-icon" />, description: "按安全基线模板批量生成设备配置脚本" },
  { title: "语法校验", icon: <span className="ac-step-icon" />, description: "CLI 语法与模板变量合法性校验" },
  { title: "配置审核", icon: <span className="ac-step-icon" />, description: "安全策略基线核对与人工复核抽检" },
  { title: "一致性校验", icon: <span className="ac-step-icon" />, description: "主备双机配置一致性比对" },
  { title: "变更方案编排", icon: <span className="ac-step-icon" />, description: "生成变更窗口、执行顺序与回退预案" },
  { title: "结果下发", icon: <span className="ac-step-icon" />, description: "下发变更方案并输出执行报告" },
];

// 打印中文字的渲染:文字保持原色,上方覆盖一层与原文完全重叠的
// 小矩形渐变蒙层(青→蓝→紫→粉),仅末端约 11em 露出彩色光带,
// 光带随打印推进不断向前滑动(见 .tw-veil 样式)
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

// 打印文本渲染:按行拆分;打印中的末行覆盖渐变蒙层 + 蓝色光标闪烁
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

// 规划清单条目打印:active 为真才开始打印,完成后解锁下一条
function PlanItemText({ text, active, onDone }) {
  const { shown, done } = useTypewriter(text, { speed: 1, enabled: active });

  useEffect(() => {
    if (done && active && onDone) onDone();
  }, [done, active]);

  return <span className="tw-live">{liveContent(shown, active && !done)}</span>;
}

// 结果卡片:彩色文档图标 + 标题/待决策标签/下载 + 时间描述 + 确认/忽略按钮
function ResultCard() {
  const [status, setStatus] = useState(null); // null | confirmed | ignored

  return (
    <div className="ac-result-card reveal">
      {/* 彩色文档图标(32×32,蓝色渐变纸面 + 折角 + W 字与纹理线条) */}
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
        {/* 第一行:标题 + 待决策标签 | 下载 + 竖线 + 下拉图标 */}
        <div className="rc-head">
          <span className="rc-title">配置详情 V1.0</span>
          <span className="rc-tag">待决策</span>
          <span className="rc-head-actions">
            <button type="button" className="rc-download">下载</button>
            <span className="rc-v-divider" />
            <Icon name="chevron-down" size="0.875rem" className="rc-caret" />
          </span>
        </div>

        {/* 第二行:时间 + 方案描述(超长省略) */}
        <p className="rc-desc">
          2026-06-23 13:56:32｜方案描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述…
        </p>

        {/* 第三行:确认 / 忽略(点击后收敛为状态文案) */}
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
// 思考(逐字打印→自动折叠) → 任务拆解与规划(技能选择匹配 + 步骤条 + 总任务规划清单)
// → 确认提示(点击确认才继续) → 步骤续跑并整段折叠 → 最终结果逐字打印 → 底部操作条
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
  const [cancelShake, setCancelShake] = useState(false);
  const [copied, setCopied] = useState(false);
  const [vote, setVote] = useState(0);
  // 规划清单条目逐条打印的进度(前 typedPlanCount 条可打印)
  const [typedPlanCount, setTypedPlanCount] = useState(1);
  // 确认问题打印完成后才显示按钮
  const [confirmTyped, setConfirmTyped] = useState(false);

  const cbRef = useRef({ onDone, onRestart });
  cbRef.current = { onDone, onRestart };

  // 问答流程中内容持续增长(逐字打印/步骤推进/底部操作条):
  // 随本卡片每次渲染,把所在对话流滚动到底部,避免新增内容被折叠线遮住、
  // 卡片底部圆角与操作条显示不全
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
        setThinkOpen(false); // 思考完成自动折叠思考文案
        setStage("thinkDone");
      }, 700);
    } else if (stage === "thinkDone") {
      later(() => setStage("skill"), 500);
    } else if (stage === "skill") {
      later(() => {
        setSkillDone(true);
        setStepIndex(0);
        setStage("steps");
      }, 900);
    } else if (stage === "steps") {
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
        setStage("confirm"); // 停在这里,等待用户确认
      }, 1000);
    } else if (stage === "runMore") {
      // 与右侧 ChangeFlow 流程组件共用同一条时间线(FLOW_TIMING):
      // 右侧卡片 i 完成时刻 = appearDelay + i*cycle + loadingMs,
      // 每张卡片完成时左侧步骤条同步前进一步,两边同时到达完成/结束
      const cycle =
        FLOW_TIMING.loadingMs + FLOW_TIMING.revealMs + FLOW_TIMING.arrowGapMs;
      const cardDoneAt = (i) =>
        FLOW_TIMING.appearDelay + i * cycle + FLOW_TIMING.loadingMs;
      const totalCards = STEP_ITEMS.length - 2; // 确认后执行的步骤:配置生成/配置审核/结果下发
      later(() => setStepIndex(2), 400); // 开始执行「配置生成」(右侧卡片即将出现)
      for (let i = 0; i < totalCards; i++) {
        later(() => setStepIndex(2 + i + 1), cardDoneAt(i)); // 卡片 i 完成 → 下一步
      }
      later(
        () => {
          setPlanOpen(false); // 与右侧「结束」端子同时,整段折叠进入结果打印
          setStage("result");
        },
        FLOW_TIMING.appearDelay + totalCards * cycle + 200
      );
    } else if (stage === "result" && result.done) {
      setStage("done");
      if (cbRef.current.onDone) cbRef.current.onDone();
    }

    return () => timers.forEach((t) => clearTimeout(t));
  }, [stage, think.done, result.done]);

  const handleConfirm = () => {
    setShowConfirm(false);
    setStage("runMore");
    // 右侧画布由「内容生成中」切换为配置变更流程组件
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
    setCopied(false);
    setVote(0);
    setTypedPlanCount(1);
    setConfirmTyped(false);
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
          <Icon name="loader-circle" size="1rem" className="is-spin" />
          <span>正在接收问题…</span>
        </div>
      </div>
    );
  }

  const thinking = stage === "thinking";

  return (
    <div className="answer-card" ref={rootRef}>
      {/* 一、思考过程(可折叠:思考图标 + 文案 + 折叠图标,打印完成后自动折叠) */}
      <div className="ac-section">
        <button
          type="button"
          className="ac-section-head"
          onClick={() => setThinkOpen((o) => !o)}
          title={thinkOpen ? "折叠思考过程" : "展开思考过程"}
        >
          <span className={thinking ? "ac-lead-icon is-live" : "ac-lead-icon"}>
            <Icon name="brain" size="0.875rem" />
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

      {/* 二、任务拆解与规划 */}
      {atLeast(stage, "skill") ? (
        <div className="ac-block reveal">
          <div className="ac-block-label">
            <span className="ac-lead-icon is-ok">
              <Icon name="workflow" size="0.875rem" />
            </span>
            <span className="ac-block-name">
              <TwText text="任务拆解与规划" />
            </span>
          </div>

          {/* 第一个小步骤:技能选择匹配【意图分解】(图标 + 逐字打印文案 + 折叠按钮) */}
          <div className="ac-section">
            <button
              type="button"
              className="ac-section-head"
              onClick={() => setPlanOpen((o) => !o)}
              title={planOpen ? "折叠执行详情" : "展开执行详情"}
            >
              <span className="ac-lead-icon">
                <Icon name="puzzle" size="0.875rem" />
              </span>
              <span className="ac-section-title">
                <TwText text="技能选择匹配【意图分解】" />
              </span>
              <span className="ac-head-state">
                {skillDone ? (
                  <Icon name="check" size="0.875rem" className="ac-done" />
                ) : (
                  <Icon
                    name="loader-circle"
                    size="0.875rem"
                    className="is-spin"
                  />
                )}
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
                {atLeast(stage, "steps") ? (
                  <Steps
                    className="ac-steps"
                    direction="vertical"
                    size="small"
                    current={stepIndex}
                    items={STEP_ITEMS}
                  />
                ) : null}

                {/* 总任务规划清单小卡片(标题 + 折叠按钮 + 提示文案 + 逐条打印的清单内容) */}
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
                    <div className="plan-card-hint">
                      <Icon name="circle-check-big" size="0.875rem" />
                      <TwText
                        text="任务编排已完成，清单与规划已生成"
                        speed={2}
                      />
                    </div>
                    {planCardOpen ? (
                      <ol className="plan-list">
                        {AI_TASK_PLAN.map((item, i) => (
                          <li
                            key={item}
                            className={i < typedPlanCount ? "" : "is-hidden"}
                          >
                            <span className="plan-idx">{i + 1}</span>
                            <span>
                              <PlanItemText
                                text={item}
                                active={i < typedPlanCount}
                                onDone={() =>
                                  setTypedPlanCount((c) => Math.max(c, i + 2))
                                }
                              />
                            </span>
                          </li>
                        ))}
                      </ol>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* 确认提示:问题逐字打印,打印完成后出现按钮;点击「确认」后流程才继续 */}
      {showConfirm ? (
        <div className={cancelShake ? "ac-confirm is-shake" : "ac-confirm"}>
          <div className="ac-confirm-text">
            <TwText
              text="请确认是否按照总任务规划清单执行？"
              onDone={() => setConfirmTyped(true)}
            />
          </div>
          {confirmTyped ? (
            <div className="ac-confirm-btns">
              <Button type="primary" size="small" onClick={handleConfirm}>
                确认
              </Button>
              <Button size="small" onClick={handleCancel}>
                取消
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* 三、最终生成结果(逐字打印 + 蓝色光效) */}
      {atLeast(stage, "result") ? (
        <div className="ac-result">
          <TwBlock shown={result.shown} typing={stage === "result"} />
        </div>
      ) : null}

      {/* 四、结果卡片:结果输出完成后展示(配置详情文档 + 确认/忽略) */}
      {stage === "done" ? <ResultCard /> : null}

      {/* 五、底部操作条:左耗时 | 右五图标(刷新/复制/赞/踩/更多) */}
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
              <Icon name="refresh-cw" size="0.875rem" />
            </button>
            <button
              type="button"
              className="ac-action"
              title={copied ? "已复制" : "复制结果"}
              onClick={handleCopy}
            >
              <Icon name={copied ? "check" : "copy"} size="0.875rem" />
            </button>
            <button
              type="button"
              className={vote === 1 ? "ac-action is-on" : "ac-action"}
              title="点赞"
              onClick={() => setVote((v) => (v === 1 ? 0 : 1))}
            >
              <Icon name="thumbs-up" size="0.875rem" />
            </button>
            <button
              type="button"
              className={vote === 2 ? "ac-action is-on" : "ac-action"}
              title="踩"
              onClick={() => setVote((v) => (v === 2 ? 0 : 2))}
            >
              <Icon name="thumbs-down" size="0.875rem" />
            </button>
            <button type="button" className="ac-action" title="更多">
              <Icon name="ellipsis" size="0.875rem" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
