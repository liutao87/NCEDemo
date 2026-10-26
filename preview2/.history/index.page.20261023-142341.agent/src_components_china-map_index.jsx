import { useEffect, useRef, useState } from "react";
import { CHINA_PROVINCES, NINE_DASH_LINES } from "../../mock/china-map.js";
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

      // 3. 南海诸岛附图(右下角,真实九段线 + 台湾/海南轮廓)
      const sw = 88;
      const sh = 64;
      const hainanP = CHINA_PROVINCES.find((p) => p.name === "海南");
      const taiwanP = CHINA_PROVINCES.find((p) => p.name === "台湾");
      drawSouthSea(ctx, w - sw - 10, h - sh - 10, sw, sh, {
        ...colors,
        fill: withAlpha(cFill, 0.5),
        border: withAlpha(cSub, 0.45),
        label: cSub,
      }, hainanP ? hainanP.points : null, taiwanP ? taiwanP.points : null);
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
    // 逆序遍历:后绘制(面积小、覆盖上层)的优先命中,保证京津/港澳可精确选中
    let hit = null;
    for (let i = pathsRef.current.length - 1; i >= 0; i--) {
      const p = pathsRef.current[i];
      if (pointInPolygon(x, y, p.px)) {
        hit = p;
        break;
      }
    }
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
