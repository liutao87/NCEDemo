// 左右联动时间线常量(毫秒) — 右侧流程组件的卡片节奏,左侧步骤条按此同步推进
// 修改后两侧自动保持一致(change-flow 组件与 answer-card 的 runMore 阶段共用)
export const FLOW_TIMING = {
  appearDelay: 500, // 首张卡片出现延迟
  loadingMs: 1500, // 单张卡片加载时长
  revealMs: 500, // 状态揭示动画时长
  arrowGapMs: 200, // 箭头到下一张卡片的间隔
};

// 确认后联动展示的流程步骤:标题与左侧步骤条完全一致(配置生成/配置审核/结果下发)
// 卡片 i 完成时刻 = appearDelay + i * cycle + loadingMs(cycle = loadingMs + revealMs + arrowGapMs)
export const SYNCED_FLOW_STEPS = [
  {
    title: "配置生成",
    action: "生成配置脚本",
    actionIcon: "file-text",
    params: ["Str.vlanId", "Str.trunkId", "Str.mask"],
    commandLine: "vlan 200\ninterface eth-trunk 200\nip address Str.mask",
    no: 1,
  },
  {
    title: "配置审核",
    action: "语法与基线校验",
    actionIcon: "shield-check",
    params: ["Str.baseline", "Str.policy"],
    commandLine: "check config --baseline Str.baseline --policy Str.policy",
    no: 2,
  },
  {
    title: "结果下发",
    action: "下发变更方案",
    actionIcon: "send",
    params: ["Str.window", "Str.rollback"],
    commandLine:
      "deliver change --window Str.window --rollback Str.rollback",
    no: 3,
  },
];

// Layer 2: 配置变更流程 mock 数据 — Leaf 扩容网络变更示例步骤
export const LEAF_STEPS = [
  {
    title: "查询设备信息",
    action: "查询设备信息",
    params: ["Str.serverIp", "Str.serverIp", "Str.mask", "Str.gateway"],
    commandLine: "display device information",
    no: 1,
  },
  {
    title: "创建 VLAN 200",
    action: "创建VLAN信息",
    params: ["Str.asnNum"],
    commandLine: "vlan 200",
    no: 2,
  },
  {
    title: "创建 Eth-Trunk200 聚合链路",
    action: "创建聚合链路",
    params: ["Str.M-lag-id 89"],
    commandLine: "interface eth-trunk 200",
    actionAbnormal: true,
    no: 3,
  },
  {
    type: "branch",
    condition: "是否是V2版本",
    action: "判断设备版本",
    params: ["Str.deviceVersion"],
    commandLine: "display version",
    no: 4,
    branches: [
      {
        label: "是",
        step: {
          title: "配置BGP邻居（V2版本）",
          action: "配置BGP邻居",
          params: ["Str.peerIp", "Str.asNum"],
          commandLine: "neighbor Str.peerIp as Str.asNum",
          no: "5.1",
        },
      },
      {
        label: "否",
        step: {
          title: "配置BGP邻居（V3版本）",
          action: "配置BGP邻居",
          params: ["Str.peerIp", "Str.asNum"],
          commandLine: "neighbor Str.peerIp as Str.asNum version 3",
          no: "5.2",
        },
      },
    ],
  },
  {
    title: "成员端口加入聚合",
    action: "配置成员端口",
    params: ["Str.vpnInstanceName"],
    commandLine: "eth-trunk 200\ntrunkport interface 10GE 1/0/1",
    no: 6,
  },
  {
    title: "MPP区Spine配置及验证",
    action: "MPP区Spine配置及验证",
    params: ["Str.vpnInstanceName"],
    commandLine: "display mpp spine status",
    no: 7,
  },
  {
    title: "扩容POD设备SDN控制",
    action: "扩容POD设备SDN控制",
    params: ["Str.gatewayConnIp"],
    commandLine: "sdn pod-expand --gateway Str.gatewayConnIp",
    no: 8,
  },
];
