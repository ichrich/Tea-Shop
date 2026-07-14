import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs.jsx';
import './TypeOfTonic.css';
import Search from '../../assets/Image/search.svg';
import WhiteGalochka from '../../assets/Image/WhiteGalochka.svg';
import TypeOfTonicPopap from '../Catalog/ProductModal/ProductModal.jsx';
import { CATALOG_TONIC_FILTER_TYPES } from '../../constants/catalogTonicLinks.js';
import { normalizeTeaContent } from '../../utils/teaContent.js';
import { SITE_IMAGES } from '../../constants/siteImages.js';

const SORT_OPTIONS = [
  { value: 'default', label: 'По умолчанию' },
  { value: 'price-asc', label: 'Сначала дешевле' },
  { value: 'price-desc', label: 'Сначала дороже' },
  { value: 'name-asc', label: 'Название А-Я' },
  { value: 'name-desc', label: 'Название Я-А' },
  { value: 'newest', label: 'Сначала новые' },
];

const BENEFIT_TYPES = [
  'Повседневный ритуал',
  'Подарочные наборы',
  'Премиальная линейка',
];

const PRICE_MIN_FALLBACK = 1;
const PRICE_MAX_FALLBACK = 100000;

const CATALOG_FALLBACK_PRODUCTS = [
  {
    id: 'sencha-kagoshima',
    name: 'Сенча Кагосима',
    type: 'Сенча',
    category: 'Повседневный ритуал',
    price: 2400,
    active: 1,
    image: SITE_IMAGES.sencha,
    description: 'Весенняя японская сенча с ароматом свежей зелени, мягким умами и прозрачной сладостью.',
  },
  {
    id: 'da-hong-pao',
    name: 'Да Хун Пао',
    type: 'Улун',
    category: 'Премиальная линейка',
    price: 2800,
    active: 1,
    image: SITE_IMAGES.daHongPao,
    description: 'Утёсный улун с минеральным характером, печёными фруктами, какао и долгим тёплым послевкусием.',
  },
  {
    id: 'bai-mu-dan',
    name: 'Бай Му Дань',
    type: 'Белый чай',
    category: 'Повседневный ритуал',
    price: 2600,
    active: 1,
    image: SITE_IMAGES.whiteTea,
    description: 'Мягкий белый чай с нотами полевых цветов, спелой груши и прохладным медовым послевкусием.',
  },
  {
    id: 'matcha-uji',
    name: 'Матча Удзи церемониальная',
    type: 'Матча',
    category: 'Премиальная линейка',
    price: 3600,
    active: 1,
    image: SITE_IMAGES.matcha,
    description: 'Церемониальная матча с бархатной текстурой, насыщенным умами и свежим сладковатым финалом.',
  },
  {
    id: 'aged-shu-puer',
    name: 'Шу пуэр выдержанный',
    type: 'Пуэр',
    category: 'Премиальная линейка',
    price: 3200,
    active: 1,
    image: SITE_IMAGES.puer,
    description: 'Глубокий выдержанный пуэр с древесными, ореховыми и шоколадными оттенками без резкости.',
  },
  {
    id: 'gift-selection',
    name: 'Подарочная коллекция',
    type: 'Набор',
    category: 'Подарочные наборы',
    price: 5900,
    active: 1,
    image: SITE_IMAGES.gifts,
    description: 'Шесть выразительных чаёв в подарочной коробке с картой вкусов и рекомендациями по завариванию.',
  },
];

const PRODUCT_EDITORIAL = {
  улун: {
    name: 'Да Хун Пао',
    type: 'Улун',
    category: 'Премиальная линейка',
    price: 2800,
    image: SITE_IMAGES.daHongPao,
    description: 'Выдержанный утёсный улун с минеральным характером, нотами печёных фруктов, какао и долгим тёплым послевкусием.',
    characteristics: [
      { name: 'Происхождение', description: 'Уишань, провинция Фуцзянь' },
      { name: 'Вкус', description: 'Минеральный, печёные фрукты, какао' },
      { name: 'Заваривание', description: '90-95 °C, короткими проливами' },
    ],
  },
  сенча: {
    name: 'Сенча Кагосима',
    type: 'Сенча',
    category: 'Повседневный ритуал',
    price: 2400,
    image: SITE_IMAGES.sencha,
    description: 'Японская сенча с ароматом свежей зелени, мягким умами и чистой сладостью. Хороша для спокойного утреннего заваривания.',
    characteristics: [
      { name: 'Происхождение', description: 'Кагосима, Япония' },
      { name: 'Вкус', description: 'Свежая зелень, умами, мягкая сладость' },
      { name: 'Заваривание', description: '70-75 °C, 60-75 секунд' },
    ],
  },
  матча: {
    name: 'Матча Удзи церемониальная',
    type: 'Матча',
    category: 'Премиальная линейка',
    price: 3600,
    image: SITE_IMAGES.matcha,
    description: 'Церемониальная матча из Удзи с бархатной текстурой, насыщенным умами и свежим сладковатым послевкусием.',
    characteristics: [
      { name: 'Происхождение', description: 'Удзи, Япония' },
      { name: 'Профиль', description: 'Насыщенный умами, сливочная текстура' },
      { name: 'Приготовление', description: '2 г на 70 мл воды, 75-80 °C' },
    ],
  },
};

const resolveProductImage = product => {
  const source = `${product?.name || ''} ${product?.type || ''}`.toLowerCase();
  if (source.includes('сенча')) return SITE_IMAGES.sencha;
  if (source.includes('улун') || source.includes('да хун пао')) return SITE_IMAGES.daHongPao;
  if (source.includes('бел') || source.includes('бай му дан')) return SITE_IMAGES.whiteTea;
  if (source.includes('матча')) return SITE_IMAGES.matcha;
  if (source.includes('пуэр')) return SITE_IMAGES.puer;
  if (source.includes('подар') || source.includes('набор')) return SITE_IMAGES.gifts;
  return SITE_IMAGES.placeholder;
};

const prepareProductionProduct = product => {
  const sourceName = `${product?.name || ''}`.trim().toLowerCase();
  const editorialKey = Object.keys(PRODUCT_EDITORIAL).find(key => sourceName.includes(key));
  if (!editorialKey) {
    return { ...product, image: resolveProductImage(product) };
  }
  const editorial = PRODUCT_EDITORIAL[editorialKey];
  const rawDescription = `${product?.description || product?.discription || ''}`;
  const description = /текст описания|lorem|заглуш/i.test(rawDescription)
    ? editorial.description
    : rawDescription || editorial.description;

  return {
    ...product,
    ...editorial,
    image: editorial.image || resolveProductImage(product),
    description,
    discription: description,
  };
};

const parsePriceValue = product => {
  const raw = (product?.price ?? '').toString();
  const cleaned = raw
    .replace(/\s/g, '')
    .replace(/₽/g, '')
    .replace(/,/g, '.')
    .replace(/[^\d.]/g, '');
  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) ? value : 0;
};

const resolveImage = value => {
  if (!value || typeof value !== 'string') return SITE_IMAGES.placeholder;
  const normalized = value.trim();
  if (!normalized) return SITE_IMAGES.placeholder;
  if (
    /^(https?:)?\/\//i.test(normalized) ||
    normalized.startsWith('data:') ||
    normalized.startsWith('/images/') ||
    normalized.startsWith('/src/')
  ) {
    return normalized;
  }
  return `/images/${normalized.replace(/^\/+/, '')}`;
};

function PriceSlider({ from, to, min, max, onFromChange, onToChange, onCommit }) {
  const pct = value => ((value - min) / (max - min)) * 100;

  return (
    <div className="TeaCatalog_sliderWrap">
      <div className="TeaCatalog_sliderTrack">
        <div
          className="TeaCatalog_sliderFill"
          style={{ left: `${pct(from)}%`, width: `${pct(to) - pct(from)}%` }}
        />
        <input
          className="TeaCatalog_range TeaCatalog_range--from"
          type="range"
          min={min}
          max={max}
          value={from}
          onChange={event => {
            const value = Number(event.target.value);
            onFromChange(Math.min(value, to - 1));
          }}
          onMouseUp={onCommit}
          onPointerUp={onCommit}
          onTouchEnd={onCommit}
        />
        <input
          className="TeaCatalog_range TeaCatalog_range--to"
          type="range"
          min={min}
          max={max}
          value={to}
          onChange={event => {
            const value = Number(event.target.value);
            onToChange(Math.max(value, from + 1));
          }}
          onMouseUp={onCommit}
          onPointerUp={onCommit}
          onTouchEnd={onCommit}
        />
      </div>
      <div className="TeaCatalog_sliderLabels">
        <span>{min.toLocaleString('ru-RU')} ₽</span>
        <span>{max.toLocaleString('ru-RU')} ₽</span>
      </div>
    </div>
  );
}

function PriceBlock({
  from,
  to,
  min,
  max,
  fromInput,
  toInput,
  onFromInput,
  onToInput,
  onFromChange,
  onToChange,
  onCommit,
}) {
  return (
    <div className="TeaCatalog_priceBlock">
      <div className="TeaCatalog_priceInputs">
        <label className="TeaCatalog_priceField">
          <span>От</span>
          <input
            className="TeaCatalog_priceInput"
            type="text"
            inputMode="numeric"
            value={fromInput}
            onChange={onFromInput}
            onBlur={onCommit}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.currentTarget.blur();
                onCommit();
              }
            }}
            placeholder="0"
          />
        </label>
        <label className="TeaCatalog_priceField">
          <span>До</span>
          <input
            className="TeaCatalog_priceInput"
            type="text"
            inputMode="numeric"
            value={toInput}
            onChange={onToInput}
            onBlur={onCommit}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.currentTarget.blur();
                onCommit();
              }
            }}
            placeholder="0"
          />
        </label>
      </div>

      <PriceSlider
        from={from}
        to={to}
        min={min}
        max={max}
        onFromChange={onFromChange}
        onToChange={onToChange}
        onCommit={onCommit}
      />
    </div>
  );
}

export function TypeOfTonic() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toolbarRef = useRef(null);

  const tonicFromUrl = useMemo(() => {
    const raw = searchParams.get('tonicType');
    if (raw == null || raw === '') return null;

    try {
      const decoded = decodeURIComponent(raw.trim());
      return CATALOG_TONIC_FILTER_TYPES.includes(decoded) ? decoded : null;
    } catch {
      return null;
    }
  }, [searchParams]);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [sortOpen, setSortOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState('default');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedBenefits, setSelectedBenefits] = useState([]);
  const [search, setSearch] = useState('');

  const [draftPriceFrom, setDraftPriceFrom] = useState(PRICE_MIN_FALLBACK);
  const [draftPriceTo, setDraftPriceTo] = useState(PRICE_MAX_FALLBACK);
  const [draftFromInput, setDraftFromInput] = useState(String(PRICE_MIN_FALLBACK));
  const [draftToInput, setDraftToInput] = useState(String(PRICE_MAX_FALLBACK));
  const [priceFrom, setPriceFrom] = useState(PRICE_MIN_FALLBACK);
  const [priceTo, setPriceTo] = useState(PRICE_MAX_FALLBACK);

  useEffect(() => {
    const raw = searchParams.get('tonicType');
    if (raw == null || raw === '') return;
    const decoded = decodeURIComponent(raw.trim());
    if (!CATALOG_TONIC_FILTER_TYPES.includes(decoded)) {
      navigate('/under-development', { replace: true });
      return;
    }

    setSelectedTypes(decoded === 'Сенча' ? [] : [decoded]);
  }, [navigate, searchParams]);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setLoadError(null);

    fetch('/api/catalog/all')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Ошибка загрузки товаров: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (cancelled) return;
        const productsList = normalizeTeaContent(Array.isArray(data.products) ? data.products : [])
          .map(prepareProductionProduct);
        setProducts(productsList);
        setLoading(false);
      })
      .catch(error => {
        if (cancelled) return;
        console.error('Error loading products:', error);
        setProducts(CATALOG_FALLBACK_PRODUCTS);
        setLoadError(null);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!sortOpen && !filtersOpen) return undefined;

    const handleOutsideClick = event => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target)) {
        setSortOpen(false);
        setFiltersOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [filtersOpen, sortOpen]);

  const priceBounds = useMemo(() => {
    const prices = products
      .map(parsePriceValue)
      .filter(value => Number.isFinite(value) && value > 0);

    if (prices.length === 0) {
      return { min: PRICE_MIN_FALLBACK, max: PRICE_MAX_FALLBACK };
    }

    const min = Math.max(0, Math.floor(Math.min(...prices)));
    const max = Math.max(min + 1, Math.ceil(Math.max(...prices)));
    return { min, max };
  }, [products]);

  useEffect(() => {
    const min = priceBounds.min;
    const max = priceBounds.max;

    setDraftPriceFrom(current => Math.min(Math.max(current, min), max - 1));
    setDraftPriceTo(current => Math.max(Math.min(current, max), min + 1));
    setPriceFrom(current => Math.min(Math.max(current, min), max - 1));
    setPriceTo(current => Math.max(Math.min(current, max), min + 1));
    setDraftFromInput(String(min));
    setDraftToInput(String(max));
  }, [priceBounds.max, priceBounds.min]);

  const syncDraftFrom = value => {
    const nextValue = Math.min(Math.max(value, priceBounds.min), draftPriceTo - 1);
    setDraftPriceFrom(nextValue);
    setDraftFromInput(String(nextValue));
  };

  const syncDraftTo = value => {
    const nextValue = Math.max(Math.min(value, priceBounds.max), draftPriceFrom + 1);
    setDraftPriceTo(nextValue);
    setDraftToInput(String(nextValue));
  };

  const handleDraftFromInput = event => {
    const raw = event.target.value.replace(/\D/g, '');
    setDraftFromInput(raw);
    const value = Number(raw);
    if (!Number.isFinite(value)) return;
    setDraftPriceFrom(Math.min(Math.max(value, priceBounds.min), draftPriceTo - 1));
  };

  const handleDraftToInput = event => {
    const raw = event.target.value.replace(/\D/g, '');
    setDraftToInput(raw);
    const value = Number(raw);
    if (!Number.isFinite(value)) return;
    setDraftPriceTo(Math.max(Math.min(value, priceBounds.max), draftPriceFrom + 1));
  };

  const commitPrice = () => {
    setPriceFrom(draftPriceFrom);
    setPriceTo(draftPriceTo);
  };

  const resetAllFilters = () => {
    setSelectedTypes(tonicFromUrl && tonicFromUrl !== 'Сенча' ? [tonicFromUrl] : []);
    setSelectedBenefits([]);
    setSelectedSort('default');
    setSearch('');
    setDraftPriceFrom(priceBounds.min);
    setDraftPriceTo(priceBounds.max);
    setDraftFromInput(String(priceBounds.min));
    setDraftToInput(String(priceBounds.max));
    setPriceFrom(priceBounds.min);
    setPriceTo(priceBounds.max);
  };

  const toggleType = label => {
    setSelectedTypes(current =>
      current.includes(label) ? current.filter(item => item !== label) : [...current, label],
    );
  };

  const toggleBenefit = label => {
    setSelectedBenefits(current =>
      current.includes(label) ? current.filter(item => item !== label) : [...current, label],
    );
  };

  const filteredProducts = useMemo(() => {
    let list = [...products].filter(product => product.active === 1 || product.active === undefined);

    if (search.trim()) {
      const query = search.toLowerCase().trim();
      list = list.filter(product => {
        const name = (product.name || '').toLowerCase();
        const description = (product.discription || product.description || '').toLowerCase();
        return name.includes(query) || description.includes(query);
      });
    }

    if (selectedTypes.length > 0) {
      list = list.filter(product => {
        const value = (product.type || '').trim().toLowerCase();
        return selectedTypes.some(type => value.includes(type.toLowerCase()) || type.toLowerCase().includes(value));
      });
    }

    if (selectedBenefits.length > 0) {
      list = list.filter(product => {
        const value = (product.category || '').trim().toLowerCase();
        return selectedBenefits.some(type => value.includes(type.toLowerCase()) || type.toLowerCase().includes(value));
      });
    }

    list = list.filter(product => {
      const price = parsePriceValue(product);
      return price >= priceFrom && price <= priceTo;
    });

    switch (selectedSort) {
      case 'price-asc':
        list.sort((a, b) => parsePriceValue(a) - parsePriceValue(b));
        break;
      case 'price-desc':
        list.sort((a, b) => parsePriceValue(b) - parsePriceValue(a));
        break;
      case 'name-asc':
        list.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ru'));
        break;
      case 'name-desc':
        list.sort((a, b) => (b.name || '').localeCompare(a.name || '', 'ru'));
        break;
      case 'newest':
        list.sort((a, b) => (b.id || 0) - (a.id || 0));
        break;
      default:
        list.sort((a, b) => (a.id || 0) - (b.id || 0));
        break;
    }

    return list;
  }, [priceFrom, priceTo, products, search, selectedBenefits, selectedSort, selectedTypes]);

  const currentSortLabel =
    SORT_OPTIONS.find(option => option.value === selectedSort)?.label || SORT_OPTIONS[0].label;

  const activeFilterCount =
    selectedTypes.length +
    selectedBenefits.length +
    (search.trim() ? 1 : 0) +
    (priceFrom !== priceBounds.min || priceTo !== priceBounds.max ? 1 : 0);

  const heroTitle = tonicFromUrl ? `${tonicFromUrl} в чайной коллекции` : 'Каталог чайной коллекции';
  const heroText = tonicFromUrl
    ? 'Отдельная подборка с темпом вкуса, подачей и карточками, собранными для спокойного выбора без лишнего визуального шума.'
    : 'Листовые чаи, матча, улуны, подарочные наборы и сезонные релизы для домашнего ритуала, розницы и сервиса.';

  const handleCardClick = async productId => {
    try {
      const response = await fetch(`/api/catalog/product/${productId}`);
      if (response.ok) {
        const fullProductData = prepareProductionProduct(normalizeTeaContent(await response.json()));
        if (!fullProductData.error) {
          setSelectedProduct(fullProductData);
          return;
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки данных товара:', error);
    }

    const fallback = filteredProducts.find(product => product.id === productId);
    if (fallback) {
      setSelectedProduct(fallback);
    }
  };

  return (
    <section className="TeaCatalog">
      <div className="container">
        <div className="TeaCatalog_intro">
          <Breadcrumbs />

          <div className="TeaCatalog_hero">
            <div className="TeaCatalog_heroCopy">
              <span className="TeaCatalog_eyebrow">Каталог</span>
              <h1 className="TeaCatalog_title">{heroTitle}</h1>
              <p className="TeaCatalog_lead">{heroText}</p>
            </div>

            <div className="TeaCatalog_stats">
              <div>
                <span>Доступно сейчас</span>
                <strong>{filteredProducts.length}</strong>
              </div>
              <div>
                <span>Диапазон цен</span>
                <strong>
                  {priceBounds.min.toLocaleString('ru-RU')} - {priceBounds.max.toLocaleString('ru-RU')} ₽
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div className="TeaCatalog_toolbar" ref={toolbarRef}>
          <label className="TeaCatalog_search">
            <img src={Search} alt="" aria-hidden="true" />
            <input
              type="text"
              placeholder="Поиск по названию или описанию"
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </label>

          <div className="TeaCatalog_controls">
            <div className="TeaCatalog_dropdown">
              <button
                type="button"
                className={`TeaCatalog_trigger ${sortOpen ? 'is-open' : ''}`}
                onClick={() => {
                  setSortOpen(current => !current);
                  setFiltersOpen(false);
                }}
              >
                <span>{currentSortLabel}</span>
                <img src={WhiteGalochka} alt="" aria-hidden="true" />
              </button>

              {sortOpen && (
                <div className="TeaCatalog_menu TeaCatalog_menu--sort">
                  {SORT_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      className={`TeaCatalog_option ${selectedSort === option.value ? 'is-active' : ''}`}
                      onClick={() => {
                        setSelectedSort(option.value);
                        setSortOpen(false);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="TeaCatalog_dropdown TeaCatalog_dropdown--filters">
              <button
                type="button"
                className={`TeaCatalog_trigger ${filtersOpen ? 'is-open' : ''}`}
                onClick={() => {
                  setFiltersOpen(current => !current);
                  setSortOpen(false);
                }}
              >
                <span>Фильтры{activeFilterCount > 0 ? ` · ${activeFilterCount}` : ''}</span>
                <img src={WhiteGalochka} alt="" aria-hidden="true" />
              </button>

              {filtersOpen && (
                <div className="TeaCatalog_menu TeaCatalog_menu--filters">
                  <div className="TeaCatalog_filterSection">
                    <h2>Разделы</h2>
                    <div className="TeaCatalog_checkList">
                      {CATALOG_TONIC_FILTER_TYPES.map(type => (
                        <label key={type} className="TeaCatalog_checkRow">
                          <input
                            type="checkbox"
                            checked={selectedTypes.includes(type)}
                            onChange={() => toggleType(type)}
                          />
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="TeaCatalog_filterSection">
                    <h2>Назначение</h2>
                    <div className="TeaCatalog_checkList">
                      {BENEFIT_TYPES.map(type => (
                        <label key={type} className="TeaCatalog_checkRow">
                          <input
                            type="checkbox"
                            checked={selectedBenefits.includes(type)}
                            onChange={() => toggleBenefit(type)}
                          />
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="TeaCatalog_filterSection">
                    <h2>Цена</h2>
                    <PriceBlock
                      from={draftPriceFrom}
                      to={draftPriceTo}
                      min={priceBounds.min}
                      max={priceBounds.max}
                      fromInput={draftFromInput}
                      toInput={draftToInput}
                      onFromInput={handleDraftFromInput}
                      onToInput={handleDraftToInput}
                      onFromChange={syncDraftFrom}
                      onToChange={syncDraftTo}
                      onCommit={commitPrice}
                    />
                  </div>

                  <div className="TeaCatalog_filterFooter">
                    <button type="button" className="TeaCatalog_reset" onClick={resetAllFilters}>
                      Сбросить
                    </button>
                    <button type="button" className="TeaCatalog_apply" onClick={() => setFiltersOpen(false)}>
                      Показать {filteredProducts.length}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {!loading && activeFilterCount > 0 && (
          <div className="TeaCatalog_tags">
            {selectedTypes.map(type => (
              <button key={type} type="button" className="TeaCatalog_tag" onClick={() => toggleType(type)}>
                {type}
              </button>
            ))}
            {selectedBenefits.map(type => (
              <button key={type} type="button" className="TeaCatalog_tag" onClick={() => toggleBenefit(type)}>
                {type}
              </button>
            ))}
            {(priceFrom !== priceBounds.min || priceTo !== priceBounds.max) && (
              <button
                type="button"
                className="TeaCatalog_tag"
                onClick={() => {
                  setDraftPriceFrom(priceBounds.min);
                  setDraftPriceTo(priceBounds.max);
                  setDraftFromInput(String(priceBounds.min));
                  setDraftToInput(String(priceBounds.max));
                  setPriceFrom(priceBounds.min);
                  setPriceTo(priceBounds.max);
                }}
              >
                {priceFrom.toLocaleString('ru-RU')} - {priceTo.toLocaleString('ru-RU')} ₽
              </button>
            )}
          </div>
        )}

        {loading && <div className="TeaCatalog_state">Загрузка товаров...</div>}
        {!loading && loadError && <div className="TeaCatalog_state TeaCatalog_state--error">{loadError}</div>}
        {!loading && !loadError && filteredProducts.length === 0 && (
          <div className="TeaCatalog_state">По текущим параметрам ничего не найдено.</div>
        )}

        {!loading && !loadError && filteredProducts.length > 0 && (
          <div className="TeaCatalog_grid">
            {filteredProducts.map(product => {
              const image = resolveImage(product.image);

              return (
                <button
                  key={product.id}
                  type="button"
                  className="TeaCatalog_card"
                  onClick={() => handleCardClick(product.id)}
                >
                  <div className="TeaCatalog_cardMedia">
                    {image ? (
                      <img
                        src={image}
                        alt={product.name || 'Чай'}
                        onError={event => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = SITE_IMAGES.placeholder;
                        }}
                      />
                    ) : (
                      <div className="TeaCatalog_cardPlaceholder" aria-hidden="true">
                        <span>{(product.name || 'Чай').slice(0, 1).toUpperCase()}</span>
                      </div>
                    )}
                  </div>

                  <div className="TeaCatalog_cardBody">
                    <div className="TeaCatalog_cardTopline">
                      <span>{product.type || 'Листовой чай'}</span>
                      <strong>{parsePriceValue(product).toLocaleString('ru-RU')} ₽</strong>
                    </div>
                    <h3>{product.name || 'Чайная позиция'}</h3>
                    <p>
                      {product.discription ||
                        product.description ||
                        'Спокойный профиль вкуса, чистая подача и понятный сценарий заваривания на каждый день.'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {selectedProduct && (
          <TypeOfTonicPopap product={selectedProduct} onClose={() => setSelectedProduct(null)} />
        )}
      </div>
    </section>
  );
}

export default TypeOfTonic;
