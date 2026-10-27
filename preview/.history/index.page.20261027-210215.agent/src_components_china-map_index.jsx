import { useEffect, useRef, useState } from "react";
import { Icon } from "../../../assets/shared/icon.jsx";
import { useApp } from "../../context.jsx";
import { CHINA_PROVINCES, NINE_DASH_LINES, MAP_MARKERS, MAP_HUBS, LINK_LABELS } from "../../mock/china-map.js";
import "./index.css";

// Layer 3: 中国地图 — canvas 绘制(阿里 DataV 高德行政区划数据)
// 双层边界:省界线(细,浅色) + 国界/海岸线(粗,深色,CHINA_BORDER)
// 其余:省份文本 + 绿色标注点 + 连线 + 枢纽 logo(DOM 叠加) + 南海附图,明暗配色自动跟随

const LON_MIN = 73.2;
const LON_MAX = 135.8;
const LAT_MIN = 17.2;
const LAT_MAX = 53.9;
// 中纬度(~35°N)经度方向收缩系数,让形状更接近真实观感
const MID_LAT_K = Math.cos((35 * Math.PI) / 180);
const SPAN_X = (LON_MAX - LON_MIN) * MID_LAT_K;
const SPAN_Y = LAT_MAX - LAT_MIN;

// 省份文本字号分级(px 基准,随画布宽度整体缩放)
const FONT_BASE = { lg: 12.5, md: 11.5, sm: 10.5, xs: 9 };

function readToken(el, name, fallback) {
  if (!el) return fallback;
  const v = window.getComputedStyle(el).getPropertyValue(name).trim();
  return v || fallback;
}

function withAlpha(color, alpha) {
  if (typeof color === "string" && color.startsWith("#")) {
    let h = color.slice(1);
    if (h.length === 3) {
      h = h
        .split("")
        .map((c) => c + c)
        .join("");
    }
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return color;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
}

// 南海诸岛附图(右下角示意框:真实九段线 + 台湾/海南轮廓投影)
function drawSouthSea(ctx, x0, y0, w, h, colors, hainan, taiwan) {
  ctx.save();
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 1;
  ctx.strokeRect(x0, y0, w, h);
  ctx.fillStyle = colors.fill;
  ctx.fillRect(x0, y0, w, h);
  // 附图投影:南海区域 lon[104,123.5] lat[1,23.5] 线性映射进框内
  const SL0 = 104;
  const SL1 = 123.5;
  const SA0 = 1;
  const SA1 = 23.5;
  const prj = (lon, lat) => [x0 + ((lon - SL0) / (SL1 - SL0)) * w, y0 + ((SA1 - lat) / (SA1 - SA0)) * h];
  const strokeRing = (ring) => {
    ctx.beginPath();
    ring.forEach(([lon, lat], i) => {
      const [x, y] = prj(lon, lat);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
  };
  // 九段线(每段为细条轮廓,取形画成虚线段)
  ctx.strokeStyle = colors.sea;
  ctx.lineWidth = 1.2;
  ctx.setLineDash([3, 2]);
  NINE_DASH_LINES.forEach((seg) => {
    strokeRing(seg);
    ctx.stroke();
  });
  ctx.setLineDash([]);
  // 台湾 / 海南轮廓
  ctx.fillStyle = colors.sea;
  if (taiwan) {
    strokeRing(taiwan);
    ctx.fill();
  }
  if (hainan) {
    strokeRing(hainan);
    ctx.fill();
  }
  ctx.fillStyle = colors.label;
  ctx.font = `400 9px "HarmonyOS Sans SC", "Microsoft YaHei", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("南海诸岛", x0 + w / 2, y0 + h * 0.1);
  ctx.restore();
}

export default function ChinaMap() {
  const { isDark } = useApp();
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  // 视图状态:交互缩放/平移(ref 存放,重绘时读取,不触发 React 渲染)
  const viewRef = useRef({ zoom: 1, panX: 0, panY: 0 });
  const redrawRef = useRef(null); // 重绘函数引用(控制按钮触发)
  const [hubPos, setHubPos] = useState([]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return undefined;

    const draw = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (w <= 0 || h <= 0) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // 颜色取自组件 CSS 中的地图专属变量(浅/暗两套,.dark 切换后随之变化)
      const cFill = readToken(wrap, "--map-fill", "#F0F0F0");
      const cLine = readToken(wrap, "--map-line", "#D9D9D9"); // 省界线
      const cText = readToken(wrap, "--map-text", "#595959");
      const cSub = readToken(wrap, "--map-text-sub", "#8C8C8C");
      const cMarker = readToken(wrap, "--map-link", "#08A471"); // 标注点
      const cLink = readToken(wrap, "--map-link", "#08A471"); // 连线/logo
      const cStripe = readToken(wrap, "--map-stripe", "#202020"); // 背景条纹

      // 0. 背景竖直条纹(条纹与间隔交替布满画布,省份多边形覆盖其上)
      const stripeW = 3; // 条纹宽 3px
      const stripeGap = 2; // 间隙 2px
      ctx.fillStyle = cStripe;
      for (let x = 0; x < w; x += stripeW + stripeGap) {
        ctx.fillRect(x, 0, stripeW, h);
      }

      // 基础投影(等比缩放 + 居中,整体放大 1.3 倍)
      const ZOOM = 1.3;
      const pad = 10;
      const scale =
        ZOOM * Math.min((w - pad * 2) / SPAN_X, (h - pad * 2) / SPAN_Y);
      const offsetX = (w - SPAN_X * scale) / 2;
      const offsetY = (h - SPAN_Y * scale) / 2;
      // 视图变换:绕画布中心缩放 + 平移(滚轮缩放/拖拽交互)
      const { zoom, panX, panY } = viewRef.current;
      const cx = w / 2;
      const cy = h / 2;
      const project = (lon, lat) => {
        const bx = offsetX + (lon - LON_MIN) * MID_LAT_K * scale;
        const by = offsetY + (LAT_MAX - lat) * scale;
        return [(bx - cx) * zoom + cx + panX, (by - cy) * zoom + cy + panY];
      };
      const strokePath = (points) => {
        ctx.beginPath();
        points.forEach(([lon, lat], i) => {
          const [x, y] = project(lon, lat);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
      };

      // 1. 省份:填充 + 省界线(细,浅色)
      ctx.lineJoin = "round";
      CHINA_PROVINCES.forEach((p) => {
        strokePath(p.points);
        ctx.fillStyle = cFill;
        ctx.fill();
        ctx.strokeStyle = cLine;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // 2. 省份文本(字号随画布宽度 + 视图缩放整体缩放,设上下限)
      const fontScale =
        Math.min(Math.max(w / 760, 0.78), 1.15) *
        Math.min(Math.max(zoom, 0.6), 2);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      CHINA_PROVINCES.forEach((p) => {
        const fs = FONT_BASE[p.size] * fontScale;
        ctx.font = `400 ${fs}px "HarmonyOS Sans SC", "Microsoft YaHei", sans-serif`;
        ctx.fillStyle = p.size === "lg" || p.size === "md" ? cText : cSub;
        const [lx, ly] = project(p.label[0], p.label[1]);
        ctx.fillText(p.name, lx, ly);
      });

      // 4. 站点连线:每个站点标注点与前海/嘉定/外高桥三个枢纽全部互联
      const remPx = parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;
      ctx.lineWidth = 1;
      ctx.strokeStyle = cLink;
      MAP_MARKERS.forEach((m) => {
        const [x1, y1] = project(m.lon, m.lat);
        MAP_HUBS.forEach((hub) => {
          const [x2, y2] = project(hub.lon, hub.lat);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        });
      });

      // 4.5 枢纽骨干互联(前海 ↔ 嘉定 ↔ 外高桥 三角骨干环,线加粗与站点接入线区分)
      ctx.lineWidth = 1.5;
      const hubPairs = [
        ["qianhai", "fuzhou"],
        ["fuzhou", "waigaoqiao"],
        ["waigaoqiao", "qianhai"],
      ];
      hubPairs.forEach(([idA, idB]) => {
        const h1 = MAP_HUBS.find((hb) => hb.id === idA);
        const h2 = MAP_HUBS.find((hb) => hb.id === idB);
        if (!h1 || !h2) return;
        const [x1, y1] = project(h1.lon, h1.lat);
        const [x2, y2] = project(h2.lon, h2.lat);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });
      ctx.lineWidth = 1;

      // 4.7 连线序列号标签:部分线条中点,圆(直径2rem)或长方形(2rem×1rem)包裹数字
      //     背景色同连线色,数字白色
      const resolveRef = (ref) => {
        if (ref.startsWith("hub:")) {
          const hub = MAP_HUBS.find((h) => h.id === ref.slice(4));
          return hub ? [hub.lon, hub.lat] : null;
        }
        const m = MAP_MARKERS.find((mk) => mk.city === ref);
        return m ? [m.lon, m.lat] : null;
      };
      LINK_LABELS.forEach((lb) => {
        const p1 = resolveRef(lb.from);
        const p2 = resolveRef(lb.to);
        if (!p1 || !p2) return;
        const [x1, y1] = project(p1[0], p1[1]);
        const [x2, y2] = project(p2[0], p2[1]);
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        const w = 2 * remPx;
        ctx.font = `500 ${0.875 * remPx}px "HarmonyOS Sans SC", "Microsoft YaHei", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        if (lb.shape === "circle") {
          // 圆:无方向,数字水平居中
          ctx.beginPath();
          ctx.arc(mx, my, w / 2, 0, Math.PI * 2);
          ctx.fillStyle = cLink;
          ctx.fill();
          ctx.fillStyle = "#FFFFFF";
          ctx.fillText(String(lb.num), mx, my);
        } else {
          // 长方形:长边沿线条方向旋转,数字旋转 -90°(垂直于长边),垂直水平居中
          let angle = Math.atan2(y2 - y1, x2 - x1);
          if (angle > Math.PI / 2) angle -= Math.PI;
          if (angle < -Math.PI / 2) angle += Math.PI;
          const h = 1 * remPx;
          ctx.save();
          ctx.translate(mx, my);
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 0.125 * remPx);
          ctx.fillStyle = cLink;
          ctx.fill();
          ctx.fillStyle = "#FFFFFF";
          ctx.fillText(String(lb.num), 0, 0); // 数字水平垂直居中(textAlign/textBaseline 已设)
          ctx.restore();
        }
      });

      // 5. 站点标注点(绿色实心圆)
      MAP_MARKERS.forEach((m) => {
        const [x, y] = project(m.lon, m.lat);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = cMarker;
        ctx.fill();
      });

      // 5.5 枢纽标注点(绿色实心圆,连线汇聚处,logo 悬浮其上)
      MAP_HUBS.forEach((hb) => {
        const [x, y] = project(hb.lon, hb.lat);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = cMarker;
        ctx.fill();
      });

      // 6. 枢纽位置输出给 DOM 叠加层:logo 中心对准标注点中心(圆心=点)
      setHubPos(
        MAP_HUBS.map((hb) => {
          const [x, y] = project(hb.lon, hb.lat);
          return { id: hb.id, label: hb.label, x, y };
        }),
      );

      // 7. 南海诸岛附图(右下角,真实九段线 + 台湾/海南轮廓)
      const sw = 88;
      const sh = 64;
      const hainanP = CHINA_PROVINCES.find((p) => p.name === "海南");
      const taiwanP = CHINA_PROVINCES.find((p) => p.name === "台湾");
      drawSouthSea(ctx, w - sw - 10, h - sh - 10, sw, sh, {
        fill: withAlpha(cFill, 0.5),
        border: cLine,
        sea: cText,
        label: cSub,
      }, hainanP ? hainanP.points : null, taiwanP ? taiwanP.points : null);
    };

    redrawRef.current = draw;
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(wrap);

    // ---------- 地图交互:滚轮缩放(以鼠标为锚点) + 拖拽平移 ----------
    const onWheel = (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const v = viewRef.current;
      const ccx = rect.width / 2;
      const ccy = rect.height / 2;
      const factor = e.deltaY < 0 ? 1.18 : 1 / 1.18;
      const z2 = Math.min(Math.max(v.zoom * factor, 0.5), 8);
      // 反推鼠标点对应的基础投影坐标,保持缩放锚点地理不动
      const bx = (mx - ccx - v.panX) / v.zoom + ccx;
      const by = (my - ccy - v.panY) / v.zoom + ccy;
      viewRef.current = {
        zoom: z2,
        panX: mx - ccx - (bx - ccx) * z2,
        panY: my - ccy - (by - ccy) * z2,
      };
      draw();
    };

    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const onDown = (e) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.style.cursor = "grabbing";
    };
    const onMove = (e) => {
      if (!dragging) return;
      const v = viewRef.current;
      viewRef.current = {
        ...v,
        panX: v.panX + (e.clientX - lastX),
        panY: v.panY + (e.clientY - lastY),
      };
      lastX = e.clientX;
      lastY = e.clientY;
      draw();
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      canvas.style.cursor = "grab";
    };

    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    return () => {
      ro.disconnect();
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDark]);

  // 控制按钮:以画布中心为锚缩放(中心地理位置保持不动);居中重置视图
  const zoomBy = (factor) => {
    const v = viewRef.current;
    const z2 = Math.min(Math.max(v.zoom * factor, 0.5), 8);
    const k = z2 / v.zoom;
    viewRef.current = { zoom: z2, panX: v.panX * k, panY: v.panY * k };
    if (redrawRef.current) redrawRef.current();
  };

  const resetView = () => {
    viewRef.current = { zoom: 1, panX: 0, panY: 0 };
    if (redrawRef.current) redrawRef.current();
  };

  return (
    <div ref={wrapRef} className="china-map">
      <canvas ref={canvasRef} className="china-map-canvas" />
      {/* 右下角视图控制:放大/缩小(连体,分割线隔开) + 居中 */}
      <div className="map-controls">
        <div className="map-zoom-group">
          <button type="button" className="map-ctl-btn" title="放大" aria-label="放大" onClick={() => zoomBy(1.3)}>
            <Icon name="plus" size="1rem" />
          </button>
          <button type="button" className="map-ctl-btn" title="缩小" aria-label="缩小" onClick={() => zoomBy(1 / 1.3)}>
            <Icon name="minus" size="1rem" />
          </button>
        </div>
        <button type="button" className="map-ctl-btn is-single" title="居中" aria-label="居中" onClick={resetView}>
          <Icon name="locate-fixed" size="1rem" />
        </button>
      </div>
      {hubPos.map((hb) => (
        <div key={hb.id} className="map-hub" style={{ left: `${hb.x}px`, top: `${hb.y}px` }}>
          <div className="map-hub-logo" title={hb.label}>
            <Icon name="building-2" size="1.5rem" color="#FFFFFF" />
          </div>
          <span className="map-hub-label">{hb.label}</span>
        </div>
      ))}
    </div>
  );
}
