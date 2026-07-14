import React, { useState, useEffect, useRef } from 'react'
import { apiRequest } from '../../utils/api'
import './ArticleModal.css'
import TaxonomyModal from '../TaxonomyModal/TaxonomyModal'

const ArticleModal = ({ isOpen, onClose, article, onSave }) => {
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [category, setCategory] = useState('')
	const [categories, setCategories] = useState([])
	const [author, setAuthor] = useState('')
	const [authors, setAuthors] = useState([])
	const [publicationDate, setPublicationDate] = useState('')
	const [socials, setSocials] = useState([{ id: 1, type: 'Telegram', url: '' }])
	const [sections, setSections] = useState([])
	const [relatedArticles, setRelatedArticles] = useState([])
	const [allArticles, setAllArticles] = useState([])
	const [images, setImages] = useState([])
	const [loadingSections, setLoadingSections] = useState(false)
	const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
	const [authorDropdownOpen, setAuthorDropdownOpen] = useState(false)
	const [socialDropdownOpen, setSocialDropdownOpen] = useState(null)
	const [relatedDropdownOpen, setRelatedDropdownOpen] = useState(false)
	const [activeRelatedSlot, setActiveRelatedSlot] = useState(null)
	const [relatedSearch, setRelatedSearch] = useState('')
	const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false)
	const [isAuthorsModalOpen, setIsAuthorsModalOpen] = useState(false)
	const [isAddMenuOpen, setIsAddMenuOpen] = useState(false)
	const textareaRef = useRef(null)
	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = 'auto'
			textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
		}
	}, [description])
	useEffect(() => {
		const handleClickOutside = e => {
			if (!e.target.closest('.ArticleModal_select-wrapper')) {
				setCategoryDropdownOpen(false)
				setAuthorDropdownOpen(false)
			}
			if (!e.target.closest('.ArticleModal_social-wrapper')) {
				setSocialDropdownOpen(null)
			}
			if (!e.target.closest('.ArticleModal_related-wrapper')) {
				setRelatedDropdownOpen(false)
				setActiveRelatedSlot(null)
			}
			if (!e.target.closest('.ArticleModal_addmenu-wrapper')) {
				setIsAddMenuOpen(false)
			}
		}
		if (isOpen) {
			document.addEventListener('click', handleClickOutside)
			return () => document.removeEventListener('click', handleClickOutside)
		}
	}, [isOpen])
	useEffect(() => {
		if (!isOpen) return

		const loadCategories = async () => {
			try {
				const res = await apiRequest('/api/articleCategories')
				if (res.ok) {
					const data = await res.json()
					setCategories(Array.isArray(data) ? data : [])
				}
			} catch (err) {
				console.error('Ошибка загрузки категорий:', err)
			}
		}

		const loadAuthors = async () => {
			try {
				const res = await apiRequest('/api/articleAuthors')
				if (res.ok) {
					const data = await res.json()
					setAuthors(Array.isArray(data) ? data : [])
				}
			} catch (err) {
				console.error('Ошибка загрузки авторов:', err)
			}
		}

		const loadArticles = async () => {
			try {
				const res = await apiRequest('/api/adminArticles/articles')
				if (res.ok) {
					const data = await res.json()
					setAllArticles(Array.isArray(data) ? data : [])
				}
			} catch (err) {
				console.error('Ошибка загрузки статей:', err)
			}
		}

		loadCategories()
		loadAuthors()
		loadArticles()
	}, [isOpen])
	useEffect(() => {
		if (!isOpen) return

		if (!article) {
			setTitle('')
			setDescription('')
			setCategory('')
			setAuthor('')
			setPublicationDate('')
			setSections([])
			setRelatedArticles([])
			setImages([])
			setSocials([{ id: 1, type: 'Telegram', url: '' }])
			setRelatedSearch('')
			setIsAddMenuOpen(false)
			return
		}
		setTitle(article.title || '')
		setCategory(article.category || '')
		setAuthor(article.author || '')
		setDescription(article.excerpt || '')

		let dateForInput = ''
		if (article.date) {
			const d = new Date(article.date)
			if (!isNaN(d.getTime())) {
				dateForInput = d.toISOString().slice(0, 10)
			}
		}
		setPublicationDate(dateForInput)

		if (article.id) {
			loadSections(article.id)
			loadRelatedArticles(article.id)
		}

		if (article.images) {
			setImages(
				article.images.map(img => ({
					id: img.id,
					url: img.url,
				})),
			)
		}

		if (article.socials) {
			setSocials(article.socials)
		}
	}, [isOpen, article])
	const loadSections = async articleId => {
		if (!articleId) return
		setLoadingSections(true)
		try {
			const res = await apiRequest('/api/articleSections/' + articleId)
			if (res.ok) {
				const data = await res.json()
				setSections(Array.isArray(data) ? data : [])
			} else {
				if (res.status === 404) {
					setSections([])
				} else {
					const errorText = await res.text()
					console.error('Ошибка загрузки разделов:', res.status, errorText)
					setSections([])
				}
			}
		} catch (err) {
			console.error('Ошибка загрузки разделов:', err)
			setSections([])
		} finally {
			setLoadingSections(false)
		}
	}
	const loadRelatedArticles = async articleId => {
		if (!articleId) return
		try {
			const res = await apiRequest('/api/relatedArticles/' + articleId)
			if (res.ok) {
				const data = await res.json()
				setRelatedArticles(Array.isArray(data) ? data : [])
			} else {
				setRelatedArticles([])
			}
		} catch (err) {
			console.error('Ошибка загрузки связанных статей:', err)
			setRelatedArticles([])
		}
	}

	const handleImagesUpload = event => {
		const files = Array.from(event.target.files)
		if (!files.length) return

		const newImages = files.slice(0, 1).map(file => ({
			id: crypto.randomUUID(),
			url: URL.createObjectURL(file),
			file,
		}))

		setImages(newImages)

		event.target.value = ''
	}

	const handleRemoveImage = id => {
		setImages(prev => prev.filter(img => img.id !== id))
	}

	const updateSocial = (id, field, value) => {
		setSocials(prev =>
			prev.map(s => (s.id === id ? { ...s, [field]: value } : s)),
		)
	}

	const addRelatedArticle = async relatedArticleId => {
		if (!article?.id) {
			alert('Сначала сохраните статью')
			return
		}
		if (relatedArticles.length >= 3) {
			alert('Можно выбрать максимум 3 статьи')
			return
		}
		const alreadyAdded = relatedArticles.some(
			ra => Number(ra.relatedArticleId) === Number(relatedArticleId) || Number(ra.id) === Number(relatedArticleId),
		)
		if (alreadyAdded) {
			setRelatedDropdownOpen(false)
			return
		}
		try {
			const res = await apiRequest('/api/relatedArticles/create', {
				method: 'POST',
				body: JSON.stringify({
					articleId: article.id,
					relatedArticleId: relatedArticleId,
				}),
			})
			if (res.ok) {
				await loadRelatedArticles(article.id)
				setRelatedDropdownOpen(false)
				setRelatedSearch('')
			} else {
				throw new Error('Ошибка добавления связанной статьи')
			}
		} catch (err) {
			console.error('Ошибка добавления связанной статьи:', err)
			alert('Не удалось добавить связанную статью')
		}
	}

	const setRelatedArticleForSlot = async (slotIndex, relatedArticleId) => {
		if (!article?.id) {
			alert('Сначала сохраните статью')
			return
		}

		const current = relatedArticles[slotIndex] || null
		const chosenAlready = relatedArticles.find(
			(ra, idx) =>
				idx !== slotIndex &&
				(Number(ra.relatedArticleId) === Number(relatedArticleId) || Number(ra.id) === Number(relatedArticleId)),
		)
		if (chosenAlready) {
			alert('Эта статья уже выбрана в другом поле')
			return
		}

		try {
			if (current?.id) {
				await apiRequest('/api/relatedArticles/delete', {
					method: 'POST',
					body: JSON.stringify({ id: current.id }),
				})
			}
			await apiRequest('/api/relatedArticles/create', {
				method: 'POST',
				body: JSON.stringify({
					articleId: article.id,
					relatedArticleId,
				}),
			})
			await loadRelatedArticles(article.id)
			setRelatedDropdownOpen(false)
			setActiveRelatedSlot(null)
			setRelatedSearch('')
		} catch (err) {
			console.error('Ошибка выбора связанной статьи:', err)
			alert('Не удалось выбрать статью')
		}
	}
	const addSection = () => {
		const newSection = {
			id: `temp_${Date.now()}`,
			title: '',
			content: '',
		}
		setSections(prev => [...prev, newSection])
	}

	const updateSection = (sectionId, field, value) => {
		setSections(prev =>
			prev.map(s => (s.id === sectionId ? { ...s, [field]: value } : s)),
		)
	}

	const removeSection = async sectionId => {
		if (article && article.id && !sectionId.toString().startsWith('temp_')) {
			try {
				const res = await apiRequest('/api/articleSections/delete', {
					method: 'POST',
					body: JSON.stringify({ id: sectionId }),
				})
				if (!res.ok) {
					throw new Error('Ошибка удаления раздела')
				}
			} catch (err) {
				console.error('Ошибка удаления раздела:', err)
				alert('Не удалось удалить раздел')
				return
			}
		}
		setSections(prev => prev.filter(s => s.id !== sectionId))
	}

	const saveSections = async articleId => {
		if (!articleId) {
			console.error('Нет articleId для сохранения разделов')
			return
		}

		try {
			for (let i = 0; i < sections.length; i++) {
				const section = sections[i]
				const sectionData = {
					id: section.id,
					articleId: articleId,
					title: section.title || '',
					content: section.content || '',
				}

				if (section.id.toString().startsWith('temp_')) {
					const res = await apiRequest('/api/articleSections/create', {
						method: 'POST',
						body: JSON.stringify({
							articleId: articleId,
							title: sectionData.title,
							content: sectionData.content,
						}),
					})
					if (!res.ok) {
						const errorText = await res.text()
						throw new Error(
							`Ошибка создания раздела: ${res.status} ${errorText}`,
						)
					}
				} else {
					const res = await apiRequest('/api/articleSections/update', {
						method: 'POST',
						body: JSON.stringify({
							id: section.id,
							title: sectionData.title,
							content: sectionData.content,
						}),
					})
					if (!res.ok) {
						const errorText = await res.text()
						throw new Error(
							`Ошибка обновления раздела: ${res.status} ${errorText}`,
						)
					}
				}
			}
		} catch (err) {
			console.error('Ошибка сохранения разделов:', err)
			alert(`Не удалось сохранить разделы: ${err.message}`)
			throw err
		}
	}

	const formatDisplayDate = iso => {
		if (!iso) return ''
		const [year, month, day] = iso.split('-')

		const months = [
			'января',
			'февраля',
			'марта',
			'апреля',
			'мая',
			'июня',
			'июля',
			'августа',
			'сентября',
			'октября',
			'ноября',
			'декабря',
		]

		return `${parseInt(day)} ${months[parseInt(month) - 1]}, ${year}`
	}

	const handleSaveClick = async () => {
		const toBase64 = file =>
			new Promise((resolve, reject) => {
				const reader = new FileReader()
				reader.onload = () => resolve(reader.result)
				reader.onerror = reject
				reader.readAsDataURL(file)
			})

		const mainImg = images?.[0]
		let imagePayload = undefined
		let imageUrlPayload = undefined
		if (mainImg?.file) {
			const dataUrl = await toBase64(mainImg.file)
			imagePayload = {
				name: mainImg.file.name,
				type: mainImg.file.type,
				dataUrl,
			}
		} else if (
			mainImg?.url &&
			typeof mainImg.url === 'string' &&
			!mainImg.url.startsWith('blob:')
		) {
			imageUrlPayload = mainImg.url
		}

		const payload = {
			id: article?.id,
			title: title.trim(),
			category: category.trim() || null,
			author: author.trim(),
			excerpt: description.trim(),
			date: publicationDate || null,
			...(imagePayload ? { image: imagePayload } : {}),
			...(imageUrlPayload ? { imageUrl: imageUrlPayload } : {}),
		}

		if (!payload.title) {
			alert('Введите заголовок статьи')
			return
		}
		let articleId = article?.id || payload.id
		if (onSave) {
			try {
				const savedId = await onSave(payload)
				if (savedId) {
					articleId = savedId
				}
			} catch (e) {
				console.error('Ошибка сохранения статьи:', e)
				return
			}
		}
		if (articleId) {
			await saveSections(articleId)
		}

		onClose()
	}

	const socialTypes = ['Telegram', 'MAX', 'ВКонтакте']

	if (!isOpen) return null

	const filteredAllArticles = allArticles
		.filter(a => {
			if (article?.id && Number(a.id) === Number(article.id)) return false
			const slotItem = activeRelatedSlot !== null ? relatedArticles[activeRelatedSlot] : null
			const alreadyAdded = relatedArticles.some(
				(ra, idx) =>
					idx !== activeRelatedSlot &&
					(ra.relatedArticleId === a.id || ra.id === a.id) &&
					(!slotItem || ra.id !== slotItem.id),
			)
			if (alreadyAdded) return false
			if (!relatedSearch.trim()) return true
			return (a.title || '')
				.toLowerCase()
				.includes(relatedSearch.trim().toLowerCase())
		})

	return (
		<>
			<div className='ArticleModal_overlay' onClick={onClose}></div>
			<aside className='ArticleModal_panel' onClick={e => e.stopPropagation()}>
				<div className='ArticleModal_header'>
					<h2>{article ? 'РЕДАКТИРОВАНИЕ СТАТЬИ' : 'ДОБАВИТЬ СТАТЬЮ'}</h2>
				</div>

				<div className='ArticleModal_body'>
					<div className='ArticleModal_grid'>
						
						<div className='ArticleModal_col'>
							
							<div className='ArticleModal_group'>
								<label className='ArticleModal_label'>Название статьи</label>
								<input
									type='text'
									className='ArticleModal_input'
									placeholder='Название статьи'
									value={title}
									onChange={e => setTitle(e.target.value)}
								/>
							</div>

							
							<div className='ArticleModal_group'>
								<label className='ArticleModal_label'>Краткое описание</label>
								<textarea
									ref={textareaRef}
									className='ArticleModal_textarea ArticleModal_textarea--small'
									placeholder='Описание'
									value={description}
									onChange={e => setDescription(e.target.value)}
								/>
							</div>

							
							<div className='ArticleModal_group'>
								<label className='ArticleModal_label'>Категория</label>
								<div className='ArticleModal_select-wrapper'>
									<div
										className='ArticleModal_select'
										onClick={() =>
											setCategoryDropdownOpen(!categoryDropdownOpen)
										}
									>
										<span>{category || 'Выберите категорию'}</span>
										<svg
											className={`ArticleModal_arrow ${categoryDropdownOpen ? 'open' : ''}`}
											viewBox='0 0 24 24'
											fill='none'
										>
											<path
												d='M6 9L12 15L18 9'
												stroke='currentColor'
												strokeWidth='2'
												strokeLinecap='round'
												strokeLinejoin='round'
											/>
										</svg>
									</div>
									{categoryDropdownOpen && (
										<div className='ArticleModal_dropdown'>
											<div
												className='ArticleModal_dropdown-item'
												onClick={() => {
													setCategory('')
													setCategoryDropdownOpen(false)
												}}
											>
												Выберите категорию
											</div>
											{categories.map(cat => (
												<div
													key={cat}
													className='ArticleModal_dropdown-item'
													onClick={() => {
														setCategory(cat)
														setCategoryDropdownOpen(false)
													}}
												>
													{cat}
												</div>
											))}
											<div className='ArticleModal_dropdown-sep' />
											<div className='ArticleModal_addmenu-wrapper'>
												
												{isAddMenuOpen && (
													<div className='ArticleModal_addmenu'>
														<button
															type='button'
															className='ArticleModal_addmenu-item'
															onClick={() => {
																setIsAddMenuOpen(false)
																setCategoryDropdownOpen(false)
																setIsAuthorsModalOpen(true)
															}}
														>
															Добавить автора
														</button>
														<button
															type='button'
															className='ArticleModal_addmenu-item'
															onClick={() => {
																setIsAddMenuOpen(false)
																setCategoryDropdownOpen(false)
																setIsCategoriesModalOpen(true)
															}}
														>
															Добавить категорию
														</button>
													</div>
												)}
											</div>
										</div>
									)}
								</div>
							</div>

							
							<div className='ArticleModal_group'>
								<label className='ArticleModal_label'>Дата публикации</label>
								<div
									className='ArticleModal_date'
									onClick={e =>
										e.currentTarget
											.querySelector('input[type="date"]')
											.showPicker()
									}
								>
									<span>{formatDisplayDate(publicationDate)}</span>
									<svg
										className='ArticleModal_calendar-icon'
										viewBox='0 0 24 24'
										fill='none'
									>
										<rect
											x='3'
											y='4'
											width='18'
											height='18'
											rx='2'
											stroke='currentColor'
											strokeWidth='2'
										/>
										<path
											d='M16 2V6M8 2V6M3 10H21'
											stroke='currentColor'
											strokeWidth='2'
											strokeLinecap='round'
										/>
									</svg>
									<input
										type='date'
										className='ArticleModal_date-input'
										value={publicationDate}
										onChange={e => setPublicationDate(e.target.value)}
									/>
								</div>
							</div>

							
							<div className='ArticleModal_group'>
								<label className='ArticleModal_label'>Имя автора</label>
								<div className='ArticleModal_select-wrapper'>
									<div
										className='ArticleModal_select'
										onClick={() => setAuthorDropdownOpen(!authorDropdownOpen)}
									>
										<span>{author || 'Выберите автора'}</span>
										<svg
											className={`ArticleModal_arrow ${authorDropdownOpen ? 'open' : ''}`}
											viewBox='0 0 24 24'
											fill='none'
										>
											<path
												d='M6 9L12 15L18 9'
												stroke='currentColor'
												strokeWidth='2'
												strokeLinecap='round'
												strokeLinejoin='round'
											/>
										</svg>
									</div>
									{authorDropdownOpen && (
										<div className='ArticleModal_dropdown'>
											<div
												className='ArticleModal_dropdown-item'
												onClick={() => {
													setAuthor('')
													setAuthorDropdownOpen(false)
												}}
											>
												Выберите автора
											</div>
											{authors.map(a => (
												<div
													key={a}
													className='ArticleModal_dropdown-item'
													onClick={() => {
														setAuthor(a)
														setAuthorDropdownOpen(false)
													}}
												>
													{a}
												</div>
											))}
											<div className='ArticleModal_dropdown-sep' />
											<div className='ArticleModal_addmenu-wrapper'>
												
												{isAddMenuOpen && (
													<div className='ArticleModal_addmenu'>
														<button
															type='button'
															className='ArticleModal_addmenu-item'
															onClick={() => {
																setIsAddMenuOpen(false)
																setAuthorDropdownOpen(false)
																setIsAuthorsModalOpen(true)
															}}
														>
															Добавить автора
														</button>
														<button
															type='button'
															className='ArticleModal_addmenu-item'
															onClick={() => {
																setIsAddMenuOpen(false)
																setAuthorDropdownOpen(false)
																setIsCategoriesModalOpen(true)
															}}
														>
															Добавить категорию
														</button>
													</div>
												)}
											</div>
										</div>
									)}
								</div>
							</div>

							
							<div className='ArticleModal_group'>
								<label className='ArticleModal_label'>Социальные сети</label>
								{socials.map(social => (
									<div key={social.id} className='ArticleModal_social-wrapper'>
										<div
											className='ArticleModal_select'
											onClick={() =>
												setSocialDropdownOpen(
													socialDropdownOpen === social.id ? null : social.id,
												)
											}
										>
											<span>{social.type || 'Выберите соц. сеть'}</span>
											<svg
												className={`ArticleModal_arrow ${socialDropdownOpen === social.id ? 'open' : ''}`}
												viewBox='0 0 24 24'
												fill='none'
											>
												<path
													d='M6 9L12 15L18 9'
													stroke='currentColor'
													strokeWidth='2'
													strokeLinecap='round'
													strokeLinejoin='round'
												/>
											</svg>
										</div>
										{socialDropdownOpen === social.id && (
											<div className='ArticleModal_dropdown'>
												{socialTypes.map(type => (
													<div
														key={type}
														className='ArticleModal_dropdown-item'
														onClick={() => {
															updateSocial(social.id, 'type', type)
															setSocialDropdownOpen(null)
														}}
													>
														{type}
													</div>
												))}
											</div>
										)}
									</div>
								))}
							</div>
						</div>

						
						<div className='ArticleModal_col ArticleModal_col--right'>
							
							<div className='ArticleModal_group ArticleModal_group--photo'>
								<label className='ArticleModal_label'>Титульное фото</label>
								<div
									className={`ArticleModal_upload-area ${images[0] ? 'ArticleModal_upload-area--has-image' : ''}`}
									style={images[0] ? { backgroundImage: `url(${images[0].url})` } : undefined}
								>
									<input
										type='file'
										accept='image/*'
										onChange={handleImagesUpload}
										className='ArticleModal_file-input'
									/>
									{!images[0] && (
										<div className='ArticleModal_upload-content'>
											<svg
												className='ArticleModal_upload-icon'
												viewBox='0 0 24 24'
												fill='none'
											>
												<path
													d='M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15'
													stroke='currentColor'
													strokeWidth='2'
													strokeLinecap='round'
													strokeLinejoin='round'
												/>
											</svg>
											<span className='ArticleModal_upload-text'>
												Перетащите фото или загрузите
											</span>
										</div>
									)}
									{images[0] && (
										<button
											type='button'
											className='ArticleModal_cover-remove'
											onClick={e => {
												e.preventDefault()
												e.stopPropagation()
												handleRemoveImage(images[0].id)
											}}
										>
											×
										</button>
									)}
								</div>
							</div>
						</div>
					</div>

					
					<div className='ArticleModal_group ArticleModal_group--recommended'>
						<label className='ArticleModal_label'>Рекомендуемые статьи</label>
						<div className='ArticleModal_recommended-grid'>
							<div className='ArticleModal_recommended-col'>
								<div className='ArticleModal_related-wrapper'>
									<div
										className='ArticleModal_select ArticleModal_select--search'
										onClick={() => {
											setActiveRelatedSlot(0)
											setRelatedDropdownOpen(activeRelatedSlot === 0 ? !relatedDropdownOpen : true)
										}}
									>
										<span>{relatedArticles[0]?.title || 'Статья'}</span>
										<svg
											className={`ArticleModal_arrow ${relatedDropdownOpen && activeRelatedSlot === 0 ? 'open' : ''}`}
											viewBox='0 0 24 24'
											fill='none'
										>
											<path
												d='M6 9L12 15L18 9'
												stroke='currentColor'
												strokeWidth='2'
												strokeLinecap='round'
												strokeLinejoin='round'
											/>
										</svg>
									</div>
									{relatedDropdownOpen && activeRelatedSlot === 0 && (
										<div className='ArticleModal_dropdown ArticleModal_dropdown--articles'>
											<div className='ArticleModal_search-input-wrapper'>
												<input
													type='text'
													className='ArticleModal_search-input'
													placeholder='Поиск'
													value={relatedSearch}
													onChange={e => setRelatedSearch(e.target.value)}
												/>
												<svg
													className='ArticleModal_search-icon-small'
													viewBox='0 0 24 24'
													fill='none'
												>
													<circle
														cx='11'
														cy='11'
														r='8'
														stroke='currentColor'
														strokeWidth='2'
													/>
													<path
														d='M21 21L16.65 16.65'
														stroke='currentColor'
														strokeWidth='2'
														strokeLinecap='round'
													/>
												</svg>
											</div>
											{filteredAllArticles.map(a => (
												<div
													key={a.id}
													className='ArticleModal_dropdown-item'
													onClick={() => setRelatedArticleForSlot(0, a.id)}
												>
													{a.title}
												</div>
											))}
										</div>
									)}
								</div>
							</div>
							<div className='ArticleModal_recommended-col'>
								<div className='ArticleModal_related-wrapper'>
									<div
										className='ArticleModal_select ArticleModal_select--search'
										onClick={() => {
											setActiveRelatedSlot(1)
											setRelatedDropdownOpen(activeRelatedSlot === 1 ? !relatedDropdownOpen : true)
										}}
									>
										<span>{relatedArticles[1]?.title || 'Статья'}</span>
										<svg
											className={`ArticleModal_arrow ${relatedDropdownOpen && activeRelatedSlot === 1 ? 'open' : ''}`}
											viewBox='0 0 24 24'
											fill='none'
										>
											<path
												d='M6 9L12 15L18 9'
												stroke='currentColor'
												strokeWidth='2'
												strokeLinecap='round'
												strokeLinejoin='round'
											/>
										</svg>
									</div>
									{relatedDropdownOpen && activeRelatedSlot === 1 && (
										<div className='ArticleModal_dropdown ArticleModal_dropdown--articles'>
											<div className='ArticleModal_search-input-wrapper'>
												<input
													type='text'
													className='ArticleModal_search-input'
													placeholder='Поиск'
													value={relatedSearch}
													onChange={e => setRelatedSearch(e.target.value)}
												/>
											</div>
											{filteredAllArticles.map(a => (
												<div
													key={a.id}
													className='ArticleModal_dropdown-item'
													onClick={() => setRelatedArticleForSlot(1, a.id)}
												>
													{a.title}
												</div>
											))}
										</div>
									)}
								</div>
								<div className='ArticleModal_related-wrapper' style={{ marginTop: '0.8vw' }}>
									<div
										className='ArticleModal_select ArticleModal_select--search'
										onClick={() => {
											setActiveRelatedSlot(2)
											setRelatedDropdownOpen(activeRelatedSlot === 2 ? !relatedDropdownOpen : true)
										}}
									>
										<span>{relatedArticles[2]?.title || 'Статья'}</span>
										<svg
											className={`ArticleModal_arrow ${relatedDropdownOpen && activeRelatedSlot === 2 ? 'open' : ''}`}
											viewBox='0 0 24 24'
											fill='none'
										>
											<path
												d='M6 9L12 15L18 9'
												stroke='currentColor'
												strokeWidth='2'
												strokeLinecap='round'
												strokeLinejoin='round'
											/>
										</svg>
									</div>
									{relatedDropdownOpen && activeRelatedSlot === 2 && (
										<div className='ArticleModal_dropdown ArticleModal_dropdown--articles'>
											<div className='ArticleModal_search-input-wrapper'>
												<input
													type='text'
													className='ArticleModal_search-input'
													placeholder='Поиск'
													value={relatedSearch}
													onChange={e => setRelatedSearch(e.target.value)}
												/>
											</div>
											{filteredAllArticles.map(a => (
												<div
													key={a.id}
													className='ArticleModal_dropdown-item'
													onClick={() => setRelatedArticleForSlot(2, a.id)}
												>
													{a.title}
												</div>
											))}
										</div>
									)}
								</div>
							</div>
						</div>
					</div>

					
					<div className='ArticleModal_group ArticleModal_group--sections'>
						{loadingSections && (
							<p className='ArticleModal_loading'>Загрузка разделов...</p>
						)}

						{!loadingSections &&
							sections.map((section, index) => (
								<div className='ArticleModal_section-block' key={section.id}>
									<div className='ArticleModal_section-title'>
										Раздел №{index + 1}
									</div>

									<input
										type='text'
										className='ArticleModal_input'
										placeholder='Заголовок'
										value={section.title || ''}
										onChange={e => updateSection(section.id, 'title', e.target.value)}
									/>

									<textarea
										className='ArticleModal_textarea ArticleModal_textarea--section'
										placeholder='Описание'
										value={section.content || ''}
										onChange={e =>
											updateSection(section.id, 'content', e.target.value)
										}
										rows={4}
									/>

									<div className='ArticleModal_actions-row'>
										<button
											type='button'
											className='ArticleModal_link-btn'
											onClick={addSection}
										>
											Добавить еще
										</button>
										<button
											type='button'
											className='ArticleModal_link-btn ArticleModal_link-btn--delete'
											onClick={() => removeSection(section.id)}
										>
											Удалить <span aria-hidden='true'>🗑</span>
										</button>
									</div>
								</div>
							))}

						{!loadingSections && sections.length === 0 && (
							<div className='ArticleModal_section-block'>
								<div className='ArticleModal_section-title'>Раздел №1</div>
								<input
									type='text'
									className='ArticleModal_input'
									placeholder='Заголовок'
									value=''
									readOnly
								/>
								<textarea
									className='ArticleModal_textarea ArticleModal_textarea--section'
									placeholder='Описание'
									value=''
									readOnly
									rows={4}
								/>
								<div className='ArticleModal_actions-row'>
									<button
										type='button'
										className='ArticleModal_link-btn'
										onClick={addSection}
									>
										Добавить еще
									</button>
									<button
										type='button'
										className='ArticleModal_link-btn ArticleModal_link-btn--delete'
										disabled
									>
										Удалить <span aria-hidden='true'>🗑</span>
									</button>
								</div>
							</div>
						)}
					</div>
				</div>

				
				<div className='ArticleModal_footer'>
					<button
						className='ArticleModal_btn ArticleModal_btn--save'
						onClick={handleSaveClick}
					>
						Сохранить изменения
					</button>
					<button
						className='ArticleModal_btn ArticleModal_btn--cancel'
						onClick={onClose}
					>
						Отменить изменения
					</button>
				</div>
			</aside>

			<TaxonomyModal
				isOpen={isAuthorsModalOpen}
				onClose={async () => {
					setIsAuthorsModalOpen(false)
					try {
						const res = await apiRequest('/api/articleAuthors')
						if (res.ok) {
							const data = await res.json()
							setAuthors(Array.isArray(data) ? data : [])
						}
					} catch {
					}
				}}
				title='ДОБАВИТЬ АВТОРА'
				entityLabel='Автор'
				apiBase='/api/articleAuthors'
			/>

			<TaxonomyModal
				isOpen={isCategoriesModalOpen}
				onClose={async () => {
					setIsCategoriesModalOpen(false)
					try {
						const res = await apiRequest('/api/articleCategories')
						if (res.ok) {
							const data = await res.json()
							setCategories(Array.isArray(data) ? data : [])
						}
					} catch {
					}
				}}
				title='ДОБАВИТЬ КАТЕГОРИИ'
				entityLabel='Категория'
				apiBase='/api/articleCategories'
			/>
		</>
	)
}

export default ArticleModal
