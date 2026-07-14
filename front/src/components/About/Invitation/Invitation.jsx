import React, { useState } from 'react';
import './Invitation.css';
import Pointer from '../../../assets/Image/Pointer.svg';
import TgLogo from '../../../assets/Image/TgLogo.svg';
import VkLogo from '../../../assets/Image/VkLogo.svg';
import { PERSONAL_DATA_POLICY_URL } from '../../../constants/personalDataPolicy.js';

const Invitation = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: '',
    agree: false,
  });

  const handleChange = event => {
    const { name, value, type, checked } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setStatus(null);

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        email: null,
        message: formData.message,
        agree: Boolean(formData.agree),
        formUIQUE: 'about-invitation',
      };
      const res = await fetch('/api/contact-form/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus(data.message || 'Ошибка при отправке. Попробуйте позже.');
      } else {
        setStatus('Спасибо. Мы подготовим предложение и свяжемся с вами.');
        setFormData({ name: '', phone: '', message: '', agree: false });
      }
    } catch (error) {
      console.error(error);
      setStatus('Ошибка сети. Попробуйте позже.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="invitation section-light">
        <div className="invitation_container container">
          <div className="invitation_content">
            <h2 className="invitation_title">
              СОБЕРЁМ ЧАЙНУЮ ПОДАЧУ
              <br />
              ДЛЯ ВАШЕГО ПРОСТРАНСТВА,
              <br />
              СОБЫТИЯ ИЛИ БУТИКА.
            </h2>

            <button className="invitation_trigger_button" onClick={() => setIsModalOpen(true)}>
              Связаться
              <img src={Pointer} alt="" />
            </button>
          </div>
        </div>
      </section>

      {isModalOpen && (
        <>
          <div className="invitation_overlay" onClick={() => setIsModalOpen(false)} />
          <div className={`invitation_modal ${isModalOpen ? 'active' : ''}`}>
            <button className="invitation_close" onClick={() => setIsModalOpen(false)}>
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                <path d="M7.5 7.5L22.5 22.5M22.5 7.5L7.5 22.5" stroke="white" strokeWidth="2" />
              </svg>
            </button>

            <h3 className="invitation_modal_title">
              Давайте обсудим
              <br />
              ваш формат подачи
            </h3>

            <div className="invitation_modal_socials">
              <span>Связаться с нами</span>
              <div className="invitation_modal_icons">
                <a href="https://t.me/" className="invitation_modal_icon" aria-label="Telegram">
                  <img src={TgLogo} alt="Telegram" />
                </a>
                <a href="https://vk.com/" className="invitation_modal_icon" aria-label="ВКонтакте">
                  <img src={VkLogo} alt="VK" />
                </a>
              </div>
            </div>

            <p className="invitation_modal_description">
              Напишите, нужен ли вам ассортимент для ресторана, подарочная коллекция,
              клубная подписка или розничная витрина. Мы подскажем, как лучше собрать
              предложение по вкусу, упаковке и формату сервировки.
            </p>

            <form className="invitation_modal_form" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Имя"
                value={formData.name}
                onChange={handleChange}
                className="invitation_modal_input"
                required
              />

              <input
                type="tel"
                name="phone"
                placeholder="Телефон"
                value={formData.phone}
                onChange={handleChange}
                className="invitation_modal_input"
                required
              />

              <input
                type="text"
                name="message"
                placeholder="Коротко о задаче"
                value={formData.message}
                onChange={handleChange}
                className="invitation_modal_input"
                required
              />

              <label className="invitation_modal_checkbox">
                <input
                  type="checkbox"
                  name="agree"
                  checked={formData.agree}
                  onChange={handleChange}
                  required
                />
                <span>
                  Принимаю <a href={PERSONAL_DATA_POLICY_URL}>условия обработки персональных данных</a>.
                </span>
              </label>

              <button type="submit" className="invitation_modal_submit" disabled={submitting}>
                {submitting ? 'Отправка...' : 'Отправить сообщение'}
              </button>
              {status && <p className="invitation_status">{status}</p>}
            </form>
          </div>
        </>
      )}
    </>
  );
};

export default Invitation;
