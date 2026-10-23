import { Tooltip } from "antd";
import { Icon } from "../../../assets/shared/icon.jsx";
import { useApp } from "../../context.jsx";
import "./index.css";

// Layer 4: 头部导航 — 高 3rem,两端对齐垂直居中;左侧汉堡图标 + logo + 标题,右侧全局工具图标 + 账户
export default function HeaderBar() {
  const { isDark, toggleDark, toggleMenu } = useApp();

  return (
    <header className="header-bar">
      <div className="header-left">
        <button
          type="button"
          className="header-icon-btn"
          onClick={toggleMenu}
          aria-label="切换导航菜单"
          title="切换导航菜单"
        >
          <Icon name="menu" size="1.25rem" />
        </button>
        <div className="header-brand">
          <img className="header-logo" src="./assets/uploads/favicon.svg" alt="iMaster NCE" />
          <span className="header-title">iMaster NCE</span>
        </div>
      </div>
      <div className="header-right">
        <Tooltip title="搜索">
          <button type="button" className="header-icon-btn" aria-label="搜索">
            <Icon name="search" size="1rem" />
          </button>
        </Tooltip>
        <Tooltip title="帮助">
          <button type="button" className="header-icon-btn" aria-label="帮助">
            <Icon name="info" size="1rem" />
          </button>
        </Tooltip>
        <Tooltip title={isDark ? "切换浅色主题" : "切换深色主题"}>
          <button
            type="button"
            className="header-icon-btn"
            onClick={toggleDark}
            aria-label="换肤"
          >
            <Icon name="palette" size="1rem" />
          </button>
        </Tooltip>
        <div className="header-account">
          <Icon name="user" size="1rem" />
          <span className="header-account-name">Admin</span>
        </div>
      </div>
    </header>
  );
}
