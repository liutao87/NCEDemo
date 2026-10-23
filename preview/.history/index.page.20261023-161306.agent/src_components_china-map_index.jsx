import { useEffect, useRef } from "react";
import { CHINA_PROVINCES, NINE_DASH_LINES, MAP_MARKERS, MAP_HUBS } from "../../mock/china-map.js";
import { useApp } from "../../context.jsx";
import "./index.css";

// Layer 3: 中国省份地图 — canvas 绘制真实边界 + 省份文本
// 投影:等距圆柱 + 中纬度经度收缩;颜色取组件级地图变量,暗色模式自动跟随重绘

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
      const cLine = readToken(wrap, "--map-line", "#D9D9D9");
      const cText = readToken(wrap, "--map-text", "#595959");
      const cSub = readToken(wrap, "--map-text-sub", "#8C8C8C");
      const cMarker = readToken(wrap, "--success", "#00A870");
      const cLink = readToken(wrap, "--map-link", "#06A46F");

      // 投影参数(等比缩放 + 居中)
      const pad = 10;
      const scale = Math.min((w - pad * 2) / SPAN_X, (h - pad * 2) / SPAN_Y);
      const offsetX = (w - SPAN_X * scale) / 2;
      const offsetY = (h - SPAN_Y * scale) / 2;
      const project = (lon, lat) => [
        offsetX + (lon - LON_MIN) * MID_LAT_K * scale,
        offsetY + (LAT_MAX - lat) * scale,
      ];

      // 1. 省份多边形:填充 + 描边
      ctx.lineJoin = "round";
      CHINA_PROVINCES.forEach((p) => {
        ctx.beginPath();
        p.points.forEach(([lon, lat], i) => {
          const [x, y] = project(lon, lat);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fillStyle = cFill;
        ctx.fill();
        ctx.strokeStyle = cLine;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // 2. 省份文本(字号随画布宽度整体缩放)
      const fontScale = Math.min(Math.max(w / 760, 0.78), 1.15);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      CHINA_PROVINCES.forEach((p) => {
        const fs = FONT_BASE[p.size] * fontScale;
        ctx.font = `400 ${fs}px "HarmonyOS Sans SC", "Microsoft YaHei", sans-serif`;
        ctx.fillStyle = p.size === "lg" || p.size === "md" ? cText : cSub;
        const [lx, ly] = project(p.label[0], p.label[1]);
        ctx.fillText(p.name, lx, ly);
      });

      // 3. 站点连线(标注点 → 枢纽,先画线再画点,点覆盖线端)
      ctx.lineWidth = 1;
      ctx.strokeStyle = cLink;
      MAP_MARKERS.forEach((m) => {
        const hub = MAP_HUBS.find((hb) => hb.id === m.hub);
        if (!hub) return;
        const [x1, y1] = project(m.lon, m.lat);
        const [x2, y2] = project(hub.lon, hub.lat);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });

      // 4. 省份标注点(绿色实心圆)
      MAP_MARKERS.forEach((m) => {
        const [x, y] = project(m.lon, m.lat);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = cMarker;
        ctx.fill();
      });

      // 5. 枢纽标注点(绿色实心圆,略大以示汇聚)
      MAP_HUBS.forEach((hb) => {
        const [x, y] = project(hb.lon, hb.lat);
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = cMarker;
        ctx.fill();
      });

      // 6. 南海诸岛附图(右下角,真实九段线 + 台湾/海南轮廓)
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

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [isDark]);

  return (
    <div ref={wrapRef} className="china-map">
      <canvas ref={canvasRef} className="china-map-canvas" />
    </div>
  );
}
