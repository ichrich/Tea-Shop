import React, { useEffect, useMemo, useState } from 'react'
import './AdminUserModal.css'

const ROLE_OPTIONS = [
  { value: 'Администрирование', label: 'Администрирование' },
  { value: 'Продвижение', label: 'Продвижение' },
  { value: 'Продажи', label: 'Продажи' },
  { value: 'Наполнение', label: 'Контент' },
]

const ROLE_ACCESS = {
  Администрирование: ['Обзор', 'Товары', 'Заказы', 'Продвижение', 'Публикации', 'Команда'],
  Продвижение: ['Обзор', 'Продвижение'],
  Продажи: ['Обзор', 'Товары', 'Заказы'],
  Наполнение: ['Обзор', 'Товары', 'Публикации'],
}

const normalizeRole = value => {
  const role = String(value || '').split(',')[0].trim().toLowerCase()
  if (role.includes('продвиж')) return 'Продвижение'
  if (role.includes('продаж')) return 'Продажи'
  if (role.includes('напол') || role.includes('контент')) return 'Наполнение'
  return 'Администрирование'
}

const AdminUserModal = ({ isOpen, onClose, admin, onSave }) => {
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('Администрирование')
  const [isActive, setIsActive] = useState(true)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationError, setValidationError] = useState('')
  const [saving, setSaving] = useState(false)

  const isEdit = Boolean(admin?.id)
  const accessItems = useMemo(() => ROLE_ACCESS[role] || [], [role])

  useEffect(() => {
    if (!isOpen) return
    setFullName(admin?.fullName || '')
    setUsername(admin?.username || '')
    setEmail(admin?.email || '')
    setRole(normalizeRole(admin?.role))
    setIsActive(admin?.isActive !== false)
    setPasswordOpen(!admin?.id)
    setPasswordVisible(false)
    setPassword('')
    setConfirmPassword('')
    setValidationError('')
    setSaving(false)
  }, [isOpen, admin])

  useEffect(() => {
    if (!isOpen) return undefined
    const onKeyDown = event => {
      if (event.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const generatePassword = () => {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%'
    const values = new Uint32Array(14)
    window.crypto.getRandomValues(values)
    const generated = Array.from(values, value => alphabet[value % alphabet.length]).join('')
    setPassword(generated)
    setConfirmPassword(generated)
    setValidationError('')
  }

  const submit = async () => {
    if (!username.trim()) {
      setValidationError('Укажите логин администратора.')
      return
    }
    if (!isEdit && password.length < 6) {
      setValidationError('Для нового аккаунта задайте пароль не короче 6 символов.')
      return
    }
    if (password && password.length < 6) {
      setValidationError('Пароль должен содержать не менее 6 символов.')
      return
    }
    if (password !== confirmPassword) {
      setValidationError('Пароли не совпадают.')
      return
    }

    setSaving(true)
    setValidationError('')
    try {
      await onSave?.({
        id: admin?.id,
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim() || null,
        role,
        isActive,
        ...((!isEdit || password) ? { password } : {}),
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='AdminUserModal_root' role='dialog' aria-modal='true' aria-labelledby='admin-user-title'>
      <button className='AdminUserModal_overlay' type='button' aria-label='Закрыть окно' onClick={onClose} />
      <aside className='AdminUserModal_panel'>
        <header className='AdminUserModal_header'>
          <div>
            <span className='AdminUserModal_kicker'>{isEdit ? 'Управление аккаунтом' : 'Новый аккаунт'}</span>
            <h2 id='admin-user-title'>{isEdit ? 'Настройки администратора' : 'Добавить администратора'}</h2>
          </div>
          <button className='AdminUserModal_close' type='button' onClick={onClose} aria-label='Закрыть'>×</button>
        </header>

        <div className='AdminUserModal_body'>
          <section className='AdminUserModal_section'>
            <div className='AdminUserModal_sectionHead'>
              <div>
                <h3>Данные аккаунта</h3>
                <p>Основная информация для входа и идентификации сотрудника.</p>
              </div>
            </div>
            <div className='AdminUserModal_fields'>
              <label className='AdminUserModal_field'>
                <span>ФИО</span>
                <input value={fullName} onChange={event => setFullName(event.target.value)} placeholder='Имя сотрудника' />
              </label>
              <label className='AdminUserModal_field'>
                <span>Логин</span>
                <input value={username} onChange={event => setUsername(event.target.value)} placeholder='Логин для входа' autoComplete='off' />
              </label>
              <label className='AdminUserModal_field AdminUserModal_field--wide'>
                <span>Электронная почта</span>
                <input type='email' value={email} onChange={event => setEmail(event.target.value)} placeholder='name@company.ru' />
              </label>
            </div>
          </section>

          <section className='AdminUserModal_section'>
            <div className='AdminUserModal_sectionHead'>
              <div>
                <h3>Функционал аккаунта</h3>
                <p>Роль определяет доступные сотруднику разделы панели.</p>
              </div>
            </div>
            <div className='AdminUserModal_fields'>
              <label className='AdminUserModal_field'>
                <span>Роль пользователя</span>
                <select value={role} onChange={event => setRole(event.target.value)}>
                  {ROLE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label className='AdminUserModal_field'>
                <span>Статус</span>
                <select value={isActive ? 'active' : 'inactive'} onChange={event => setIsActive(event.target.value === 'active')}>
                  <option value='active'>Активен</option>
                  <option value='inactive'>Отключен</option>
                </select>
              </label>
            </div>
            <div className='AdminUserModal_access'>
              <span className='AdminUserModal_accessLabel'>Доступные разделы</span>
              <div className='AdminUserModal_accessList'>
                {accessItems.map(item => <span key={item}>{item}</span>)}
              </div>
            </div>
          </section>

          <section className='AdminUserModal_section'>
            <div className='AdminUserModal_sectionHead AdminUserModal_sectionHead--password'>
              <div>
                <h3>{isEdit ? 'Смена пароля' : 'Пароль'}</h3>
                <p>{isEdit ? 'Текущий пароль останется прежним, если не задавать новый.' : 'Минимальная длина пароля 6 символов.'}</p>
              </div>
              {isEdit && (
                <button type='button' className='AdminUserModal_passwordToggle' onClick={() => {
                  setPasswordOpen(open => !open)
                  setPasswordVisible(false)
                  setPassword('')
                  setConfirmPassword('')
                  setValidationError('')
                }}>
                  {passwordOpen ? 'Не менять пароль' : 'Изменить пароль'}
                </button>
              )}
            </div>

            {passwordOpen && (
              <div className='AdminUserModal_passwordBox'>
                <div className='AdminUserModal_fields'>
                  <label className='AdminUserModal_field'>
                    <span>Новый пароль</span>
                    <div className='AdminUserModal_passwordField'>
                      <input type={passwordVisible ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} autoComplete='new-password' />
                      <button
                        type='button'
                        className='AdminUserModal_passwordEye'
                        aria-label={passwordVisible ? 'Скрыть пароль' : 'Показать пароль'}
                        aria-pressed={passwordVisible}
                        onClick={() => setPasswordVisible(visible => !visible)}
                      >
                        <svg viewBox='0 0 24 24' aria-hidden='true'>
                          <path d='M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z' />
                          <circle cx='12' cy='12' r='2.6' />
                          {passwordVisible && <path d='m4 4 16 16' />}
                        </svg>
                      </button>
                    </div>
                  </label>
                  <label className='AdminUserModal_field'>
                    <span>Повторите пароль</span>
                    <div className='AdminUserModal_passwordField'>
                      <input type={passwordVisible ? 'text' : 'password'} value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} autoComplete='new-password' />
                      <button
                        type='button'
                        className='AdminUserModal_passwordEye'
                        aria-label={passwordVisible ? 'Скрыть пароль' : 'Показать пароль'}
                        aria-pressed={passwordVisible}
                        onClick={() => setPasswordVisible(visible => !visible)}
                      >
                        <svg viewBox='0 0 24 24' aria-hidden='true'>
                          <path d='M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z' />
                          <circle cx='12' cy='12' r='2.6' />
                          {passwordVisible && <path d='m4 4 16 16' />}
                        </svg>
                      </button>
                    </div>
                  </label>
                </div>
                <button type='button' className='AdminUserModal_generate' onClick={generatePassword}>Сгенерировать надежный пароль</button>
              </div>
            )}
          </section>

          {validationError && <div className='AdminUserModal_error' role='alert'>{validationError}</div>}
        </div>

        <footer className='AdminUserModal_footer'>
          <button type='button' className='AdminUserModal_cancel' onClick={onClose}>Отменить</button>
          <button type='button' className='AdminUserModal_save' onClick={submit} disabled={saving}>
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </footer>
      </aside>
    </div>
  )
}

export default AdminUserModal
