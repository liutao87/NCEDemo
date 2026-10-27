import { useMemo, useState } from "react";
import { Button, Input, Select, Table } from "antd";
import { Icon } from "../../../assets/shared/icon.jsx";
import StatusTag from "../../components/status-tag/index.jsx";
import { DEVICES, DEVICE_TYPES, DEVICE_TYPE_OPTIONS, DEVICE_STATUS_OPTIONS } from "../../mock/device.js";
import "./index.css";

// Layer 4: 设备管理 — 条件筛选工具栏 + 设备列表
export default function DeviceView() {
  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");

  const filteredDevices = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return DEVICES.filter((d) => {
      const matchType = type === "all" || d.type === type;
      const matchStatus = status === "all" || d.status === status;
      const matchKeyword =
        kw === "" || d.name.toLowerCase().includes(kw) || d.ip.includes(kw);
      return matchType && matchStatus && matchKeyword;
    });
  }, [keyword, type, status]);

  const handleReset = () => {
    setKeyword("");
    setType("all");
    setStatus("all");
  };

  const columns = [
    {
      title: "设备名称",
      dataIndex: "name",
      key: "name",
      render: (name) => (
        <a
          className="table-link"
          onClick={() => {}}
          title={`查看 ${name} 详情`}
        >
          {name}
        </a>
      ),
    },
    { title: "管理IP", dataIndex: "ip", key: "ip" },
    {
      title: "设备类型",
      dataIndex: "type",
      key: "type",
      filters: DEVICE_TYPES.map((t) => ({ text: t, value: t })),
      onFilter: (value, record) => record.type === value,
    },
    { title: "所在位置", dataIndex: "location", key: "location" },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      filters: DEVICE_STATUS_OPTIONS
        .filter((o) => o.value !== "all")
        .map((o) => ({ text: o.label, value: o.value })),
      onFilter: (value, record) => record.status === value,
      render: (status) => <StatusTag status={status} />,
    },
    {
      title: "CPU使用率",
      dataIndex: "cpuUsage",
      key: "cpuUsage",
      align: "right",
      sorter: (a, b) => a.cpuUsage - b.cpuUsage,
      render: (v) => `${v}%`,
    },
    {
      title: "内存使用率",
      dataIndex: "memUsage",
      key: "memUsage",
      align: "right",
      sorter: (a, b) => a.memUsage - b.memUsage,
      render: (v) => `${v}%`,
    },
    {
      title: "上线时间",
      dataIndex: "uptime",
      key: "uptime",
      sorter: (a, b) => a.uptime.localeCompare(b.uptime),
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <span className="table-actions">
          <Icon
            name="file-text"
            size="0.875rem"
            className="table-action-icon"
            title="查看详情"
            onClick={() => {}}
          />
          <Icon
            name="pencil"
            size="0.875rem"
            className="table-action-icon"
            title="编辑设备"
            onClick={() => {}}
          />
          <Icon
            name="trash-2"
            size="0.875rem"
            className="table-action-icon"
            title="删除设备"
            onClick={() => {}}
          />
        </span>
      ),
    },
  ];

  return (
    <div className="device-view">
      <div className="toolbar-card">
        <Input
          className="toolbar-search"
          allowClear
          placeholder="搜索设备名称或管理IP"
          suffix={<Icon name="search" size="0.875rem" />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={() => {}}
        />
        <Select
          style={{ width: "9rem" }}
          value={type}
          onChange={setType}
          options={DEVICE_TYPE_OPTIONS}
        />
        <Select
          style={{ width: "9rem" }}
          value={status}
          onChange={setStatus}
          options={DEVICE_STATUS_OPTIONS}
        />
        <Button type="primary" icon={<Icon name="search" size="0.875rem" />}>
          查询
        </Button>
        <Button icon={<Icon name="rotate-cw" size="0.875rem" />} onClick={handleReset}>
          重置
        </Button>
        <div className="toolbar-spacer" />
        <Button type="primary" icon={<Icon name="plus" size="0.875rem" />}>
          新增设备
        </Button>
      </div>
      <div className="table-card">
        <Table
          rowKey="id"
          size="large"
          columns={columns}
          dataSource={filteredDevices}
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
