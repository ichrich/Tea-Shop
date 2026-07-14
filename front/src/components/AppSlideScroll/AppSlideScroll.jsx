import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';

const SCROLL_LOCK_DISTANCE = 24;
const WHEEL_TRIGGER_DISTANCE = 12;
const TOUCH_TRIGGER_DISTANCE = 26;
const SNAP_MIN_HEIGHT = 140;
const SNAP_MIN_VIEWPORT_RATIO = 0.28;
const SNAP_DEDUPE_DISTANCE = 28;
const SNAP_TARGET_SELECTOR = [
  '[data-slide-snap="true"]',
  'main > section',
  'main > div > section',
  '.First_block > section',
  '.Second_block > section',
  '.Third_block > section',
  '.pin-spacer > section',
  'footer',
].join(', ');

function isInteractiveTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    Boolean(target.closest('a, button, input, textarea, select, option, [contenteditable="true"]'))
  );
}

function canScrollWithin(target, direction) {
  let node = target instanceof HTMLElement ? target : null;
  while (node && node !== document.body) {
    const style = window.getComputedStyle(node);
    const overflowY = style.overflowY;
    const scrollable =
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      node.scrollHeight > node.clientHeight + 2;

    if (scrollable) {
      if (direction > 0 && node.scrollTop + node.clientHeight < node.scrollHeight - 2) {
        return true;
      }
      if (direction < 0 && node.scrollTop > 2) {
        return true;
      }
    }

    node = node.parentElement;
  }

  return false;
}

function resolveSnapElement(element) {
  if (!(element instanceof HTMLElement)) return null;
  return element.closest('.pin-spacer') || element;
}

function getElementDocumentTop(element) {
  const target = resolveSnapElement(element);
  if (!(target instanceof HTMLElement)) return Number.POSITIVE_INFINITY;
  const rect = target.getBoundingClientRect();
  return rect.top + window.scrollY;
}

function getSnapTargets() {
  const minHeight = Math.max(SNAP_MIN_HEIGHT, window.innerHeight * SNAP_MIN_VIEWPORT_RATIO);
  const candidates = Array.from(document.querySelectorAll(SNAP_TARGET_SELECTOR))
    .filter((element) => {
      if (!(element instanceof HTMLElement)) return false;
      const style = window.getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      if (style.position === 'fixed') return false;
      if (style.scrollSnapAlign === 'none') return false;

      const rect = element.getBoundingClientRect();
      return rect.height >= minHeight && rect.width > 24;
    })
    .map((element) => ({
      element,
      top: getElementDocumentTop(element),
      height: resolveSnapElement(element)?.getBoundingClientRect().height ?? element.getBoundingClientRect().height,
    }))
    .sort((a, b) => a.top - b.top);

  const deduped = [];

  candidates.forEach((candidate) => {
    const prev = deduped[deduped.length - 1];
    if (!prev || Math.abs(candidate.top - prev.top) > SNAP_DEDUPE_DISTANCE) {
      deduped.push(candidate);
      return;
    }

    if (candidate.height > prev.height) {
      deduped[deduped.length - 1] = candidate;
    }
  });

  return deduped.map((candidate) => candidate.element);
}

function getNextTarget(targets, direction) {
  if (!targets.length) return null;

  const currentY = window.scrollY;

  if (direction > 0) {
    return targets.find((target) => getElementDocumentTop(target) > currentY + SCROLL_LOCK_DISTANCE) || null;
  }

  for (let i = targets.length - 1; i >= 0; i -= 1) {
    const top = getElementDocumentTop(targets[i]);
    if (top < currentY - SCROLL_LOCK_DISTANCE) return targets[i];
  }

  return null;
}

function isSlideScrollDisabled() {
  return (
    document.body.dataset.slideScrollDisabled === 'true' ||
    document.documentElement.dataset.slideScrollDisabled === 'true'
  );
}

export function AppSlideScroll() {
  const location = useLocation();
  const tweenRef = useRef(null);
  const cooldownUntilRef = useRef(0);
  const touchStartYRef = useRef(0);
  const wheelDeltaRef = useRef(0);
  const wheelResetRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(max-width: 1024px)').matches) {
      document.body.dataset.slideScrollDisabled = 'false';
      document.documentElement.dataset.slideScrollDisabled = 'false';
      return undefined;
    }

    const clearTween = () => {
      if (tweenRef.current) {
        tweenRef.current.kill();
        tweenRef.current = null;
      }
    };

    const clearWheelDelta = () => {
      wheelDeltaRef.current = 0;
      if (wheelResetRef.current) {
        window.clearTimeout(wheelResetRef.current);
        wheelResetRef.current = null;
      }
    };

    const scrollToTarget = (target) => {
      if (!(target instanceof HTMLElement)) return;

      const targetY = getElementDocumentTop(target);
      clearTween();

      const proxy = { y: window.scrollY };
      tweenRef.current = gsap.to(proxy, {
        y: targetY,
        duration: Math.min(0.9, Math.max(0.58, Math.abs(targetY - window.scrollY) / window.innerHeight * 0.24)),
        ease: 'power2.inOut',
        overwrite: true,
        onUpdate: () => {
          window.scrollTo(0, proxy.y);
        },
        onComplete: () => {
          window.scrollTo(0, targetY);
          tweenRef.current = null;
          cooldownUntilRef.current = performance.now() + 240;
        },
      });
    };

    const maybeHandle = (direction, eventTarget) => {
      const now = performance.now();
      if (now < cooldownUntilRef.current) return false;
      if (tweenRef.current) return true;
      if (isSlideScrollDisabled()) return false;
      if (isInteractiveTarget(eventTarget)) return false;
      if (eventTarget instanceof HTMLElement && eventTarget.closest('[data-slide-scroll-local="true"]')) {
        return false;
      }
      if (canScrollWithin(eventTarget, direction)) return false;

      const targets = getSnapTargets();
      const nextTarget = getNextTarget(targets, direction);
      if (!nextTarget) return false;

      scrollToTarget(nextTarget);
      return true;
    };

    const onWheel = (event) => {
      if (event.defaultPrevented) return;
      if (Math.abs(event.deltaY) < 2) return;

      wheelDeltaRef.current += event.deltaY;
      if (wheelResetRef.current) {
        window.clearTimeout(wheelResetRef.current);
      }
      wheelResetRef.current = window.setTimeout(() => {
        wheelDeltaRef.current = 0;
      }, 180);

      if (Math.abs(wheelDeltaRef.current) < WHEEL_TRIGGER_DISTANCE) return;

      const direction = wheelDeltaRef.current > 0 ? 1 : -1;
      const handled = maybeHandle(direction, event.target);

      if (handled) {
        clearWheelDelta();
      }
      if (handled) event.preventDefault();
    };

    const onTouchStart = (event) => {
      touchStartYRef.current = event.touches?.[0]?.clientY ?? 0;
    };

    const onTouchMove = (event) => {
      if (event.defaultPrevented) return;
      const currentY = event.touches?.[0]?.clientY ?? touchStartYRef.current;
      const delta = touchStartYRef.current - currentY;
      if (Math.abs(delta) < TOUCH_TRIGGER_DISTANCE) return;

      const handled = maybeHandle(delta > 0 ? 1 : -1, event.target);
      if (handled) {
        event.preventDefault();
        touchStartYRef.current = currentY;
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      clearTween();
      clearWheelDelta();
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [location.pathname]);

  return null;
}

export default AppSlideScroll;
