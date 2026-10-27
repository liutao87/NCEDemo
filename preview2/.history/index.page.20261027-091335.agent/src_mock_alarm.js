// Layer 2: 告警域 mock 数据

export const ALARM_SEVERITY_OPTIONS = [
  { value: "all", label: "全部级别" },
  { value: "critical", label: "紧急" },
  { value: "major", label: "重要" },
  { value: "minor", label: "次要" },
  { value: "info", label: "提示" },
];

export const ALARM_STATUS_OPTIONS = [
  { value: "all", label: "全部状态" },
  { value: "pending", label: "未处理" },
  { value: "processing", label: "处理中" },
  { value: "cleared", label: "已清除" },
];

export const ALARMS = [
  { id: 1, time: "2026-10-23 08:42", severity: "critical", device: "NE8000-M8", description: "设备CPU利用率超过阈值（87% > 80%）", status: "processing" },
  { id: 2, time: "2026-10-23 08:15", severity: "major", device: "USG6315E-FW2", description: "防火墙并发会话数超过告警阈值（85%）", status: "pending" },
  { id: 3, time: "2026-10-23 07:58", severity: "minor", device: "S5731-S24P4X-31", description: "端口GE0/0/24入方向流量突增，超过基线300%", status: "processing" },
  { id: 4, time: "2026-10-23 07:30", severity: "critical", device: "NE8000-M8", description: "BGP邻居10.2.1.1中断，持续时长56秒", status: "cleared" },
  { id: 5, time: "2026-10-23 06:47", severity: "major", device: "USG6315E-FW2", description: "IPsec隧道协商失败，对端10.3.1.1不可达", status: "pending" },
  { id: 6, time: "2026-10-23 05:12", severity: "minor", device: "AirEngine5761-11", description: "AP离线超过5分钟，请检查PoE供电", status: "cleared" },
  { id: 7, time: "2026-10-22 23:40", severity: "info", device: "S6730-H24X-11", description: "MAC地址表项使用率超过60%", status: "cleared" },
  { id: 8, time: "2026-10-22 22:05", severity: "major", device: "S5731-S24P4X-31", description: "光模块GE0/0/1接收光功率过低（-18.6dBm）", status: "pending" },
  { id: 9, time: "2026-10-22 20:31", severity: "info", device: "S5735-L48T4X-21", description: "系统日志存储空间即将告满（92%）", status: "processing" },
  { id: 10, time: "2026-10-22 18:26", severity: "minor", device: "NE40E-X8A-01", description: "OSPF邻居状态震荡，邻居10.1.1.2", status: "cleared" },
];
