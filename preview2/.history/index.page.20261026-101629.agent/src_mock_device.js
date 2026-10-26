// Layer 2: 设备域 mock 数据

export const DEVICE_TYPES = ["路由器", "交换机", "防火墙", "WLAN AP"];

export const DEVICE_TYPE_OPTIONS = [
  { value: "all", label: "全部类型" },
  ...DEVICE_TYPES.map((t) => ({ value: t, label: t })),
];

export const DEVICE_STATUS_OPTIONS = [
  { value: "all", label: "全部状态" },
  { value: "online", label: "在线" },
  { value: "offline", label: "离线" },
  { value: "alarm", label: "告警" },
  { value: "maintaining", label: "维护中" },
];

export const DEVICES = [
  { id: 1, name: "NE40E-X8A-01", ip: "10.1.1.1", type: "路由器", location: "杭州-核心机房A", status: "online", cpuUsage: 12, memUsage: 38, uptime: "2026-08-02 09:12" },
  { id: 2, name: "NE40E-X8A-02", ip: "10.1.1.2", type: "路由器", location: "杭州-核心机房A", status: "online", cpuUsage: 15, memUsage: 41, uptime: "2026-08-02 09:26" },
  { id: 3, name: "NE8000-M8", ip: "10.1.2.1", type: "路由器", location: "北京-数据中心C", status: "alarm", cpuUsage: 87, memUsage: 72, uptime: "2026-07-18 14:03" },
  { id: 4, name: "S12700E-4", ip: "10.2.1.1", type: "交换机", location: "杭州-核心机房A", status: "online", cpuUsage: 23, memUsage: 45, uptime: "2026-06-25 10:41" },
  { id: 5, name: "S12700E-5", ip: "10.2.1.2", type: "交换机", location: "杭州-核心机房A", status: "online", cpuUsage: 26, memUsage: 47, uptime: "2026-06-25 10:55" },
  { id: 6, name: "S6730-H24X-11", ip: "10.2.2.11", type: "交换机", location: "上海-汇聚机房B", status: "online", cpuUsage: 18, memUsage: 33, uptime: "2026-09-01 08:20" },
  { id: 7, name: "S6730-H24X-12", ip: "10.2.2.12", type: "交换机", location: "上海-汇聚机房B", status: "maintaining", cpuUsage: 9, memUsage: 30, uptime: "2026-09-01 08:35" },
  { id: 8, name: "S5735-L48T4X-21", ip: "10.2.3.21", type: "交换机", location: "上海-汇聚机房B", status: "online", cpuUsage: 21, memUsage: 36, uptime: "2026-09-14 16:08" },
  { id: 9, name: "S5735-L48T4X-22", ip: "10.2.3.22", type: "交换机", location: "上海-汇聚机房B", status: "offline", cpuUsage: 0, memUsage: 0, uptime: "—" },
  { id: 10, name: "S5735-L24T4S-23", ip: "10.2.3.23", type: "交换机", location: "北京-数据中心C", status: "online", cpuUsage: 17, memUsage: 29, uptime: "2026-09-20 11:47" },
  { id: 11, name: "USG6605E-FW1", ip: "10.3.1.1", type: "防火墙", location: "杭州-核心机房A", status: "online", cpuUsage: 31, memUsage: 52, uptime: "2026-05-30 09:00" },
  { id: 12, name: "USG6315E-FW2", ip: "10.3.1.2", type: "防火墙", location: "上海-汇聚机房B", status: "alarm", cpuUsage: 76, memUsage: 81, uptime: "2026-05-30 09:18" },
  { id: 13, name: "USG6320E-FW3", ip: "10.3.2.1", type: "防火墙", location: "深圳-园区机房D", status: "online", cpuUsage: 28, memUsage: 49, uptime: "2026-08-11 13:29" },
  { id: 14, name: "AirEngine5762-12", ip: "10.4.1.11", type: "WLAN AP", location: "深圳-园区机房D", status: "online", cpuUsage: 11, memUsage: 24, uptime: "2026-10-05 07:52" },
  { id: 15, name: "AirEngine5762-13", ip: "10.4.1.12", type: "WLAN AP", location: "深圳-园区机房D", status: "online", cpuUsage: 13, memUsage: 26, uptime: "2026-10-05 07:52" },
  { id: 16, name: "AirEngine6761-21", ip: "10.4.2.21", type: "WLAN AP", location: "成都-灾备机房E", status: "online", cpuUsage: 19, memUsage: 31, uptime: "2026-09-28 15:14" },
  { id: 17, name: "AirEngine5761-11", ip: "10.4.2.22", type: "WLAN AP", location: "成都-灾备机房E", status: "offline", cpuUsage: 0, memUsage: 0, uptime: "—" },
  { id: 18, name: "AR6300-31", ip: "10.1.3.31", type: "路由器", location: "成都-灾备机房E", status: "online", cpuUsage: 14, memUsage: 27, uptime: "2026-07-07 10:22" },
  { id: 19, name: "AR6280-32", ip: "10.1.3.32", type: "路由器", location: "成都-灾备机房E", status: "online", cpuUsage: 16, memUsage: 30, uptime: "2026-07-07 10:40" },
  { id: 20, name: "S5731-S24P4X-31", ip: "10.2.4.31", type: "交换机", location: "深圳-园区机房D", status: "alarm", cpuUsage: 68, memUsage: 74, uptime: "2026-08-19 17:36" },
  { id: 21, name: "S5731-S24P4X-32", ip: "10.2.4.32", type: "交换机", location: "深圳-园区机房D", status: "online", cpuUsage: 20, memUsage: 35, uptime: "2026-08-19 17:50" },
  { id: 22, name: "NE8000-M1", ip: "10.1.2.2", type: "路由器", location: "北京-数据中心C", status: "online", cpuUsage: 22, memUsage: 44, uptime: "2026-06-12 08:47" },
];
