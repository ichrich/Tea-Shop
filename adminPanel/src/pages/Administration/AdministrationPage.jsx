import React, { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../../utils/api'
import AdminsTable from '../../components/AdminsTable/AdminsTable'
import AdminUserModal from '../../components/AdminUserModal/AdminUserModal'
import './AdministrationPage.css'

const AdministrationPage = () => {
  const [searchValue, setSearchValue] = useState('')
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState(null)

  const loadAdmins = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await apiRequest('/api/adminUsers')
      if (!res.ok) throw new Error(`Ошибка загрузки: ${res.status}`)
      const data = await res.json()
      setAdmins(Array.isArray(data) ? data : [])
    } catch (event) {
      setError(event?.message || 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdmins()
  }, [])

  const filteredCount = useMemo(() => {
    const normalized = searchValue.trim().toLowerCase()
    if (!normalized) return admins.length

    return admins.filter(admin => {
      const haystack = [admin.fullName, admin.username, admin.role, admin.email, admin.id]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(normalized)
    }).length
  }, [admins, searchValue])

  const activeCount = useMemo(() => admins.filter(admin => admin.isActive).length, [admins])

  const onCreate = () => {
    setEditingAdmin(null)
    setIsModalOpen(true)
  }

  const onEdit = admin => {
    setEditingAdmin(admin)
    setIsModalOpen(true)
  }

  const onToggleActive = async admin => {
    try {
      const res = await apiRequest('/api/adminUsers/toggle', {
        method: 'POST',
        body: JSON.stringify({ id: admin.id, isActive: !admin.isActive }),
      })
      if (!res.ok) throw new Error(`Ошибка: ${res.status}`)
      await loadAdmins()
    } catch (event) {
      alert(event?.message || 'Не удалось изменить статус')
    }
  }

  const onDelete = async admin => {
    if (!confirm('Удалить администратора?')) return

    try {
      const res = await apiRequest('/api/adminUsers/delete', {
        method: 'POST',
        body: JSON.stringify({ id: admin.id }),
      })
      if (!res.ok) throw new Error(`Ошибка: ${res.status}`)
      await loadAdmins()
    } catch (event) {
      alert(event?.message || 'Не удалось удалить')
    }
  }

  const onSave = async payload => {
    try {
      const url = payload.id ? '/api/adminUsers/update' : '/api/adminUsers/create'
      const res = await apiRequest(url, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      const text = await res.text().catch(() => '')
      if (!res.ok) throw new Error(text || `Ошибка: ${res.status}`)
      setIsModalOpen(false)
      setEditingAdmin(null)
      await loadAdmins()
    } catch (event) {
      alert(event?.message || 'Не удалось сохранить')
    }
  }

  return (
    <div className='AdministrationPage'>
      <div className='AdministrationPage_topline'>
        <div>
          <span className='AdministrationPage_kicker'>Доступ и роли</span>
          <div className='AdministrationPage_title'>Администрирование</div>
        </div>

        <div className='AdministrationPage_search'>
          <input
            className='AdministrationPage_searchInput'
            placeholder='Поиск по имени, логину или роли'
            value={searchValue}
            onChange={event => setSearchValue(event.target.value)}
          />
        </div>
      </div>

      <div className='AdministrationPage_stats'>
        <article>
          <span>Всего аккаунтов</span>
          <strong>{admins.length}</strong>
        </article>
        <article>
          <span>Активных сейчас</span>
          <strong>{activeCount}</strong>
        </article>
        <article>
          <span>Найдено</span>
          <strong>{filteredCount}</strong>
        </article>
      </div>

      <div className='AdministrationPage_tableWrap'>
        <AdminsTable
          admins={admins}
          searchValue={searchValue}
          loading={loading}
          error={error}
          onCreate={onCreate}
          onEdit={onEdit}
          onToggleActive={onToggleActive}
          onDelete={onDelete}
        />
      </div>

      <AdminUserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingAdmin(null)
        }}
        admin={editingAdmin}
        onSave={onSave}
      />
    </div>
  )
}

export default AdministrationPage
