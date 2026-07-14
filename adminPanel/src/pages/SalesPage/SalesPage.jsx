import React, { useEffect, useMemo, useRef, useState } from 'react'
import { apiRequest } from '../../utils/api'
import eyeIcon from '../../assets/icons/eyeIcon.svg'
import lest from '../../assets/icons/lest.svg'
import StatusIconActive from '../../assets/icons/status_active.png'
import StatusIconNo from '../../assets/icons/status_no.png'
import krestNoIcon from '../../assets/icons/krest_no.svg'
import strelkaYesIcon from '../../assets/icons/strelka_yes.svg'
import './SalesPage.css'

const SalesPage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const [openMenuId, setOpenMenuId] = useState(null)
  const [openAddMenu, setOpenAddMenu] = useState(false)
  const [openFormSelect, setOpenFormSelect] = useState(null)
  const [modalType, setModalType] = useState(null)
  const [lineMenu, setLineMenu] = useState(null)
  const [editingProductId, setEditingProductId] = useState(null)
  const [inlineEdit, setInlineEdit] = useState(null)
  const [productImages, setProductImages] = useState([])
  const [photoPickTarget, setPhotoPickTarget] = useState(null)
  const [photoMenuId, setPhotoMenuId] = useState(null)
  const photoInputRef = useRef(null)
  const [tonicItems, setTonicItems] = useState([
    'Сенча',
    'Матча',
    'Улун',
    'Пуэр',
    'Белый чай',
  ])
  const [benefitItems, setBenefitItems] = useState([
    'Бодрость и концентрация',
    'Спокойный вечерний ритуал',
    'Подарочные коллекции',
  ])
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    tonic: '',
    benefit: '',
    cost: '',
    quantity: '',
    price: '',
    status: 'Активный',
  })

  useEffect(() => {
    let mounted = true

    const fetchProducts = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await apiRequest('/api/adminProducts')
        const raw = await res.text()
        let data = null
        try {
          data = raw ? JSON.parse(raw) : null
        } catch (_) {
          data = raw
        }

        if (!res.ok) {
          const msg =
            (data && typeof data === 'object' && (data.message || data.error)) ||
            `Ошибка загрузки: ${res.status} ${res.statusText}`
          throw new Error(msg)
        }

        const normalized =
          Array.isArray(data)
            ? data
            : Array.isArray(data?.data)
              ? data.data
              : Array.isArray(data?.items)
                ? data.items
                : Array.isArray(data?.products)
                  ? data.products
                  : []

        if (mounted) setProducts(normalized)
      } catch (e) {
        if (mounted) setError(e?.message || 'Ошибка загрузки')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchProducts()
    return () => {
      mounted = false
    }
  }, [])

  const refetchProducts = async () => {
    const res = await apiRequest('/api/adminProducts')
    const raw = await res.text()
    let data = null
    try {
      data = raw ? JSON.parse(raw) : null
    } catch (_) {
      data = raw
    }
    if (!res.ok) {
      const msg =
        (data && typeof data === 'object' && (data.message || data.error)) ||
        `Ошибка загрузки: ${res.status} ${res.statusText}`
      throw new Error(msg)
    }
    const normalized =
      Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data?.products)
              ? data.products
              : []
    setProducts(normalized)
  }

  useEffect(() => {
    const onDoc = () => {
      setOpenMenuId(null)
      setOpenAddMenu(false)
      setLineMenu(null)
      setPhotoMenuId(null)
      setOpenFormSelect(null)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  const tabs = useMemo(() => {
    const counts = new Map()
    for (const p of products) {
      const key = String(p?.category || '').trim()
      if (!key) continue
      counts.set(key, (counts.get(key) || 0) + 1)
    }

    const items = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ru'))
      .map(([label, count]) => ({
        id: label.toLowerCase(),
        label,
        count,
      }))

    return [{ id: 'all', label: 'Все', count: products.length }, ...items]
  }, [products])

  const filtered = useMemo(() => {
    const q = String(search || '').trim().toLowerCase()
    return products.filter((p) => {
      if (activeTab !== 'all') {
        const cat = String(p?.category || '').trim().toLowerCase()
        if (cat !== activeTab) return false
      }
      if (!q) return true
      const name = String(p?.name || '').toLowerCase()
      const id = String(p?.productId || p?.id || '').toLowerCase()
      return name.includes(q) || id.includes(q)
    })
  }, [products, search, activeTab])

  const toggleRowMenu = (e, id) => {
    e.stopPropagation()
    setOpenMenuId((prev) => (prev === id ? null : id))
  }

  const handleDelete = async (id) => {
    setOpenMenuId(null)
    if (!window.confirm('Удалить товар?')) return
    try {
      const res = await apiRequest(`/api/delete/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Не удалось удалить')
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (e) {
      alert(e?.message || 'Ошибка удаления')
    }
  }

  const handleToggleActive = async (id) => {
    setOpenMenuId(null)
    const current = products.find((p) => p.id === id)
    if (!current) return
    try {
      const res = await apiRequest(`/api/products/${id}/toggle`, {
        method: 'POST',
        body: JSON.stringify({ active: !current.active }),
      })
      if (!res.ok) throw new Error('Не удалось изменить статус')
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)))
    } catch (e) {
      alert(e?.message || 'Ошибка')
    }
  }

  const openCreateModal = (type) => {
    setOpenAddMenu(false)
    setLineMenu(null)
    setEditingProductId(null)
    if (type === 'product') {
      setProductForm({
        name: '',
        description: '',
        tonic: '',
        benefit: '',
        cost: '',
        quantity: '',
        price: '',
        status: 'Активный',
      })
      setProductImages([])
      setPhotoMenuId(null)
    }
    setModalType(type)
    setOpenFormSelect(null)
  }

  const closeModal = () => {
    setModalType(null)
    setLineMenu(null)
    setInlineEdit(null)
    setPhotoMenuId(null)
    setOpenFormSelect(null)
  }

  const handleLineEdit = (kind, index) => {
    const list = kind === 'tonic' ? tonicItems : benefitItems
    const current = list[index] || ''
    setInlineEdit({ kind, index, value: current, prevValue: current, isNew: false })
    setLineMenu(null)
  }

  const handleLineDelete = (kind, index) => {
    if (kind === 'tonic') {
      setTonicItems((prev) => prev.filter((_, i) => i !== index))
    } else {
      setBenefitItems((prev) => prev.filter((_, i) => i !== index))
    }
    setLineMenu(null)
  }

  const addLine = (kind) => {
    if (kind === 'tonic') {
      setTonicItems((prev) => {
        const next = [...prev, '']
        setInlineEdit({ kind: 'tonic', index: next.length - 1, value: '', prevValue: '', isNew: true })
        return next
      })
    } else {
      setBenefitItems((prev) => {
        const next = [...prev, '']
        setInlineEdit({ kind: 'benefit', index: next.length - 1, value: '', prevValue: '', isNew: true })
        return next
      })
    }
  }

  const saveInlineEdit = () => {
    if (!inlineEdit) return
    const value = String(inlineEdit.value || '').trim()
    if (!value) {
      if (inlineEdit.isNew) {
        if (inlineEdit.kind === 'tonic') {
          setTonicItems((prev) => prev.filter((_, i) => i !== inlineEdit.index))
        } else {
          setBenefitItems((prev) => prev.filter((_, i) => i !== inlineEdit.index))
        }
      }
      setInlineEdit(null)
      return
    }
    if (inlineEdit.kind === 'tonic') {
      setTonicItems((prev) => prev.map((v, i) => (i === inlineEdit.index ? value : v)))
    } else {
      setBenefitItems((prev) => prev.map((v, i) => (i === inlineEdit.index ? value : v)))
    }
    setInlineEdit(null)
  }

  const cancelInlineEdit = () => {
    if (!inlineEdit) return
    if (inlineEdit.isNew) {
      if (inlineEdit.kind === 'tonic') {
        setTonicItems((prev) => prev.filter((_, i) => i !== inlineEdit.index))
      } else {
        setBenefitItems((prev) => prev.filter((_, i) => i !== inlineEdit.index))
      }
    } else {
      if (inlineEdit.kind === 'tonic') {
        setTonicItems((prev) => prev.map((v, i) => (i === inlineEdit.index ? inlineEdit.prevValue : v)))
      } else {
        setBenefitItems((prev) => prev.map((v, i) => (i === inlineEdit.index ? inlineEdit.prevValue : v)))
      }
    }
    setInlineEdit(null)
  }

  const openEditProductModal = (product) => {
    setOpenMenuId(null)
    setEditingProductId(product.id)
    setProductForm({
      name: product?.name || '',
      description: product?.description || '',
      tonic: product?.category || '',
      benefit: product?.usefull || '',
      cost: '',
      quantity: String(product?.quantity ?? ''),
      price: String(product?.price ?? ''),
      status: product?.active ? 'Активный' : 'Не активный',
    })
    const existingImages = Array.isArray(product?.images)
      ? product.images
      : product?.image
        ? [product.image]
        : []
    setProductImages(
      existingImages
        .filter((url) => typeof url === 'string' && url.trim())
        .slice(0, 8)
        .map((url, index) => ({
          id: `img-${Date.now()}-${index}`,
          url,
        }))
    )
    setPhotoMenuId(null)
    setOpenFormSelect(null)
    setModalType('product')
  }

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const next = files.slice(0, 8).map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(file),
      file,
    }))

    setProductImages((prev) => {
      if (photoPickTarget === 'cover') {
        const cover = next[0]
        const others = prev.filter((_, idx) => idx !== 0)
        return [cover, ...others].slice(0, 8)
      }

      if (typeof photoPickTarget === 'number') {
        const startIndex = photoPickTarget
        const updated = [...prev]
        for (let i = 0; i < next.length; i += 1) {
          const targetIndex = startIndex + i
          if (targetIndex > 7) break
          updated[targetIndex] = next[i]
        }
        return updated.slice(0, 8)
      }

      return [...prev, ...next].slice(0, 8)
    })

    setPhotoPickTarget(null)
    e.target.value = ''
  }

  const openPhotoPicker = (target) => {
    setPhotoPickTarget(target)
    photoInputRef.current?.click()
  }

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const makeCoverPhoto = (id) => {
    setProductImages((prev) => {
      const idx = prev.findIndex((img) => img.id === id)
      if (idx <= 0) return prev
      const picked = prev[idx]
      const rest = prev.filter((img) => img.id !== id)
      return [picked, ...rest]
    })
    setPhotoMenuId(null)
  }

  const removePhoto = (id) => {
    setProductImages((prev) => prev.filter((img) => img.id !== id))
    setPhotoMenuId(null)
  }

  const saveProduct = async () => {
    const name = String(productForm.name || '').trim()
    if (!name) return
    const quantityNum = Number(String(productForm.quantity || '').replace(/[^\d.-]/g, '')) || 0
    const priceNum = Number(String(productForm.price || '').replace(/[^\d.-]/g, '')) || 0
    const costNum = Number(String(productForm.cost || '').replace(/[^\d.-]/g, '')) || 0

    try {
      const imagesPayload = await Promise.all(
        productImages.map(async (img) => {
          if (img.file) {
            const dataUrl = await toBase64(img.file)
            return {
              name: img.file.name,
              type: img.file.type,
              dataUrl,
            }
          }
          if (img.url && typeof img.url === 'string') {
            return { url: img.url }
          }
          return null
        })
      )

      if (editingProductId) {
        const res = await apiRequest('/api/addProduct/update', {
          method: 'POST',
          body: JSON.stringify({
            id: editingProductId,
            name,
            description: String(productForm.description || '').trim(),
            category: productForm.benefit || '',
            type: productForm.tonic || '',
            price: priceNum,
            costPrice: costNum,
            quantity: quantityNum,
            images: imagesPayload.filter(Boolean),
            catalogSection: 3,
            features: [],
            certs: [],
            cerf: [],
          }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.message || err.error || 'Не удалось сохранить изменения')
        }
      } else {
        const res = await apiRequest('/api/addProduct', {
          method: 'POST',
          body: JSON.stringify({
            name,
            description: String(productForm.description || '').trim(),
            category: productForm.benefit || '',
            type: productForm.tonic || '',
            price: priceNum,
            costPrice: costNum,
            quantity: quantityNum,
            images: imagesPayload.filter(Boolean),
            catalogSection: 3,
            features: [],
            cerf: [],
            cerfFile: [],
          }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.message || err.error || 'Не удалось добавить товар')
        }
      }

      await refetchProducts()
      closeModal()
    } catch (e) {
      alert(e?.message || 'Ошибка сохранения товара')
    }
  }

  return (
    <div className="SalesPage">
      <div className="SalesPage_card">
        <div className="SalesPage_header">
          <h1 className="SalesPage_title">Товары</h1>
        </div>

        <div className="SalesPage_tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`SalesPage_tab ${activeTab === t.id ? 'SalesPage_tab_active' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                setActiveTab(t.id)
              }}
            >
              {t.label} <span className="SalesPage_badge">{t.count}</span>
            </button>
          ))}
        </div>

        <div className="SalesPage_controls">
          <div className="SalesPage_search">
            <input
              type="text"
              className="SalesPage_searchInput"
              placeholder="Поиск"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="9" cy="9" r="6" stroke="white" strokeOpacity="0.35" strokeWidth="1.4" />
              <path d="M14 14L17 17" stroke="white" strokeOpacity="0.35" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="SalesPage_tableWrap">
          <table className="SalesPage_table">
            <thead>
              <tr>
                <th>НАЗВАНИЕ ТОВАРА</th>
                <th>ID ТОВАРА</th>
                <th>ВИД ЧАЯ</th>
                <th>ПРОСМОТРЫ</th>
                <th>ЦЕНА</th>
                <th>КОЛ-ВО</th>
                <th>СТАТУС</th>
                <th aria-label="Действия" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="SalesPage_empty" colSpan={8}>
                    Загрузка...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td className="SalesPage_empty" colSpan={8}>
                    {error}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="SalesPage_empty" colSpan={8}>
                    Товары не найдены
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id}>
                    <td className="SalesPage_titleCell" data-label="Название товара">
                      <div className="SalesPage_titleCellRow">
                        <span>{p.name}</span>
                      </div>
                    </td>
                    <td
                      className={`SalesPage_idCell ${openMenuId === p.id ? 'SalesPage_idCell--menuOpen' : ''}`}
                      data-label="ID товара"
                    >
                      <span>{p.productId}</span>
                    </td>
                    <td data-label="Вид чая">{p.category}</td>
                    <td data-label="Просмотры">
                      <span className="SalesPage_metric">
                        <img className="SalesPage_metricIcon" src={eyeIcon} alt="" aria-hidden="true" />
                        {p.views ?? 0}
                      </span>
                    </td>
                    <td data-label="Цена">₽ {typeof p.price === 'number' ? `${p.price.toLocaleString('ru-RU')}` : p.price}</td>
                    <td data-label="Количество"><span className="SalesPage_metric">
                      <img className="SalesPage_metricIcon" src={lest} alt="" aria-hidden="true" />
                      <span> {p.quantity ?? 0} шт</span></span></td>
                    <td data-label="Статус">
                      <span className={`SalesPage_status ${p.active ? 'SalesPage_status--active' : ''}`}>
                        <img
                          src={p.active ? StatusIconActive : StatusIconNo}
                          alt=""
                          aria-hidden="true"
                          className="SalesPage_statusIcon"
                        />
                        {p.active ? 'Активный' : 'Не активный'}
                      </span>
                    </td>
                    <td className={`SalesPage_actionsCell ${openMenuId === p.id ? 'SalesPage_idCell--menuOpen' : ''}`} data-label="Действия">
                      <button type="button" className="SalesPage_more" onClick={(e) => toggleRowMenu(e, p.id)}>
                        ...
                      </button>
                      {openMenuId === p.id && (
                        <div className="SalesPage_menu" onClick={(e) => e.stopPropagation()}>
                          <button type="button" className="SalesPage_menuItem" onClick={() => openEditProductModal(p)}>
                            Редактировать
                          </button>
                          <button type="button" className="SalesPage_menuItem" onClick={() => handleToggleActive(p.id)}>
                            {p.active ? 'Снять с публикации' : 'Опубликовать'}
                          </button>
                          <button
                            type="button"
                            className="SalesPage_menuItem SalesPage_menuItem--danger"
                            onClick={() => handleDelete(p.id)}
                          >
                            Удалить
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="SalesPage_addButton_wrapper" onClick={(e) => e.stopPropagation()}>
        {openAddMenu && (
          <div className="SalesPage_addMenu">
            <button type="button" className="SalesPage_addMenu_item" onClick={() => openCreateModal('product')}>
              Товар
            </button>
            <button type="button" className="SalesPage_addMenu_item" onClick={() => openCreateModal('tonic')}>
              Вид чая
            </button>
            <button type="button" className="SalesPage_addMenu_item" onClick={() => openCreateModal('benefit')}>
              Назначение
            </button>
          </div>
        )}

        <button type="button" className="SalesPage_addButton" onClick={() => setOpenAddMenu((v) => !v)} aria-label="Добавить">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {modalType && <div className="SalesPage_modalOverlay" onClick={() => setModalType(null)} />}

      {modalType === 'product' && (
        <aside className="SalesPage_sideModal SalesPage_sideModal--wide" onClick={(e) => e.stopPropagation()}>
          <h2 className="SalesPage_sideModalTitle">{editingProductId ? 'РЕДАКТИРОВАТЬ ТОВАР' : 'ДОБАВИТЬ ТОВАР'}</h2>
          <div className="SalesPage_formGrid">
            <div>
              <label className="SalesPage_label">Название товара</label>
              <input
                className="SalesPage_input"
                placeholder="Название товара"
                value={productForm.name}
                onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="SalesPage_label">Описание товара</label>
              <input
                className="SalesPage_input"
                placeholder="Описание товара"
                value={productForm.description}
                onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>

          <div className="SalesPage_formGrid SalesPage_formGrid--upload">
            <div>
              <label className="SalesPage_label">Фотографии товара</label>
              <label
                className={`SalesPage_uploadBox ${productImages[0] ? 'SalesPage_uploadBox--hasImage' : ''}`}
                style={
                  productImages[0]
                    ? {
                        backgroundImage: `url(${productImages[0].url})`,
                      }
                    : undefined
                }
                onClick={(e) => {
                  e.preventDefault()
                  openPhotoPicker('cover')
                }}
              >
                {!productImages[0] && 'Перетащите фото или загрузите'}
              </label>
            </div>
            <div className="SalesPage_thumbGrid">
              {Array.from({ length: 8 }).map((_, i) => {
                const imageIndex = i + 1
                const img = productImages[imageIndex]
                return (
                  <div key={i} className="SalesPage_thumb" onClick={() => openPhotoPicker(imageIndex)}>
                    {img ? (
                      <>
                        <img src={img.url} alt="" className="SalesPage_thumbImg" />
                        <button
                          type="button"
                          className="SalesPage_thumbDots"
                          onClick={(e) => {
                            e.stopPropagation()
                            setPhotoMenuId(photoMenuId === img.id ? null : img.id)
                          }}
                        >
                          ...
                        </button>
                        {photoMenuId === img.id && (
                          <div className="SalesPage_thumbMenu">
                            <button type="button" onClick={() => makeCoverPhoto(img.id)}>Сделать титульным</button>
                            <button type="button" onClick={() => removePhoto(img.id)}>Удалить</button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="SalesPage_thumbPlaceholder">...</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          <input ref={photoInputRef} type="file" accept="image/*" multiple className="SalesPage_hiddenInput" onChange={handlePhotoUpload} />

          <div className="SalesPage_formGrid">
            <div>
              <label className="SalesPage_label">Вид чая</label>
              <div className="SalesPage_selectWrap" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="SalesPage_selectTrigger"
                  onClick={() => setOpenFormSelect((prev) => (prev === 'tonic' ? null : 'tonic'))}
                >
                  <span>{productForm.tonic || 'Вид чая'}</span>
                  <span className={`SalesPage_selectArrow ${openFormSelect === 'tonic' ? 'SalesPage_selectArrow--open' : ''}`}>▾</span>
                </button>
                {openFormSelect === 'tonic' && (
                  <div className="SalesPage_selectDropdown">
                    {tonicItems.map((item, i) => (
                      <button
                        key={`${item}-${i}`}
                        type="button"
                        className="SalesPage_selectOption"
                        onClick={() => {
                          setProductForm((prev) => ({ ...prev, tonic: item }))
                          setOpenFormSelect(null)
                        }}
                      >
                        <span>{item}</span>
                        <span className={`SalesPage_optionCheck ${productForm.tonic === item ? 'SalesPage_optionCheck--active' : ''}`} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="SalesPage_label">Назначение</label>
              <div className="SalesPage_selectWrap" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="SalesPage_selectTrigger"
                  onClick={() => setOpenFormSelect((prev) => (prev === 'benefit' ? null : 'benefit'))}
                >
                  <span>{productForm.benefit || 'Назначение'}</span>
                  <span className={`SalesPage_selectArrow ${openFormSelect === 'benefit' ? 'SalesPage_selectArrow--open' : ''}`}>▾</span>
                </button>
                {openFormSelect === 'benefit' && (
                  <div className="SalesPage_selectDropdown">
                    {benefitItems.map((item, i) => (
                      <button
                        key={`${item}-${i}`}
                        type="button"
                        className="SalesPage_selectOption"
                        onClick={() => {
                          setProductForm((prev) => ({ ...prev, benefit: item }))
                          setOpenFormSelect(null)
                        }}
                      >
                        <span>{item}</span>
                        <span className={`SalesPage_optionCheck ${productForm.benefit === item ? 'SalesPage_optionCheck--active' : ''}`} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="SalesPage_formGrid">
            <div>
              <label className="SalesPage_label">Себестоимость</label>
              <input
                className="SalesPage_input"
                placeholder="10 000 ₽"
                value={productForm.cost}
                onChange={(e) => setProductForm((prev) => ({ ...prev, cost: e.target.value }))}
              />
            </div>
            <div>
              <label className="SalesPage_label">Количество</label>
              <input
                className="SalesPage_input"
                placeholder="1 шт."
                value={productForm.quantity}
                onChange={(e) => setProductForm((prev) => ({ ...prev, quantity: e.target.value }))}
              />
            </div>
          </div>

          <div className="SalesPage_formGrid">
            <div>
              <label className="SalesPage_label">Цена</label>
              <input
                className="SalesPage_input"
                placeholder="20 000 ₽"
                value={productForm.price}
                onChange={(e) => setProductForm((prev) => ({ ...prev, price: e.target.value }))}
              />
            </div>
            <div>
              <label className="SalesPage_label">Состояние</label>
              <select
                className="SalesPage_input"
                value={productForm.status}
                onChange={(e) => setProductForm((prev) => ({ ...prev, status: e.target.value }))}
              >
                <option>Активный</option>
                <option>Не активный</option>
              </select>
            </div>
          </div>

          <div className="SalesPage_modalFooter">
            <button className="SalesPage_btnPrimary" onClick={saveProduct}>Сохранить изменения</button>
            <button className="SalesPage_btnGhost" onClick={closeModal}>Отменить изменения</button>
          </div>
        </aside>
      )}

      {modalType === 'tonic' && (
        <aside className="SalesPage_sideModal" onClick={(e) => e.stopPropagation()}>
          <h2 className="SalesPage_sideModalTitle">ДОБАВИТЬ<br />ВИД ЧАЯ</h2>
          <label className="SalesPage_label">Чайные категории</label>
          {tonicItems.map((item, idx) => (
            <div key={`${item}-${idx}`} className="SalesPage_lineItem">
              {inlineEdit?.kind === 'tonic' && inlineEdit?.index === idx ? (
                <input
                  className="SalesPage_inlineInput"
                  autoFocus
                  value={inlineEdit.value}
                  onChange={(e) => setInlineEdit((prev) => ({ ...prev, value: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveInlineEdit()
                    if (e.key === 'Escape') cancelInlineEdit()
                  }}
                />
              ) : (
                <span className="SalesPage_lineText">{item}</span>
              )}
              {inlineEdit?.kind === 'tonic' && inlineEdit?.index === idx ? (
                <div className="SalesPage_inlineActions">
                  <button type="button" className="SalesPage_inlineActionBtn" onClick={saveInlineEdit}>
                    <img src={strelkaYesIcon} alt="Подтвердить" />
                  </button>
                  <button type="button" className="SalesPage_inlineActionBtn" onClick={cancelInlineEdit}>
                    <img src={krestNoIcon} alt="Отменить" />
                  </button>
                </div>
              ) : (
                <span>
                  <button
                    type="button"
                    className="SalesPage_lineDots"
                    onClick={() => setLineMenu(lineMenu?.key === `t-${idx}` ? null : { key: `t-${idx}` })}
                  >
                    ...
                  </button>
                  ↕
                </span>
              )}
              {lineMenu?.key === `t-${idx}` && (
                <div className="SalesPage_lineMenu">
                  <button type="button" onClick={() => handleLineEdit('tonic', idx)}>Редактировать</button>
                  <button type="button" onClick={() => handleLineDelete('tonic', idx)}>Удалить</button>
                </div>
              )}
            </div>
          ))}
          <button type="button" className="SalesPage_linkBtn" onClick={() => addLine('tonic')}>Добавить еще</button>
          <div className="SalesPage_modalFooter">
            <button className="SalesPage_btnPrimary" onClick={closeModal}>Сохранить изменения</button>
            <button className="SalesPage_btnGhost" onClick={closeModal}>Отменить изменения</button>
          </div>
        </aside>
      )}

      {modalType === 'benefit' && (
        <aside className="SalesPage_sideModal" onClick={(e) => e.stopPropagation()}>
          <h2 className="SalesPage_sideModalTitle">ДОБАВИТЬ<br />НАЗНАЧЕНИЕ</h2>
          <label className="SalesPage_label">Назначение</label>
          {benefitItems.map((item, idx) => (
            <div key={`${item}-${idx}`} className="SalesPage_lineItem">
              {inlineEdit?.kind === 'benefit' && inlineEdit?.index === idx ? (
                <input
                  className="SalesPage_inlineInput"
                  autoFocus
                  value={inlineEdit.value}
                  onChange={(e) => setInlineEdit((prev) => ({ ...prev, value: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveInlineEdit()
                    if (e.key === 'Escape') cancelInlineEdit()
                  }}
                />
              ) : (
                <span className="SalesPage_lineText">{item}</span>
              )}
              {inlineEdit?.kind === 'benefit' && inlineEdit?.index === idx ? (
                <div className="SalesPage_inlineActions">
                  <button type="button" className="SalesPage_inlineActionBtn" onClick={saveInlineEdit}>
                    <img src={strelkaYesIcon} alt="Подтвердить" />
                  </button>
                  <button type="button" className="SalesPage_inlineActionBtn" onClick={cancelInlineEdit}>
                    <img src={krestNoIcon} alt="Отменить" />
                  </button>
                </div>
              ) : (
                <span>
                  <button
                    type="button"
                    className="SalesPage_lineDots"
                    onClick={() => setLineMenu(lineMenu?.key === `b-${idx}` ? null : { key: `b-${idx}` })}
                  >
                    ...
                  </button>
                  ↕
                </span>
              )}
              {lineMenu?.key === `b-${idx}` && (
                <div className="SalesPage_lineMenu">
                  <button type="button" onClick={() => handleLineEdit('benefit', idx)}>Редактировать</button>
                  <button type="button" onClick={() => handleLineDelete('benefit', idx)}>Удалить</button>
                </div>
              )}
            </div>
          ))}
          <button type="button" className="SalesPage_linkBtn" onClick={() => addLine('benefit')}>Добавить еще</button>
          <div className="SalesPage_modalFooter">
            <button className="SalesPage_btnPrimary" onClick={closeModal}>Сохранить изменения</button>
            <button className="SalesPage_btnGhost" onClick={closeModal}>Отменить изменения</button>
          </div>
        </aside>
      )}
    </div>
  )
}

export default SalesPage



