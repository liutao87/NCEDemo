import { useState, useEffect, useRef } from "react";

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
