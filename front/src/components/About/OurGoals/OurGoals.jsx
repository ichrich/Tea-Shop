import React, {
  useRef,
  useState,
  useEffect,
} from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './OurGoals.css';

gsap.registerPlugin(ScrollTrigger);

const MISSION_TITLE = 'Наша миссия находить эти скрытые дары природы';
const GOALS_TITLE = 'Наши глобальные цели для светлого будущего';
const MISSION_TEXT =
  'Мы ищем ценность там, где другие видят лишь отходы, и создаём будущее из того, что уже есть вокруг.\n'
  + 'Для нас это больше, чем бизнес. Это новый способ видеть мир.\n'
  + 'Мы хотим, чтобы жизнь была по-настоящему качественной и насыщенной в любом возрасте. '
  + 'Чтобы каждый мог реализовать себя и подарить миру что-то важное. '
  + 'И мы создаём для этого все условия, используя самые неожиданные ресурсы природы.';

const CARDS = [
  {
    id: 1,
    title: 'Новая энергия',
    description:
      'Создать доступный и неиссякаемый источник энергии, который будет безопасным для планеты.',
    rotation: 0,
    lines: 1,
  },
  {
    id: 2,
    title: 'Технологии будущего',
    description:
      'Разработать принципиально новые способы передвижения, которые сотрут границы расстояний.',
    rotation: 5,
    lines: 2,
  },
  {
    id: 3,
    title: 'Экотранспорт',
    description:
      'Создать по-настоящему безопасный и «умный» транспорт, который будет работать долго, не вредя окружающей среде.',
    rotation: 10,
    lines: 3,
  },
];

const PIN_TOP_DESKTOP = 0;
const REVEAL_PX = 380;
const SCENE_TRANSITION_PX = 340;
const CARD_STEP_PX = 360;
const MIN_HOLD_PX = 160;

const setSlideScrollDisabled = (disabled) => {
  const value = disabled ? 'true' : 'false';
  document.body.dataset.slideScrollDisabled = value;
  document.documentElement.dataset.slideScrollDisabled = value;
};

function getProgressBarStyle(activeSnap, totalSnaps) {
  const height = '31%';
  if (totalSnaps <= 1 || activeSnap === 0) return { top: '0%', y: '0%', height };
  if (activeSnap === totalSnaps - 1) return { top: '100%', y: '-100%', height };
  return { top: '50%', y: '-50%', height };
}

function GoalCard({ card }) {
  return (
    <>
      <h3 className="goal-card__title">{card.title}</h3>
      <div className="goal-card__lines">
        {Array.from({ length: card.lines }).map((_, i) => (
          <div key={i} className="goal-card__line" />
        ))}
      </div>
      <p className="goal-card__description">{card.description}</p>
    </>
  );
}

const OurGoals = () => {
  const [activeSnap, setActiveSnap] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const targetRef = useRef(null);
  const pinRef = useRef(null);
  const viewportRef = useRef(null);
  const missionPanelRef = useRef(null);
  const goalsPanelRef = useRef(null);
  const missionTextRef = useRef(null);
  const missionClipRef = useRef(null);
  const missionTitleRef = useRef(null);
  const goalsTitleRef = useRef(null);
  const cardRefs = useRef([]);
  const scenesSTRef = useRef(null);
  const sceneScrollTweenRef = useRef(null);
  const bodySnapRef = useRef({ body: '', html: '' });

  const totalSnaps = 1 + CARDS.length;
  const progressStyle = getProgressBarStyle(activeSnap, totalSnaps);
  const Motion = motion;

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 1024);
      setIsTablet(width >= 768 && width <= 1024);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  useEffect(() => {
    bodySnapRef.current = {
      body: document.body.style.scrollSnapType,
      html: document.documentElement.style.scrollSnapType,
    };
  }, []);

  useEffect(() => {
    const triggerEl = targetRef.current;
    const pinEl = pinRef.current;
    const viewportEl = viewportRef.current;
    if (!triggerEl || !pinEl || !viewportEl) return;

    const snapPoints = [];
    let totalScrollPx = 0;
    let missionTextEndPx = 0;
    let goalsStartPx = 0;
    let lastTouchY = 0;
    let pendingUpdate = null;
    const activeSnapRef = { current: 0 };

    const updateActiveSnap = (index) => {
      if (activeSnapRef.current === index) return;
      activeSnapRef.current = index;
      if (pendingUpdate) cancelAnimationFrame(pendingUpdate);
      pendingUpdate = requestAnimationFrame(() => {
        setActiveSnap(index);
        pendingUpdate = null;
      });
    };

    const prepareRanges = () => {
      snapPoints.length = 0;
      totalScrollPx = 0;

      const viewportHeight = viewportEl.clientHeight || window.innerHeight * 0.55;
      const clipHeight = isMobile ? window.innerHeight * 0.49 : viewportHeight;
      const missionText = missionTextRef.current;
      const textHeight = missionText?.scrollHeight || 0;
      const overflowPx = Math.max(0, textHeight - clipHeight);

      const missionRevealEnd = REVEAL_PX;
      missionTextEndPx = missionRevealEnd + Math.max(MIN_HOLD_PX, overflowPx);
      goalsStartPx = missionTextEndPx + SCENE_TRANSITION_PX;

      snapPoints.push(0);
      snapPoints.push(missionRevealEnd);
      if (overflowPx > 12) snapPoints.push(missionTextEndPx);
      snapPoints.push(goalsStartPx);

      totalScrollPx = goalsStartPx;
      CARDS.forEach((_, i) => {
        if (i > 0) totalScrollPx += CARD_STEP_PX;
        snapPoints.push(totalScrollPx);
      });

      totalScrollPx = Math.max(totalScrollPx, REVEAL_PX + SCENE_TRANSITION_PX);

      snapPoints.sort((a, b) => a - b);
      for (let i = snapPoints.length - 1; i > 0; i--) {
        if (Math.abs(snapPoints[i] - snapPoints[i - 1]) < 8) snapPoints.splice(i, 1);
      }
    };

    const setTitleState = (missionAmount, goalsAmount) => {
      if (missionTitleRef.current) {
        gsap.set(missionTitleRef.current, {
          opacity: 0.4 + 0.6 * missionAmount,
          filter: `blur(${0.52 * (1 - missionAmount)}vw)`,
        });
      }
      if (goalsTitleRef.current) {
        gsap.set(goalsTitleRef.current, {
          opacity: 0.4 + 0.6 * goalsAmount,
          filter: `blur(${0.52 * (1 - goalsAmount)}vw)`,
        });
      }
    };

    const renderCards = (cardProgress) => {
      const vw = window.innerWidth / 100;

      cardRefs.current.forEach((el, index) => {
        if (!el) return;
        const card = CARDS[index];
        const offset = index - cardProgress;

        if (offset <= -1) {
          gsap.set(el, {
            x: -15 * vw,
            y: 0,
            rotation: 0,
            scale: 1,
            opacity: 0,
            zIndex: 1,
            filter: 'blur(6px)',
            pointerEvents: 'none',
          });
          return;
        }

        if (offset >= 1) {
          const stack = offset;
          gsap.set(el, {
            x: stack * 1.5 * vw,
            y: Math.abs(stack) * 0.5 * vw,
            rotation: card.rotation,
            scale: 1 - stack * 0.03,
            opacity: Math.max(0.45, 0.72 - stack * 0.12),
            zIndex: CARDS.length - Math.round(stack),
            filter: 'blur(0.12vw)',
            pointerEvents: 'none',
          });
          return;
        }

        if (offset > 0) {
          const t = offset;
          gsap.set(el, {
            x: t * 12 * vw,
            y: t * 0.4 * vw,
            rotation: gsap.utils.interpolate(card.rotation, 0, 1 - t),
            scale: 0.98 + 0.02 * (1 - t),
            opacity: 0.55 + 0.45 * (1 - t),
            zIndex: 15 + Math.round((1 - t) * 5),
            filter: `blur(${6 * t}px)`,
            pointerEvents: 'none',
          });
          return;
        }

        if (offset < 0) {
          const t = Math.abs(offset);
          gsap.set(el, {
            x: -t * 12 * vw,
            y: 0,
            rotation: 0,
            scale: 1 - t * 0.04,
            opacity: 1 - t * 0.85,
            zIndex: 20,
            filter: `blur(${8 * t}px)`,
            pointerEvents: 'none',
          });
          return;
        }

        gsap.set(el, {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          opacity: 1,
          zIndex: 30,
          filter: 'blur(0px)',
          pointerEvents: 'auto',
        });
      });
    };

    const renderProgress = (self) => {
      const scrollPx = self.progress * totalScrollPx;

      let snapIndex = 0;
      if (scrollPx >= goalsStartPx) {
        const cardPx = scrollPx - goalsStartPx;
        snapIndex = 1 + Math.min(CARDS.length - 1, Math.round(cardPx / Math.max(1, CARD_STEP_PX)));
      } else if (scrollPx >= missionTextEndPx * 0.55) {
        snapIndex = 1;
      }
      updateActiveSnap(snapIndex);

      if (scrollPx < goalsStartPx) {
        const revealProgress = gsap.utils.clamp(0, 1, scrollPx / Math.max(1, REVEAL_PX));
        const textProgress = gsap.utils.clamp(
          0,
          1,
          (scrollPx - REVEAL_PX) / Math.max(1, missionTextEndPx - REVEAL_PX),
        );
        const sceneTransition = gsap.utils.clamp(
          0,
          1,
          (scrollPx - missionTextEndPx) / Math.max(1, SCENE_TRANSITION_PX),
        );
        const easedReveal = gsap.parseEase('power2.out')(revealProgress);
        const easedScene = gsap.parseEase('power2.inOut')(sceneTransition);
        const contentReveal = gsap.utils.clamp(0, 1, (revealProgress - 0.38) / 0.62);
        const easedContent = gsap.parseEase('power2.out')(contentReveal);

        setTitleState(1 - easedScene * 0.6, easedScene * 0.6);

        if (missionPanelRef.current) {
          gsap.set(missionPanelRef.current, {
            autoAlpha: 1 - 0.55 * easedScene,
            y: -42 * easedScene,
            scale: 1 - 0.02 * easedScene,
            filter: `blur(${6 * easedScene}px)`,
            pointerEvents: easedScene < 0.5 ? 'auto' : 'none',
          });
        }
        if (goalsPanelRef.current) {
          gsap.set(goalsPanelRef.current, {
            autoAlpha: gsap.utils.clamp(0.28, 1, 0.28 + easedScene * 0.72),
            y: 48 * (1 - easedScene),
            scale: 0.96 + 0.04 * easedScene,
            filter: `blur(${12 * (1 - easedScene)}px)`,
            pointerEvents: easedScene >= 0.5 ? 'auto' : 'none',
          });
        }
        if (missionClipRef.current) {
          gsap.set(missionClipRef.current, {
            autoAlpha: isMobile ? Math.max(easedContent, 1 - 0.55 * easedScene) : 1 - easedScene * 0.35,
          });
        }
        if (missionTextRef.current) {
          const overflow = Math.max(0, missionTextRef.current.scrollHeight - (missionClipRef.current?.clientHeight || 0));
          gsap.set(missionTextRef.current, { y: -overflow * textProgress });
        }
        renderCards(easedScene * 0.22);
      } else {
        setTitleState(0.35, 1);

        const cardPx = scrollPx - goalsStartPx;
        const cardProgress = gsap.utils.clamp(0, CARDS.length - 1, cardPx / Math.max(1, CARD_STEP_PX));

        if (missionPanelRef.current) {
          gsap.set(missionPanelRef.current, { autoAlpha: 0, pointerEvents: 'none' });
        }
        if (goalsPanelRef.current) {
          gsap.set(goalsPanelRef.current, { autoAlpha: 1, y: 0, pointerEvents: 'auto' });
        }
        if (missionClipRef.current) {
          gsap.set(missionClipRef.current, { autoAlpha: 0 });
        }
        renderCards(cardProgress);
      }
    };

    prepareRanges();

    if (missionPanelRef.current) {
      gsap.set(missionPanelRef.current, { autoAlpha: 1, y: 0 });
    }
    if (goalsPanelRef.current) {
      gsap.set(goalsPanelRef.current, { autoAlpha: 0, y: 36 });
    }
    renderCards(0);

    const getCurrentScenePx = () => {
      const st = scenesSTRef.current;
      if (!st) return 0;
      return gsap.utils.clamp(0, totalScrollPx, window.scrollY - st.start);
    };

    const goToScenePx = (scenePx) => {
      const st = scenesSTRef.current;
      if (!st) return;
      const targetY = st.start + gsap.utils.clamp(0, totalScrollPx, scenePx);
      if (sceneScrollTweenRef.current) sceneScrollTweenRef.current.kill();

      const proxy = { y: window.scrollY };
      sceneScrollTweenRef.current = gsap.to(proxy, {
        y: targetY,
        duration: 0.55,
        ease: 'power3.inOut',
        overwrite: true,
        onUpdate: () => window.scrollTo(0, proxy.y),
        onComplete: () => {
          window.scrollTo(0, targetY);
          sceneScrollTweenRef.current = null;
        },
      });
    };

    const getNextSnapPoint = (direction) => {
      const current = getCurrentScenePx();
      if (direction > 0) {
        return snapPoints.find((point) => point > current + 3);
      }
      for (let i = snapPoints.length - 1; i >= 0; i--) {
        if (snapPoints[i] < current - 3) return snapPoints[i];
      }
      return undefined;
    };

    const onPresentationWheel = (event) => {
      const st = scenesSTRef.current;
      if (!st || !st.isActive) return;

      const delta = event.deltaY || 0;
      if (Math.abs(delta) < 0.5) return;

      const targetPoint = getNextSnapPoint(delta > 0 ? 1 : -1);
      if (targetPoint === undefined) return;

      event.preventDefault();
      if (sceneScrollTweenRef.current) return;
      goToScenePx(targetPoint);
    };

    const onPresentationTouchStart = (event) => {
      lastTouchY = event.touches?.[0]?.clientY ?? 0;
    };

    const onPresentationTouchMove = (event) => {
      const st = scenesSTRef.current;
      if (!st || !st.isActive) return;

      const currentY = event.touches?.[0]?.clientY ?? lastTouchY;
      const delta = lastTouchY - currentY;
      if (Math.abs(delta) < 4) return;

      const targetPoint = getNextSnapPoint(delta > 0 ? 1 : -1);
      if (targetPoint === undefined) return;

      event.preventDefault();
      if (sceneScrollTweenRef.current) return;
      goToScenePx(targetPoint);
      lastTouchY = currentY;
    };

    const pinStart = isMobile ? 'top top' : `top ${PIN_TOP_DESKTOP}px`;

    const st = ScrollTrigger.create({
      id: 'OurGoalsScenes',
      trigger: triggerEl,
      start: pinStart,
      end: () => `+=${totalScrollPx}`,
      scrub: 0.35,
      pin: pinEl,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onRefresh: prepareRanges,
      onUpdate: renderProgress,
      onToggle: (self) => {
        if (self.isActive) {
          document.body.style.scrollSnapType = 'none';
          document.documentElement.style.scrollSnapType = 'none';
          document.body.style.scrollBehavior = 'auto';
          setSlideScrollDisabled(true);
        } else {
          document.body.style.scrollSnapType = bodySnapRef.current.body;
          document.documentElement.style.scrollSnapType = bodySnapRef.current.html;
          setSlideScrollDisabled(false);
        }
        window.dispatchEvent(
          new CustomEvent('app:force-header', { detail: { hidden: self.isActive } }),
        );
      },
      snap: {
        snapTo: (value) => {
          if (!totalScrollPx || !snapPoints.length) return value;
          const px = value * totalScrollPx;
          const nearest = snapPoints.reduce(
            (best, point) => (Math.abs(point - px) < Math.abs(best - px) ? point : best),
            snapPoints[0],
          );
          return nearest / totalScrollPx;
        },
        duration: { min: 0.32, max: 0.72 },
        delay: 0.02,
        ease: 'power3.inOut',
      },
    });

    scenesSTRef.current = st;
    pinEl.addEventListener('wheel', onPresentationWheel, { passive: false });
    pinEl.addEventListener('touchstart', onPresentationTouchStart, { passive: true });
    pinEl.addEventListener('touchmove', onPresentationTouchMove, { passive: false });

    const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 120);

    return () => {
      clearTimeout(refreshTimer);
      if (pendingUpdate) cancelAnimationFrame(pendingUpdate);
      if (sceneScrollTweenRef.current) {
        sceneScrollTweenRef.current.kill();
        sceneScrollTweenRef.current = null;
      }
      pinEl.removeEventListener('wheel', onPresentationWheel);
      pinEl.removeEventListener('touchstart', onPresentationTouchStart);
      pinEl.removeEventListener('touchmove', onPresentationTouchMove);
      window.dispatchEvent(
        new CustomEvent('app:force-header', { detail: { hidden: false } }),
      );
      document.body.style.scrollSnapType = bodySnapRef.current.body;
      document.documentElement.style.scrollSnapType = bodySnapRef.current.html;
      setSlideScrollDisabled(false);
      if (scenesSTRef.current) {
        scenesSTRef.current.kill();
        scenesSTRef.current = null;
      }
      ScrollTrigger.refresh();
    };
  }, [isMobile]);

  const mobileGoalsTitle = isTablet ? GOALS_TITLE : 'Наши большие цели';
  const mobileMissionTitle = isTablet ? MISSION_TITLE : 'Наша миссия';

  return (
    <section className={`goals-new ${isMobile ? 'goals-new--scroll-mobile' : ''}`} data-slide-scroll-local="true" data-slide-snap="true">
      <div ref={targetRef} className="goals-new__scroll_container">
        <div ref={pinRef} className="goals-new__pin">
          <div className="container goals-new__pin_inner">
            <div className="goals-new__wrapper">
              <div className="goals-new__left">
                <div className="goals-new__progress_bar">
                  <div className="goals-new__progress_track" />
                  <Motion.div
                    className="goals-new__progress_fill"
                    animate={progressStyle}
                    transition={{
                      duration: 0.35,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                  />
                </div>

                {!isMobile ? (
                  <div className="goals-new__titles">
                    <div className="goals-new__title_section goals-new__title_section--top">
                      <h2 ref={missionTitleRef} className="goals-new__title">
                        {MISSION_TITLE}
                      </h2>
                    </div>
                    <div className="goals-new__title_section goals-new__title_section--bottom">
                      <h2 ref={goalsTitleRef} className="goals-new__title">
                        {GOALS_TITLE}
                      </h2>
                    </div>
                  </div>
                ) : (
                  <div className="goals-new__titles goals-new__titles--mobile">
                    <h2
                      className={`goals-new__mobile_title ${activeSnap === 0 ? 'is-active' : ''}`}
                    >
                      {mobileMissionTitle}
                    </h2>
                    <h2
                      className={`goals-new__mobile_title ${activeSnap >= 1 ? 'is-active' : ''}`}
                    >
                      {mobileGoalsTitle}
                    </h2>
                  </div>
                )}
              </div>

              <div className="goals-new__right">
                <div ref={viewportRef} className="goals-new__viewport">
                  <div ref={missionPanelRef} className="goals-new__panel goals-new__panel--mission">
                    {isMobile && (
                      <h2 className="goals-new__panel_mobile_title">{mobileMissionTitle}</h2>
                    )}
                    <div ref={missionClipRef} className="goals-new__mission_clip">
                      <div ref={missionTextRef} className="goals-new__mission_text">
                        <p className="goals-new__description">{MISSION_TEXT}</p>
                      </div>
                    </div>
                  </div>

                  <div ref={goalsPanelRef} className="goals-new__panel goals-new__panel--goals">
                    {isMobile && activeSnap >= 1 && (
                      <p className="goals-new__panel_group_label">{mobileGoalsTitle}</p>
                    )}
                    <div className="goals-new__cards_stack">
                      {CARDS.map((card, index) => (
                        <div
                          key={card.id}
                          ref={(el) => {
                            cardRefs.current[index] = el;
                          }}
                          className="goal-card"
                        >
                          <GoalCard card={card} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurGoals;
