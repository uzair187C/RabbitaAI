/**
 * RabbitaAI Logo — Stylized rabbit silhouette
 * Two overlapping rounded rectangles (ears) above a circle (head)
 */
export default function RabbitaLogo({ size = 56, color = 'currentColor', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="RabbitaAI logo"
    >
      {/* Left ear */}
      <rect
        x="14"
        y="4"
        width="10"
        height="28"
        rx="5"
        fill={color}
        opacity="0.85"
      />
      {/* Right ear */}
      <rect
        x="32"
        y="4"
        width="10"
        height="28"
        rx="5"
        fill={color}
      />
      {/* Head */}
      <circle
        cx="28"
        cy="38"
        r="14"
        fill={color}
      />
      {/* Left eye */}
      <circle cx="23" cy="36" r="2.5" fill="var(--layer-0, #07080C)" />
      {/* Right eye */}
      <circle cx="33" cy="36" r="2.5" fill="var(--layer-0, #07080C)" />
      {/* Nose */}
      <ellipse cx="28" cy="41" rx="2" ry="1.5" fill="var(--layer-0, #07080C)" opacity="0.7" />
    </svg>
  )
}
