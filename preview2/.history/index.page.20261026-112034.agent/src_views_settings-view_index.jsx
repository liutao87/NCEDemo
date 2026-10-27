import { useState } from "react";
import { Button, Input, InputNumber, Switch, message } from "antd";
import "./index.css";

// Layer 4: 系统设置 — H5 表单骨架(标签居左) + 开关设置行
const DEFAULT_FORM = {
  systemName: "iMaster NCE-Campus",
  adminEmail: "admin@example.com",
  pollInterval: 30,
  soundAlarm: true,
  emailNotify: true,
  smsNotify: false,
};

export default function SettingsView() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSave = () => {
    const next = {};
    if (!form.systemName.trim()) {
      next.systemName = "请输入系统名称";
    }
    if (!form.adminEmail.trim()) {
      next.adminEmail = "请输入管理员邮箱";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.adminEmail)) {
      next.adminEmail = "邮箱格式不正确";
    }
    if (form.pollInterval === null || form.pollInterval === undefined) {
      next.pollInterval = "请输入轮询间隔";
    } else if (form.pollInterval < 5 || form.pollInterval > 3600) {
      next.pollInterval = "取值范围 5 - 3600 秒";
    }
    setErrors(next);
    if (Object.keys(next).length === 0) {
      message.success("系统设置已保存");
    }
  };

  const handleCancel = () => {
    setForm(DEFAULT_FORM);
    setErrors({});
  };

  return (
    <div className="settings-view">
      <section className="settings-card">
        <h3 className="settings-card-title">基本设置</h3>
        <div className="settings-grid">
          <label className="form-label required" htmlFor="set-name">系统名称</label>
          <div className="form-field">
            <Input
              id="set-name"
              style={{ width: "24rem" }}
              status={errors.systemName ? "error" : undefined}
              value={form.systemName}
              onChange={(e) => setField("systemName", e.target.value)}
              placeholder="请输入系统名称"
            />
            {errors.systemName && <div className="form-error">{errors.systemName}</div>}
          </div>

          <label className="form-label required" htmlFor="set-email">管理员邮箱</label>
          <div className="form-field">
            <Input
              id="set-email"
              style={{ width: "24rem" }}
              status={errors.adminEmail ? "error" : undefined}
              value={form.adminEmail}
              onChange={(e) => setField("adminEmail", e.target.value)}
              placeholder="name@example.com"
            />
            {errors.adminEmail && <div className="form-error">{errors.adminEmail}</div>}
          </div>

          <label className="form-label" htmlFor="set-interval">轮询间隔</label>
          <div className="form-field">
            <span className="form-inline">
              <InputNumber
                id="set-interval"
                mode="spinner"
                variant="outlined"
                style={{ width: "8rem" }}
                min={5}
                max={3600}
                value={form.pollInterval}
                onChange={(v) => setField("pollInterval", v)}
                placeholder="30"
              />
              <span className="form-unit">秒</span>
            </span>
            {errors.pollInterval && <div className="form-error">{errors.pollInterval}</div>}
          </div>
        </div>
      </section>

      <section className="settings-card">
        <h3 className="settings-card-title">告警通知</h3>
        <div className="switch-row">
          <div className="switch-text">
            <span className="switch-label">告警声音提醒</span>
            <span className="switch-desc">产生紧急/重要告警时在控制台播放提示音</span>
          </div>
          <Switch checked={form.soundAlarm} onChange={(v) => setField("soundAlarm", v)} />
        </div>
        <div className="switch-row">
          <div className="switch-text">
            <span className="switch-label">邮件通知</span>
            <span className="switch-desc">新告警产生时发送邮件至管理员邮箱</span>
          </div>
          <Switch checked={form.emailNotify} onChange={(v) => setField("emailNotify", v)} />
        </div>
        <div className="switch-row">
          <div className="switch-text">
            <span className="switch-label">短信通知</span>
            <span className="switch-desc">紧急告警产生时发送短信至值班手机（需配置网关）</span>
          </div>
          <Switch checked={form.smsNotify} onChange={(v) => setField("smsNotify", v)} />
        </div>
      </section>

      <div className="settings-actions">
        <Button onClick={handleCancel}>取消</Button>
        <Button type="primary" onClick={handleSave}>保存</Button>
      </div>
    </div>
  );
}
