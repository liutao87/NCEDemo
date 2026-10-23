import { useState, useEffect, createContext, useContext } from "react";

// Layer 1: 全局状态 — 主题模式与业务状态
// 换肤单轨驱动:isDark 只切换 <html> 的 .dark class;
// 普通 H5 元素(token 四层)与 antd 组件(ant.css 换肤层)同源跟随,无需 React 参与换肤。
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  // 侧边菜单默认收起(3rem 宽),点击底部按钮/头部汉堡图标可展开为 16rem
  const [menuCollapsed, setMenuCollapsed] = useState(true);
  // 当前激活的菜单项 key
  const [activeMenu, setActiveMenu] = useState("overview");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const value = {
    isDark,
    toggleDark: () => setIsDark((d) => !d),
    menuCollapsed,
    toggleMenu: () => setMenuCollapsed((c) => !c),
    activeMenu,
    setActiveMenu,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}
