import React, { useMemo } from 'react';
import { motion as Motion } from 'framer-motion';
import './TeaStoryScroller.css';

const DEFAULT_CONFIG = {
  scenes: [
    {
      id: 'tea-story-default',
      title: 'Чайная коллекция',
      content: ['Редкие листовые чаи для спокойного ежедневного ритуала и профессиональной подачи.'],
    },
  ],
  cards: [],
};

const toArray = value => (
  (Array.isArray(value) ? value : [value]).filter(Boolean)
);

const buildItems = inputConfig => {
  const config = inputConfig || DEFAULT_CONFIG;
  const cards = toArray(config.cards);
  const result = [];

  toArray(config.scenes).forEach((scene, sceneIndex) => {
    if (scene?.kind === 'cards' && cards.length > 0) {
      cards.forEach((card, cardIndex) => {
        result.push({
          id: `${scene.id || sceneIndex}-${card.id || cardIndex}`,
          eyebrow: scene.title || '',
          title: card.title || scene.title || '',
          content: toArray(card.description),
        });
      });
      return;
    }

    result.push({
      id: scene?.id || `tea-story-${sceneIndex}`,
      eyebrow: scene?.eyebrow || '',
      title: scene?.title || '',
      content: toArray(scene?.content),
    });
  });

  return result.length > 0 ? result : buildItems(DEFAULT_CONFIG);
};

const itemMotion = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const TeaStoryScroller = ({ config, className = '' } = {}) => {
  const items = useMemo(() => buildItems(config), [config]);

  return (
    <section
      className={`TeaStory_section ${className}`.trim()}
      data-slide-scroll-local="true"
    >
      <div className="TeaStory_static container">
        <Motion.header
          className="TeaStory_staticHeader"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="TeaStory_staticEyebrow">Коллекция и подход</p>
          <h2 className="TeaStory_staticHeading">Чай раскрывается через происхождение, вкус и способ подачи</h2>
        </Motion.header>

        <div className="TeaStory_staticGrid">
          {items.map((item, index) => (
            <Motion.article
              key={item.id}
              className="TeaStory_staticItem"
              variants={itemMotion}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.18 }}
              transition={{
                duration: 0.55,
                delay: Math.min(index % 3, 2) * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="TeaStory_staticIndex">{String(index + 1).padStart(2, '0')}</div>
              <div className="TeaStory_staticCopy">
                {item.eyebrow ? <p className="TeaStory_staticLabel">{item.eyebrow}</p> : null}
                <h3 className="TeaStory_staticTitle">{item.title}</h3>
                <div className="TeaStory_staticBody">
                  {item.content.map((paragraph, paragraphIndex) => (
                    <p key={paragraphIndex}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </Motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeaStoryScroller;
