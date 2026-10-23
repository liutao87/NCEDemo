import { useApp } from "../../context.jsx";
import OverviewView from "../overview-view/index.jsx";
import DeviceView from "../device-view/index.jsx";
import AlarmView from "../alarm-view/index.jsx";
import SettingsView from "../settings-view/index.jsx";
import "./index.css";

// Layer 4: 菜单内容区 — 按侧边菜单激活项渲染对应视图
const VIEW_MAP = {
  overview: { title: "总览", description: "全网设备与告警运行态势一屏掌握", component: OverviewView },
  devices: { title: "设备管理", description: "管理全网纳管设备，查询设备详情与运行状态", component: DeviceView },
  alarms: { title: "告警管理", description: "集中监控全网告警，跟踪告警处理进度", component: AlarmView },
  settings: { title: "系统设置", description: "配置系统基本参数与告警通知策略", component: SettingsView },
};

export default function ContentArea() {
  const { activeMenu } = useApp();
  const view = VIEW_MAP[activeMenu] || VIEW_MAP.overview;
  const ViewComponent = view.component;

  return (
    <main className="content-area">
      <div className="content-header">
        <h2 className="content-title">{view.title}</h2>
        <p className="content-description">{view.description}</p>
      </div>
      <ViewComponent />
    </main>
  );
}
