import { Icon } from "../../../assets/shared/icon.jsx";
import "./index.css";

// Layer 4: 内容生成画布 — AI 会话发送后右侧主内容区
export default function ContentGen() {
  return (
    <div className="content-gen">
      <div className="gen-toolbar">
        <button type="button" className="gen-canvas-btn">
          <Icon name="layout-dashboard" size="1rem" />
          <span>全景画布</span>
        </button>
        <button type="button" className="gen-expand-btn" title="放大/缩小" aria-label="放大/缩小">
          <Icon name="maximize-2" size="1rem" />
        </button>
      </div>
      <div className="gen-body">
        <div className="gen-intent-title">意图确认</div>
        <div className="gen-stage">
          {/* SVG 只画虚线渐变边框(fill:none 透明) */}
          <svg className="gen-svg" aria-hidden="true">
            <defs>
              <linearGradient id="genGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="2%" stopColor="#669fff" />
                <stop offset="12%" stopColor="#7b67ff" />
                <stop offset="39%" stopColor="#9567ff" />
                <stop offset="50%" stopColor="#ff666b" />
                <stop offset="61%" stopColor="#ff9566" />
                <stop offset="89%" stopColor="#ffad66" />
                <stop offset="99%" stopColor="#669fff" />
              </linearGradient>
            </defs>
            <rect
              className="gen-rect"
              x="1"
              y="1"
              width="100%"
              height="100%"
              rx="16"
              ry="16"
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {/* div 深色底 + 毛玻璃,内缩 2px 被 SVG 描边围住 */}
          <div className="gen-frame" />
          {/* 文字独立层:在 gen-stage 下(不在 gen-frame 内),不受 backdrop-filter 模糊影响 */}
          <div className="gen-center">
            <div className="gen-text">内容生成中...</div>
          </div>
        </div>
      </div>
    </div>
  );
}
