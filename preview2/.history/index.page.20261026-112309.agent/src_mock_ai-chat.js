// Layer 2: AI 会话 mock 数据 — 智能运维场景卡片(换一批轮换两组)
export const AI_CARD_GROUPS = [
  [
    {
      key: "manual",
      icon: "book-open",
      title: "操作手册",
      desc: "操作手册描述文本",
    },
    {
      key: "mop-sample",
      icon: "workflow",
      title: "MOP工作流样例",
      desc: "可直接使用的样例，无需修改",
    },
    {
      key: "mop-tpl",
      icon: "file-text",
      title: "MOP工作流模版",
      desc: "空置的工作流模版，需要您填入配置后上传使用",
    },
  ],
  [
    {
      key: "baseline",
      icon: "shield-check",
      title: "安全基线核查",
      desc: "一键核查设备安全基线并生成整改报告",
    },
    {
      key: "cutover",
      icon: "network",
      title: "网络割接方案",
      desc: "按向导生成割接步骤、验证清单与回退预案",
    },
    {
      key: "vuln",
      icon: "bug",
      title: "漏洞处置建议",
      desc: "匹配近期高危漏洞并给出修复指引",
    },
  ],
];
