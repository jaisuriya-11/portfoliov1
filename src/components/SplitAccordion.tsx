import { ChevronDown } from "lucide-react";
import { motion, MotionConfig, useReducedMotion } from "motion/react";
import { useId, useState, type ReactNode } from "react";
import { motionTokens } from "./arc/lib/motion-tokens";

export interface SplitItem {
  id: string;
  head: ReactNode;
  body: ReactNode;
}

/** Corner radius of the stack and of each split-off card. Kept small on purpose. */
const R = 8;

/**
 * A stacked list that splits apart around the open row (after Watermelon UI's
 * card-split accordion): the open row lifts out as its own card with a gap
 * above and below, and its neighbours round off the edges that now face the gap.
 * Motion comes from Arc's tokens so it matches the rest of the page.
 */
export default function SplitAccordion({ items, defaultOpen = 0 }: { items: SplitItem[]; defaultOpen?: number }) {
  const [open, setOpen] = useState<number>(defaultOpen);
  const reduce = useReducedMotion();
  const uid = useId();
  const last = items.length - 1;

  return (
    <MotionConfig transition={reduce ? { duration: 0 } : motionTokens.spring.smooth}>
      <ul className="split">
        {items.map((it, i) => {
          const isOpen = i === open;
          const before = i === open - 1;
          const after = i === open + 1;
          // A corner rounds when that edge is the top/bottom of the stack or faces a gap.
          const top = i === 0 || isOpen || after ? R : 0;
          const bottom = i === last || isOpen || before ? R : 0;
          const panel = `${uid}-panel-${i}`;
          return (
            <motion.li
              key={it.id}
              layout="position"
              className="split__item"
              data-open={isOpen || undefined}
              initial={false}
              animate={{
                borderTopLeftRadius: top,
                borderTopRightRadius: top,
                borderBottomLeftRadius: bottom,
                borderBottomRightRadius: bottom,
                marginTop: isOpen && i > 0 ? 10 : 0,
                marginBottom: isOpen && i < last ? 10 : 0,
              }}
            >
              <button type="button" className="split__head" aria-expanded={isOpen} aria-controls={panel} onClick={() => setOpen(isOpen ? -1 : i)}>
                {it.head}
                <motion.span className="split__chev" animate={{ rotate: isOpen ? 180 : 0 }} transition={reduce ? { duration: 0 } : motionTokens.spring.snappy}>
                  <ChevronDown size={17} aria-hidden="true" />
                </motion.span>
              </button>
              <motion.div
                id={panel}
                role="region"
                className="split__panel"
                initial={false}
                animate={isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                aria-hidden={!isOpen}
                inert={!isOpen}
              >
                <motion.div
                  className="split__inner"
                  initial={false}
                  animate={isOpen ? { y: 0, filter: "blur(0px)" } : { y: -6, filter: `blur(${motionTokens.blur.subtle}px)` }}
                >
                  {it.body}
                </motion.div>
              </motion.div>
            </motion.li>
          );
        })}
      </ul>
    </MotionConfig>
  );
}
