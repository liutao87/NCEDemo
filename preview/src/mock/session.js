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
      "请协助制定域名改造方案：将嘉定DC互联网区域的全部业务域名统一从 HTTP 迁移到 HTTPS，逐条梳理现有解析记录、CNAME 链路与证书到期情况；按业务重要性分批排期，明确每批的验证方式与回滚路径，并输出迁移前后对照清单与风险说明。",
  },
  {
    key: "tpl-2",
    name: "应用互访",
    category: "app",
    icon: "arrow-left-right",
    prompt:
      "请生成两个业务系统之间的应用互访策略：明确访问端口、协议、流量方向与安全域隔离要求，标注双向还是单向放行；给出策略命中后的审计日志留存与到期复审建议，最终形成可直接下发到防火墙的策略清单。",
  },
  {
    key: "tpl-3",
    name: "负载均衡",
    category: "app",
    icon: "scale",
    prompt:
      "请为互联网出口设计负载均衡策略：说明流量分发模式、健康检查机制与会话保持方案，量化单节点故障时的切换时长指标与验证方法；结合当前出口带宽与峰值流量，给出扩容阈值建议与压测用例。",
  },
  {
    key: "tpl-4",
    name: "设备巡检",
    category: "device",
    icon: "search",
    prompt:
      "请对嘉定DC全部核心与汇聚设备执行例行巡检：覆盖 CPU、内存、温度、电源与风扇状态，检查 OSPF 邻居、BFD 会话与关键端口错包率；对异常项给出处置建议，并输出巡检报告与风险项跟踪清单。",
  },
  {
    key: "tpl-5",
    name: "端口扩容",
    category: "device",
    icon: "network",
    prompt:
      "请生成 Leaf 设备的端口扩容配置：包含端口聚合、VLAN 划分、链路带宽规划与 QoS 标记；自动校验上下游 Spine 端口的对应配置与聚合一致性，评估扩容后的流量负载与收敛表现，并输出回退命令组。",
  },
  {
    key: "tpl-6",
    name: "系统升级",
    category: "device",
    icon: "refresh-cw",
    prompt:
      "请编排设备系统版本升级方案：包含升级窗口选择、分批升级顺序、回滚步骤与业务影响评估；升级前完成配置全量备份与版本兼容性核对，升级后逐项验证邻居状态与业务可达性，形成升级检查单。",
  },
  {
    key: "tpl-7",
    name: "告警降噪",
    category: "device",
    icon: "bell-off",
    prompt:
      "请对最近一周的重复告警做降噪分析：识别同源同因的告警簇，统计各簇频次、持续时长与集中时段；给出收敛规则、抑制阈值与聚合维度建议，预估降噪后的告警量下降比例，并标注不可收敛的遗留项。",
  },
  {
    key: "tpl-8",
    name: "网络割接",
    category: "device",
    icon: "split",
    prompt:
      "请生成周末割接实施方案：包含割接步骤、验证清单与应急回退预案，明确每步的操作窗口、责任人与回退触发条件；附业务影响评估与提前通知范围，确保全程可观测、可回退，影响控制在分钟级。",
  },
  {
    key: "tpl-9",
    name: "安全基线",
    category: "security",
    icon: "shield-check",
    prompt:
      "请辅助生成防火墙安全策略基线：覆盖分区隔离、最小开放端口原则与高危端口封禁要求；对照现网策略逐条给出差距分析、整改优先级与合规依据，标注例外白名单及其到期时间。",
  },
  {
    key: "tpl-10",
    name: "访问控制",
    category: "security",
    icon: "lock",
    prompt:
      "请为运维入口设计访问控制策略：包含账号权限分级、登录源 IP 限制与双因子认证要求；明确各类角色的最小权限集合、审批流程与定期权限复核机制，输出权限矩阵与落地配置样例。",
  },
  {
    key: "tpl-11",
    name: "漏洞修复",
    category: "security",
    icon: "bug",
    prompt:
      "请梳理近期高危漏洞的修复建议：圈定影响设备范围、补丁版本、修复窗口与验证方式；按利用风险与暴露面排序，对暂不可修复项给出临时缓解措施，并输出修复进度跟踪表。",
  },
];
