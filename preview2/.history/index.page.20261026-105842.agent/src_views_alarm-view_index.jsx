import { useMemo, useState } from "react";
import { Button, Select, Table, Tag } from "antd";
import { Icon } from "../../../assets/shared/icon.jsx";
import { ALARMS, ALARM_SEVERITY_OPTIONS, ALARM_STATUS_OPTIONS } from "../../mock/alarm.js";
import "./index.css";

// Layer 4: 告警管理 — 级别/状态筛选 + 告警列表
const SEVERITY_TAG = {
  critical: { color: "error", label: "紧急" },
  major: { color: "warning", label: "重要" },
  minor: { color: "processing", label: "次要" },
  info: { color: "default", label: "提示" },
};

const STATUS_TAG = {
  pending: { color: "error", label: "未处理" },
  processing: { color: "processing", label: "处理中" },
  cleared: { color: "success", label: "已清除" },
};

export default function AlarmView() {
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("all");

  const filteredAlarms = useMemo(
    () =>
      ALARMS.filter(
        (a) =>
          (severity === "all" || a.severity === severity) &&
          (status === "all" || a.status === status)
      ),
    [severity, status]
  );

  const handleReset = () => {
    setSeverity("all");
    setStatus("all");
  };

  const columns = [
    {
      title: "告警时间",
      dataIndex: "time",
      key: "time",
      sorter: (a, b) => a.time.localeCompare(b.time),
    },
    {
      title: "级别",
      dataIndex: "severity",
      key: "severity",
      filters: ALARM_SEVERITY_OPTIONS.filter((o) => o.value !== "all").map((o) => ({
        text: o.label,
        value: o.value,
      })),
      onFilter: (value, record) => record.severity === value,
      render: (severity) => {
        const item = SEVERITY_TAG[severity] || SEVERITY_TAG.info;
        return <Tag color={item.color}>{item.label}</Tag>;
      },
    },
    {
      title: "告警设备",
      dataIndex: "device",
      key: "device",
      render: (device) => (
        <a className="table-link" onClick={() => {}} title={`查看 ${device} 详情`}>
          {device}
        </a>
      ),
    },
    {
      title: "告警内容",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "处理状态",
      dataIndex: "status",
      key: "status",
      filters: ALARM_STATUS_OPTIONS.filter((o) => o.value !== "all").map((o) => ({
        text: o.label,
        value: o.value,
      })),
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const item = STATUS_TAG[status] || STATUS_TAG.pending;
        return <Tag color={item.color}>{item.label}</Tag>;
      },
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <span className="table-actions">
          <Icon
            name="eye"
            size="0.875rem"
            className="table-action-icon"
            title="查看告警详情"
            onClick={() => {}}
          />
          <Icon
            name="check"
            size="0.875rem"
            className="table-action-icon"
            title="清除告警"
            onClick={() => {}}
          />
        </span>
      ),
    },
  ];

  return (
    <div className="alarm-view">
      <div className="toolbar-card">
        <Select
          style={{ width: "9rem" }}
          value={severity}
          onChange={setSeverity}
          options={ALARM_SEVERITY_OPTIONS}
        />
        <Select
          style={{ width: "9rem" }}
          value={status}
          onChange={setStatus}
          options={ALARM_STATUS_OPTIONS}
        />
        <Button type="primary" icon={<Icon name="search" size="0.875rem" />}>
          查询
        </Button>
        <Button icon={<Icon name="rotate-cw" size="0.875rem" />} onClick={handleReset}>
          重置
        </Button>
        <div className="toolbar-spacer" />
        <Button icon={<Icon name="check" size="0.875rem" />}>批量清除</Button>
      </div>
      <div className="table-card">
        <Table
          rowKey="id"
          size="large"
          columns={columns}
          dataSource={filteredAlarms}
          sortDirections={["ascend", "descend", "ascend"]}
          showSorterTooltip={false}
          pagination={{
            showTotal: (total) => `总记录数：${total}`,
            showSizeChanger: true,
            showQuickJumper: { goButton: "跳转" },
          }}
        />
      </div>
    </div>
  );
}
