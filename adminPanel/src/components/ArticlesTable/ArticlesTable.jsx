import React, { useMemo, useState, useEffect } from 'react'
import PointerIcon from '../../assets/icons/pointer.svg'
import CalendarIcon from '../../assets/icons/calendar.svg'
import EyeIcon from '../../assets/icons/eye.svg'
import StatusIconActive from '../../assets/icons/status_active.png'
import StatusIconNo from '../../assets/icons/status_no.png'
import './ArticlesTable.css'
import TaxonomyModal from '../TaxonomyModal/TaxonomyModal'

const ArticlesTable = ({
	articles = [],
	allArticles = [],
	searchValue = '',
	loading = false,
	error = null,
	onEditArticle,
	onTogglePublished,
	onDeleteArticle,
	onCreateArticle,
}) => {
	const [selectedArticles, setSelectedArticles] = useState([])
	const [openMenuId, setOpenMenuId] = useState(null)
	const [isAddMenuOpen, setIsAddMenuOpen] = useState(false)
	const [isAuthorsModalOpen, setIsAuthorsModalOpen] = useState(false)
	const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false)
	const [isMobile, setIsMobile] = useState(false)

	const normalizedSearch = searchValue.trim().toLowerCase()
	const filteredArticles = useMemo(() => {
		if (!normalizedSearch) return articles
		return articles.filter(a => {
			const title = (a.title || '').toLowerCase()
			const category = (a.category || '').toLowerCase()
			return (
				title.includes(normalizedSearch) ||
				category.includes(normalizedSearch) ||
				String(a.id).includes(normalizedSearch)
			)
		})
	}, [articles, normalizedSearch])

	const handleSelectAll = e => {
		if (e.target.checked) {
			setSelectedArticles(filteredArticles.map(a => a.id))
		} else {
			setSelectedArticles([])
		}
	}

	const handleSelectArticle = id => {
		if (selectedArticles.includes(id)) {
			setSelectedArticles(selectedArticles.filter(aid => aid !== id))
		} else {
			setSelectedArticles([...selectedArticles, id])
		}
	}

	const handlePointerClick = (article, e) => {
		e.stopPropagation()
		setOpenMenuId(prev => (prev === article.id ? null : article.id))
		setIsAddMenuOpen(false)
	}

	const handleToggleStatus = article => {
		if (onTogglePublished) {
			onTogglePublished(article)
		}
		setOpenMenuId(null)
	}

	const handleAddMenuToggle = e => {
		e.stopPropagation()
		setIsAddMenuOpen(prev => !prev)
		setOpenMenuId(null)
	}

	const handleAddMenuItemClick = type => {
		setIsAddMenuOpen(false)
		if (onCreateArticle) {
			onCreateArticle(type)
		}
	}

	useEffect(() => {
		const onDocClick = () => {
			setOpenMenuId(null)
			setIsAddMenuOpen(false)
		}
		if (openMenuId !== null || isAddMenuOpen) {
			document.addEventListener('click', onDocClick)
			return () => document.removeEventListener('click', onDocClick)
		}
	}, [openMenuId, isAddMenuOpen])

	useEffect(() => {
		const mq = window.matchMedia('(max-width: 767px)')
		const apply = () => setIsMobile(Boolean(mq.matches))
		apply()
		if (mq.addEventListener) mq.addEventListener('change', apply)
		else mq.addListener(apply)
		return () => {
			if (mq.removeEventListener) mq.removeEventListener('change', apply)
			else mq.removeListener(apply)
		}
	}, [])
	const getStatusIcon = isPublished => {
		return isPublished ? StatusIconActive : StatusIconNo
	}

	return (
		<div className='ArticlesTable'>
			<div className='ArticlesTable_wrapper'>
				{isMobile ? (
					<div className='ArticlesTable_mobileList'>
						{loading ? (
							<div className='ArticlesTable_mobileEmpty'>Загрузка статей...</div>
						) : error ? (
							<div className='ArticlesTable_mobileEmpty ArticlesTable_mobileEmpty--error'>
								{error}
							</div>
						) : filteredArticles.length === 0 ? (
							<div className='ArticlesTable_mobileEmpty'>Статьи не найдены</div>
						) : (
							filteredArticles.map(article => (
								<div key={article.id} className='ArticlesTable_mobileRow'>
									<div className='ArticlesTable_mobileCol ArticlesTable_mobileCol--labels'>
										<div className='ArticlesTable_mobileTitle'>
											{article.title || '-'}
										</div>
										<div className='ArticlesTable_mobileLabel'>
											{article.category || 'Без категории'}
										</div>
										<button
											className='ArticlesTable_pointer ArticlesTable_pointer--mobile'
											type='button'
											onClick={e => handlePointerClick(article, e)}
											aria-label='Действия'
										>
											...
										</button>
										{openMenuId === article.id && (
											<div
												className='ArticlesTable_menu ArticlesTable_menu--mobile'
												role='menu'
												onClick={e => e.stopPropagation()}
											>
												<button
													type='button'
													className='ArticlesTable_menu_item'
													onClick={() => {
														setOpenMenuId(null)
														onEditArticle?.(article)
													}}
												>
													Редактировать
												</button>
												<button
													type='button'
													className='ArticlesTable_menu_item'
													onClick={() => handleToggleStatus(article)}
												>
													{article.published
														? 'Снять с публикации'
														: 'Опубликовать'}
												</button>
												<button
													type='button'
													className='ArticlesTable_menu_item ArticlesTable_menu_item--danger'
													onClick={() => {
														setOpenMenuId(null)
														onDeleteArticle?.(article)
													}}
												>
													Удалить
												</button>
											</div>
										)}
									</div>

									<div className='ArticlesTable_mobileCol ArticlesTable_mobileCol--icons'>
										<img src={EyeIcon} alt='' className='ArticlesTable_mobileIcon' />
										<img src={CalendarIcon} alt='' className='ArticlesTable_mobileIcon ArticlesTable_mobileIcon--date' />
										<img
											src={getStatusIcon(article.published)}
											alt=''
											className='ArticlesTable_mobileIcon ArticlesTable_mobileIcon--status'
										/>
									</div>

									<div className='ArticlesTable_mobileCol ArticlesTable_mobileCol--values'>
										<div className='ArticlesTable_mobileValue'>
											{article.views || 0}
										</div>
										<div className='ArticlesTable_mobileValue'>
											{article.date || ''}
										</div>
										<div className='ArticlesTable_mobileValue'>
											{article.published ? 'Активный' : 'Не активный'}
										</div>
									</div>
								</div>
							))
						)}
					</div>
				) : (
					<table className='ArticlesTable_table'>
						<thead>
							<tr>
								<th className='ArticlesTable_th ArticlesTable_th--title'>
									<div className='ArticlesTable_th_content'>
										<span>НАЗВАНИЕ ПУБЛИКАЦИИ</span>
									</div>
								</th>
								<th className='ArticlesTable_th ArticlesTable_th--category'>
									<div className='ArticlesTable_th_content'>
										<span>КАТЕГОРИЯ</span>
									</div>
								</th>
								<th className='ArticlesTable_th ArticlesTable_th--date'>
									<div className='ArticlesTable_th_content'>
										<span>ДАТА</span>
									</div>
								</th>
								<th className='ArticlesTable_th ArticlesTable_th--watches'>
									<div className='ArticlesTable_th_content'>
										<span>ПРОСМОТРЫ</span>
									</div>
								</th>
								<th className='ArticlesTable_th ArticlesTable_th--status'>
									<div className='ArticlesTable_th_content'>
										<span>СТАТУС</span>
									</div>
								</th>
							</tr>
						</thead>
						<tbody>
							{loading && (
								<tr>
									<td
										colSpan='5'
										style={{
											padding: '2vw',
											textAlign: 'center',
											color: 'rgba(255,255,255,0.6)',
										}}
									>
										Загрузка статей...
									</td>
								</tr>
							)}
							{!loading && error && (
								<tr>
									<td
										colSpan='5'
										style={{
											padding: '2vw',
											textAlign: 'center',
											color: 'rgba(255,80,80,0.9)',
										}}
									>
										{error}
									</td>
								</tr>
							)}
							{!loading && !error && filteredArticles.length === 0 && (
								<tr>
									<td
										colSpan='5'
										style={{
											padding: '2vw',
											textAlign: 'center',
											color: 'rgba(255,255,255,0.4)',
										}}
									>
										Статьи не найдены
									</td>
								</tr>
							)}
							{!loading &&
								!error &&
								filteredArticles.map(article => (
									<tr key={article.id} className='ArticlesTable_row'>
										<td>
											<div className='ArticlesTable_title_cell'>
												<span>{article.title}</span>
												<div
													className='ArticlesTable_actions'
													onClick={e => e.stopPropagation()}
												>
													<button
														className='ArticlesTable_pointer'
														type='button'
														onClick={e => handlePointerClick(article, e)}
														aria-label='Действия'
													>
														<img src={PointerIcon} alt='' />
													</button>
													{openMenuId === article.id && (
														<div className='ArticlesTable_menu' role='menu'>
															<button
																type='button'
																className='ArticlesTable_menu_item'
																onClick={() => {
																	setOpenMenuId(null)
																	onEditArticle?.(article)
																}}
															>
																Редактировать
															</button>
															<button
																type='button'
																className='ArticlesTable_menu_item'
																onClick={() => handleToggleStatus(article)}
															>
																{article.published
																	? 'Снять с публикации'
																	: 'Опубликовать'}
															</button>
															<button
																type='button'
																className='ArticlesTable_menu_item ArticlesTable_menu_item--danger'
																onClick={() => {
																	setOpenMenuId(null)
																	onDeleteArticle?.(article)
																}}
															>
																Удалить
															</button>
														</div>
													)}
												</div>
											</div>
										</td>
										<td>{article.category || 'Без категории'}</td>
										<td>
											<div className='ArticlesTable_cell_with_icon'>
												<img
													src={CalendarIcon}
													alt=''
													className='ArticlesTable_cell_icon'
												/>
												<span>{article.date || ''}</span>
											</div>
										</td>
										<td>
											<div className='ArticlesTable_cell_with_icon'>
												<img
													src={EyeIcon}
													alt=''
													className='ArticlesTable_cell_icon'
												/>
												<span>{article.views || 0}</span>
											</div>
										</td>
										<td>
											<div className='ArticlesTable_cell_with_icon'>
												<img
													src={getStatusIcon(article.published)}
													alt=''
													className='ArticlesTable_cell_icon ArticlesTable_status_icon'
												/>
												<label className='ArticlesTable_toggle'>
													<span className='ArticlesTable_toggle_text'>
														{article.published ? 'Активный' : 'Не активный'}
													</span>
												</label>
											</div>
										</td>
									</tr>
								))}
						</tbody>
					</table>
				)}
			</div>

			
			<div className='ArticlesTable_addButton_wrapper'>
				<button
					className='ArticlesTable_addButton'
					onClick={handleAddMenuToggle}
					aria-label='Добавить'
				>
					<svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
						<path
							d='M12 5V19M5 12H19'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
						/>
					</svg>
				</button>

				{isAddMenuOpen && (
					<div className='ArticlesTable_addMenu' role='menu'>
						<button
							type='button'
							className='ArticlesTable_addMenu_item'
							onClick={() => handleAddMenuItemClick('product')}
						>
							Публикацию
						</button>
						<button
							type='button'
							className='ArticlesTable_addMenu_item'
							onClick={() => {
								setIsAddMenuOpen(false)
								setIsAuthorsModalOpen(true)
							}}
						>
							Автора
						</button>
						<button
							type='button'
							className='ArticlesTable_addMenu_item'
							onClick={() => {
								setIsAddMenuOpen(false)
								setIsCategoriesModalOpen(true)
							}}
						>
							Категорию
						</button>
					</div>
				)}
			</div>

			<TaxonomyModal
				isOpen={isAuthorsModalOpen}
				onClose={() => setIsAuthorsModalOpen(false)}
				title='ДОБАВИТЬ АВТОРА'
				entityLabel='Автор'
				apiBase='/api/articleAuthors'
			/>

			<TaxonomyModal
				isOpen={isCategoriesModalOpen}
				onClose={() => setIsCategoriesModalOpen(false)}
				title='ДОБАВИТЬ КАТЕГОРИИ'
				entityLabel='Категория'
				apiBase='/api/articleCategories'
			/>
		</div>
	)
}

export default ArticlesTable
