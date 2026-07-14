import React from 'react';
import { motion } from 'framer-motion';
import './AboutCompany.css';
import Breadcrumbs from '../../Breadcrumbs/Breadcrumbs.jsx';

const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

const AboutCompany = () => {
  return (
    <>
      <div className="about__breadcrumbs-wrapper">
        <div className="container">
          <Breadcrumbs />
        </div>
      </div>

      <section className="about__block">
        <div className="container">
          <motion.h3
            className="about__block-title"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={fadeInUp}
          >
            Мы создаём чайный бренд,
            <br />
            в котором вкус звучит тише формы, но дольше памяти.
          </motion.h3>
        </div>
      </section>

      <section className="about__block">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={{ visible: { transition: { staggerChildren: 0.3 } } }}
          >
            <motion.h3 className="about__block-title" variants={fadeInUp}>
              Сад Тишины работает на стыке
              редакционной подачи, честного происхождения
              и спокойного сервиса.
            </motion.h3>
            <motion.p className="about__block-text" variants={fadeInUp}>
              Мы показываем чай как предмет внимания: через сезонность, географию,
              текстуру листа, аромат и сценарии сервировки. Поэтому каждая страница
              здесь собрана как часть одной мягкой церемонии, а не просто как каталог.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="about__block">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={{ visible: { transition: { staggerChildren: 0.3 } } }}
          >
            <motion.h3 className="about__block-title" variants={fadeInUp}>
              В фокусе бренда
              редкие листовые чаи, сезонные купажи
              и подарочные подборки.
            </motion.h3>
            <motion.p className="about__block-text" variants={fadeInUp}>
              Мы одинаково внимательно работаем и с домашним ритуалом, и с ресторанной
              подачей, и с корпоративным форматом. За счёт этого витрина остаётся живой:
              в ней легко развивать коллекции, дегустационные заметки и партнёрские сценарии.
            </motion.p>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default AboutCompany;
