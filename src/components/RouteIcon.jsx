import React from "react";
export default function RouteIcon({ name = "arrow", size = 18 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };
  if (name === "arrow")
    return (
      <svg {...common}>
        <path d="M5 12h14m-6-6 6 6-6 6" />
      </svg>
    );
  if (name === "external")
    return (
      <svg {...common}>
        <path d="M14 4h6v6M20 4l-9 9M19 13v6H5V5h6" />
      </svg>
    );
  if (name === "search")
    return (
      <svg {...common}>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </svg>
    );
  if (name === "check")
    return (
      <svg {...common}>
        <path d="m5 12 5 5L20 7" />
      </svg>
    );
  if (name === "bookmark")
    return (
      <svg {...common}>
        <path d="M6 4h12v17l-6-4-6 4z" />
      </svg>
    );
  if (name === "globe")
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c4 4 4 14 0 18M12 3c-4 4-4 14 0 18" />
      </svg>
    );
  if (name === "menu")
    return (
      <svg {...common}>
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
