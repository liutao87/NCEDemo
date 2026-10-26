// Layer 2: 会话卡片 mock 数据 — 时间范围 / 处置场景 / 待关注事件 / 提示词模板

export const RANGE_OPTIONS = [
  { value: "3d", label: "最近三天" },
  { value: "week", label: "最近一周" },
  { value: "month", label: "最近一月" },
];

export const SCENE_OPTIONS = [
  { value: "config", label: "配置变更" },
  { value: "fault", label: "故障处置" },
  { value: "alarm", label: "告警分析" },
  { value: "inspect", label: "安全巡检" },
];

export const ATTENTION_ITEMS = [
  {
    key: "attn-1",
    icon: "network",
    iconTone: "is-network",
    title: "【网络配置辅助生成】嘉定DC的互联网区域的Leaf1-2设备扩容",
    desc: "2025-06-03 15:36｜嘉定DC的互联网区域的Leaf1-2设备扩容",
    status: "processing",
  },
  {
    key: "attn-2",
    icon: "network",
    iconTone: "is-network",
    title: "【网络配置辅助生成】桃浦DC核心区的Spine-3设备端口扩容与路由策略调整",
    desc: "2025-06-03 14:21｜桃浦DC核心区的Spine-3设备端口扩容与路由策略调整",
    status: "processing",
  },
  {
    key: "attn-3",
    icon: "wrench",
    iconTone: "is-fault",
    title: "【故障自处置】嘉定DC出口链路丢包异常的自动隔离与流量调度",
    desc: "2025-06-03 11:08｜嘉定DC出口链路丢包异常的自动隔离与流量调度",
    status: "processing",
  },
  {
    key: "attn-4",
    icon: "network",
    iconTone: "is-network",
    title: "【网络配置辅助生成】金桥DC互联网区Firewall安全策略的批量下发",
    desc: "2025-06-02 18:45｜金桥DC互联网区Firewall安全策略的批量下发",
    status: "processing",
  },
  {
    key: "attn-5",
    icon: "wrench",
    iconTone: "is-fault",
    title: "【故障自处置】机房MPLS VPN标签泄漏事件等待人工复核接管",
    desc: "2025-06-02 16:12｜机房MPLS VPN标签泄漏事件等待人工复核接管",
    status: "manual",
  },
];

export const TEMPLATES = [
  {
    key: "tpl-1",
    name: "域名改造",
    category: "app",
    icon: "globe",
    prompt:
      "请协助制定域名改造方案：将嘉定DC互联网区域的业务域名统一从 HTTP 迁移到 HTTPS，并梳理现有解析记录。",
  },
  {
    key: "tpl-2",
    name: "应用互访",
    category: "app",
    icon: "arrow-left-right",
    prompt: "请生成两个业务系统之间的应用互访策略：包含访问端口、协议与安全域隔离要求。",
  },
  {
    key: "tpl-3",
    name: "负载均衡",
    category: "app",
    icon: "scale",
    prompt: "请为互联网出口设计负载均衡策略：说明流量分发模式与健康检查机制。",
  },
  {
    key: "tpl-4",
    name: "设备巡检",
    category: "device",
    icon: "search",
    prompt: "请对嘉定DC全部核心设备执行例行巡检，并输出巡检报告与风险项清单。",
  },
  {
    key: "tpl-5",
    name: "端口扩容",
    category: "device",
    icon: "network",
    prompt: "请生成Leaf设备的端口扩容配置：包含端口聚合、VLAN 与链路带宽规划。",
  },
  {
    key: "tpl-6",
    name: "系统升级",
    category: "device",
    icon: "refresh-cw",
    prompt: "请编排设备系统版本升级方案：包含升级窗口、回滚步骤与影响评估。",
  },
  {
    key: "tpl-7",
    name: "告警降噪",
    category: "device",
    icon: "bell-off",
    prompt: "请对最近一周的重复告警做降噪分析，并给出收敛规则建议。",
  },
  {
    key: "tpl-8",
    name: "网络割接",
    category: "device",
    icon: "split",
    prompt: "请生成周末割接实施方案：包含割接步骤、验证清单与应急回退预案。",
  },
  {
    key: "tpl-9",
    name: "安全策略",
    category: "security",
    icon: "shield-check",
    prompt: "请辅助生成防火墙安全策略基线：覆盖分区隔离、最小开放端口原则。",
  },
  {
    key: "tpl-10",
    name: "访问控制",
    category: "security",
    icon: "lock",
    prompt: "请为运维入口设计访问控制策略：包含账号权限分级与登录源限制。",
  },
  {
    key: "tpl-11",
    name: "漏洞修复",
    category: "security",
    icon: "bug",
    prompt: "请梳理近期高危漏洞的修复建议：包含影响设备范围、补丁版本与验证方式。",
  },
];
