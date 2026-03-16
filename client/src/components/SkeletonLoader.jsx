/**
 * Reusable shimmer/skeleton loader components.
 * Usage:
 *   <SkeletonCard />               — single card-shaped skeleton
 *   <SkeletonTable rows={5} />     — table skeleton
 *   <SkeletonText lines={3} />     — text line skeletons
 *   <SkeletonStatGrid count={4} /> — stat-card grid skeleton
 */

const shimmer = {
  background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s infinite",
  borderRadius: 8,
};

const darkShimmer = {
  background: "linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s infinite",
  borderRadius: 8,
};

function Bar({ w = "100%", h = 16, isDark, style = {} }) {
  return (
    <div
      style={{
        ...(isDark ? darkShimmer : shimmer),
        width: w,
        height: h,
        ...style,
      }}
    />
  );
}

export function SkeletonText({ lines = 3, isDark }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Bar
          key={i}
          w={i === lines - 1 ? "60%" : "100%"}
          h={14}
          isDark={isDark}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ isDark }) {
  const bg = isDark ? "#1e293b" : "#fff";
  const border = isDark ? "#334155" : "#e2e8f0";
  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 14,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <Bar w="40%" h={14} isDark={isDark} />
      <Bar w="70%" h={28} isDark={isDark} />
      <Bar w="55%" h={12} isDark={isDark} />
    </div>
  );
}

export function SkeletonStatGrid({ count = 4, isDark }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${count}, 1fr)`,
        gap: 14,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} isDark={isDark} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5, isDark }) {
  const bg = isDark ? "#1e293b" : "#fff";
  const border = isDark ? "#334155" : "#e2e8f0";
  const headerBg = isDark ? "#0f172a" : "#f8fafc";
  return (
    <div
      style={{
        background: bg,
        borderRadius: 14,
        border: `1px solid ${border}`,
        overflow: "hidden",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 12,
          padding: "14px 16px",
          background: headerBg,
          borderBottom: `1px solid ${border}`,
        }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <Bar key={i} h={12} isDark={isDark} />
        ))}
      </div>
      {/* Data rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: 12,
            padding: "14px 16px",
            borderBottom: r < rows - 1 ? `1px solid ${border}` : "none",
          }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <Bar key={c} h={14} w={c === 0 ? "80%" : "100%"} isDark={isDark} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default SkeletonCard;
