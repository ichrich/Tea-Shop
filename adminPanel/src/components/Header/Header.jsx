import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './Header.css'
import leaveIcon from '../../assets/icons/leave.svg'

import dashboardIcon from '../../assets/icons/dashboadr_ico.svg'
import saleIcon from '../../assets/icons/cart.svg'
import promotionIcon from '../../assets/icons/promotionn.svg'
import contentIcon from '../../assets/icons/napoln.svg'
import adminIcon from '../../assets/icons/adminIcon.svg'

const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isBurgerOpen, setIsBurgerOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const burgerRef = useRef(null)
  const userRef = useRef(null)

  const ROLE_ACCESS = {
    Администрирование: ['dashboard', 'sales', 'promotion', 'content', 'admin'],
    Продвижение: ['dashboard', 'promotion'],
    Продажи: ['dashboard', 'sales'],
    Наполнение: ['dashboard', 'content'],
  }

  const parseRoles = raw =>
    String(raw || '')
      .split(',')
      .map(x => x.trim().toLowerCase())
      .filter(Boolean)

  const menuItems = [
    { id: 'dashboard', label: 'Обзор', icon: dashboardIcon, path: '/dashboard' },
    { id: 'sales', label: 'Товары', icon: saleIcon, path: '/sales' },
    { id: 'promotion', label: 'Продвижение', icon: promotionIcon, path: '/promotion' },
    { id: 'content', label: 'Публикации', icon: contentIcon, path: '/content' },
    { id: 'admin', label: 'Администрирование', icon: adminIcon, path: '/administration' },
  ]

  const roles = parseRoles(user?.role)
  const allowedSet = new Set()

  if (roles.length === 0) {
    ROLE_ACCESS.Администрирование.forEach(item => allowedSet.add(item))
  } else {
    for (const role of roles) {
      if (role.includes('админ')) ROLE_ACCESS.Администрирование.forEach(item => allowedSet.add(item))
      if (role.includes('продвиж')) ROLE_ACCESS.Продвижение.forEach(item => allowedSet.add(item))
      if (role.includes('продаж')) ROLE_ACCESS.Продажи.forEach(item => allowedSet.add(item))
      if (role.includes('наполн')) ROLE_ACCESS.Наполнение.forEach(item => allowedSet.add(item))
    }
  }

  const visibleMenuItems = menuItems.filter(item => allowedSet.has(item.id))

  useEffect(() => {
    const handleClickOutside = event => {
      if (burgerRef.current && !burgerRef.current.contains(event.target)) {
        setIsBurgerOpen(false)
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className='Header'>
      <div className='Header_container'>
        <div className='Header_brand'>
          <span className='Header_brandMark'>TC</span>
          <div className='Header_brandCopy'>
            <strong>Tea Control</strong>
            <span>Панель управления</span>
          </div>
        </div>

        <nav className='Header_sidebar_nav'>
          {visibleMenuItems.map(item => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `Header_sidebar_item ${isActive ? 'active' : ''}`}
            >
              <span className='Header_sidebar_icon'>
                <img src={item.icon} alt='' aria-hidden='true' />
              </span>
              <span className='Header_sidebar_label'>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div
          className='Header_user'
          ref={userRef}
          onClick={() => setIsUserMenuOpen(v => !v)}
          role='button'
          tabIndex={0}
          onKeyDown={event => {
            if (event.key === 'Enter' || event.key === ' ') setIsUserMenuOpen(v => !v)
          }}
        >
          <div className='Header_user_avatar'>
            <span className='Header_user_initial'>{user?.username ? user.username.charAt(0).toUpperCase() : 'A'}</span>
          </div>
          <div className='Header_user_meta'>
            <span className='Header_user_name'>{user?.username || 'Администратор'}</span>
            <span className='Header_user_role'>{user?.role || 'Полный доступ'}</span>
          </div>

          {isUserMenuOpen && (
            <div className='Header_userMenu' role='menu' onClick={event => event.stopPropagation()}>
              <button
                type='button'
                className='Header_userMenuItem'
                onClick={async () => {
                  setIsUserMenuOpen(false)
                  await logout()
                  navigate('/login', { replace: true })
                }}
              >
                Выйти
              </button>
            </div>
          )}
        </div>

        <div className='Header_burger' ref={burgerRef}>
          <button
            className={`Header_burger_btn ${isBurgerOpen ? 'Header_burger_btn_open' : ''}`}
            onClick={() => setIsBurgerOpen(v => !v)}
            type='button'
            aria-label={isBurgerOpen ? 'Close menu' : 'Open menu'}
          >
            <span className='Header_burger_line'></span>
            <span className='Header_burger_line'></span>
            <span className='Header_burger_line'></span>
          </button>

          {isBurgerOpen && (
            <>
              <div className='Header_burger_backdrop' onClick={() => setIsBurgerOpen(false)} />
              <div className='Header_burger_menu' role='menu'>
                <div className='Header_burger_top'>
                  <div className='Header_burger_profile'>
                    <div className='Header_burger_avatar'>
                      <span className='Header_burger_avatar_initial'>
                        {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
                      </span>
                    </div>
                    <span className='Header_burger_username'>{user?.username || 'Администратор'}</span>
                  </div>

                  <button
                    type='button'
                    className='Header_burger_close'
                    onClick={() => setIsBurgerOpen(false)}
                    aria-label='Close menu'
                  />
                </div>

                <nav className='Header_burger_nav' aria-label='Navigation'>
                  {visibleMenuItems.map(item => (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      className={({ isActive }) => `Header_burger_navItem ${isActive ? 'active' : ''}`}
                      onClick={() => setIsBurgerOpen(false)}
                    >
                      <img src={item.icon} alt='' aria-hidden='true' className='Header_burger_navIcon' />
                      <span className='Header_burger_navLabel'>{item.label}</span>
                    </NavLink>
                  ))}
                </nav>

                <div className='Header_burger_footer'>
                  <button
                    type='button'
                    className='Header_burger_footerLink Header_burger_footerLink--logout'
                    onClick={async () => {
                      setIsBurgerOpen(false)
                      await logout()
                      navigate('/login', { replace: true })
                    }}
                  >
                    <span>Выйти</span>
                    <img src={leaveIcon} alt='' aria-hidden='true' className='Header_burger_footerIcon' />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
