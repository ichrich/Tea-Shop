import React, { useLayoutEffect, useRef } from 'react';
import './ForWhom.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const ForWhom = () => {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    if (!sectionRef.current) return undefined;

    let media;
    const ctx = gsap.context(() => {
      media = gsap.matchMedia();

      media.add('(min-width: 1025px)', () => {
        const cards = gsap.utils.toArray('.ForWhom_card');
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 72%',
            toggleActions: 'play none none reverse',
          },
        });

        tl.fromTo('.ForWhom_title',
          { opacity: 0.35, y: 24, filter: 'blur(8px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.62, ease: 'power3.out' },
        );
        tl.fromTo(cards,
          { opacity: 0.25, y: 34, x: index => (index % 2 === 0 ? -20 : 20), rotate: index => (index % 2 === 0 ? -1.5 : 1.5) },
          { opacity: 1, y: 0, x: 0, rotate: 0, duration: 0.72, stagger: 0.09, ease: 'back.out(1.2)', clearProps: 'transform' },
          '-=0.22',
        );
      });

      media.add('(max-width: 1024px)', () => {
        gsap.fromTo(['.ForWhom_title', '.ForWhom_card'],
          { opacity: 0.3, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 82%',
              toggleActions: 'play none none reverse',
            },
          },
        );
      });

    }, sectionRef);

    return () => {
      media?.revert();
      ctx.revert();
    };
  }, []);

  const cards = [
    { id: 1, text: 'Бутики, шоурумы и чайные пространства' },
    { id: 2, text: 'Рестораны, отели и камерные гастропроекты' },
    { id: 3, text: 'Корпоративные подарочные программы' },
    { id: 4, text: 'Подписки, клубы и сезонные дропы' },
    { id: 5, text: 'Офисы, переговорные и частные церемонии' },
    { id: 6, text: 'Команды, которым нужен деликатный премиальный ассортимент' },
  ];

  return (
    <section ref={sectionRef} className="ForWhom">
      <div className="container">
        <div className="ForWhom_wrapper">
          <h2 className="ForWhom_title">Для кого подходит коллекция?</h2>

          {cards.map((card, index) => (
            <div key={card.id} className={`ForWhom_card ForWhom_card-${index + 1}`}>
              <h3 className="ForWhom_card_question">{card.text}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
