"use client";

import Image from "next/image";
import type React from "react";

interface GlassEffectProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

interface DockIcon {
  src: string;
  alt: string;
  onClick?: () => void;
}

const GlassEffect: React.FC<GlassEffectProps> = ({
  children,
  className = "",
  style = {},
  onClick,
}) => {
  const glassStyle = {
    boxShadow: "0 6px 6px rgba(0, 0, 0, 0.2), 0 0 20px rgba(0, 0, 0, 0.1)",
    transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 2.2)",
    ...style,
  };

  return (
    <div
      className={`relative flex font-semibold overflow-hidden text-white cursor-pointer transition-all duration-700 ${className}`}
      style={glassStyle}
      onClick={onClick}
    >
      {/* <div
        className="absolute inset-0 z-0 overflow-hidden rounded-inherit rounded-3xl"
        style={{
          backdropFilter: "blur(10px)",
          isolation: "isolate",
        }}
      /> */}
      <div
        className="absolute inset-0 z-10 rounded-inherit"
        style={{ background: "rgba(255, 255, 255, 0.15)" }}
      />
      <div
        className="absolute inset-0 z-20 rounded-inherit rounded-3xl overflow-hidden"
        style={{
          boxShadow:
            "inset 2px 2px 1px 0 rgba(255, 255, 255, 0.3), inset -1px -1px 1px 1px rgba(255, 255, 255, 0.2)",
        }}
      />
      <div className="relative z-30">{children}</div>
    </div>
  );
};

export const GlassDock: React.FC<{ icons: DockIcon[] }> = ({ icons }) => (
  <GlassEffect className="rounded-3xl p-2 hover:p-4">
    <div className="flex items-center justify-center gap-2 rounded-3xl p-2 py-0 px-0.5 overflow-hidden">
      {icons.map((icon, index) => (
        <Image
          key={index}
          src={icon.src || "/placeholder.svg"}
          alt={icon.alt}
          width={48}
          height={48}
          className="w-12 h-12 transition-all duration-700 hover:scale-110 cursor-pointer rounded-xl"
          style={{
            transformOrigin: "center center",
            transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 2.2)",
          }}
          onClick={icon.onClick}
        />
      ))}
    </div>
  </GlassEffect>
);
