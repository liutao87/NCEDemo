import { Tag } from "antd";

// Layer 3: 设备状态标签 — 设备状态 → Tag 预设色/文案 统一映射
const DEVICE_STATUS = {
  online: { color: "success", label: "在线" },
  offline: { color: "default", label: "离线" },
  alarm: { color: "error", label: "告警" },
  maintaining: { color: "warning", label: "维护中" },
};

export default function StatusTag({ status }) {
  const item = DEVICE_STATUS[status] || DEVICE_STATUS.offline;
  return <Tag color={item.color}>{item.label}</Tag>;
}
