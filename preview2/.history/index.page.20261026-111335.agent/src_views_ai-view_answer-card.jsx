import { useEffect, useRef, useState } from "react";
import { Button, Steps } from "antd";
import { Icon } from "../../../assets/shared/icon.jsx";
import {
  AI_THINKING_TEXT,
  AI_FINAL_RESULT,
  AI_TASK_PLAN,
  AI_STEP_CHIPS,
} from "../../mock/ai-chat.js";
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

// 步骤条数据:确认前运行第 0-1 步,用户点击「确认」后继续第 2-4 步
const STEP_ITEMS = [
  {
    title: "网络资源确定",
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
  { title: "任务编排", description: "解析意图依赖，编排执行链路与执行顺序" },
  { title: "配置生成", description: "按安全基线模板批量生成设备配置脚本" },
  { title: "配置审核", description: "语法校验与安全策略基线核对" },
  { title: "结果下发", description: "输出变更方案与回退预案" },
];

// 打印渐变尾迹长度(字符数):尾迹从旧到新透明度递增,边缘字符全亮并带光晕
const TRAIL_LEN = 8;

// 单行打印渲染:末尾 TRAIL_LEN 个字符为蓝色渐变尾迹,最后一字符带光晕脉冲
function typeLine(line, typing) {
  if (!typing || !line) return line;
  const k = Math.min(TRAIL_LEN, line.length);
  const head = line.slice(0, line.length - k);
  const tail = line.slice(line.length - k);
  return (
    <>
      {head}
      {tail.split("").map((ch, i) => {
        const isEdge = i === k - 1;
        return (
          <span
            key={`${ch}-${i}`}
            className={isEdge ? "tw-edge" : "tw-trail"}
            style={
              isEdge ? undefined : { opacity: 0.25 + (0.75 * i) / (k - 1) }
            }
          >
            {ch}
          </span>
        );
      })}
    </>
  );
}

// 打印文本渲染:按行拆分;打印中时末行带渐变尾迹 + 蓝色光标闪烁
function TwBlock({ shown, typing }) {
  const lines = shown.split("\n");
  return (
    <div className="ac-tw">
      {lines.map((line, idx) => {
        const isLast = idx === lines.length - 1;
        const cls =
          line.indexOf("· ") === 0 ? "ac-tw-line is-item" : "ac-tw-line";
        return (
          <p key={idx} className={cls}>
            {isLast ? typeLine(line, typing) : line || "\u00A0"}
            {typing && isLast ? <span className="tw-caret" /> : null}
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

  return (
    <>
      {typeLine(shown, !done)}
      {!done ? <span className="tw-caret" /> : null}
    </>
  );
}

// 规划清单条目打印:active 为真才开始打印,完成后解锁下一条
function PlanItemText({ text, active, onDone }) {
  const { shown, done } = useTypewriter(text, { speed: 1, enabled: active });

  useEffect(() => {
    if (done && active && onDone) onDone();
  }, [done, active]);

  return (
    <>
      {typeLine(shown, active && !done)}
      {active && !done ? <span className="tw-caret" /> : null}
    </>
  );
}

// AI 回答卡片流程:
// 思考(逐字打印→自动折叠) → 任务拆解与规划(技能选择匹配 + 步骤条 + 总任务规划清单)
// → 确认提示(点击确认才继续) → 步骤续跑并整段折叠 → 最终结果逐字打印 → 底部操作条
export default function AnswerCard({ onDone, onRestart }) {
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
      later(() => setStepIndex(2), 400);
      later(() => setStepIndex(3), 1400);
      later(() => setStepIndex(4), 2400);
      later(() => setStepIndex(STEP_ITEMS.length), 3400);
      later(() => {
        setPlanOpen(false); // 全部步骤完成,整段折叠
        setStage("result");
      }, 4400);
    } else if (stage === "result" && result.done) {
      setStage("done");
      if (cbRef.current.onDone) cbRef.current.onDone();
    }

    return () => timers.forEach((t) => clearTimeout(t));
  }, [stage, think.done, result.done]);

  const handleConfirm = () => {
    setShowConfirm(false);
    setStage("runMore");
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
      <div className="answer-card">
        <div className="ac-wait">
          <Icon name="loader-circle" size="1rem" className="is-spin" />
          <span>正在接收问题…</span>
        </div>
      </div>
    );
  }

  const thinking = stage === "thinking";

  return (
    <div className="answer-card">
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

      {/* 确认提示:点击「确认」后流程才继续,否则停在原地 */}
      {showConfirm ? (
        <div className={cancelShake ? "ac-confirm is-shake" : "ac-confirm"}>
          <div className="ac-confirm-text">
            请确认是否按照总任务规划清单执行？
          </div>
          <div className="ac-confirm-btns">
            <Button type="primary" size="small" onClick={handleConfirm}>
              确认
            </Button>
            <Button size="small" onClick={handleCancel}>
              取消
            </Button>
          </div>
        </div>
      ) : null}

      {/* 三、最终生成结果(逐字打印 + 蓝色光效) */}
      {atLeast(stage, "result") ? (
        <div className="ac-result">
          <TwBlock shown={result.shown} typing={stage === "result"} />
        </div>
      ) : null}

      {/* 四、底部操作条:左耗时 | 右五图标(刷新/复制/赞/踩/更多) */}
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
