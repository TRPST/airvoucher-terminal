"use client";

import * as React from "react";
import ReactCanvasConfetti from "react-canvas-confetti";
import { cn } from "@/utils/cn";

type ConfettiOverlayProps = {
  fire?: boolean;
  onComplete?: () => void;
  className?: string;
  duration?: number; // duration in milliseconds
};

export function ConfettiOverlay({
  fire = false,
  onComplete,
  className,
  duration = 3000,
}: ConfettiOverlayProps) {
  const [isAnimating, setIsAnimating] = React.useState(false);
  const refAnimationInstance = React.useRef<any>(null);

  const getInstance = React.useCallback((instance: any) => {
    refAnimationInstance.current = instance;
  }, []);

  // Fire confetti with a realistic pattern
  const fireConfetti = React.useCallback(() => {
    if (!refAnimationInstance.current) return;

    const animationDuration = 3000;
    const animationEnd = Date.now() + animationDuration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 100,
      gravity: 1.2,
      decay: 0.94,
    };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    // Create an interval that will shoot confetti periodically
    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      // Shoot confetti from random positions at the bottom
      refAnimationInstance.current({
        ...defaults,
        particleCount: Math.floor(
          randomInRange(20, 40) * (timeLeft / animationDuration)
        ),
        origin: {
          x: randomInRange(0.2, 0.8),
          y: 1,
        },
        colors: [
          "#ff0000", // red
          "#ffa500", // orange
          "#ffff00", // yellow
          "#008000", // green
          "#0000ff", // blue
          "#4b0082", // indigo
          "#ee82ee", // violet
          "#ffffff", // white
          "#ffd700", // gold
        ],
      });

      // Shoot confetti from the sides occasionally
      if (Math.random() > 0.8) {
        refAnimationInstance.current({
          ...defaults,
          particleCount: Math.floor(
            randomInRange(10, 25) * (timeLeft / animationDuration)
          ),
          angle: randomInRange(0, 60),
          origin: {
            x: randomInRange(0, 0.1),
            y: randomInRange(0.3, 0.7),
          },
          colors: ["#ffd700", "#ffcc00", "#ffdd00"],
        });
      }

      if (Math.random() > 0.8) {
        refAnimationInstance.current({
          ...defaults,
          particleCount: Math.floor(
            randomInRange(10, 25) * (timeLeft / animationDuration)
          ),
          angle: randomInRange(120, 180),
          origin: {
            x: randomInRange(0.9, 1),
            y: randomInRange(0.3, 0.7),
          },
          colors: ["#ffd700", "#ffcc00", "#ffdd00"],
        });
      }
    }, 250);
  }, []);

  React.useEffect(() => {
    if (fire && !isAnimating) {
      setIsAnimating(true);
      fireConfetti();

      // Reset after duration
      const timer = setTimeout(() => {
        setIsAnimating(false);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [fire, fireConfetti, isAnimating, onComplete, duration]);

  // Return canvas for confetti that is fixed positioned over everything
  return (
    <div
      className={cn("fixed inset-0 z-[9999] pointer-events-none", className)}
    >
      <ReactCanvasConfetti
        style={{
          position: "fixed",
          pointerEvents: "none",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
        }}
        onInit={getInstance}
      />
    </div>
  );
}
