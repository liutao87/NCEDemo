import { useState, useEffect, createContext, useContext } from "react";

// Layer 1: 全局状态 — 主题模式与业务状态
// 换肤单轨驱动:isDark 只切换 <html> 的 .dark class;
// 普通 H5 元素(token 四层)与 antd 组件(ant.css 换肤层)同源跟随,无需 React 参与换肤。
const AppContext = createContext(null);

export function AppProvider({ children }) {
  // 页面默认深色主题(头部/侧边栏/内容区随令牌整体翻转)
  const [isDark, setIsDark] = useState(true);
  // 侧边菜单默认收起(3rem 宽),点击底部按钮/头部汉堡图标可展开为 16rem
  const [menuCollapsed, setMenuCollapsed] = useState(true);
  // 当前激活的菜单项 key
  const [activeMenu, setActiveMenu] = useState("overview");
  // AI 会话是否已开始(发送首条消息后置 true,右侧主内容区展示"内容生成中"画布)
  const [aiChatActive, setAiChatActive] = useState(false);
  // 配置变更流程启动标记:AI 问答点击「确认」后 +1,右侧画布切换为流程组件;
  // 每次发送新提问重置为 0(回到"内容生成中")
  const [aiFlowRunId, setAiFlowRunId] = useState(0);
  // 从首页输入框/模板库携带到 AI 会话的待发送内容(跳转后自动开始问答)
  // 形如 { text, title } —— title 为模板名(可选),用作会话标题
  const [pendingQuestion, setPendingQuestion] = useState(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const value = {
    isDark,
    toggleDark: () => setIsDark((d) => !d),
    menuCollapsed,
    toggleMenu: () => setMenuCollapsed((c) => !c),
    activeMenu,
    setActiveMenu,
    aiChatActive,
    startAiChat: () => {
      setAiChatActive(true);
      setAiFlowRunId(0);
    },
    aiFlowRunId,
    launchAiFlow: () => setAiFlowRunId((id) => id + 1),
    pendingQuestion,
    setPendingQuestion,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}
