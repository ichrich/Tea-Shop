import React, { useEffect, useMemo, useState } from 'react'
import './AdminsTable.css'

const AdminsTable = ({
  admins = [],
  searchValue = '',
  loading = false,
  error = null,
  onCreate,
  onEdit,
  onToggleActive,
  onDelete,
}) => {
  const [openMenuId, setOpenMenuId] = useState(null)

  const filteredAdmins = useMemo(() => {
    const query = searchValue.trim().toLowerCase()
    if (!query) return admins

    return admins.filter(admin =>
      [admin.fullName, admin.username, admin.email, admin.role, admin.id]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [admins, searchValue])

  useEffect(() => {
    if (openMenuId === null) return undefined
    const closeMenu = () => setOpenMenuId(null)
    document.addEventListener('click', closeMenu)
    return () => document.removeEventListener('click', closeMenu)
  }, [openMenuId])

  const runAction = callback => {
    setOpenMenuId(null)
    callback?.()
  }

  return (
    <section className='AdminsTable'>
      <div className='AdminsTable_toolbar'>
        <div>
          <h2>Учетные записи</h2>
          <p>Администраторы, роли и доступ к разделам панели.</p>
        </div>
        <button type='button' className='AdminsTable_create' onClick={onCreate}>
          <span aria-hidden='true'>+</span>
          Добавить администратора
        </button>
      </div>

      <div className='AdminsTable_scroll'>
        <table className='AdminsTable_table'>
          <thead>
            <tr>
              <th>Сотрудник</th>
              <th>Логин</th>
              <th>Роль</th>
              <th>Статус</th>
              <th className='AdminsTable_actionsHead'>Действия</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className='AdminsTable_state'>Загрузка...</td></tr>
            )}
            {!loading && error && (
              <tr><td colSpan={5} className='AdminsTable_state AdminsTable_state--error'>{error}</td></tr>
            )}
            {!loading && !error && filteredAdmins.length === 0 && (
              <tr><td colSpan={5} className='AdminsTable_state'>Администраторы не найдены</td></tr>
            )}
            {!loading && !error && filteredAdmins.map(admin => (
              <tr key={admin.id}>
                <td data-label='Сотрудник'>
                  <strong>{admin.fullName || admin.username}</strong>
                  {admin.email && <span className='AdminsTable_email'>{admin.email}</span>}
                </td>
                <td data-label='Логин'>{admin.username}</td>
                <td data-label='Роль'>{admin.role || 'Администрирование'}</td>
                <td data-label='Статус'>
                  <span className={`AdminsTable_status ${admin.isActive ? 'is-active' : 'is-inactive'}`}>
                    <span className='AdminsTable_statusDot' />
                    {admin.isActive ? 'Активен' : 'Отключен'}
                  </span>
                </td>
                <td data-label='Действия' className='AdminsTable_actionsCell'>
                  <div className='AdminsTable_actions'>
                    <button
                      type='button'
                      className='AdminsTable_more'
                      aria-label={`Действия для ${admin.fullName || admin.username}`}
                      aria-expanded={openMenuId === admin.id}
                      onClick={event => {
                        event.stopPropagation()
                        setOpenMenuId(current => current === admin.id ? null : admin.id)
                      }}
                    >
                      <span aria-hidden='true'>⋮</span>
                    </button>
                    {openMenuId === admin.id && (
                      <div className='AdminsTable_menu' role='menu' onClick={event => event.stopPropagation()}>
                        <button type='button' onClick={() => runAction(() => onEdit?.(admin))}>Редактировать</button>
                        <button type='button' onClick={() => runAction(() => onToggleActive?.(admin))}>
                          {admin.isActive ? 'Отключить' : 'Активировать'}
                        </button>
                        <button className='is-danger' type='button' onClick={() => runAction(() => onDelete?.(admin))}>
                          Удалить
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default AdminsTable
