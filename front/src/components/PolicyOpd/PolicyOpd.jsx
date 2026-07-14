import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs.jsx';
import './PolicyOpd.css';

const sections = [
  {
    id: 'general',
    title: 'Общие положения',
    content: [
      'Настоящая политика описывает порядок обработки персональных данных на сайте чайного дома «Сад Тишины». Документ распространяется на все формы обратной связи, заявки на подбор, партнёрские обращения и коммуникацию, которая начинается через сайт.',
      'Оператором данных выступает администрация сайта. Мы используем сведения только в рамках обработки запросов, сопровождения заказа, подбора ассортимента и поддержки клиента.',
    ],
  },
  {
    id: 'data',
    title: 'Какие данные мы можем получать',
    content: [
      'Имя, номер телефона, адрес электронной почты и иные сведения, которые пользователь добровольно сообщает при отправке формы или заявки.',
      'Технические данные: IP-адрес, cookies, тип устройства, браузер, язык интерфейса, время посещения и действия на страницах сайта.',
    ],
  },
  {
    id: 'purposes',
    title: 'Для чего используются данные',
    content: [
      'Чтобы ответить на запрос пользователя, подготовить подбор чая, согласовать заказ, обсудить поставку или партнёрский формат.',
      'Чтобы улучшать структуру сайта, анализировать востребованные сценарии использования и поддерживать стабильную работу сервисов.',
      'Чтобы информировать клиента о статусе обращения, поставки, согласованных условиях и сервисных деталях.',
    ],
  },
  {
    id: 'legal',
    title: 'Правовые основания',
    content: [
      'Обработка данных осуществляется на основании согласия пользователя, предоставленного при отправке формы, а также в случаях, когда это требуется для исполнения договора или ответа на официальный запрос.',
      'Пользователь вправе в любой момент отозвать согласие на обработку персональных данных, направив соответствующее обращение по контактам, указанным на сайте.',
    ],
  },
  {
    id: 'storage',
    title: 'Хранение и защита',
    content: [
      'Мы применяем организационные и технические меры для защиты данных от неправомерного доступа, изменения, распространения и уничтожения.',
      'Срок хранения зависит от цели обращения, требований законодательства и необходимости сопровождения заказа или коммуникации.',
    ],
  },
  {
    id: 'rights',
    title: 'Права пользователя',
    content: [
      'Пользователь может запросить уточнение, обновление или удаление своих персональных данных, если они являются неполными, устаревшими или обрабатываются с нарушением.',
      'Также пользователь вправе получить информацию о составе обрабатываемых данных и целях их использования.',
    ],
  },
];

export default function PolicyOpd() {
  const scrollTweenRef = useRef(null);

  useEffect(() => () => scrollTweenRef.current?.kill(), []);

  const scrollToSection = (event, id) => {
    event.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targetY = Math.max(0, target.getBoundingClientRect().top + window.scrollY - 104);

    scrollTweenRef.current?.kill();
    if (reduceMotion) {
      window.scrollTo(0, targetY);
    } else {
      const proxy = { y: window.scrollY };
      scrollTweenRef.current = gsap.to(proxy, {
        y: targetY,
        duration: 0.72,
        ease: 'power3.inOut',
        overwrite: true,
        onUpdate: () => window.scrollTo(0, proxy.y),
        onComplete: () => {
          window.scrollTo(0, targetY);
          scrollTweenRef.current = null;
        },
      });
    }
    window.history.replaceState(null, '', `#${id}`);
  };

  return (
    <div className="PolicyOpd">
      <div className="container">
        <Breadcrumbs />
      </div>

      <section className="PolicyOpd_hero">
        <div className="PolicyOpd_heroInner container">
          <p className="PolicyOpd_eyebrow">Документы и условия</p>
          <h1 className="PolicyOpd_heroTitle">Политика обработки персональных данных</h1>
          <p className="PolicyOpd_heroLead">
            Мы собираем только те сведения, которые нужны для обратной связи, подбора ассортимента,
            сопровождения заказов и партнёрской коммуникации.
          </p>
        </div>
      </section>

      <section className="PolicyOpd_layout">
        <div className="PolicyOpd_layoutInner container">
          <aside className="PolicyOpd_nav" aria-label="Разделы политики">
            {sections.map((section, index) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="PolicyOpd_navItem"
                onClick={event => scrollToSection(event, section.id)}
              >
                <span className="PolicyOpd_navIndex">{String(index + 1).padStart(2, '0')}</span>
                <span className="PolicyOpd_navLabel">{section.title}</span>
              </a>
            ))}
          </aside>

          <div className="PolicyOpd_content">
            {sections.map((section, index) => (
              <article key={section.id} id={section.id} className="PolicyOpd_card">
                <div className="PolicyOpd_cardHead">
                  <span className="PolicyOpd_cardIndex">{String(index + 1).padStart(2, '0')}</span>
                  <h2 className="PolicyOpd_cardTitle">{section.title}</h2>
                </div>
                <div className="PolicyOpd_cardBody">
                  {section.content.map((line, lineIndex) => (
                    <p key={lineIndex} className="PolicyOpd_text">
                      {line}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
