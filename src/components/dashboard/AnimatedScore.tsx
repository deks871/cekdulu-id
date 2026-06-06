import { useEffect, useState } from "react";
import { animate } from "framer-motion";

interface AnimatedScoreProps {
  score: number;
  className?: string;
}

export default function AnimatedScore({ score, className = "" }: AnimatedScoreProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const controls = animate(0, score, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate(value) {
        setDisplayScore(Math.round(value));
      },
    });

    return () => controls.stop();
  }, [score]);

  return <span className={className}>{displayScore}</span>;
}
