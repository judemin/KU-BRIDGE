import { useEffect, useRef } from "react";

const TARGETS =
  ".section-heading, .resource-card, .issue-card, .route-step, .check-item, .inquiry-template, .trust-section";

// Progressive enhancement: content stays visible without observer/animation support.
export function observeReveals(root, seen = new WeakSet()) {
  const preference = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  if (!root || !window.IntersectionObserver || preference?.matches)
    return () => {};

  const animations = new Set();
  const observer = new window.IntersectionObserver(
    (entries) => {
      let sequence = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target;
        observer.unobserve(element);
        if (seen.has(element)) continue;
        seen.add(element);
        if (!element.animate) continue;
        const animation = element.animate(
          [
            { opacity: 0, transform: "translateY(14px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          {
            duration: 420,
            delay: Math.min(sequence++ * 45, 180),
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            fill: "backwards",
          },
        );
        animations.add(animation);
        animation.onfinish = animation.oncancel = () =>
          animations.delete(animation);
      }
    },
    { threshold: 0.08 },
  );

  root.querySelectorAll(TARGETS).forEach((element) => {
    if (!seen.has(element)) observer.observe(element);
  });
  const cancel = () => {
    observer.disconnect();
    for (const animation of animations) animation.cancel();
    animations.clear();
  };
  const onPreferenceChange = (event) => {
    if (event.matches) cancel();
  };
  preference?.addEventListener?.("change", onPreferenceChange);
  return () => {
    cancel();
    preference?.removeEventListener?.("change", onPreferenceChange);
  };
}

export function useRevealMotion(rootRef, contentKey) {
  const seen = useRef(new WeakSet());
  useEffect(
    () => observeReveals(rootRef.current, seen.current),
    [rootRef, contentKey],
  );
}
