import { Icon } from "../../../assets/shared/icon.jsx";
import "./index.css";

// Layer 4: 内容生成画布 — AI 会话发送后右侧主内容区
// 顶部工具栏(全景画布 + 放大/缩小) + 标题「意图确认」+ 内容生成区(深底毛玻璃 + 彩色虚线动效)
export default function ContentGen() {
  return (
    <div className="content-gen">
      {/* 顶部工具栏:高 3.5rem,space-between,底部边框线 */}
      <div className="gen-toolbar">
        <button type="button" className="gen-canvas-btn">
          <Icon name="layout-dashboard" size="1rem" />
          <span>全景画布</span>
        </button>
        <button
          type="button"
          className="gen-expand-btn"
          title="放大/缩小"
          aria-label="放大/缩小"
        >
          <Icon name="maximize-2" size="1rem" />
        </button>
      </div>

      {/* 画布容器:上间距 0.75rem,左右 1rem,上下布局 */}
      <div className="gen-body">
        <div className="gen-intent-title">意图确认</div>

        {/* 内容生成区:深底毛玻璃,彩色虚线流转矩形(持续动效) */}
        <div className="gen-stage">
          <div className="gen-frame">
            <svg className="gen-border" aria-hidden="true">
              <defs>
                <linearGradient id="genGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="35%" stopColor="#2563eb" />
                  <stop offset="70%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              <rect className="gen-rect gen-rect-fast" x="3" y="3" rx="1rem" />
              <rect className="gen-rect gen-rect-slow" x="3" y="3" rx="1rem" />
            </svg>

            <div className="gen-center">
              <div className="gen-text">内容生成中...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
