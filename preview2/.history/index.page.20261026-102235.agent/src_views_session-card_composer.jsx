import { useEffect, useRef, useState } from "react";
import { Input, Popover, Select } from "antd";
import { Icon } from "../../../assets/shared/icon.jsx";
import { SCENE_OPTIONS, TEMPLATES } from "../../mock/session.js";

const { TextArea } = Input;

const TPL_TABS = [
  { key: "all", label: "全部" },
  { key: "device", label: "设备" },
  { key: "app", label: "应用" },
  { key: "security", label: "安全" },
];

const MAX_LEN = 2000;
const PLACEHOLDER = "输入问题或输入“/”触发提示词";

// 模板库浮层面板:标题 + 分类tab + 模板列表(354px,超出滚动)
function TplPanel({ tab, onTab, selectedKey, onPick }) {
  const list = TEMPLATES.filter((t) => tab === "all" || t.category === tab);
  return (
    <div className="tpl-panel">
      <div className="tpl-title">模板列表</div>
      <div className="tpl-tabs">
        {TPL_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={t.key === tab ? "tpl-tab is-active" : "tpl-tab"}
            onClick={() => onTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="tpl-list">
        {list.map((t) => (
          <button
            key={t.key}
            type="button"
            className={t.key === selectedKey ? "tpl-item is-active" : "tpl-item"}
            onClick={() => onPick(t)}
          >
            <Icon name={t.icon} size="0.875rem" />
            <span className="tpl-name">{t.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// AI 输入框:初始 48px 单行,点击展开为 120px 完整输入区(渐变彩边 + 模板库 + 字数 + 发送)
// 展开后保持大输入框状态,不因点击外部而收起;defaultExpanded 可指定初始即展开
// onSend:发送回调(Enter/点击发送触发),发送后清空输入;busy:回答生成中锁定发送
export default function Composer({ defaultExpanded = false, busy = false, onSend }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [text, setText] = useState("");
  const [scene, setScene] = useState("config");
  const [tplOpen, setTplOpen] = useState(false);
  const [tplTab, setTplTab] = useState("all");
  const [selectedTpl, setSelectedTpl] = useState(null);
  const taRef = useRef(null);

  useEffect(() => {
    if (expanded && taRef.current) taRef.current.focus();
  }, [expanded]);

  const canSend = Boolean(onSend) && !busy && text.trim().length > 0;
  const tplLabel = selectedTpl ? selectedTpl.name : "模板库";

  // 发送:回调后清空输入内容与已选模板
  const doSend = () => {
    if (!canSend) return;
    onSend(text.trim());
    setText("");
    setSelectedTpl(null);
  };

  const pickTpl = (tpl) => {
    setSelectedTpl(tpl);
    setText(tpl.prompt);
    setTplOpen(false);
    if (taRef.current) taRef.current.focus();
  };

  const clearTpl = () => {
    setSelectedTpl(null);
    setText("");
  };

  if (!expanded) {
    // 初始态:48px 小输入框,点击展开
    return (
      <div className="session-composer">
        <button
          type="button"
          className="composer-frame is-small"
          onClick={() => setExpanded(true)}
          aria-label="展开输入框"
        >
          <span className="composer-inner">
            <span className="composer-placeholder">{text || PLACEHOLDER}</span>
            <span className="composer-send-mini">
              <Icon name="send" size="1rem" />
            </span>
          </span>
        </button>
      </div>
    );
  }

  // 展开态:120px 大输入框 + 工具栏 + AI 提示(保持展开,不自动收起)
  return (
    <div className="session-composer">
      <div className="composer-frame is-big">
        <div className="composer-inner">
          <div className="composer-input">
            <TextArea
              ref={taRef}
              variant="borderless"
              value={text}
              placeholder={PLACEHOLDER}
              maxLength={MAX_LEN}
              onChange={(e) => setText(e.target.value)}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  doSend();
                }
              }}
              style={{ height: "100%", resize: "none" }}
            />
          </div>
          <div className="composer-toolbar">
            <div className="composer-tools-left">
              <Select
                className="scene-select"
                variant="borderless"
                value={scene}
                onChange={setScene}
                popupMatchSelectWidth={false}
                options={SCENE_OPTIONS.map((o) => ({
                  value: o.value,
                  label: (
                    <span className="scene-label">
                      <Icon name="sliders-horizontal" size="0.75rem" />
                      {o.label}
                    </span>
                  ),
                }))}
              />
              <Popover
                arrow={false}
                trigger="click"
                placement="topLeft"
                open={tplOpen}
                onOpenChange={setTplOpen}
                overlayClassName="tpl-popover"
                content={
                  <TplPanel
                    tab={tplTab}
                    onTab={setTplTab}
                    selectedKey={selectedTpl ? selectedTpl.key : ""}
                    onPick={pickTpl}
                  />
                }
              >
                <div
                  className={selectedTpl ? "tool-btn is-active" : "tool-btn"}
                  role="button"
                  tabIndex={0}
                  aria-label="打开模板库"
                >
                  <Icon name="layout-template" size="0.75rem" />
                  <span className="tool-btn-text">{tplLabel}</span>
                  {selectedTpl ? (
                    <span
                      className="tool-btn-clear"
                      role="button"
                      tabIndex={0}
                      title="清除模板"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        clearTpl();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          clearTpl();
                        }
                      }}
                    >
                      <Icon name="x" size="0.75rem" />
                    </span>
                  ) : null}
                </div>
              </Popover>
              <span className="word-count">
                {text.length}/{MAX_LEN}
              </span>
            </div>
            <div className="composer-tools-right">
              <button type="button" className="icon-tool" title="插入链接">
                <Icon name="link" size="1rem" />
              </button>
              <button type="button" className="icon-tool" title="语音输入">
                <Icon name="mic" size="1rem" />
              </button>
              <button
                type="button"
                className={canSend ? "send-btn is-active" : "send-btn"}
                title={busy ? "回答生成中…" : "发送"}
                onClick={doSend}
              >
                <Icon name={busy ? "loader-circle" : "send"} size="1rem" className={busy ? "is-spin" : ""} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="composer-hint">
        <span>内容由ai生成，无法确保准确性和完整性，仅供参考。</span>
        <Icon name="circle-question-mark" size="0.75rem" />
      </div>
    </div>
  );
}
