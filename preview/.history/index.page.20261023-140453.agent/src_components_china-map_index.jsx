import { useEffect, useRef, useState } from "react";
import { CHINA_PROVINCES } from "../../mock/china-map.js";
import { useApp } from "../../context.jsx";
import "./index.css";

// Layer 3: 中国省份地图 — canvas 绘制简化多边形 + 省份文本 + hover 高亮
// 投影:等距圆柱 + 中纬度经度收缩;颜色取 design token,暗色模式自动跟随重绘

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

function pointInPolygon(x, y, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0];
    const yi = pts[i][1];
    const xj = pts[j][0];
    const yj = pts[j][1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

// 南海诸岛附图(右下角示意框,九段线以虚线段表示)
function drawSouthSea(ctx, x0, y0, w, h, colors) {
  ctx.save();
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 1;
  ctx.strokeRect(x0, y0, w, h);
  ctx.fillStyle = colors.fill;
  ctx.fillRect(x0, y0, w, h);
  ctx.strokeStyle = colors.sea;
  ctx.lineWidth = 1.2;
  ctx.setLineDash([3, 2]);
  ctx.beginPath();
  // 九段线示意:左侧纵列 4 段 + 底部横列 5 段
  const seg = (a, b, c, d) => {
    ctx.moveTo(a, b);
    ctx.lineTo(c, d);
  };
  seg(x0 + w * 0.22, y0 + h * 0.08, x0 + w * 0.22, y0 + h * 0.24);
  seg(x0 + w * 0.18, y0 + h * 0.38, x0 + w * 0.18, y0 + h * 0.54);
  seg(x0 + w * 0.22, y0 + h * 0.68, x0 + w * 0.22, y0 + h * 0.8);
  seg(x0 + w * 0.3, y0 + h * 0.88, x0 + w * 0.4, y0 + h * 0.9);
  seg(x0 + w * 0.5, y0 + h * 0.9, x0 + w * 0.6, y0 + h * 0.9);
  seg(x0 + w * 0.7, y0 + h * 0.9, x0 + w * 0.78, y0 + h * 0.9);
  seg(x0 + w * 0.86, y0 + h * 0.86, x0 + w * 0.92, y0 + h * 0.8);
  seg(x0 + w * 0.95, y0 + h * 0.68, x0 + w * 0.96, y0 + h * 0.58);
  seg(x0 + w * 0.94, y0 + h * 0.42, x0 + w * 0.94, y0 + h * 0.32);
  ctx.stroke();
  ctx.setLineDash([]);
  // 岛屿点示意
  ctx.fillStyle = colors.sea;
  [
    [0.38, 0.6],
    [0.52, 0.52],
    [0.66, 0.44],
    [0.78, 0.38],
    [0.6, 0.66],
    [0.72, 0.58],
  ].forEach(([px, py]) => {
    ctx.beginPath();
    ctx.arc(x0 + w * px, y0 + h * py, 1.5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = colors.label;
  ctx.font = `400 9px "HarmonyOS Sans SC", "Microsoft YaHei", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("南海诸岛", x0 + w / 2, y0 + h * 0.16);
  ctx.restore();
}

export default function ChinaMap() {
  const { isDark } = useApp();
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const pathsRef = useRef([]);
  const [hoverCode, setHoverCode] = useState(null);

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

      // 颜色取自容器继承链上的 token(暗色切换后随之变化)
      const cFill = readToken(wrap, "--info-container", "#E3F0FC");
      const cBorder = readToken(wrap, "--surface-container-lowest", "#F4F7FB");
      const cActive = readToken(wrap, "--info", "#0067D1");
      const cLabel = readToken(wrap, "--on-surface", "#1F2A3D");
      const cSub = readToken(wrap, "--on-surface-variant", "#5A6B84");
      const colors = {
        fill: cFill,
        border: cBorder,
        active: cActive,
        label: cLabel,
        sea: cActive,
      };

      // 投影参数(等比缩放 + 居中)
      const pad = 10;
      const scale = Math.min((w - pad * 2) / SPAN_X, (h - pad * 2) / SPAN_Y);
      const offsetX = (w - SPAN_X * scale) / 2;
      const offsetY = (h - SPAN_Y * scale) / 2;
      const project = (lon, lat) => [
        offsetX + (lon - LON_MIN) * MID_LAT_K * scale,
        offsetY + (LAT_MAX - lat) * scale,
      ];

      // 缓存投影后的像素路径(hover 命中检测复用)
      pathsRef.current = CHINA_PROVINCES.map((p) => ({
        code: p.code,
        name: p.name,
        size: p.size,
        label: project(p.label[0], p.label[1]),
        px: p.points.map(([lon, lat]) => project(lon, lat)),
      }));

      // 1. 省份多边形:填充 + 描边
      ctx.lineJoin = "round";
      pathsRef.current.forEach((p) => {
        ctx.beginPath();
        p.px.forEach(([x, y], i) => {
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fillStyle = p.code === hoverCode ? withAlpha(cActive, 0.35) : cFill;
        ctx.fill();
        ctx.strokeStyle = p.code === hoverCode ? cActive : withAlpha(cActive, 0.55);
        ctx.lineWidth = p.code === hoverCode ? 1.5 : 1;
        ctx.stroke();
      });

      // 2. 省份文本(字号随画布宽度整体缩放)
      const fontScale = Math.min(Math.max(w / 760, 0.78), 1.15);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      pathsRef.current.forEach((p) => {
        const fs = FONT_BASE[p.size] * fontScale;
        const active = p.code === hoverCode;
        ctx.font = `${active ? 600 : 400} ${fs}px "HarmonyOS Sans SC", "Microsoft YaHei", sans-serif`;
        ctx.fillStyle = active ? cActive : p.size === "lg" || p.size === "md" ? cLabel : cSub;
        ctx.fillText(p.name, p.label[0], p.label[1]);
      });

      // 3. 南海诸岛附图(右下角)
      const sw = 88;
      const sh = 64;
      drawSouthSea(ctx, w - sw - 10, h - sh - 10, sw, sh, {
        ...colors,
        fill: withAlpha(cFill, 0.5),
        border: withAlpha(cSub, 0.45),
        label: cSub,
      });
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [isDark, hoverCode]);

  const handleMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // 多个命中时取顶点最少(面积最小)的区域,保证京津/港澳可命中
    let hit = null;
    pathsRef.current.forEach((p) => {
      if (pointInPolygon(x, y, p.px)) {
        if (!hit || p.px.length < hit.px.length) hit = p;
      }
    });
    const code = hit ? hit.code : null;
    setHoverCode((prev) => (prev === code ? prev : code));
  };

  const handleLeave = () => setHoverCode(null);

  return (
    <div ref={wrapRef} className="china-map" title={hoverCode ? "当前省份" : undefined}>
      <canvas
        ref={canvasRef}
        className="china-map-canvas"
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
      />
    </div>
  );
}
