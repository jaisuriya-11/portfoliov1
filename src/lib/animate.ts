import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** The pieces inside a card that settle in one after another once the card arrives. */
const ITEMS = [
  ".split__item",
  ".mb__tile",
  ".pj",
  ".skill",
  ".swipe__row",
  ".gh-heat",
  ".prs li",
  ".contact__lead",
  ".contact__actions > *",
].join(", ");

/**
 * Page motion with GSAP:
 *  - the profile card plays a short intro on load (card, banner), then
 *    its avatar, text, buttons and socials fade in together;
 *  - every other card rises out of a soft blur as it scrolls into view, its
 *    title's blossom spins in, then its rows / cards / chips follow in a stagger;
 *  - the footer quote and footer fade up the same way.
 * Reduced motion skips all of it, so everything simply shows.
 * Returns a cleanup function for useEffect.
 */
export function animatePage(root: HTMLElement, { intro: playIntro = true }: { intro?: boolean } = {}) {
  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Returning home from a sub-page: everything is already "seen", so nothing replays.
    if (!playIntro && root.querySelector(".frame--profile")) return;

    const ease = "expo.out";

    // Intro: the profile card.
    // Sub-pages (/games, /places): the page card simply rises in.
    if (!root.querySelector(".frame--profile")) {
      gsap.from(".page", { y: 18, opacity: 0, filter: "blur(6px)", duration: 0.9, ease, clearProps: "transform,opacity,filter" });
      gsap.from(".page .gcard, .page .pcard", { y: 14, opacity: 0, duration: 0.7, ease, stagger: 0.03, delay: 0.25, clearProps: "transform,opacity,filter" });
      return;
    }

    // clearProps hands transforms back to CSS and Motion once each tween ends.
    const intro = gsap.timeline({ defaults: { ease, duration: 0.9, clearProps: "transform,opacity,filter" } });
    intro
      .from(".frame--profile", { y: 18, opacity: 0, filter: "blur(6px)", duration: 1 })
      .from(".frame--profile .banner", { opacity: 0, scale: 1.04, duration: 1.4 }, "<")
      // Avatar, text, buttons and socials: one plain fade, all together.
      .from(".frame--profile .avatar, .profile__name, .profile__sub, .profile__tools, .bio, .bio__actions, .bio__socials", { opacity: 0, duration: 0.7, ease: "power1.out" }, "-=0.6");

    // Every section card, plus the quote and the footer.
    gsap.utils.toArray<HTMLElement>(".column > .sec, .column > .quote, .column > .foot").forEach((card) => {
      const tl = gsap.timeline({
        defaults: { ease, clearProps: "transform,opacity,filter" },
        scrollTrigger: { trigger: card, start: "top 96%", once: true },
      });
      tl.from(card, { y: 36, opacity: 0, scale: 0.985, filter: "blur(8px)", duration: 1 });

      const mark = card.querySelector(".sec__mark");
      if (mark) tl.from(mark, { rotate: -180, scale: 0, ease: "back.out(2)", duration: 0.8 }, "-=0.75");

      const title = card.querySelector(".sec__title");
      if (title) tl.from(title, { x: -8, opacity: 0, duration: 0.6 }, "<0.05");

      const items = card.querySelectorAll(ITEMS);
      if (items.length) tl.from(items, { y: 14, opacity: 0, duration: 0.7, stagger: { each: 0.045, from: "start" } }, "-=0.55");
    });

    // Cards change height when a row opens or more projects show; keep trigger points honest.
    const ro = new ResizeObserver(() => ScrollTrigger.refresh());
    ro.observe(root);
    return () => ro.disconnect();
  });

  return () => mm.revert();
}
