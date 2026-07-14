import React, { useState, useEffect } from 'react'
import { apiRequest } from '../../utils/api'
import ArticleTabs from '../../components/ArticleTabs/ArticleTabs'
import ArticlesTable from '../../components/ArticlesTable/ArticlesTable'
import ArticleModal from '../../components/ArticleModal/ArticleModal'

import Export from '../../assets/icons/export.png'
import Filter from '../../assets/icons/filter.png'
import GalochkaIcon from '../../assets/icons/BlackGalochka.png'

import './ArticlesPage.css'

const ArticlesPage = () => {
	const [searchValue, setSearchValue] = useState('')
	const [isSearchFocused, setIsSearchFocused] = useState(false)
	const [isExportOpen, setIsExportOpen] = useState(false)
	const [isFiltersOpen, setIsFiltersOpen] = useState(false)
	const [isAddModalOpen, setIsAddModalOpen] = useState(false)
	const [articles, setArticles] = useState([])
	const [loading, setLoading] = useState(false)
	const [loadError, setLoadError] = useState(null)
	const [tabs, setTabs] = useState([])
	const [activeTab, setActiveTab] = useState('all')
	const [editingArticle, setEditingArticle] = useState(null)
	const formatDate = dateString => {
		if (!dateString) return ''
		const d = new Date(dateString)
		if (!isNaN(d.getTime())) {
			const day = String(d.getDate()).padStart(2, '0')
			const month = String(d.getMonth() + 1).padStart(2, '0')
			const year = String(d.getFullYear()).slice(-2)
			return `${day}.${month}.${year}`
		}
		return dateString
	}
	useEffect(() => {
		let cancelled = false

		const fetchArticles = async () => {
			setLoading(true)
			setLoadError(null)
			try {
				const res = await apiRequest('/api/adminArticles')
				if (!res.ok) {
					throw new Error(`Ошибка загрузки статей: ${res.status}`)
				}
				const data = await res.json()
				const apiArticles = Array.isArray(data) ? data : []
				const formattedArticles = apiArticles.map(a => {
					let displayDate = ''
					if (a.date) {
						const d = new Date(a.date)
						if (!isNaN(d.getTime())) {
							const day = String(d.getDate()).padStart(2, '0')
							const month = String(d.getMonth() + 1).padStart(2, '0')
							const year = String(d.getFullYear()).slice(-2)
							displayDate = `${day}.${month}.${year}`
						} else {
							displayDate = a.date
						}
					}
					return {
						...a,
						date: displayDate,
						rawDate: a.date ? new Date(a.date).getTime() : null,
					}
				})

				if (!cancelled) {
					setArticles(formattedArticles)
				}
			} catch (err) {
				console.error(err)
				if (!cancelled) {
					setLoadError(err.message || 'Ошибка загрузки статей')
				}
			} finally {
				if (!cancelled) setLoading(false)
			}
		}

		fetchArticles()

		return () => {
			cancelled = true
		}
	}, [])
	useEffect(() => {
		const total = articles.length
		const byCategory = articles.reduce((acc, a) => {
			const key = a.category || 'Без категории'
			acc[key] = (acc[key] || 0) + 1
			return acc
		}, {})

		const newTabs = [
			{ id: 'all', label: 'Все', count: total },
			...Object.entries(byCategory).map(([cat, count]) => ({
				id: cat,
				label: cat,
				count,
			})),
		]
		setTabs(newTabs)
	}, [articles])

	const handleSearchChange = e => {
		setSearchValue(e.target.value)
	}

	const handleSearchFocus = () => {
		setIsSearchFocused(true)
	}

	const handleSearchBlur = () => {
		setTimeout(() => setIsSearchFocused(false), 200)
	}

	const handleTabChange = tabId => {
		setActiveTab(tabId)
	}

	const handleCreateArticle = type => {
		console.log('Создать:', type)
		setEditingArticle(null)
		setIsAddModalOpen(true)
	}

	const handleEditArticle = article => {
		setEditingArticle(article)
		setIsAddModalOpen(true)
	}
	const handleTogglePublished = async article => {
		setArticles(prevArticles =>
			prevArticles.map(a =>
				a.id === article.id ? { ...a, published: !a.published } : a,
			),
		)

		try {
			const res = await apiRequest('/api/adminArticles/toggle', {
				method: 'POST',
				body: JSON.stringify({ id: article.id, published: !article.published }),
			})

			if (!res.ok) {
				throw new Error('Ошибка изменения статуса публикации')
			}
		} catch (e) {
			console.error(e)
			setArticles(prevArticles =>
				prevArticles.map(a =>
					a.id === article.id ? { ...a, published: article.published } : a,
				),
			)
			alert(e.message || 'Не удалось изменить статус статьи')
		}
	}
	const handleDeleteArticle = async article => {
		if (!article?.id) return
		const ok = window.confirm(
			`Удалить статью "${article.title || article.id}"?`,
		)
		if (!ok) return
		const deletedArticleId = article.id
		setArticles(prevArticles =>
			prevArticles.filter(a => a.id !== deletedArticleId),
		)

		try {
			const res = await apiRequest('/api/adminArticles/delete', {
				method: 'POST',
				body: JSON.stringify({ id: article.id }),
			})
			if (!res.ok) {
				throw new Error('Ошибка удаления статьи')
			}
		} catch (e) {
			console.error(e)
			alert(e.message || 'Не удалось удалить статью')
			const refreshRes = await apiRequest('/api/adminArticles')
			if (refreshRes.ok) {
				const refreshData = await refreshRes.json()
				const formattedArticles = refreshData.map(a => {
					let displayDate = ''
					if (a.date) {
						const d = new Date(a.date)
						if (!isNaN(d.getTime())) {
							const day = String(d.getDate()).padStart(2, '0')
							const month = String(d.getMonth() + 1).padStart(2, '0')
							const year = String(d.getFullYear()).slice(-2)
							displayDate = `${day}.${month}.${year}`
						} else {
							displayDate = a.date
						}
					}
					return { ...a, date: displayDate }
				})
				setArticles(formattedArticles)
			}
		}
	}
	const handleSaveArticle = async payload => {
		try {
			let articleId = payload.id

			if (payload.id) {
				const res = await apiRequest('/api/adminArticles/update', {
					method: 'POST',
					body: JSON.stringify(payload),
				})
				if (!res.ok) {
					throw new Error('Ошибка сохранения статьи')
				}
				setArticles(prevArticles =>
					prevArticles.map(a =>
						a.id === payload.id
							? {
									...a,
									...payload,
									date: payload.date ? formatDate(payload.date) : a.date,
								}
							: a,
					),
				)
			} else {
				const res = await apiRequest('/api/adminArticles/create', {
					method: 'POST',
					body: JSON.stringify(payload),
				})
				if (!res.ok) {
					throw new Error('Ошибка создания статьи')
				}
				const result = await res.json()
				articleId = result.id
				const newArticle = {
					...payload,
					id: articleId,
					date: payload.date ? formatDate(payload.date) : '',
					views: 0,
					published: true,
				}
				setArticles(prevArticles => [newArticle, ...prevArticles])
			}

			setIsAddModalOpen(false)
			setEditingArticle(null)
			return articleId
		} catch (e) {
			console.error(e)
			alert(e.message || 'Не удалось сохранить статью')
			throw e
		}
	}
	const filteredByTab = (
		activeTab === 'all'
			? articles
			: articles.filter(a => (a.category || 'Без категории') === activeTab)
	).filter(article => {
		if (!searchValue.trim()) return true
		const searchLower = searchValue.toLowerCase().trim()
		return (
			(article.title && article.title.toLowerCase().includes(searchLower)) ||
			(article.category &&
				article.category.toLowerCase().includes(searchLower)) ||
			(article.author && article.author.toLowerCase().includes(searchLower)) ||
			(article.date && article.date.includes(searchLower))
		)
	})

	return (
		<div className='ArticlesPage'>
			<div className='ArticlesPage_container'>
				<main className='ArticlesPage_main'>
					<div className='ArticlesPage_content'>
						
						<div className='ArticlesPage_header'>
							<h1 className='ArticlesPage_title'>ПУБЛИКАЦИИ</h1>

							
							<div className='ArticlesPage_headerSearch'>
								<div className='ArticlesPage_headerSearch_icon'>
									<svg width='20' height='20' viewBox='0 0 20 20' fill='none'>
										<circle
											cx='9'
											cy='9'
											r='6'
											stroke='currentColor'
											strokeWidth='1.5'
										/>
										<path
											d='M14 14L17 17'
											stroke='currentColor'
											strokeWidth='1.5'
											strokeLinecap='round'
										/>
									</svg>
								</div>
								<input
									type='text'
									placeholder='Поиск'
									className='ArticlesPage_headerSearch_input'
									value={searchValue}
									onChange={handleSearchChange}
									onFocus={handleSearchFocus}
									onBlur={handleSearchBlur}
								/>
								{searchValue && (
									<button
										className='ArticlesPage_headerSearch_clear'
										onClick={() => setSearchValue('')}
									>
										✕
									</button>
								)}
							</div>

							<div className='ArticlesPage_actions'>
								
								

								
							</div>
						</div>

						
						<ArticleTabs
							tabs={tabs}
							activeTab={activeTab}
							onTabChange={handleTabChange}
						/>

						
						{searchValue && (
							<div className='ArticlesPage_searchResults'>
								Найдено статей: <strong>{filteredByTab.length}</strong>
								{filteredByTab.length === 0 && ' - ничего не найдено'}
							</div>
						)}

						
						<div className='ArticlesPage_controls' style={{ display: 'none' }}>
							<div className='ArticlesPage_search-wrapper'>
								<div className='ArticlesPage_search'>
									<svg width='20' height='20' viewBox='0 0 20 20' fill='none'>
										<circle
											cx='9'
											cy='9'
											r='6'
											stroke='white'
											strokeOpacity='0.4'
											strokeWidth='1.5'
										/>
										<path
											d='M14 14L17 17'
											stroke='white'
											strokeOpacity='0.4'
											strokeWidth='1.5'
											strokeLinecap='round'
										/>
									</svg>
									<input
										type='text'
										placeholder='Поиск товара'
										className='ArticlesPage_search_input'
										value={searchValue}
										onChange={handleSearchChange}
										onFocus={handleSearchFocus}
										onBlur={handleSearchBlur}
									/>
								</div>
							</div>

							<div className='ArticlesPage_filters-wrap'>
								<button
									className='ArticlesPage_filters'
									onClick={() => setIsFiltersOpen(!isFiltersOpen)}
								>
									Фильтры
									<img src={Filter} alt='' />
								</button>
							</div>
						</div>

						
						<ArticlesTable
							articles={filteredByTab}
							allArticles={articles}
							searchValue={searchValue}
							loading={loading}
							error={loadError}
							onEditArticle={handleEditArticle}
							onTogglePublished={handleTogglePublished}
							onDeleteArticle={handleDeleteArticle}
							onCreateArticle={handleCreateArticle}
						/>
					</div>
				</main>
			</div>

			
			<ArticleModal
				isOpen={isAddModalOpen}
				onClose={() => {
					setIsAddModalOpen(false)
					setEditingArticle(null)
				}}
				article={editingArticle}
				onSave={handleSaveArticle}
			/>
		</div>
	)
}

export default ArticlesPage
