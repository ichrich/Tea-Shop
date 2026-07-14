import React, { useState, useEffect } from 'react'
import { apiRequest } from '../../utils/api'
import strelkaDown from '../../assets/icons/strelka_down.svg'
import './RevenueChart.css'

const RevenueChart = () => {
	const [remoteData, setRemoteData] = useState(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)
	const [selectedProduct, setSelectedProduct] = useState(
		'Анфельция Тобучинская',
	)
	const getMonthName = (monthNum) => {
		const months = [
			'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
			'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
		]
		return months[monthNum - 1]
	}
	const formatMonth = yearMonth => {
		if (!yearMonth) return ''

		let monthNum = null
		if (yearMonth.includes('-')) {
			monthNum = parseInt(yearMonth.split('-')[1])
		}
		else if (yearMonth.includes('.')) {
			monthNum = parseInt(yearMonth.split('.')[0])
		}

		if (monthNum === null || isNaN(monthNum)) {
			console.error('Не удалось распознать месяц из:', yearMonth)
			return yearMonth
		}

		return getMonthName(monthNum)
	}

	useEffect(() => {
		setLoading(true)
		setError(null)
		apiRequest('/api/grapfic')
			.then(res => {
				if (!res.ok) {
					throw new Error(`Ошибка загрузки графика: ${res.status}`)
				}
				return res.json()
			})
			.then(payload => {
				const items = payload?.data ?? payload ?? []
				items.sort((a, b) =>
					(a.year_month || '').localeCompare(b.year_month || ''),
				)
				console.log('Загружено месяцев:', items.length)
				console.log(
					'Месяцы:',
					items.map(i => i.year_month),
				)
				setRemoteData(items)
			})
			.catch(e => {
				console.error(e)
				setError(e)
			})
			.finally(() => setLoading(false))
	}, [])

	if (loading) {
		return (
			<div className='RevenueChart'>
				<div className='RevenueChart_header'>
					<h3 className='RevenueChart_title'>Статистика просмотров</h3>
				</div>
				<div className='RevenueChart_graph'>
					<div className='RevenueChart_loading'>Загрузка...</div>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className='RevenueChart'>
				<div className='RevenueChart_header'>
					<h3 className='RevenueChart_title'>Статистика просмотров</h3>
				</div>
				<div className='RevenueChart_graph'>
					<div className='RevenueChart_error'>Ошибка загрузки графика</div>
				</div>
			</div>
		)
	}

	const items = Array.isArray(remoteData) ? remoteData : []

	if (!items.length) {
		return (
			<div className='RevenueChart'>
				<div className='RevenueChart_header'>
					<h3 className='RevenueChart_title'>Статистика просмотров</h3>
				</div>
				<div className='RevenueChart_graph'>
					<div className='RevenueChart_error'>Нет данных для отображения</div>
				</div>
			</div>
		)
	}

	const incomeData = items.map(d => ({
		month: d.year_month,
		value: Number(d.total_quantity ?? 0),
	}))

	const viewsData = items.map(d => ({
		month: d.year_month,
		value: Number(d.total_views ?? 0),
	}))
	const months = incomeData.map(d => d.month)
	const getDisplayMonths = () => {
		const last5Months = months.slice(-5)
		return last5Months.map(m => formatMonth(m))
	}

	const maxValue = Math.max(
		1,
		...incomeData.map(p => Number(p.value)),
		...viewsData.map(p => Number(p.value)),
	)
	const COLS = 4
	const ROWS = 6
	const CELL_WIDTH = 9.323 // vw
	const CELL_HEIGHT = 4.375 // vw
	const GRAPH_WIDTH = CELL_WIDTH * COLS // 37.292vw
	const GRAPH_HEIGHT = CELL_HEIGHT * ROWS // 26.25vw

	const toPointsFromData = dataArray =>
		dataArray
			.map((pt, index) => {
				const x = (index / (dataArray.length - 1 || 1)) * GRAPH_WIDTH
				const y = GRAPH_HEIGHT - (Number(pt.value) / maxValue) * GRAPH_HEIGHT
				return `${x},${y}`
			})
			.join(' ')

	const displayMonths = getDisplayMonths()

	return (
		<div className='RevenueChart'>
			<div className='RevenueChart_header'>
				<h3 className='RevenueChart_title'>Статистика просмотров</h3>

				<div className='RevenueChart_product'>
					<span className='RevenueChart_product_name'>{selectedProduct}</span>
					<img
						src={strelkaDown}
						alt=''
						className='RevenueChart_product_arrow'
					/>
				</div>
			</div>

			<div className='RevenueChart_graph'>
				<div className='RevenueChart_y_axis'>
					{[
						maxValue,
						Math.round(maxValue * 0.6),
						Math.round(maxValue * 0.4),
						Math.round(maxValue * 0.2),
						0,
					].map((value, index) => (
						<span key={index} className='RevenueChart_y_label'>
							{value}
						</span>
					))}
				</div>

				<div className='RevenueChart_plot'>
					<svg
						className='RevenueChart_svg'
						viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
						preserveAspectRatio='none'
					>
						<defs>
							<linearGradient
								id='incomeGradient'
								x1='0%'
								y1='0%'
								x2='0%'
								y2='100%'
							>
								<stop offset='0%' stopColor='rgba(205, 255, 255, 0.1)' />
								<stop offset='100%' stopColor='rgba(205, 255, 255, 0)' />
							</linearGradient>
							<linearGradient
								id='viewsGradient'
								x1='0%'
								y1='0%'
								x2='0%'
								y2='100%'
							>
								<stop offset='0%' stopColor='rgba(38, 0, 255, 0.1)' />
								<stop offset='100%' stopColor='rgba(38, 0, 255, 0)' />
							</linearGradient>
						</defs>

						{Array.from({ length: ROWS }).map((_, row) =>
							Array.from({ length: COLS }).map((_, col) => (
								<rect
									key={`cell-${row}-${col}`}
									x={col * CELL_WIDTH}
									y={row * CELL_HEIGHT}
									width={CELL_WIDTH}
									height={CELL_HEIGHT}
									fill='none'
									stroke='rgba(255, 255, 255, 0.15)'
									strokeWidth='0.1'
								/>
							)),
						)}

						{Array.from({ length: ROWS + 1 }).map((_, i) => (
							<line
								key={`h-${i}`}
								x1='0'
								y1={i * CELL_HEIGHT}
								x2={GRAPH_WIDTH}
								y2={i * CELL_HEIGHT}
								stroke='rgba(255, 255, 255, 0.3)'
								strokeWidth='0.15'
							/>
						))}

						{Array.from({ length: COLS + 1 }).map((_, i) => (
							<line
								key={`v-${i}`}
								x1={i * CELL_WIDTH}
								y1='0'
								x2={i * CELL_WIDTH}
								y2={GRAPH_HEIGHT}
								stroke='rgba(255, 255, 255, 0.3)'
								strokeWidth='0.15'
							/>
						))}

						<polyline
							points={toPointsFromData(incomeData)}
							fill='none'
							stroke='rgba(205, 255, 255, 1)'
							strokeWidth='0.15'
						/>

						{incomeData.map((point, index) => {
							const x = (index / (incomeData.length - 1 || 1)) * GRAPH_WIDTH
							const y =
								GRAPH_HEIGHT - (Number(point.value) / maxValue) * GRAPH_HEIGHT
							return (
								<circle
									key={`income-${index}`}
									cx={x}
									cy={y}
									r='0.4'
									fill='rgba(205, 255, 255, 1)'
								/>
							)
						})}

						<polyline
							points={toPointsFromData(viewsData)}
							fill='none'
							stroke='#2600ff'
							strokeWidth='0.15'
						/>

						{viewsData.map((point, index) => {
							const x = (index / (viewsData.length - 1 || 1)) * GRAPH_WIDTH
							const y =
								GRAPH_HEIGHT - (Number(point.value) / maxValue) * GRAPH_HEIGHT
							return (
								<circle
									key={`views-${index}`}
									cx={x}
									cy={y}
									r='0.4'
									fill='#2600ff'
								/>
							)
						})}
					</svg>

					<div className='RevenueChart_x_axis'>
						{displayMonths.map((month, index) => (
							<span key={index} className='RevenueChart_x_label'>
								{month}
							</span>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}

export default RevenueChart