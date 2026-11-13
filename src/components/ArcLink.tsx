import { motion, useReducedMotion } from "motion/react";
import type { AnchorHTMLAttributes } from "react";
import type { ButtonSize, ButtonVariant } from "./arc/button/button";
import styles from "./arc/button/button.module.css";
import { motionTokens } from "./arc/lib/motion-tokens";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "onDrag" | "onDragEnd" | "onDragStart" | "onAnimationStart"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

/** An Arc button rendered as a link: same classes and press feel as `Button`, for things that navigate. */
export default function ArcLink({ variant = "secondary", size = "md", className, children, ...props }: Props) {
  const reduce = useReducedMotion();
  const external = props.href?.startsWith("http");
  return (
    <motion.a
      className={[styles.button, styles[variant], styles[size], className].filter(Boolean).join(" ")}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      transition={motionTokens.spring.snappy}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      {...props}
    >
      <span className={styles.labelPhase}>{children}</span>
    </motion.a>
  );
}
