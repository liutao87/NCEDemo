import { Menu } from "antd";
import { Icon } from "../../../assets/shared/icon.jsx";
import { useApp } from "../../context.jsx";
import "./index.css";

// Layer 4: 侧边菜单 — 收起 3rem / 展开 16rem,底部按钮切换(抽屉式伸缩)
const MENU_ITEMS = [
  { key: "overview", icon: "layout-dashboard", label: "总览" },
  { key: "devices", icon: "server", label: "设备管理" },
  { key: "alarms", icon: "bell", label: "告警管理" },
  { key: "settings", icon: "settings", label: "系统设置" },
];

export default function SideMenu() {
  const { menuCollapsed, toggleMenu, activeMenu, setActiveMenu } = useApp();

  return (
    <aside className={menuCollapsed ? "side-menu is-collapsed" : "side-menu"}>
      <Menu
        mode="inline"
        inlineCollapsed={menuCollapsed}
        selectedKeys={[activeMenu]}
        onClick={(info) => setActiveMenu(info.key)}
        style={{
          flex: "1 1 0",
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          borderInlineEnd: "none",
        }}
        items={MENU_ITEMS.map((item) => ({
          key: item.key,
          icon: <Icon name={item.icon} size="1rem" />,
          label: item.label,
        }))}
      />
      <button
        type="button"
        className="side-menu-toggle"
        onClick={toggleMenu}
        title={menuCollapsed ? "展开菜单" : "收起菜单"}
        aria-label={menuCollapsed ? "展开菜单" : "收起菜单"}
      >
        <Icon
          src={
            menuCollapsed
              ? "./assets/uploads/sidebar-toggle-expand.svg"
              : "./assets/uploads/sidebar-toggle-collapse.svg"
          }
          size="1rem"
          style={{ width: "1rem", height: "1rem" }}
        />
      </button>
    </aside>
  );
}
