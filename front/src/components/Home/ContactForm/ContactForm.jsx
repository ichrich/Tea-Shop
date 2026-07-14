import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './ContactForm.css';
import Pointer from '../../../assets/Image/Pointer.svg';
import TgLogo from '../../../assets/Image/TgLogo.svg';
import VkLogo from '../../../assets/Image/VkLogo.svg';
import { PERSONAL_DATA_POLICY_URL } from '../../../constants/personalDataPolicy.js';

const EMPTY_FORM = {
  name: '',
  phone: '',
  message: '',
  agree: false,
};

const openContactModal = () => {
  window.dispatchEvent(new CustomEvent('app:open-contact-modal'));
};

export const ContactForm = () => (
  <section id="contact-form" className="ContactForm_section section-light">
    <div className="ContactForm_container container">
      <div className="ContactForm_content">
        <h2 className="ContactForm_title">
          ПОДБЕРЁМ ЧАЙ
          <br />
          ДЛЯ БУТИКА, РЕСТОРАНА
          <br />
          ИЛИ ПОДАРОЧНОЙ ЛИНИИ.
        </h2>

        <button className="ContactForm_trigger_button" type="button" onClick={openContactModal}>
          Связаться
          <img src={Pointer} alt="" />
        </button>
      </div>
    </div>
  </section>
);

export const ContactModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const closeButtonRef = useRef(null);

  const closeModal = () => setIsOpen(false);

  useEffect(() => {
    const openModal = () => setIsOpen(true);
    window.addEventListener('app:open-contact-modal', openModal);
    return () => window.removeEventListener('app:open-contact-modal', openModal);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const onKeyDown = event => {
      if (event.key === 'Escape') closeModal();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const handleChange = event => {
    const { name, value, type, checked } = event.target;
    setFormData(previous => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    if (submitting) return;
    if (!formData.name.trim()) return setStatus('Введите имя');
    if (!/^\+?[0-9\s()-]{10,18}$/.test(formData.phone || '')) {
      return setStatus('Введите корректный номер телефона');
    }
    if (!formData.message.trim()) return setStatus('Расскажите, какой чай или формат вам нужен');
    if (!formData.agree) return setStatus('Необходимо принять условия обработки данных');

    setSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch('/api/contact-form/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, formUIQUE: 'site-contact' }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus(data.message || 'Не удалось отправить сообщение. Попробуйте позже.');
      } else {
        setStatus('Спасибо. Мы свяжемся с вами в ближайшее время.');
        setFormData(EMPTY_FORM);
      }
    } catch {
      setStatus('Нет соединения с сервером. Попробуйте позже.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="ContactForm_dialog" role="presentation" onMouseDown={event => {
      if (event.target === event.currentTarget) closeModal();
    }}>
      <div
        className="ContactForm_modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
      >
        <button
          ref={closeButtonRef}
          className="ContactForm_close"
          type="button"
          onClick={closeModal}
          aria-label="Закрыть форму"
        >
          <span aria-hidden="true">×</span>
        </button>

        <h3 id="contact-modal-title" className="ContactForm_modal_title">
          Расскажите,
          <br />
          какой чайный сценарий вам нужен
        </h3>

        <div className="ContactForm_modal_socials">
          <span>Быстрая связь</span>
          <div className="ContactForm_modal_icons">
            <a href="https://t.me/" className="ContactForm_modal_icon" aria-label="Telegram">
              <img src={TgLogo} alt="" />
            </a>
            <a href="https://vk.com/" className="ContactForm_modal_icon" aria-label="ВКонтакте">
              <img src={VkLogo} alt="" />
            </a>
          </div>
        </div>

        <p className="ContactForm_modal_description">
          Подберём коллекцию для домашней церемонии, ресторанной карты, подарочной серии или
          корпоративного заказа. Ответим с предложением по ассортименту и сервировке.
        </p>

        <form className="ContactForm_modal_form" onSubmit={handleSubmit}>
          <label className="ContactForm_field">
            <span>Имя</span>
            <input
              type="text"
              name="name"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              className="ContactForm_modal_input"
              required
            />
          </label>

          <label className="ContactForm_field">
            <span>Телефон</span>
            <input
              type="tel"
              name="phone"
              autoComplete="tel"
              placeholder="+7 (___) ___-__-__"
              value={formData.phone}
              onChange={handleChange}
              className="ContactForm_modal_input"
              required
            />
          </label>

          <label className="ContactForm_field">
            <span>Задача</span>
            <textarea
              name="message"
              rows="3"
              placeholder="Например, чайная карта для ресторана"
              value={formData.message}
              onChange={handleChange}
              className="ContactForm_modal_input ContactForm_modal_textarea"
              required
            />
          </label>

          <label className="ContactForm_modal_checkbox">
            <input
              type="checkbox"
              name="agree"
              checked={formData.agree}
              onChange={handleChange}
              required
            />
            <span>
              Принимаю{' '}
              <a
                href={PERSONAL_DATA_POLICY_URL}
                className="ContactForm_policy_link"
              >
                условия обработки персональных данных
              </a>
              .
            </span>
          </label>

          <button type="submit" className="ContactForm_modal_submit" disabled={submitting}>
            {submitting ? 'Отправляем...' : 'Отправить сообщение'}
          </button>
          {status && <p className="ContactForm_status" role="status">{status}</p>}
        </form>
      </div>
    </div>,
    document.body,
  );
};
