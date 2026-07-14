import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Breadcrumbs from '../../Breadcrumbs/Breadcrumbs.jsx';
import AhnfeltiaCanvas from './AhnfeltiaCanvas.jsx';

import './AhnfeltiaScene.css';

gsap.registerPlugin(ScrollTrigger);

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

const setSlideScrollDisabled = (disabled) => {
    const value = disabled ? 'true' : 'false';
    document.body.dataset.slideScrollDisabled = value;
    document.documentElement.dataset.slideScrollDisabled = value;
};

const AhnfeltiaScene = () => {
    const wrapperRef = useRef(null);
    const [scrollProgress, setScrollProgress] = useState(0);

    const sceneText = useMemo(() => {
        return {
            short: 'Чайная коллекция для спокойных повседневных ритуалов',
            long:
                'Этот анимационный блок раскрывает чайный продукт в спокойной презентационной подаче. ' +
                'Его можно использовать для сенчи, матчи, улуна, пуэра или подарочной коллекции. ' +
                'Тексты, изображения и акценты собраны так, чтобы внимание оставалось на продукте и его характере.'
        };
    }, []);

    useLayoutEffect(() => {
        if (!wrapperRef.current) return;
        const htmlEl = document.documentElement;
        const bodyEl = document.body;
        const prevHtmlSnap = htmlEl.style.scrollSnapType;
        const prevBodySnap = bodyEl.style.scrollSnapType;
        htmlEl.style.scrollSnapType = 'none';
        bodyEl.style.scrollSnapType = 'none';

        const mm = gsap.matchMedia();

        const setup = (baseScrollDistance) => {
            const ctx = gsap.context(() => {
                gsap.set('.AhnfeltiaScroll_canvas', { opacity: 1, scale: 1 });
                gsap.set('.Ahn_title.left', { xPercent: 0, opacity: 1 });
                gsap.set('.Ahn_title.right', { xPercent: 0, opacity: 1 });
                gsap.set('.Ahn_desc_short', {
                    opacity: 1,
                    y: Math.max(window.innerHeight * 0.25, 180)
                });
                gsap.set('.Ahn_desc_long', {
                    opacity: 0,
                    y: 80,
                    filter: 'blur(16px)'
                });

                const ratio = baseScrollDistance / 2200;
                const splitStagePx = 420 * ratio; // разъезд
                const shortHoldPx = 240 * ratio; // чтение короткого
                const textSwapPx = 360 * ratio; // замена короткого на длинный
                const finalHoldPx = 360 * ratio; // финальное чтение

                const scrollDistance = splitStagePx + shortHoldPx + textSwapPx + finalHoldPx;

                const splitT = splitStagePx / scrollDistance;
                const shortHoldT = shortHoldPx / scrollDistance;
                const textSwapT = textSwapPx / scrollDistance;
                const finalHoldT = finalHoldPx / scrollDistance;

                const snapPoints = [0, splitT, splitT + shortHoldT, splitT + shortHoldT + textSwapT, 1];

                const snapToStep = (value, st) => {
                    const dir = st?.direction || 1;
                    if (dir > 0) {
                        for (let i = 0; i < snapPoints.length; i += 1) {
                            if (snapPoints[i] > value + 0.0005) return snapPoints[i];
                        }
                        return 1;
                    }
                    for (let i = snapPoints.length - 1; i >= 0; i -= 1) {
                        if (snapPoints[i] < value - 0.0005) return snapPoints[i];
                    }
                    return 0;
                };

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: wrapperRef.current,
                        start: 'top top-=1',
                        end: `+=${scrollDistance}`,
                        scrub: 0.15,
                        pin: true,
                        anticipatePin: 1,
                        invalidateOnRefresh: true,
                        snap: {
                            snapTo: snapToStep,
                            duration: 0.22,
                            delay: 0,
                            ease: 'power3.out',
                            inertia: false
                        },
                        markers: false,
                        onToggle: (self) => {
                            setSlideScrollDisabled(self.isActive);
                        },
                        onUpdate: (self) => {
                            setScrollProgress(clamp(self.progress, 0, 1));
                        }
                    }
                });
                tl.to(
                    '.Ahn_title.left',
                    { xPercent: -170, ease: 'none', duration: splitT, scale: 0.6 },
                    0
                );
                tl.to(
                    '.Ahn_title.right',
                    { xPercent: 200, ease: 'none', duration: splitT, scale: 0.6 },
                    0
                );
                tl.to(
                    '.Ahn_desc_short',
                    { y: -92, ease: 'power2.out', duration: splitT },
                    0
                );
                tl.to({}, { duration: shortHoldT });
                tl.to(
                    '.Ahn_desc_short',
                    { opacity: 0, y: -20, ease: 'power1.in', duration: textSwapT * 0.45 },
                    '>'
                );
                tl.fromTo(
                    '.Ahn_desc_long',
                    { opacity: 0, y: 80, filter: 'blur(16px)' },
                    { opacity: 1, y: -190, filter: 'blur(0px)', ease: 'power2.out', duration: textSwapT * 0.55 },
                    '>'
                );
                tl.to({}, { duration: finalHoldT });
            }, wrapperRef);

            return () => ctx.revert();
        };

        mm.add(
            {
                desktop: '(min-width: 1025px)',
                tablet: '(min-width: 768px) and (max-width: 1024px)',
                mobile: '(max-width: 767px)'
            },
            (context) => {
                const { desktop, tablet, mobile } = context.conditions;
                if (desktop) return setup(2200);
                if (tablet) return setup(2000);
                if (mobile) return setup(1400);
                return undefined;
            }
        );

        return () => {
            mm.revert();
            htmlEl.style.scrollSnapType = prevHtmlSnap;
            bodyEl.style.scrollSnapType = prevBodySnap;
            setSlideScrollDisabled(false);
            setScrollProgress(0);
        };
    }, []);

    return (
        <div ref={wrapperRef} className="AhnfeltiaScroll_wrapper" data-slide-scroll-local="true" data-slide-snap="true">
            <div className="AhnfeltiaScroll_canvasWrap">
                <AhnfeltiaCanvas scrollProgress={scrollProgress} />
            </div>

            <div className="AhnfeltiaScroll_breadcrumbs container">
                <Breadcrumbs />
            </div>

            <div className="AhnfeltiaScroll_titleWrap container">
                <h1 className="Ahn_title left">Сенча</h1>
                <h1 className="Ahn_title right">Премиум</h1>
            </div>

            <div className="AhnfeltiaScroll_descWrap">
                <p className="Ahn_desc_short Ahn_desc_common">{sceneText.short}</p>
                <p className="Ahn_desc_long Ahn_desc_common">{sceneText.long}</p>
            </div>
        </div>
    );
};

export default AhnfeltiaScene;
