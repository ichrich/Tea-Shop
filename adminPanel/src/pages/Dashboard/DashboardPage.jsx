import React, { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../../utils/api'
import './DashboardPage.css'

const DashboardPage = () => {
  const [products, setProducts] = useState([])
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await apiRequest('/api/adminProducts')
        if (!res.ok) throw new Error('Ошибка загрузки товаров')
        const data = await res.json()
        const list = Array.isArray(data) ? data : []
        setProducts(list)
        if (list.length) setSelectedProductId(list[0].id)
      } catch (error) {
        console.error(error)
      }
    }

    loadProducts()
  }, [])

  useEffect(() => {
    if (!selectedProductId) return

    const loadStats = async () => {
      setLoading(true)

      try {
        const res = await apiRequest(`/api/dashBoard/product/${selectedProductId}`)

        if (res.ok) {
          const data = await res.json()
          setStats(data)
        } else {
          const [graphRes, topRes] = await Promise.all([
            apiRequest('/api/grapfic'),
            apiRequest('/api/topProduct'),
          ])

          const graphData = graphRes.ok ? await graphRes.json() : { data: [] }
          const topData = topRes.ok ? await topRes.json() : []
          const selectedProduct = products.find(product => Number(product.id) === Number(selectedProductId))
          const selectedTop = Array.isArray(topData)
            ? topData.find(product => Number(product.id) === Number(selectedProductId))
            : null

          const now = new Date()
          const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
          const monthLabel = now.toLocaleString('ru-RU', { month: 'short' }).replace('.', '')
          const toShortMonth = yearMonth => {
            if (!yearMonth || typeof yearMonth !== 'string' || !yearMonth.includes('-')) {
              return `${monthLabel[0].toUpperCase()}${monthLabel.slice(1)}.`
            }

            const [year, month] = yearMonth.split('-')
            const date = new Date(Number(year), Number(month) - 1, 1)
            const short = date.toLocaleString('ru-RU', { month: 'short' }).replace('.', '')
            return `${short[0].toUpperCase()}${short.slice(1)}.`
          }

          const chart = Array.isArray(graphData?.data)
            ? graphData.data.slice(-5).map(item => ({
                month: toShortMonth(item.year_month),
                views: Number(item.total_views || 0),
                orders: Number(item.total_quantity || 0),
              }))
            : []

          if (chart.length === 0) {
            chart.push({
              month: `${monthLabel[0].toUpperCase()}${monthLabel.slice(1)}.`,
              views: Number(selectedProduct?.views || 0),
              orders: Number(selectedTop?.total_quantity || 0),
            })
          } else if (Number(selectedProduct?.views || 0) > 0) {
            chart[chart.length - 1].views = Number(selectedProduct.views)
          }

          setStats({
            productId: selectedProductId,
            productName: selectedProduct?.name || '',
            month: ym,
            chart,
            sales: {
              quantity: Number(selectedTop?.total_quantity || 0),
              revenue: Number(selectedTop?.total_revenue || 0),
              profit: Math.round(Number(selectedTop?.total_revenue || 0) * 0.6),
              selectedPct: Number(selectedTop?.total_revenue || 0) > 0 ? 100 : 0,
            },
          })
        }
      } catch (error) {
        console.error(error)
        setStats(null)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [selectedProductId, products])

  const chartPoints = useMemo(() => {
    const items = Array.isArray(stats?.chart) ? stats.chart : []
    const max = Math.max(1, ...items.flatMap(item => [item.views || 0, item.orders || 0]))

    return items.map((item, index) => ({
      x: items.length > 1 ? (index / (items.length - 1)) * 100 : 0,
      yViews: 100 - ((item.views || 0) / max) * 100,
      yOrders: 100 - ((item.orders || 0) / max) * 100,
      month: item.month,
    }))
  }, [stats])

  const yMax = useMemo(() => {
    const items = Array.isArray(stats?.chart) ? stats.chart : []
    const rawMax = Math.max(1, ...items.flatMap(item => [Number(item.views || 0), Number(item.orders || 0)]))
    return Math.ceil(rawMax / 10) * 10
  }, [stats])

  const yTicks = useMemo(() => {
    const step = yMax / 5
    return Array.from({ length: 6 }, (_, index) => Math.round(index * step))
  }, [yMax])

  const summaryCards = useMemo(
    () => [
      {
        label: 'Выбранный товар',
        value: stats?.productName || 'Нет данных',
        helper: `${products.length} позиций в каталоге`,
      },
      {
        label: 'Заказы',
        value: `${stats?.sales?.quantity ?? 0}`,
        helper: 'Текущий период',
      },
      {
        label: 'Выручка',
        value: `${Number(stats?.sales?.revenue || 0).toLocaleString('ru-RU')} ₽`,
        helper: 'Валовый оборот',
      },
      {
        label: 'Маржинальность',
        value: `${Number(stats?.sales?.profit || 0).toLocaleString('ru-RU')} ₽`,
        helper: 'Расчетный вклад',
      },
    ],
    [products.length, stats],
  )

  const toMonthLabel = ym => {
    if (!ym || typeof ym !== 'string' || !ym.includes('-')) return '-'
    const [year, month] = ym.split('-')
    const date = new Date(Number(year), Number(month) - 1, 1)
    return date.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })
  }

  return (
    <div className='DashboardNew'>
      <div className='DashboardNew_topline'>
        <div>
          <span className='DashboardNew_kicker'>Операционный обзор</span>
          <h1 className='DashboardNew_title'>Ключевые показатели чайного проекта на одном экране</h1>
        </div>

        <div className='DashboardNew_selectWrap'>
          <label htmlFor='dashboard-product'>Фокус по товару</label>
          <select
            id='dashboard-product'
            value={selectedProductId || ''}
            onChange={event => setSelectedProductId(Number(event.target.value))}
          >
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className='DashboardNew_summary'>
        {summaryCards.map(card => (
          <section className='DashboardNew_statCard' key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>{card.helper}</small>
          </section>
        ))}
      </div>

      <div className='DashboardNew_grid'>
        <section className='DashboardNew_card DashboardNew_card--chart'>
          <div className='DashboardNew_head'>
            <div>
              <span className='DashboardNew_cardLabel'>Спрос и трафик</span>
              <h3>Просмотры и заказы</h3>
            </div>
          </div>

          <div className='DashboardNew_plotWrap'>
            <div className='DashboardNew_yAxis'>
              {yTicks.slice().reverse().map(value => (
                <span key={value}>{value}</span>
              ))}
            </div>

            <div className='DashboardNew_plot'>
              <svg viewBox='0 0 100 100' preserveAspectRatio='none'>
                {[0, 20, 40, 60, 80, 100].map(grid => (
                  <line key={`h-${grid}`} x1='0' y1={grid} x2='100' y2={grid} className='gridLine' />
                ))}
                {[0, 20, 40, 60, 80, 100].map(grid => (
                  <line key={`v-${grid}`} x1={grid} y1='0' x2={grid} y2='100' className='gridLine' />
                ))}
                {[...Array(Math.max(0, chartPoints.length - 1))].map((_, index) => (
                  <line
                    key={`views-${index}`}
                    x1={chartPoints[index].x}
                    y1={chartPoints[index].yViews}
                    x2={chartPoints[index + 1].x}
                    y2={chartPoints[index + 1].yViews}
                    className='lineViews'
                  />
                ))}
                {[...Array(Math.max(0, chartPoints.length - 1))].map((_, index) => (
                  <line
                    key={`orders-${index}`}
                    x1={chartPoints[index].x}
                    y1={chartPoints[index].yOrders}
                    x2={chartPoints[index + 1].x}
                    y2={chartPoints[index + 1].yOrders}
                    className='lineOrders'
                  />
                ))}
                {chartPoints.map((point, index) => (
                  <circle key={`point-view-${index}`} cx={point.x} cy={point.yViews} r='1.2' className='dotViews' />
                ))}
                {chartPoints.map((point, index) => (
                  <circle key={`point-order-${index}`} cx={point.x} cy={point.yOrders} r='1.2' className='dotOrders' />
                ))}
              </svg>

              <div className='DashboardNew_months'>
                {(stats?.chart || []).map(item => (
                  <span key={item.month}>{item.month}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className='DashboardNew_side'>
          <section className='DashboardNew_card DashboardNew_card--sales'>
            <div className='DashboardNew_head'>
              <div>
                <span className='DashboardNew_cardLabel'>Продажи</span>
                <h3>Профиль месяца</h3>
              </div>
            </div>

            <div className='DashboardNew_salesContent'>
              <div className='DashboardNew_statsList'>
                <div><span>Период</span><b>{toMonthLabel(stats?.month)}</b></div>
                <div><span>Заказы</span><b>{stats?.sales?.quantity ?? 0}</b></div>
                <div><span>Выручка</span><b>{Number(stats?.sales?.revenue || 0).toLocaleString('ru-RU')} ₽</b></div>
                <div><span>Маржа</span><b>{Number(stats?.sales?.profit || 0).toLocaleString('ru-RU')} ₽</b></div>
              </div>

              <div className='DashboardNew_donutWrap'>
                <div
                  className='DashboardNew_donut'
                  style={{
                    background: `conic-gradient(#ff9a4d 0 ${stats?.sales?.selectedPct || 0}%, rgba(255,255,255,0.12) ${stats?.sales?.selectedPct || 0}% 100%)`,
                  }}
                />
                <div className='DashboardNew_legend'>
                  <div><i className='legendA' />Выбранный товар</div>
                  <div><i className='legendB' />Остальной оборот</div>
                </div>
              </div>
            </div>
          </section>

          <section className='DashboardNew_card DashboardNew_card--insights'>
            <div className='DashboardNew_head'>
              <div>
                <span className='DashboardNew_cardLabel'>Подсказки</span>
                <h3>На что смотреть дальше</h3>
              </div>
            </div>

            <div className='DashboardNew_insights'>
              <article>
                <span>Пиковый трафик</span>
                <strong>{chartPoints.length ? Math.max(...(stats?.chart || []).map(item => item.views || 0)) : 0}</strong>
                <p>Максимум просмотров в текущем окне графика.</p>
              </article>
              <article>
                <span>Текущий спрос</span>
                <strong>{stats?.sales?.quantity ?? 0}</strong>
                <p>Заказы по выбранной позиции.</p>
              </article>
            </div>
          </section>
        </div>
      </div>

      {loading && <div className='DashboardNew_loading'>Загрузка показателей...</div>}
    </div>
  )
}

export default DashboardPage
