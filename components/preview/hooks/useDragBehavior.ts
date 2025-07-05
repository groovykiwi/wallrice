"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Position } from "../types";
import { DIMENSIONS } from "../types";

interface UseDragBehaviorProps {
  screenRef: React.RefObject<HTMLDivElement | null>;
  terminalType: "linux" | "macos";
}

export const useDragBehavior = ({
  screenRef,
  terminalType,
}: UseDragBehaviorProps) => {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [positionsInitialized, setPositionsInitialized] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Set initial position based on terminal type and screen size
  useEffect(() => {
    const setInitialPosition = () => {
      if (!screenRef.current) return;

      const screenRect = screenRef.current.getBoundingClientRect();
      const screenWidth = screenRect.width;
      const screenHeight = screenRect.height;

      if (terminalType === "linux") {
        const terminalWidth = DIMENSIONS.LINUX_TERMINAL.WIDTH;
        const terminalHeight = DIMENSIONS.LINUX_TERMINAL.HEIGHT;
        const x = Math.max(0, (screenWidth - terminalWidth) * 0.5);
        const y = Math.max(
          DIMENSIONS.SPACING.TOP_MARGIN,
          (screenHeight - terminalHeight) * 0.4
        );
        setPosition({ x, y });
      } else {
        const terminalWidth = DIMENSIONS.MAC_TERMINAL.WIDTH;
        const terminalHeight = DIMENSIONS.MAC_TERMINAL.HEIGHT;
        const x = Math.max(
          0,
          screenWidth - terminalWidth - DIMENSIONS.SPACING.SCREEN_EDGE
        );
        const y = Math.max(
          DIMENSIONS.SPACING.TOP_MARGIN,
          Math.min(
            DIMENSIONS.SPACING.DOCK_MARGIN,
            (screenHeight - terminalHeight - DIMENSIONS.SPACING.DOCK_MARGIN) *
              0.15
          )
        );
        setPosition({ x, y });
      }
      setPositionsInitialized(true);
    };

    setInitialPosition();

    const handleResize = () => {
      setInitialPosition();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [screenRef, terminalType]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!terminalRef.current || !screenRef.current) return;

    const terminalRect = terminalRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - terminalRect.left,
      y: e.clientY - terminalRect.top,
    });
    setIsDragging(true);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !screenRef.current) return;

      const screenRect = screenRef.current.getBoundingClientRect();

      let terminalWidth: number;
      let terminalHeight: number;

      if (terminalType === "linux") {
        terminalWidth = DIMENSIONS.LINUX_TERMINAL.WIDTH;
        terminalHeight = DIMENSIONS.LINUX_TERMINAL.HEIGHT;
      } else {
        if (terminalRef.current) {
          const terminalRect = terminalRef.current.getBoundingClientRect();
          terminalWidth = terminalRect.width;
          terminalHeight = terminalRect.height;
        } else {
          terminalWidth = DIMENSIONS.MAC_TERMINAL.WIDTH;
          terminalHeight = DIMENSIONS.MAC_TERMINAL.HEIGHT;
        }
      }

      let newX = e.clientX - screenRect.left - dragOffset.x;
      let newY = e.clientY - screenRect.top - dragOffset.y;

      // Constrain to screen bounds
      newX = Math.max(0, Math.min(newX, screenRect.width - terminalWidth));

      if (terminalType === "linux") {
        newY = Math.max(
          DIMENSIONS.SPACING.TOP_MARGIN,
          Math.min(newY, screenRect.height - terminalHeight)
        );
      } else {
        newY = Math.max(
          DIMENSIONS.SPACING.TOP_MARGIN,
          Math.min(
            newY,
            screenRect.height - terminalHeight - DIMENSIONS.SPACING.DOCK_MARGIN
          )
        );
      }

      setPosition({ x: newX, y: newY });
    },
    [isDragging, screenRef, terminalType, dragOffset.x, dragOffset.y]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove]);

  return {
    position,
    isDragging,
    positionsInitialized,
    terminalRef,
    handleMouseDown,
  };
};
