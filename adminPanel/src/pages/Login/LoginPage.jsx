import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');
    setLoading(true);

    if (!username.trim() || !password.trim()) {
      setError('Заполните логин и пароль.');
      setLoading(false);
      return;
    }

    const result = await login(username.trim(), password);

    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.error || 'Не удалось войти. Проверьте логин и пароль.');
    }

    setLoading(false);
  };

  return (
    <div className="LoginPage">
      <div className="LoginPage_backdrop" />
      <div className="LoginPage_shell">
        <div className="LoginPage_intro">
          <p className="LoginPage_eyebrow">Управление сайтом</p>
          <h1 className="LoginPage_title">Панель чайного дома</h1>
          <p className="LoginPage_subtitle">
            Вход для команды, которая управляет каталогом, публикациями, партнёрскими запросами и
            заказами.
          </p>
        </div>

        <div className="LoginPage_card">
          <div className="LoginPage_cardHeader">
            <h2 className="LoginPage_cardTitle">Вход в систему</h2>
            <p className="LoginPage_cardText">Используйте рабочие учётные данные администратора.</p>
          </div>

          <form onSubmit={handleSubmit} className="LoginPage_form">
            {error ? (
              <div className="LoginPage_error" role="alert">
                {error}
              </div>
            ) : null}

            <label className="LoginPage_group" htmlFor="username">
              <span className="LoginPage_label">Логин</span>
              <input
                id="username"
                type="text"
                className="LoginPage_input"
                value={username}
                onChange={event => setUsername(event.target.value)}
                placeholder="Введите логин"
                autoComplete="username"
                disabled={loading}
                required
              />
            </label>

            <div className="LoginPage_group">
              <label className="LoginPage_label" htmlFor="password">Пароль</label>
              <div className="LoginPage_passwordField">
                <input
                  id="password"
                  type={passwordVisible ? 'text' : 'password'}
                  className="LoginPage_input"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  placeholder="Введите пароль"
                  autoComplete="current-password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="LoginPage_passwordEye"
                  aria-label={passwordVisible ? 'Скрыть пароль' : 'Показать пароль'}
                  aria-pressed={passwordVisible}
                  onClick={() => setPasswordVisible(visible => !visible)}
                  disabled={loading}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" />
                    <circle cx="12" cy="12" r="2.6" />
                    {passwordVisible && <path d="m4 4 16 16" />}
                  </svg>
                </button>
              </div>
            </div>

            <button type="submit" className="LoginPage_button" disabled={loading}>
              {loading ? 'Входим...' : 'Войти'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
