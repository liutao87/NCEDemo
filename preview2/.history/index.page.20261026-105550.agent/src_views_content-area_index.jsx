import { useApp } from "../../context.jsx";
import SessionCard from "../session-card/index.jsx";
import OverviewView from "../overview-view/index.jsx";
import AiChat from "../ai-view/index.jsx";
import ContentGen from "../content-gen/index.jsx";
import DeviceView from "../device-view/index.jsx";
import AlarmView from "../alarm-view/index.jsx";
import SettingsView from "../settings-view/index.jsx";
import "./index.css";

// Layer 4: 菜单内容区 — 按当前激活菜单项渲染对应视图
// 首页:左侧会话卡片(33.75rem × 100%,贴边) + 右侧地图自适应
// AI:左侧 AI 会话卡片(33.75rem × 100%,贴边) + 右侧生成画布(发送后出现)
const VIEW_MAP = {
  devices: DeviceView,
  alarms: AlarmView,
  settings: SettingsView,
};

export default function ContentArea() {
  const { activeMenu, aiChatActive } = useApp();

  if (activeMenu === "overview") {
    return (
      <main className="content-area is-overview">
        <SessionCard />
        <div className="overview-aside">
          <OverviewView />
        </div>
      </main>
    );
  }

  if (activeMenu === "ai") {
    return (
      <main className="content-area is-overview">
        <AiChat />
        {/* 右侧画布容器带 dark 类:固定深色(含发送前空态),与 AI 面板一致 */}
        <div className="overview-aside ai-canvas dark">
          {aiChatActive ? <ContentGen /> : null}
        </div>
      </main>
    );
  }

  const ActiveView = VIEW_MAP[activeMenu] || DeviceView;
  return (
    <main className="content-area">
      <ActiveView />
    </main>
  );
}
