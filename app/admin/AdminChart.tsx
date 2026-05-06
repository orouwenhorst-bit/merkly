"use client";

import { useEffect, useRef, useState } from "react";

interface ChartPoint {
  date: string;
  total: number;
  premium: number;
}

export default function AdminChart({ data }: { data: ChartPoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) setWidth(containerRef.current.clientWidth);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const padLeft = 36;
  const padRight = 16;
  const padTop = 16;
  const padBottom = 32;
  const h = 180;
  const chartW = width - padLeft - padRight;
  const chartH = h - padTop - padBottom;

  const maxVal = Math.max(...data.map((d) => d.total), 1);
  const step = chartW / Math.max(data.length - 1, 1);

  const toX = (i: number) => padLeft + i * step;
  const toY = (v: number) => padTop + chartH - (v / maxVal) * chartH;

  const totalPath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(d.total).toFixed(1)}`)
    .join(" ");

  const premiumPath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(d.premium).toFixed(1)}`)
    .join(" ");

  // Area fill under total line
  const areaPath = `${totalPath} L ${toX(data.length - 1).toFixed(1)} ${(padTop + chartH).toFixed(1)} L ${padLeft.toFixed(1)} ${(padTop + chartH).toFixed(1)} Z`;

  // Y-axis gridlines (4 lines)
  const gridLines = [0.25, 0.5, 0.75, 1].map((pct) => {
    const y = padTop + chartH - pct * chartH;
    const label = Math.round(pct * maxVal);
    return { y, label };
  });

  // X-axis labels: show every 7th day
  const xLabels = data.filter((_, i) => i % 7 === 0 || i === data.length - 1);

  const [tooltip, setTooltip] = useState<{ x: number; y: number; d: ChartPoint } | null>(null);

  return (
    <div ref={containerRef} className="relative w-full select-none" style={{ height: h }}>
      <svg
        width={width}
        height={h}
        className="overflow-visible"
        onMouseLeave={() => setTooltip(null)}
        onMouseMove={(e) => {
          const rect = (e.target as SVGElement).closest("svg")!.getBoundingClientRect();
          const mx = e.clientX - rect.left - padLeft;
          const idx = Math.round(mx / step);
          if (idx >= 0 && idx < data.length) {
            setTooltip({ x: toX(idx), y: toY(data[idx].total), d: data[idx] });
          }
        }}
      >
        {/* Grid lines */}
        {gridLines.map(({ y, label }) => (
          <g key={label}>
            <line x1={padLeft} x2={width - padRight} y1={y} y2={y} stroke="#27272a" strokeWidth={1} />
            <text x={padLeft - 6} y={y + 4} fontSize={10} fill="#52525b" textAnchor="end">
              {label}
            </text>
          </g>
        ))}

        {/* Zero line */}
        <line
          x1={padLeft}
          x2={width - padRight}
          y1={padTop + chartH}
          y2={padTop + chartH}
          stroke="#3f3f46"
          strokeWidth={1}
        />

        {/* Area fill */}
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#areaGrad)" />

        {/* Total line */}
        <path d={totalPath} fill="none" stroke="#a78bfa" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {/* Premium line */}
        <path d={premiumPath} fill="none" stroke="#e879f9" strokeWidth={1.5} strokeDasharray="4 3" strokeLinejoin="round" strokeLinecap="round" />

        {/* X-axis labels */}
        {xLabels.map((d) => {
          const i = data.indexOf(d);
          const x = toX(i);
          const label = new Date(d.date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
          return (
            <text key={d.date} x={x} y={h - 4} fontSize={10} fill="#52525b" textAnchor="middle">
              {label}
            </text>
          );
        })}

        {/* Tooltip crosshair */}
        {tooltip && (
          <g>
            <line
              x1={tooltip.x}
              x2={tooltip.x}
              y1={padTop}
              y2={padTop + chartH}
              stroke="#52525b"
              strokeWidth={1}
              strokeDasharray="3 2"
            />
            <circle cx={tooltip.x} cy={tooltip.y} r={4} fill="#a78bfa" />
          </g>
        )}
      </svg>

      {/* Tooltip box */}
      {tooltip && (
        <div
          className="absolute pointer-events-none bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs shadow-xl z-10"
          style={{
            left: Math.min(tooltip.x + 12, width - 120),
            top: Math.max(tooltip.y - 40, 0),
          }}
        >
          <p className="text-neutral-400 mb-1">
            {new Date(tooltip.d.date).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" })}
          </p>
          <p className="text-violet-300 font-semibold">{tooltip.d.total} totaal</p>
          <p className="text-fuchsia-400">{tooltip.d.premium} premium</p>
          <p className="text-neutral-500">{tooltip.d.total - tooltip.d.premium} gratis</p>
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-2 right-4 flex items-center gap-4 text-xs text-neutral-500">
        <span className="flex items-center gap-1.5">
          <span className="w-6 h-0.5 bg-violet-400 inline-block rounded-full" />
          Totaal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-6 h-0.5 bg-fuchsia-400 inline-block rounded-full opacity-70" style={{ borderTop: "1.5px dashed #e879f9", background: "none" }} />
          Premium
        </span>
      </div>
    </div>
  );
}
