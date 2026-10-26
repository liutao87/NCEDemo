import { useApp } from "../../context.jsx";
import OverviewView from "../overview-view/index.jsx";
import DeviceView from "../device-view/index.jsx";
import AlarmView from "../alarm-view/index.jsx";
import SettingsView from "../settings-view/index.jsx";
import "./index.css";

// Layer 4: 菜单内容区 — 按当前激活菜单项渲染对应视图
const VIEW_MAP = {
  overview: OverviewView,
  devices: DeviceView,
  alarms: AlarmView,
  settings: SettingsView,
};

export default function ContentArea() {
  const { activeMenu } = useApp();
  const ActiveView = VIEW_MAP[activeMenu] || OverviewView;
  return (
    <main className="content-area">
      <ActiveView />
    </main>
  );
}
