import { Icon } from "../../../assets/shared/icon.jsx";
import { useApp } from "../../context.jsx";
import "./index.css";

// Layer 4: 侧边菜单 — 收起 3rem / 展开 16rem,底部按钮切换(抽屉式伸缩)
// 注:菜单项已按需求暂时移除,恢复时取消下方注释并还原 <Menu /> 渲染即可
// const MENU_ITEMS = [
//   { key: "overview", icon: "layout-dashboard", label: "总览" },
//   { key: "devices", icon: "server", label: "设备管理" },
//   { key: "alarms", icon: "bell", label: "告警管理" },
//   { key: "settings", icon: "settings", label: "系统设置" },
// ];

export default function SideMenu() {
  const { menuCollapsed, toggleMenu } = useApp();

  return (
    <aside className={menuCollapsed ? "side-menu is-collapsed" : "side-menu"}>
      {/* 菜单内容暂时移除:占位容器撑起剩余高度,使底部伸缩按钮始终贴底 */}
      <div className="side-menu-placeholder" />
      <button
        type="button"
        className="side-menu-toggle"
        onClick={toggleMenu}
        title={menuCollapsed ? "展开菜单" : "收起菜单"}
        aria-label={menuCollapsed ? "展开菜单" : "收起菜单"}
      >
        <Icon name={menuCollapsed ? "chevron-right" : "chevron-left"} size="1rem" />
      </button>
    </aside>
  );
}
