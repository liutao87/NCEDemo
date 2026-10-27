import {
  useState,
  useEffect,
  Fragment,
  useRef,
  useLayoutEffect,
} from "react";
import { Icon } from "../../../assets/shared/icon.jsx";
import { FLOW_TIMING } from "../../mock/change-flow.js";
import "./index.css";

// 累计运行时间 hook:autoPlay 时每 80ms 更新一次 elapsed(毫秒),
// 用于按时间线驱动「加载中 → 校验完成」的状态切换
function useElapsed(run) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!run) {
      setElapsed(0);
      return undefined;
    }
    const start = performance.now();
    const id = setInterval(() => setElapsed(performance.now() - start), 80);
    return () => clearInterval(id);
  }, [run]);
  return elapsed;
}

const DEFAULT_ACTIONS = [
  { label: "新页签查看", icon: "external-link" },
  { label: "功能设计文档", icon: "file-text" },
];

// 拆分参数字段:"Str.serverIp" → "Str."(字段类型) + "serverIp"(参数内容)
function splitParam(p) {
  const dot = p.indexOf(".");
  if (dot === -1) return { type: "", content: p };
  return { type: p.slice(0, dot + 1), content: p.slice(dot + 1) };
}

// 参数标签(拆分字段类型与参数内容)
function ParamTag({ value, animated, delay }) {
  const { type, content } = splitParam(value);
  return (
    <span
      className={`cf-tag cf-tag--param ${animated ? "cf-tag-load" : ""}`}
      style={animated ? { animationDelay: `${delay}s` } : undefined}
    >
      <Icon
        name="chevrons-left-right"
        size="0.75rem"
        color="#5ca2e9"
        strokeWidth={1.5}
        className="cf-tag-icon"
      />
      <span className="cf-tag-param-group">
        {type ? <span className="cf-tag-param-type">{type}</span> : null}
        <span className="cf-tag-param-value">{content}</span>
      </span>
    </span>
  );
}

// 单张流程步骤卡片
function FlowCard({
  step,
  index,
  loading,
  fading,
  delay,
  selected,
  onSelect,
  showAction = true,
  showParams = true,
}) {
  const params = step.params || [];
  // 加载中:流光边框 + 外发光 + 弥散光晕;缓出阶段(fading)保留加载视觉并淡出
  const showLoading = loading || fading;
  const stateClass = showLoading ? "cf-card--loading" : "";

  // 参数标签溢出测量 + 浮窗:固定宽度内显示不全时,用 +N 展示剩余数量
  const tagsRef = useRef(null);
  const moreBtnRef = useRef(null);
  const actionTagRef = useRef(null);
  const [hiddenCount, setHiddenCount] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, right: 0 });
  // 异常动作标签的悬浮提示(portal 渲染到 body,不受卡片 overflow 裁剪)
  const [abnormalTip, setAbnormalTip] = useState(false);
  const [abnormalTipPos, setAbnormalTipPos] = useState({ top: 0, left: 0 });

  const toggleMore = () => {
    if (!showMore && moreBtnRef.current) {
      const rect = moreBtnRef.current.getBoundingClientRect();
      setPopupPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setShowMore(!showMore);
  };

  // 异常动作标签 hover:定位到标签正上方居中
  const abnormal = step.actionAbnormal;
  const handleAbnormalEnter = () => {
    if (!abnormal || !actionTagRef.current) return;
    const rect = actionTagRef.current.getBoundingClientRect();
    setAbnormalTipPos({ top: rect.top, left: rect.left + rect.width / 2 });
    setAbnormalTip(true);
  };
  const handleAbnormalLeave = () => setAbnormalTip(false);

  useLayoutEffect(() => {
    const container = tagsRef.current;
    if (!container || !params.length || !showParams) return undefined;

    const measure = () => {
      const maxWidth = container.clientWidth;
      const gap = 6;
      // 排除 "+N" 标签,仅测量动作标签 + 参数标签
      const nodes = Array.from(
        container.querySelectorAll(".cf-tag")
      ).filter((n) => !n.classList.contains("cf-tag--more"));
      const actionW = nodes[0] ? nodes[0].offsetWidth : 0;
      const paramWs = nodes.slice(1).map((n) => n.offsetWidth);

      const countFit = (moreReserve) => {
        let used = actionW + (moreReserve > 0 ? gap + moreReserve : 0);
        let visible = 0;
        for (let i = 0; i < paramWs.length; i++) {
          if (used + gap + paramWs[i] <= maxWidth) {
            used += gap + paramWs[i];
            visible++;
          } else break;
        }
        return visible;
      };

      let visible = countFit(0);
      if (visible < params.length) {
        visible = countFit(30); // 预留 "+N" 标签约 30px,避免其被裁剪
      }
      setHiddenCount(Math.max(0, params.length - visible));
    };

    measure();
    // 字体加载后重新测量(字体未加载时宽度不准,可能导致标签溢出)
    if (
      typeof document !== "undefined" &&
      document.fonts &&
      document.fonts.ready
    ) {
      document.fonts.ready.then(measure);
    }
    return undefined;
  }, [params, step.action, showAction, showParams]);

  const visibleCount = Math.max(0, params.length - hiddenCount);
  const visibleParams = params.slice(0, visibleCount);
  const hiddenParams = params.slice(visibleCount);

  return (
    <div
      className={`cf-card-outer ${
        showLoading ? "cf-card-outer--loading" : ""
      } ${fading ? "cf-card-outer--fading" : ""} cf-anim`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div
        className={`cf-card ${stateClass} ${
          selected ? "cf-card--selected" : ""
        } ${fading ? "cf-card--fading" : ""}`}
        onClick={() => onSelect && onSelect(index)}
      >
        <div className="cf-card-header">
          <span className="cf-card-title">
            {step.no != null ? (
              <span className="cf-card-index">
                {String(step.no).indexOf(".") >= 0 ? step.no : `${step.no}.`}
              </span>
            ) : null}
            {step.title}
          </span>
          <div className="cf-card-header-right">
            {loading ? (
              <span className="cf-loading-indicator" />
            ) : (
              <span className="cf-detail-icon" title="查看详情">
                <Icon
                  name="file-text"
                  size="0.875rem"
                  color={selected ? "#3b82f6" : "#DFDFDF"}
                />
              </span>
            )}
          </div>
        </div>
        {showAction && step.action ? (
          <div className="cf-tags" ref={tagsRef}>
            <span
              ref={actionTagRef}
              className={`cf-tag cf-tag--action ${
                abnormal ? "cf-tag--abnormal" : ""
              } cf-tag-load`}
              onMouseEnter={abnormal ? handleAbnormalEnter : undefined}
              onMouseLeave={abnormal ? handleAbnormalLeave : undefined}
            >
              <Icon
                name={abnormal ? "triangle-alert" : step.actionIcon || "circle-dot"}
                size="0.75rem"
                color={abnormal ? "#f87171" : "#cb8efb"}
                strokeWidth={1.5}
                className="cf-tag-icon"
              />
              {step.action}
            </span>
            {showParams
              ? visibleParams.map((p, i) => (
                  <ParamTag key={i} value={p} animated delay={i * 0.15} />
                ))
              : null}
            {showParams && hiddenCount > 0 ? (
              <button
                ref={moreBtnRef}
                className="cf-tag cf-tag--more cf-tag-load"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMore();
                }}
              >
                +{hiddenCount}
                <Icon
                  name="chevron-down"
                  size="0.75rem"
                  className="cf-tag-more-icon"
                />
              </button>
            ) : null}
          </div>
        ) : null}
        {showLoading ? <div className="cf-card-glow" /> : null}
        <div className="cf-card-dots" />
      </div>
      {showMore && hiddenCount > 0 ? (
        <div
          className="cf-tag-popup"
          style={{ top: popupPos.top, right: popupPos.right }}
        >
          {hiddenParams.map((p, i) => (
            <ParamTag key={i} value={p} />
          ))}
        </div>
      ) : null}
      {abnormalTip ? (
        <div
          className="cf-abnormal-tip"
          style={{ top: abnormalTipPos.top, left: abnormalTipPos.left }}
        >
          匹配到多个重复动作包，请人工确认选择
        </div>
      ) : null}
    </div>
  );
}

// 详情行:标签 + 内容
function DetailRow({ label, children }) {
  return (
    <div className="cf-drawer-row">
      <span className="cf-drawer-label">{label}</span>
      <div className="cf-drawer-value">{children}</div>
    </div>
  );
}

// 单节点详情侧边栏:节点名称 / 匹配动作 / 匹配参数 / 关联参数命令行
function DetailPanel({ step, onClose }) {
  if (!step) return null;
  const params = step.params || [];
  return (
    <div className="cf-drawer-panel">
      <div className="cf-drawer-header">
        <span className="cf-drawer-title">{step.title}</span>
        <button
          className="cf-drawer-close"
          type="button"
          onClick={onClose}
          aria-label="关闭"
        >
          <Icon name="x" size="1rem" color="#DFDFDF" />
        </button>
      </div>
      <div className="cf-drawer-body">
        <DetailRow label="匹配动作">
          <span className="cf-tag cf-tag--action">
            <Icon
              name={step.actionIcon || "circle-dot"}
              size="0.75rem"
              color="#cb8efb"
              strokeWidth={1.5}
              className="cf-tag-icon"
            />
            {step.action}
          </span>
        </DetailRow>
        <DetailRow label="匹配参数">
          {params.length ? (
            <div className="cf-drawer-params">
              {params.map((p, i) => (
                <ParamTag key={i} value={p} />
              ))}
            </div>
          ) : (
            <span className="cf-drawer-text cf-drawer-text--muted">—</span>
          )}
        </DetailRow>
        <div className="cf-drawer-row">
          <div className="cf-drawer-label-row">
            <span className="cf-drawer-label">关联命令行</span>
            {step.commandLine ? (
              <button
                className="cf-drawer-copy"
                type="button"
                onClick={() => {
                  const text = step.commandLine || "";
                  if (
                    typeof navigator !== "undefined" &&
                    navigator.clipboard
                  ) {
                    navigator.clipboard.writeText(text);
                  }
                }}
                aria-label="复制"
              >
                <Icon name="copy" size="0.875rem" color="#C9C9C9" />
              </button>
            ) : null}
          </div>
          <div className="cf-drawer-value">
            <pre className="cf-drawer-code">{step.commandLine || "—"}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

// 配置变更流程组件:纵向流程图,步骤卡片依次加载(流光边框),
// 支持条件分支、点击选中(详情侧边栏)、视图缩放
// 时间线常量取自 FLOW_TIMING(与左侧 AI 问答步骤条联动共用同一节奏)
export default function ChangeFlow(props) {
  const steps = props.steps || [];
  const autoPlay = props.autoPlay !== false;
  const loadingMs =
    props.loadingMs != null ? props.loadingMs : FLOW_TIMING.loadingMs;
  const elapsed = useElapsed(autoPlay);

  // 选中态:支持受控(selectedIndex)与非受控(内部状态 + 点击切换)
  const [internalSelected, setInternalSelected] = useState(null);
  const selectedIndex =
    props.selectedIndex != null ? props.selectedIndex : internalSelected;

  // 节点详情侧边栏
  const [detailNode, setDetailNode] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const closeDetail = () => {
    setDetailOpen(false);
    if (props.selectedIndex == null) setInternalSelected(null);
    if (props.onSelect) props.onSelect(null);
  };
  const selectAndOpen = (i, step) => {
    if (props.selectedIndex == null) setInternalSelected(i);
    if (props.onSelect) props.onSelect(i);
    setDetailNode(step);
    setDetailOpen(true);
  };
  const handleSelect = (i) => selectAndOpen(i, steps[i]);

  // 视图缩放
  const ZOOM_MIN = 0.5;
  const ZOOM_MAX = 1.5;
  const ZOOM_STEP = 0.1;
  const [zoom, setZoom] = useState(1);
  const zoomIn = () =>
    setZoom((z) => Math.min(ZOOM_MAX, Math.round((z + ZOOM_STEP) * 10) / 10));
  const zoomOut = () =>
    setZoom((z) => Math.max(ZOOM_MIN, Math.round((z - ZOOM_STEP) * 10) / 10));

  const actions = props.actions || DEFAULT_ACTIONS;

  // 顺序出现:上一张卡片「全部加载完成(含状态揭示)」后,箭头淡入,再轮到下一张
  const APPEAR_DELAY_MS = FLOW_TIMING.appearDelay;
  const STATUS_REVEAL_MS = FLOW_TIMING.revealMs;
  const ARROW_GAP_MS = FLOW_TIMING.arrowGapMs;
  const FADE_OUT_MS = 450;
  const cycleMs = loadingMs + STATUS_REVEAL_MS + ARROW_GAP_MS;
  const endDelay = autoPlay
    ? (APPEAR_DELAY_MS + steps.length * cycleMs) / 1000
    : 0.7 + steps.length * 0.5;
  const flowDoneMs =
    APPEAR_DELAY_MS +
    Math.max(0, steps.length - 1) * cycleMs +
    loadingMs +
    FADE_OUT_MS;
  const flowLoading = autoPlay && elapsed < flowDoneMs;

  return (
    <div className={`cf ${props.theme === "light" ? "cf--light" : ""}`}>
      <header className="cf-topbar cf-anim" style={{ animationDelay: "0.1s" }}>
        <div className="cf-topbar-left">
          <div className="cf-topbar-icon">
            <Icon
              name={props.headerIcon || "clipboard-list"}
              size="0.875rem"
              color="#ffffff"
            />
          </div>
          <span className="cf-topbar-title">
            {props.title || "网络变更-配置详情"}
          </span>
        </div>
        <div className="cf-topbar-right">
          {actions.map((a, i) => (
            <button key={i} className="cf-btn" type="button">
              <Icon name={a.icon} size="0.875rem" />
              {a.label}
            </button>
          ))}
        </div>
      </header>

      <main className="cf-flow" style={{ transform: `scale(${zoom})` }}>
        <div className="cf-terminal cf-anim" style={{ animationDelay: "0.3s" }}>
          {props.startLabel || "开始"}
        </div>
        <div
          className={`cf-arrow ${
            flowLoading ? "cf-arrow--loading" : ""
          } cf-anim`}
          style={{ animationDelay: "0.4s" }}
        />
        {steps.map((step, i) => {
          const appearAt = APPEAR_DELAY_MS + i * cycleMs;
          const doneAt = appearAt + loadingMs;
          const arrowAt = doneAt + STATUS_REVEAL_MS;
          const loading = autoPlay && elapsed < doneAt;
          const fading = autoPlay && !loading && elapsed < doneAt + FADE_OUT_MS;
          const cardDelay = autoPlay ? appearAt / 1000 : 0.5 + i * 0.5;
          const arrowDelay = autoPlay ? arrowAt / 1000 : 0.7 + i * 0.5;
          // 三阶段加载:初始仅标题 → 加载动作标签 → 加载参数标签
          const actionAt = appearAt + loadingMs * 0.33;
          const paramsAt = appearAt + loadingMs * 0.66;
          const showAction =
            props.showAction != null
              ? props.showAction
              : !autoPlay || elapsed >= actionAt;
          const showParams =
            props.showParams != null
              ? props.showParams
              : !autoPlay || elapsed >= paramsAt;
          // 分支节点:判断条件 + 多条分支
          if (step.type === "branch") {
            return (
              <Fragment key={i}>
                <div
                  className="cf-branch cf-anim"
                  style={{ animationDelay: `${cardDelay}s` }}
                >
                  <FlowCard
                    step={{
                      title: step.condition,
                      action: step.action,
                      params: step.params,
                      commandLine: step.commandLine,
                      no: step.no,
                    }}
                    index={i}
                    loading={loading}
                    fading={fading}
                    delay={cardDelay}
                    selected={false}
                    onSelect={() =>
                      selectAndOpen(i, {
                        title: step.condition,
                        action: step.action,
                        params: step.params,
                        commandLine: step.commandLine,
                      })
                    }
                    showAction={showAction}
                    showParams={showParams}
                  />
                  <div
                    className="cf-branch-fork cf-anim"
                    style={{ animationDelay: `${cardDelay + 0.1}s` }}
                  >
                    <svg viewBox="0 0 840 50" preserveAspectRatio="none">
                      <path d="M420,0 V20 Q420,35 405,35 H215 Q200,35 200,50" />
                      <path d="M420,0 V20 Q420,35 435,35 H625 Q640,35 640,50" />
                    </svg>
                    {step.branches.map((b, bi) => (
                      <span
                        key={bi}
                        className={`cf-branch-label ${
                          bi === 0
                            ? "cf-branch-label--left"
                            : "cf-branch-label--right"
                        }`}
                      >
                        {b.label}
                      </span>
                    ))}
                  </div>
                  <div className="cf-branch-cols">
                    {step.branches.map((b, bi) => (
                      <FlowCard
                        key={bi}
                        step={b.step}
                        index={i}
                        loading={loading}
                        fading={fading}
                        delay={cardDelay + 0.4 + bi * 0.2}
                        selected={false}
                        onSelect={() => selectAndOpen(i, b.step)}
                        showAction={showAction}
                        showParams={showParams}
                      />
                    ))}
                  </div>
                  <div
                    className="cf-branch-join cf-anim"
                    style={{ animationDelay: `${arrowDelay - 0.1}s` }}
                  >
                    <svg viewBox="0 0 840 50" preserveAspectRatio="none">
                      <path d="M200,0 V20 Q200,35 215,35 H405 Q420,35 420,50" />
                      <path d="M640,0 V20 Q640,35 625,35 H435 Q420,35 420,50" />
                    </svg>
                  </div>
                </div>
                <div
                  className={`cf-arrow ${
                    flowLoading ? "cf-arrow--loading" : ""
                  } cf-anim`}
                  style={{ animationDelay: `${arrowDelay}s` }}
                />
              </Fragment>
            );
          }
          return (
            <Fragment key={i}>
              <FlowCard
                step={step}
                index={i}
                loading={loading}
                fading={fading}
                delay={cardDelay}
                selected={selectedIndex === i}
                onSelect={handleSelect}
                showAction={showAction}
                showParams={showParams}
              />
              <div
                className={`cf-arrow ${
                  flowLoading ? "cf-arrow--loading" : ""
                } cf-anim`}
                style={{ animationDelay: `${arrowDelay}s` }}
              />
            </Fragment>
          );
        })}
        <div
          className="cf-terminal cf-anim"
          style={{ animationDelay: `${endDelay}s` }}
        >
          {props.endLabel || "结束"}
        </div>
      </main>
      <div className="cf-zoom">
        <button
          className="cf-zoom-btn"
          type="button"
          onClick={zoomIn}
          disabled={zoom >= ZOOM_MAX}
          aria-label="放大"
        >
          <Icon name="plus" size="0.875rem" />
        </button>
        <button
          className="cf-zoom-btn"
          type="button"
          onClick={zoomOut}
          disabled={zoom <= ZOOM_MIN}
          aria-label="缩小"
        >
          <Icon name="minus" size="0.875rem" />
        </button>
      </div>

      <div className={`cf-drawer ${detailOpen ? "cf-drawer--open" : ""}`}>
        <DetailPanel step={detailNode} onClose={closeDetail} />
      </div>
    </div>
  );
}
