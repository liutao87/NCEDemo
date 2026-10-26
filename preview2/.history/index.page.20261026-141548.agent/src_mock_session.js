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
    name: "业务域名 HTTPS 化改造方案",
    category: "app",
    icon: "globe",
    prompt:
      "请协助制定域名改造方案：将嘉定DC互联网区域的全部业务域名统一从 HTTP 迁移到 HTTPS，梳理现有解析记录与证书到期情况，并输出分批迁移顺序与回滚方式。",
  },
  {
    key: "tpl-2",
    name: "跨系统应用互访策略编排",
    category: "app",
    icon: "arrow-left-right",
    prompt:
      "请生成两个业务系统之间的应用互访策略：明确访问端口、协议、流量方向与安全域隔离要求，同时给出策略命中后的审计日志留存建议，形成可直接下发的策略清单。",
  },
  {
    key: "tpl-3",
    name: "互联网出口负载均衡策略设计",
    category: "app",
    icon: "scale",
    prompt:
      "请为互联网出口设计负载均衡策略：说明流量分发模式、健康检查机制与会话保持方案，并对单节点故障时的切换时长给出预期指标与验证方法。",
  },
  {
    key: "tpl-4",
    name: "数据中心核心设备例行巡检",
    category: "device",
    icon: "search",
    prompt:
      "请对嘉定DC全部核心与汇聚设备执行例行巡检：覆盖CPU、内存、温度、电源与风扇状态，检查OSPF邻居与BFD会话健康状况，并输出巡检报告与风险项清单。",
  },
  {
    key: "tpl-5",
    name: "Leaf 设备端口扩容配置生成",
    category: "device",
    icon: "network",
    prompt:
      "请生成Leaf设备的端口扩容配置：包含端口聚合、VLAN 划分、链路带宽规划与QoS标记，同时校验上下游Spine端口的对应配置，确保扩容后流量负载均衡。",
  },
  {
    key: "tpl-6",
    name: "设备系统版本升级方案编排",
    category: "device",
    icon: "refresh-cw",
    prompt:
      "请编排设备系统版本升级方案：包含升级窗口选择、分批升级顺序、回滚步骤与业务影响评估，并给出升级前后的配置备份与版本核对清单。",
  },
  {
    key: "tpl-7",
    name: "周期性重复告警降噪分析",
    category: "device",
    icon: "bell-off",
    prompt:
      "请对最近一周的重复告警做降噪分析：识别同源同因的告警簇，统计各簇频次与持续时长，给出收敛规则与抑制阈值建议，并预估降噪后的告警量下降比例。",
  },
  {
    key: "tpl-8",
    name: "周末网络割接实施方案生成",
    category: "device",
    icon: "split",
    prompt:
      "请生成周末割接实施方案：包含割接步骤、验证清单与应急回退预案，明确每步的操作窗口、责任人与回退触发条件，确保业务影响控制在分钟级。",
  },
  {
    key: "tpl-9",
    name: "防火墙安全策略基线核查",
    category: "security",
    icon: "shield-check",
    prompt:
      "请辅助生成防火墙安全策略基线：覆盖分区隔离、最小开放端口原则与高危端口封禁要求，并对照现有策略给出差距分析与整改优先级排序。",
  },
  {
    key: "tpl-10",
    name: "运维入口访问控制策略设计",
    category: "security",
    icon: "lock",
    prompt:
      "请为运维入口设计访问控制策略：包含账号权限分级、登录源IP限制与双因子认证要求，明确各类角色的最小权限集合与定期权限复核机制。",
  },
  {
    key: "tpl-11",
    name: "近期高危漏洞修复建议梳理",
    category: "security",
    icon: "bug",
    prompt:
      "请梳理近期高危漏洞的修复建议：包含影响设备范围、补丁版本、修复窗口与验证方式，评估漏洞利用风险等级，并给出暂不可修复时的临时缓解措施。",
  },
];
