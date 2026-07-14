import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../../utils/api'
import krestNoIcon from '../../assets/icons/krest_no.svg'
import strelkaYesIcon from '../../assets/icons/strelka_yes.svg'
import './TaxonomyModal.css'

const TaxonomyModal = ({
	isOpen,
	onClose,
	title,
	entityLabel, // 'author' | 'category'
	apiBase, // '/api/articleAuthors' | '/api/articleCategories'
}) => {
	const [items, setItems] = useState([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [newValue, setNewValue] = useState('')
	const [isAdding, setIsAdding] = useState(false)

	const [menuOpenFor, setMenuOpenFor] = useState(null)
	const [editingOld, setEditingOld] = useState(null)
	const [editingValue, setEditingValue] = useState('')

	const normalizedItems = useMemo(
		() =>
			items
				.filter(Boolean)
				.map(x => String(x))
				.sort((a, b) => a.localeCompare(b, 'ru')),
		[items],
	)

	const load = useCallback(async () => {
		setLoading(true)
		setError('')
		try {
			const res = await apiRequest(apiBase)
			if (!res.ok) {
				const txt = await res.text().catch(() => '')
				throw new Error(txt || `HTTP ${res.status}`)
			}
			const data = await res.json()
			setItems(Array.isArray(data) ? data : [])
		} catch (e) {
			setError(e?.message || 'Не удалось загрузить список')
		} finally {
			setLoading(false)
		}
	}, [apiBase])

	useEffect(() => {
		if (!isOpen) return
		setNewValue('')
		setIsAdding(false)
		setMenuOpenFor(null)
		setEditingOld(null)
		setEditingValue('')
		load()
	}, [isOpen, load])

	useEffect(() => {
		if (!isOpen) return
		const onDocClick = e => {
			if (!e.target.closest('.TaxonomyModal_item-menu') && !e.target.closest('.TaxonomyModal_item-more')) {
				setMenuOpenFor(null)
			}
		}
		document.addEventListener('click', onDocClick)
		return () => document.removeEventListener('click', onDocClick)
	}, [isOpen])

	if (!isOpen) return null

	const createItem = async () => {
		const name = newValue.trim()
		if (!name) return true

		setError('')
		try {
			const res = await apiRequest(`${apiBase}/create`, {
				method: 'POST',
				body: JSON.stringify({ name }),
			})
			if (!res.ok) {
				const txt = await res.text().catch(() => '')
				throw new Error(txt || `HTTP ${res.status}`)
			}
			setNewValue('')
			setIsAdding(false)
			await load()
			return true
		} catch (e) {
			setError(e?.message || 'Не удалось добавить')
			return false
		}
	}

	const handleSave = async () => {
		if (isAdding && newValue.trim()) {
			const ok = await createItem()
			if (!ok) return
		}
		onClose()
	}

	const startEdit = value => {
		setEditingOld(value)
		setEditingValue(value)
		setMenuOpenFor(null)
	}

	const cancelEdit = () => {
		setEditingOld(null)
		setEditingValue('')
	}

	const saveEdit = async () => {
		const oldName = editingOld
		const newName = editingValue.trim()
		if (!oldName || !newName) return

		setError('')
		try {
			const res = await apiRequest(`${apiBase}/update`, {
				method: 'POST',
				body: JSON.stringify({ oldName, newName }),
			})
			if (!res.ok) {
				const txt = await res.text().catch(() => '')
				throw new Error(txt || `HTTP ${res.status}`)
			}
			cancelEdit()
			await load()
		} catch (e) {
			setError(e?.message || 'Не удалось сохранить')
		}
	}

	const deleteItem = async value => {
		setError('')
		try {
			const res = await apiRequest(`${apiBase}/delete`, {
				method: 'POST',
				body: JSON.stringify({ name: value }),
			})
			if (!res.ok) {
				const txt = await res.text().catch(() => '')
				throw new Error(txt || `HTTP ${res.status}`)
			}
			setMenuOpenFor(null)
			if (editingOld === value) cancelEdit()
			await load()
		} catch (e) {
			setError(e?.message || 'Не удалось удалить')
		}
	}

	return (
		<>
			<div className='TaxonomyModal_overlay' onClick={onClose} />
			<div className='TaxonomyModal_panel' onClick={e => e.stopPropagation()}>
				<div className='TaxonomyModal_header'>
					<div className='TaxonomyModal_title'>{title}</div>
					<div className='TaxonomyModal_subtitle'>Чайная коллекция</div>
				</div>

				<div className='TaxonomyModal_body'>
					{error && <div className='TaxonomyModal_error'>{error}</div>}

					{loading ? (
						<div className='TaxonomyModal_loading'>Загрузка...</div>
					) : (
						<div className='TaxonomyModal_list'>
							{normalizedItems.map(value => {
								const isEditing = editingOld === value
								return (
									<div className='TaxonomyModal_item' key={value}>
										{isEditing ? (
											<>
												<input
													className='TaxonomyModal_input'
													value={editingValue}
													onChange={e => setEditingValue(e.target.value)}
													placeholder={entityLabel}
												/>
												<div className='TaxonomyModal_item-actions'>
													<button
														type='button'
														className='TaxonomyModal_icon-btn'
														onClick={saveEdit}
														aria-label='Сохранить'
													>
														<img src={strelkaYesIcon} alt='' />
													</button>
													<button
														type='button'
														className='TaxonomyModal_icon-btn'
														onClick={cancelEdit}
														aria-label='Отменить'
													>
														<img src={krestNoIcon} alt='' />
													</button>
												</div>
											</>
										) : (
											<>
												<div className='TaxonomyModal_item-value'>{value}</div>
												<div className='TaxonomyModal_item-tools'>
													<button
														type='button'
														className='TaxonomyModal_item-more'
														onClick={() =>
															setMenuOpenFor(menuOpenFor === value ? null : value)
														}
														aria-label='Меню'
													>
														...
													</button>
													<span className='TaxonomyModal_sortMark' aria-hidden='true'>↕</span>
												</div>
											</>
										)}

										{menuOpenFor === value && !isEditing && (
											<div className='TaxonomyModal_item-menu'>
												<button
													type='button'
													className='TaxonomyModal_menu-item'
													onClick={() => startEdit(value)}
												>
													Редактировать
												</button>
												<button
													type='button'
													className='TaxonomyModal_menu-item TaxonomyModal_menu-item--danger'
													onClick={() => deleteItem(value)}
												>
													Удалить
												</button>
											</div>
										)}
									</div>
								)
							})}

							{isAdding && (
								<div className='TaxonomyModal_add-row'>
									<input
										className='TaxonomyModal_input'
										value={newValue}
										onChange={e => setNewValue(e.target.value)}
										placeholder={entityLabel}
									/>
									<div className='TaxonomyModal_item-actions'>
										<button
											type='button'
											className='TaxonomyModal_icon-btn'
											onClick={createItem}
											aria-label='Сохранить'
										>
											<img src={strelkaYesIcon} alt='' />
										</button>
										<button
											type='button'
											className='TaxonomyModal_icon-btn'
											onClick={() => {
												setIsAdding(false)
												setNewValue('')
											}}
											aria-label='Отменить'
										>
											<img src={krestNoIcon} alt='' />
										</button>
									</div>
								</div>
							)}

							<button
								type='button'
								className='TaxonomyModal_link'
								onClick={() => setIsAdding(true)}
							>
								Добавить еще
							</button>
						</div>
					)}
				</div>

				<div className='TaxonomyModal_footer'>
					<button type='button' className='TaxonomyModal_btn TaxonomyModal_btn--save' onClick={handleSave}>
						Сохранить изменения
					</button>
					<button type='button' className='TaxonomyModal_btn TaxonomyModal_btn--cancel' onClick={onClose}>
						Отменить изменения
					</button>
				</div>
			</div>
		</>
	)
}

export default TaxonomyModal
