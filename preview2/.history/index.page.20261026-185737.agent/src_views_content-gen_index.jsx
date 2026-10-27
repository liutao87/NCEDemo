import { Icon } from "../../../assets/shared/icon.jsx";
import "./index.css";

// Layer 4: 内容生成画布 — AI 会话发送后右侧主内容区
// 顶部标题「网络资源确定」,下方为彩色虚线流转矩形(持续动效),中心文案「内容生成中」
export default function ContentGen() {
  return (
    <div className="content-gen">
      <header className="gen-head">
        <h3 className="gen-title">
          <Icon name="network" size="1.125rem" />
          网络资源确定
        </h3>
        <span className="gen-sub">Aico 正在为您生成内容</span>
      </header>

      {/* 矩形高度为可用区一半,垂直居中 */}
      <div className="gen-stage">
        <div className="gen-frame">
          {/* 双层彩色虚线矩形:反向流动,叠加发光 */}
          <svg className="gen-border" aria-hidden="true">
            <defs>
              <linearGradient id="genGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="35%" stopColor="#2563eb" />
                <stop offset="70%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <rect className="gen-rect gen-rect-fast" x="3" y="3" rx="1.25rem" />
            <rect className="gen-rect gen-rect-slow" x="3" y="3" rx="1.25rem" />
          </svg>

          <div className="gen-center">
            <span className="gen-orb">
              <Icon name="sparkles" size="1.5rem" />
            </span>
            <div className="gen-text">
              内容生成中
              <span className="gen-dots">
                <i />
                <i />
                <i />
              </span>
            </div>
            <div className="gen-hint">正在确定网络资源范围并匹配设备清单</div>
          </div>
        </div>
      </div>
    </div>
  );
}
