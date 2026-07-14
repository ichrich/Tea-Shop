import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Blog.css';

import { JOURNAL_IMAGES, SITE_IMAGES } from '../../../constants/siteImages.js';

import Pointer from '../../../assets/Image/Pointer.svg';
import Search from '../../../assets/Image/search.svg';
import FilterIcon from '../../../assets/Image/voronka.svg';
import WhiteGalochka from '../../../assets/Image/WhiteGalochka.svg';
import Breadcrumbs from '../../Breadcrumbs/Breadcrumbs.jsx';
import { CURATED_JOURNAL_ARTICLES } from '../../../data/journalContent.js';

const [blogImg1, blogImg2, blogImg3, blogImg4, blogImg5, blogImg6, blogImg7] = JOURNAL_IMAGES;
const blogHeroCoverDefault = SITE_IMAGES.collection;

const isProductionArticle = article => {
    const value = `${article?.title || ''}`.trim();
    if (value.length < 12) return false;
    return !/^(новая статья|название статьи|статья|тест|ыфв)/i.test(value);
};

export const Blog = ({
                         variant = 'default',
                         title = 'Блог',
                         showAllLink = true,
                         showSearchBar = false,
                         categories = [],
                         showSelects = false,
                         showBreadcrumbs = true,
                         heroHeading = 'Недавние публикации',
                         heroSubtext = 'Редакционные материалы о происхождении чая, сезонных урожаях, сервировке и спокойных сценариях повседневного ритуала.',
                         heroCoverFile,
                     }) => {
    const [showFiltersModal, setShowFiltersModal] = useState(false);
    const [showAllExtended, setShowAllExtended] = useState(false);
    const [activeCategory, setActiveCategory] = useState('Все');
    const [selectedSort, setSelectedSort] = useState('Сортировка');
    const [showSectionDropdown, setShowSectionDropdown] = useState(false);
    const [selectedSections, setSelectedSections] = useState([]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);
    const [selectedAuthors, setSelectedAuthors] = useState([]);
    const [showSortDropdownDesktop, setShowSortDropdownDesktop] = useState(false);
    const [showFiltersDropdownDesktop, setShowFiltersDropdownDesktop] = useState(false);
    const [showSectionBlockDesktop, setShowSectionBlockDesktop] = useState(true);
    const [showDateBlockDesktop, setShowDateBlockDesktop] = useState(true);
    const [showAuthorBlockDesktop, setShowAuthorBlockDesktop] = useState(true);
    const [blogTitle, setBlogTitle] = useState('Блог');
    const [articlesFromApi, setArticlesFromApi] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const mobileSearchInputRef = useRef(null);
    const now = useMemo(() => new Date(), []);
    const initialYear = now.getFullYear();
    const initialMonth = now.getMonth();
    const [currentMonth, setCurrentMonth] = useState(initialMonth);
    const [currentYear, setCurrentYear] = useState(initialYear);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const months = useMemo(
        () => ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
        [],
    );
    const [startMonth, setStartMonth] = useState(months[initialMonth]);
    const [startYear, setStartYear] = useState(String(initialYear));
    const [endMonth, setEndMonth] = useState(months[initialMonth]);
    const [endYear, setEndYear] = useState(String(initialYear));

    const navigate = useNavigate();

    const heroCoverUrl = useMemo(() => {
        if (heroCoverFile === undefined || heroCoverFile === null) {
            return blogHeroCoverDefault;
        }
        if (typeof heroCoverFile === 'string' && heroCoverFile.trim() === '') {
            return blogHeroCoverDefault;
        }
        if (typeof heroCoverFile === 'string') {
            const name = heroCoverFile.trim();
            if (/^(https?:)?\/\//i.test(name) || name.startsWith('/')) return name;
            return `/images/${name.replace(/^\/+/, '')}`;
        }
        return heroCoverFile;
    }, [heroCoverFile]);

    const sortOptions = useMemo(
        () => [
            'Сортировка',
            'Название А-Я',
            'Название Я-А',
            'Порядок сперва новые',
            'Порядок сперва старые',
            'Порядок по умолчанию',
        ],
        [],
    );

    const resolveImage = (value, fallback) => {
        if (!value || typeof value !== 'string') return fallback;
        const v = value.trim();
        if (!v) return fallback;
        if (/^(https?:)?\/\//i.test(v) || v.startsWith('data:') || v.startsWith('/images/') || v.startsWith('/src/')) {
            return v;
        }
        return `/images/${v.replace(/^\/+/, '')}`;
    };
    useEffect(() => {
        let cancelled = false;
        const loadBlog = async () => {
            setLoading(true);
            setLoadError(null);
            try {
                const res = await fetch('/api/blog/1');
                if (!res.ok) throw new Error(`Ошибка загрузки блога: ${res.status}`);
                const data = await res.json();
                if (cancelled) return;
                setBlogTitle(data.blog_title || title);
                const publishedArticles = Array.isArray(data.articles)
                    ? data.articles.filter(a => a.date && a.date.trim() !== '' && isProductionArticle(a))
                    : [];
                setArticlesFromApi(publishedArticles.length >= 3 ? publishedArticles : CURATED_JOURNAL_ARTICLES);
            } catch (err) {
                if (cancelled) return;
                console.error(err);
                setArticlesFromApi(CURATED_JOURNAL_ARTICLES);
                setLoadError(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        loadBlog();
        return () => { cancelled = true; };
    }, [title]);

    const handleArticleClick = (e, articleId) => {
        e.preventDefault();
        navigate(`/blog/${articleId}`);
    };

    const handleSectionToggle = (section) => {
        setSelectedSections(prev =>
            prev.includes(section)
                ? prev.filter(s => s !== section)
                : [...prev, section]
        );
    };

    const handleAuthorToggle = (author) => {
        setSelectedAuthors(prev =>
            prev.includes(author)
                ? prev.filter(a => a !== author)
                : [...prev, author]
        );
    };

    const updateMonthYearRange = (type, monthName, yearValue) => {
        const monthIndex = months.indexOf(monthName);
        const yearNum = Number(yearValue);
        if (monthIndex < 0 || Number.isNaN(yearNum)) return;

        if (type === 'start') {
            const from = new Date(yearNum, monthIndex, 1, 0, 0, 0, 0);
            setStartDate(from);
            if (!endDate || endDate < from) {
                const monthEnd = new Date(yearNum, monthIndex + 1, 0, 23, 59, 59, 999);
                setEndDate(monthEnd);
                setEndMonth(monthName);
                setEndYear(String(yearNum));
            }
            return;
        }

        const to = new Date(yearNum, monthIndex + 1, 0, 23, 59, 59, 999);
        setEndDate(to);
        if (!startDate || startDate > to) {
            const monthStart = new Date(yearNum, monthIndex, 1, 0, 0, 0, 0);
            setStartDate(monthStart);
            setStartMonth(monthName);
            setStartYear(String(yearNum));
        }
    };

    const parseArticleDate = (article) => {
        const raw = article?.date || article?.created_at || article?.createdAt || article?.published_at;
        if (!raw) return null;
        const d = new Date(raw);
        if (Number.isNaN(d.getTime()) && typeof raw === 'string') {
            const m = raw.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
            if (m) {
                const dd = Number(m[1]);
                const mm = Number(m[2]) - 1;
                const yyyy = Number(m[3]);
                const ddm = new Date(yyyy, mm, dd);
                if (!Number.isNaN(ddm.getTime())) return ddm;
            }
        }
        if (Number.isNaN(d.getTime())) return null;
        return d;
    };
    const getDaysInMonth = (month, year) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month, year) => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // Понедельник = 0
    };

    const clampToEndOfYear = (date) => {
        if (!date) return date;
        const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        return date > endOfYear ? endOfYear : date;
    };

    const handleDateClick = (day) => {
        const clickedDate = new Date(currentYear, currentMonth, day);
        const safeClicked = clampToEndOfYear(clickedDate);

        if (!startDate || (startDate && endDate)) {
            setStartDate(safeClicked);
            setEndDate(null);
        } else if (startDate && !endDate) {
            if (safeClicked > startDate) {
                setEndDate(safeClicked);
            } else {
                setEndDate(startDate);
                setStartDate(safeClicked);
            }
        }
    };

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const isDateInRange = (day) => {
        if (!startDate) return false;
        const date = new Date(currentYear, currentMonth, day);
        if (!endDate) return date.getTime() === startDate.getTime();
        return date >= startDate && date <= endDate;
    };

    const formatDate = (date) => {
        if (!date) return '';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${day}.${month}.${year}`;
    };

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="Blog_datepicker_day Blog_datepicker_day--empty"></div>);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const isInRange = isDateInRange(day);
            days.push(
                <button
                    key={`current-${day}`}
                    type="button"
                    className={`Blog_datepicker_day ${isInRange ? 'Blog_datepicker_day--selected' : ''}`}
                    onClick={() => handleDateClick(day)}
                >
                    {day}
                </button>
            );
        }
        const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
        const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

        for (let day = 1; day <= 5; day++) {
            const isInRange = isDateInRangeNextMonth(day, nextMonth, nextYear);
            days.push(
                <button
                    key={`next-${day}`}
                    type="button"
                    className={`Blog_datepicker_day Blog_datepicker_day--next-month ${isInRange ? 'Blog_datepicker_day--selected' : ''}`}
                    onClick={() => handleDateClickNextMonth(day, nextMonth, nextYear)}
                >
                    {day}
                </button>
            );
        }

        return days;
    };

    const isDateInRangeNextMonth = (day, month, year) => {
        if (!startDate) return false;
        const date = new Date(year, month, day);
        if (!endDate) return date.getTime() === startDate.getTime();
        return date >= startDate && date <= endDate;
    };

    const handleDateClickNextMonth = (day, month, year) => {
        const clickedDate = new Date(year, month, day);
        const safeClicked = clampToEndOfYear(clickedDate);

        if (!startDate || (startDate && endDate)) {
            setStartDate(safeClicked);
            setEndDate(null);
        } else if (startDate && !endDate) {
            if (safeClicked > startDate) {
                setEndDate(safeClicked);
            } else {
                setEndDate(startDate);
                setStartDate(safeClicked);
            }
        }
    };
    const filteredArticles = useMemo(() => {
        let list = Array.isArray(articlesFromApi) ? [...articlesFromApi] : [];
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            list = list.filter(article => {
                const t = (article.title || '').toLowerCase();
                const e = (article.excerpt || '').toLowerCase();
                const c = ((article.category || article.section || '') + '').toLowerCase();
                return t.includes(query) || e.includes(query) || c.includes(query);
            });
        }
        if (selectedSections.length > 0) {
            const set = new Set(selectedSections.map(s => (s || '').toLowerCase()));
            list = list.filter(a => {
                const sec = ((a.category || a.section || '') + '').toLowerCase().trim();
                return sec && set.has(sec);
            });
        }
        if (selectedAuthors.length > 0) {
            const set = new Set(selectedAuthors.map(s => (s || '').toLowerCase()));
            list = list.filter(a => {
                const author = ((a.author || '') + '').toLowerCase().trim();
                return author && set.has(author);
            });
        }
        if (startDate) {
            const from = new Date(startDate);
            from.setHours(0, 0, 0, 0);
            const to = endDate ? new Date(endDate) : new Date(startDate);
            to.setHours(23, 59, 59, 999);
            list = list.filter(a => {
                const d = parseArticleDate(a);
                if (!d) return false;
                return d >= from && d <= to;
            });
        }
        const sortMode = selectedSort || 'Сортировка';
        if (sortMode === 'Название Я-А') {
            list.sort((a, b) => (b.title || '').localeCompare(a.title || '', 'ru'));
        } else if (sortMode === 'Название А-Я') {
            list.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'ru'));
        } else if (sortMode === 'Порядок сперва старые') {
            list.sort((a, b) => {
                const da = parseArticleDate(a)?.getTime() || 0;
                const db = parseArticleDate(b)?.getTime() || 0;
                return da - db;
            });
        } else {
            list.sort((a, b) => {
                const da = parseArticleDate(a)?.getTime() || 0;
                const db = parseArticleDate(b)?.getTime() || 0;
                return db - da;
            });
        }

        return list;
    }, [articlesFromApi, searchQuery, selectedSections, selectedAuthors, startDate, endDate, selectedSort]);

    const hasFilteredResults = filteredArticles.length > 0;

    useEffect(() => {
        if (loading || loadError) return;
        if (hasFilteredResults) return;
        setShowSortDropdownDesktop(false);
        setShowFiltersDropdownDesktop(false);
        setShowFiltersModal(false);
        setShowSectionDropdown(false);
        setShowDatePicker(false);
        setShowAuthorDropdown(false);
        setMobileSearchOpen(false);
    }, [hasFilteredResults, loading, loadError]);

    useEffect(() => {
        if (!mobileSearchOpen) return;
        window.setTimeout(() => mobileSearchInputRef.current?.focus(), 0);
    }, [mobileSearchOpen]);
    const mainArticle = filteredArticles[0]
        ? {
              ...filteredArticles[0],
              image: resolveImage(filteredArticles[0].image, blogImg1),
          }
        : {
              id: 1,
              title: 'Статья',
              tag: '#текст',
              image: blogImg1,
          };
    const articles = filteredArticles.slice(1).map((a, idx) => ({
        ...a,
        image: resolveImage(a.image, [blogImg2, blogImg3, blogImg4, blogImg5, blogImg6, blogImg7][idx] || blogImg2),
    }));

    const extendedArticles = filteredArticles.map((a, idx) => ({
        ...a,
        image: resolveImage(a.image, [blogImg1, blogImg2, blogImg3, blogImg4, blogImg5, blogImg6, blogImg7][idx] || blogImg1),
    }));
    const visibleExtendedArticles = showAllExtended ? extendedArticles : extendedArticles.slice(0, 8);

    const sections = Array.from(
        new Set(
            (Array.isArray(articlesFromApi) ? articlesFromApi : [])
                .map((a) => (a.category || a.section || '').toString().trim())
                .filter(Boolean),
        ),
    );
    const authors = Array.from(
        new Set(
            (Array.isArray(articlesFromApi) ? articlesFromApi : [])
                .map((a) => (a.author || a.author_name || '').toString().trim())
                .filter(Boolean),
        ),
    );
    const years = useMemo(() => {
        const cur = now.getFullYear();
        const start = 2022;
        const out = [];
        for (let y = cur; y >= start; y--) out.push(String(y));
        return out;
    }, [now]);

    return (
        <section className={`Blog_section Blog_section--${variant}`}>
            <div className="Blog_container container">
                {variant === 'extended' && showSelects ? (
                    <header className="Blog_extended_header">
                        {showBreadcrumbs && (
                            <div className="Blog_extended_breadcrumbs">
                                <Breadcrumbs />
                            </div>
                        )}
                        <div
                            className="Blog_hero"
                            style={{ backgroundImage: `url(${heroCoverUrl})` }}
                        >
                            <div className="Blog_hero_overlay" aria-hidden />
                            <div className="Blog_hero_content">
                                <h1 className="Blog_hero_title">{heroHeading}</h1>
                                <hr className="Blog_hero_dash" />
                                <p className="Blog_hero_subtitle">{heroSubtext}</p>
                            </div>
                        </div>
                    </header>
                ) : (
                    showBreadcrumbs && <Breadcrumbs />
                )}

                
                {variant === 'default' && (
                    <div className="Blog_header">
                        <h2 className="Blog_title">{blogTitle}</h2>
                        {showAllLink && (
                            <a href="/blog" className="Blog_link">
                                ВСЕ СТАТЬИ
                                <img src={Pointer} alt="" />
                            </a>
                        )}
                    </div>
                )}

                
                {variant === 'extended' && showSelects && (
                    <>
                        <div className="Blog_filters_strip">
                            <div className="Blog_filters_strip_inner container">
                            <div className="Blog_filters Blog_filters--bar">
                            <div className={`Blog_filters_left ${mobileSearchOpen ? 'Blog_filters_left--hidden_mobile' : ''}`}>
                                <div className="Blog_filter_panel Blog_filter_panel--sort">
                                    <button
                                        className={`Blog_filter_panel_trigger ${showSortDropdownDesktop ? 'active' : ''}`}
                                        onClick={() => {
                                            setShowSortDropdownDesktop(!showSortDropdownDesktop);
                                            setShowFiltersDropdownDesktop(false);
                                        }}
                                        type="button"
                                    >
                                        <span>Сортировка</span>
                                        <img src={WhiteGalochka} alt="" className="Blog_filter_panel_arrow" />
                                    </button>

                                    {showSortDropdownDesktop && (
                                        <div className="Blog_filter_panel_menu">
                                            {sortOptions.map((option) => (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    className={`Blog_filter_check_item ${selectedSort === option ? 'active' : ''}`}
                                                    onClick={() => {
                                                        setSelectedSort(option);
                                                        setShowSortDropdownDesktop(false);
                                                    }}
                                                >
                                                    <span className="Blog_filter_fake_checkbox" />
                                                    <span>{option}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                
                                <button
                                    className="Blog_filters_btn"
                                    onClick={() => setShowFiltersModal(!showFiltersModal)}
                                    type="button"
                                >
                                    Фильтры
                                    <img src={FilterIcon} alt="" />
                                </button>

                                <div className="Blog_filter_panel Blog_filter_panel--filters">
                                    <button
                                        className={`Blog_filter_panel_trigger ${showFiltersDropdownDesktop ? 'active' : ''}`}
                                        onClick={() => {
                                            setShowFiltersDropdownDesktop(!showFiltersDropdownDesktop);
                                            setShowSortDropdownDesktop(false);
                                        }}
                                        type="button"
                                    >
                                        <span>Фильтры</span>
                                        <img src={WhiteGalochka} alt="" className="Blog_filter_panel_arrow" />
                                    </button>

                                    {showFiltersDropdownDesktop && (
                                        <div className="Blog_filter_panel_menu Blog_filter_panel_menu--filters">
                                            <div className="Blog_filter_section">
                                                <button className="Blog_filter_section_head" type="button" onClick={() => setShowSectionBlockDesktop(!showSectionBlockDesktop)}>
                                                    <span>Разделы</span>
                                                    <span className={`Blog_filter_minus ${showSectionBlockDesktop ? 'open' : ''}`} />
                                                </button>
                                                {showSectionBlockDesktop && (
                                                    <div className="Blog_filter_section_body">
                                                        {sections.length > 0 ? sections.map((section) => (
                                                            <label key={section} className="Blog_dropdown_item">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedSections.includes(section)}
                                                                    onChange={() => handleSectionToggle(section)}
                                                                />
                                                                <span>{section}</span>
                                                            </label>
                                                        )) : (
                                                            <div className="Blog_dropdown_item"><span>Нет разделов</span></div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="Blog_filter_section">
                                                <button className="Blog_filter_section_head" type="button" onClick={() => setShowDateBlockDesktop(!showDateBlockDesktop)}>
                                                    <span>Дата публикации</span>
                                                    <span className={`Blog_filter_minus ${showDateBlockDesktop ? 'open' : ''}`} />
                                                </button>
                                                {showDateBlockDesktop && (
                                                    <div className="Blog_filter_section_body Blog_filter_section_body--dates">
                                                        <div className="Blog_filter_month_row">
                                                            <span>С</span>
                                                            <select
                                                                className="Blog_filter_inline_select"
                                                                value={startMonth}
                                                                onChange={(e) => {
                                                                    setStartMonth(e.target.value);
                                                                    updateMonthYearRange('start', e.target.value, startYear);
                                                                }}
                                                            >
                                                                {months.map((month) => <option key={month} value={month}>{month}</option>)}
                                                            </select>
                                                            <select
                                                                className="Blog_filter_inline_select"
                                                                value={startYear}
                                                                onChange={(e) => {
                                                                    setStartYear(e.target.value);
                                                                    updateMonthYearRange('start', startMonth, e.target.value);
                                                                }}
                                                            >
                                                                {years.map((year) => <option key={year} value={year}>{year}</option>)}
                                                            </select>
                                                        </div>
                                                        <div className="Blog_filter_month_row">
                                                            <span>По</span>
                                                            <select
                                                                className="Blog_filter_inline_select"
                                                                value={endMonth}
                                                                onChange={(e) => {
                                                                    setEndMonth(e.target.value);
                                                                    updateMonthYearRange('end', e.target.value, endYear);
                                                                }}
                                                            >
                                                                {months.map((month) => <option key={month} value={month}>{month}</option>)}
                                                            </select>
                                                            <select
                                                                className="Blog_filter_inline_select"
                                                                value={endYear}
                                                                onChange={(e) => {
                                                                    setEndYear(e.target.value);
                                                                    updateMonthYearRange('end', endMonth, e.target.value);
                                                                }}
                                                            >
                                                                {years.map((year) => <option key={year} value={year}>{year}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="Blog_filter_section">
                                                <button className="Blog_filter_section_head" type="button" onClick={() => setShowAuthorBlockDesktop(!showAuthorBlockDesktop)}>
                                                    <span>Автор</span>
                                                    <span className={`Blog_filter_minus ${showAuthorBlockDesktop ? 'open' : ''}`} />
                                                </button>
                                                {showAuthorBlockDesktop && (
                                                    <div className="Blog_filter_section_body">
                                                        {authors.map((author) => (
                                                            <label key={author} className="Blog_dropdown_item">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedAuthors.includes(author)}
                                                                    onChange={() => handleAuthorToggle(author)}
                                                                />
                                                                <span>{author}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div> 

                            
                            {showSearchBar && (
                                <div className={`Blog_search Blog_search--collapsible ${mobileSearchOpen ? 'open' : ''}`}>
                                    <input
                                        ref={mobileSearchInputRef}
                                        type="text"
                                        placeholder="Найти"
                                        className="Blog_search_input"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="Blog_search_icon_btn"
                                        aria-label={mobileSearchOpen ? 'Закрыть поиск' : 'Открыть поиск'}
                                        onClick={() => setMobileSearchOpen((v) => !v)}
                                    >
                                        {mobileSearchOpen ? (
                                            <span className="Blog_search_close_icon" aria-hidden />
                                        ) : (
                                            <img src={Search} alt="" className="Blog_search_icon" />
                                        )}
                                    </button>
                                </div>
                            )}
                            </div>
                            </div>
                        </div>

                        {!loading && !loadError && !hasFilteredResults && (
                            <div className="Blog_empty_state" role="status" aria-live="polite">
                                Статьи под данной фильтрации не существует. Попробуйте другую фильтрацию
                            </div>
                        )}

                        
                        {showFiltersModal && (
                            <div className="Blog_filters_mobile_menu">
                                
                                <div className="Blog_filters_mobile_item">
                                    <div className="Blog_filters_mobile_header">
                                        <span>РАЗДЕЛ</span>
                                        <button
                                            className="Blog_filters_mobile_toggle"
                                            onClick={() => setShowSectionDropdown(!showSectionDropdown)}
                                            type="button"
                                        >
                                            <span className={showSectionDropdown ? 'active' : ''}></span>
                                        </button>
                                    </div>
                                    {showSectionDropdown && (
                                        <div className="Blog_filters_mobile_submenu">
                                            {sections.map((section) => (
                                                <label key={section} className="Blog_dropdown_item">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedSections.includes(section)}
                                                        onChange={() => handleSectionToggle(section)}
                                                    />
                                                    <span>{section}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                
                                <div className="Blog_filters_mobile_item">
                                    <div className="Blog_filters_mobile_header">
                                        <span>ДАТА ПУБЛИКАЦИИ</span>
                                        <button
                                            className="Blog_filters_mobile_toggle"
                                            onClick={() => setShowDatePicker(!showDatePicker)}
                                            type="button"
                                        >
                                            <span className={showDatePicker ? 'active' : ''}></span>
                                        </button>
                                    </div>
                                    {showDatePicker && (
                                        <div className="Blog_filters_mobile_submenu">
                                            <div className="Blog_datepicker">
                                                <div className="Blog_datepicker_header">
                                                    
                                                    <div className="Blog_datepicker_range">
                                                        <span className="Blog_datepicker_label">С</span>
                                                        <div className="Blog_datepicker_selects_group">
                                                            <div className="Blog_datepicker_month_wrapper">
                                                                <select
                                                                    className="Blog_datepicker_month_select"
                                                                    value={months[currentMonth]}
                                                                    onChange={(e) => {
                                                                        const monthIndex = months.indexOf(e.target.value);
                                                                        setCurrentMonth(monthIndex);
                                                                        setStartMonth(e.target.value);
                                                                    }}
                                                                >
                                                                    {months.map(month => (
                                                                        <option key={month} value={month}>{month}</option>
                                                                    ))}
                                                                </select>
                                                                <img src={WhiteGalochka} alt="" className="Blog_datepicker_icon" />
                                                            </div>
                                                            <div className="Blog_datepicker_year_wrapper">
                                                                <select
                                                                    className="Blog_datepicker_year_select"
                                                                    value={currentYear}
                                                                    onChange={(e) => {
                                                                        const year = parseInt(e.target.value);
                                                                        setCurrentYear(year);
                                                                        setStartYear(e.target.value);
                                                                    }}
                                                                >
                                                                    {years.map(year => (
                                                                        <option key={year} value={year}>{year}</option>
                                                                    ))}
                                                                </select>
                                                                <img src={WhiteGalochka} alt="" className="Blog_datepicker_icon" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    
                                                    <div className="Blog_datepicker_range">
                                                        <span className="Blog_datepicker_label">По</span>
                                                        <div className="Blog_datepicker_selects_group">
                                                            <div className="Blog_datepicker_month_wrapper">
                                                                <select
                                                                    className="Blog_datepicker_month_select"
                                                                    value={endMonth}
                                                                    onChange={(e) => setEndMonth(e.target.value)}
                                                                >
                                                                    {months.map(month => (
                                                                        <option key={month} value={month}>{month}</option>
                                                                    ))}
                                                                </select>
                                                                <img src={WhiteGalochka} alt="" className="Blog_datepicker_icon" />
                                                            </div>
                                                            <div className="Blog_datepicker_year_wrapper">
                                                                <select
                                                                    className="Blog_datepicker_year_select"
                                                                    value={endYear}
                                                                    onChange={(e) => setEndYear(e.target.value)}
                                                                >
                                                                    {years.map(year => (
                                                                        <option key={year} value={year}>{year}</option>
                                                                    ))}
                                                                </select>
                                                                <img src={WhiteGalochka} alt="" className="Blog_datepicker_icon" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                
                                                <div className="Blog_datepicker_calendar_single">
                                                    <div className="Blog_datepicker_weekdays">
                                                        <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div>
                                                        <div>Пт</div><div>Сб</div><div>Вс</div>
                                                    </div>
                                                    <div className="Blog_datepicker_days">
                                                        {renderCalendarDays()}
                                                    </div>
                                                </div>

                                                
                                                <div className="Blog_datepicker_footer">
                                                    <button
                                                        type="button"
                                                        className="Blog_datepicker_nav Blog_datepicker_nav--prev"
                                                        onClick={handlePrevMonth}
                                                    >
                                                        <img src={WhiteGalochka} alt="Предыдущий месяц" />
                                                    </button>
                                                    <span className="Blog_datepicker_range_display">
                                                        {startDate && endDate ? (
                                                            <>
                                                                <span>С {formatDate(startDate)}</span>
                                                                <span className="Blog_datepicker_range_separator">по</span>
                                                                <span>{formatDate(endDate)}</span>
                                                            </>
                                                        ) : startDate ? (
                                                            `С ${formatDate(startDate)}`
                                                        ) : (
                                                            'Выберите диапазон'
                                                        )}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className="Blog_datepicker_nav Blog_datepicker_nav--next"
                                                        onClick={handleNextMonth}
                                                    >
                                                        <img src={WhiteGalochka} alt="Следующий месяц" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                
                                <div className="Blog_filters_mobile_item">
                                    <div className="Blog_filters_mobile_header">
                                        <span>АВТОР</span>
                                        <button
                                            className="Blog_filters_mobile_toggle"
                                            onClick={() => setShowAuthorDropdown(!showAuthorDropdown)}
                                            type="button"
                                        >
                                            <span className={showAuthorDropdown ? 'active' : ''}></span>
                                        </button>
                                    </div>
                                    {showAuthorDropdown && (
                                        <div className="Blog_filters_mobile_submenu">
                                            {authors.map((author) => (
                                                <label key={author} className="Blog_dropdown_item">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedAuthors.includes(author)}
                                                        onChange={() => handleAuthorToggle(author)}
                                                    />
                                                    <span>{author}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}

                
                {variant === 'extended' && categories.length > 0 && !showSelects && (
                    <div className="Blog_categories">
                        {categories.map((category) => (
                            <button
                                key={category}
                                className={`Blog_category_btn ${
                                    activeCategory === category ? 'active' : ''
                                }`}
                                onClick={() => setActiveCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                )}

                
                {variant === 'default' && (
                    <>
                        <div className="Blog_grid Blog_grid--chaotic">
                            <div className="Blog_card_wrapper Blog_card_wrapper--1">
                                <a href={`/blog/${mainArticle.id}`} className="Blog_card Blog_card--1" onClick={(e) => handleArticleClick(e, mainArticle.id)}>
                                    <div className="Blog_card_image_wrapper">
                                        <img src={mainArticle.image} alt={mainArticle.title} className="Blog_card_image" />
                                    </div>
                                    <div className="Blog_card_overlay">
                                        <span className="Blog_card_tag_center">Чайный журнал</span>
                                        <button className="Blog_card_btn_center" type="button">
                                            читать статью <img src={Pointer} alt="" />
                                        </button>
                                    </div>
                                </a>
                                <h3 className="Blog_card_title_external">{mainArticle.title || 'Как читать коллекцию по вкусовым сценариям'}</h3>
                            </div>

                            {articles.map((article, index) => (
                                <div key={article.id} className={`Blog_card_wrapper Blog_card_wrapper--${index + 2}`}>
                                    <a href={`/blog/${article.id}`} className={`Blog_card Blog_card--${index + 2}`} onClick={(e) => handleArticleClick(e, article.id)}>
                                        <div className="Blog_card_image_wrapper">
                                            <img src={article.image} alt={article.title} className="Blog_card_image" />
                                        </div>
                                        <div className="Blog_card_overlay">
                                            <span className="Blog_card_tag_center">{article.category || 'Чайный журнал'}</span>
                                            <button className="Blog_card_btn_center" type="button">
                                                читать статью <img src={Pointer} alt="" />
                                            </button>
                                        </div>
                                    </a>
                                    <h3 className="Blog_card_title_external">{article.title || 'Сезонные подборки и новые урожаи'}</h3>
                                </div>
                            ))}
                        </div>

                        <div className="Blog_grid Blog_grid--default">
                            <a href={`/blog/${mainArticle.id}`} className="Blog_card Blog_card_large" onClick={(e) => handleArticleClick(e, mainArticle.id)}>
                                <div className="Blog_card_image_wrapper">
                                    <img src={mainArticle.image} alt={mainArticle.title} className="Blog_card_image" />
                                </div>
                                <div className="Blog_card_content">
                                    <h3 className="Blog_card_title">{mainArticle.title}</h3>
                                </div>
                            </a>

                            {articles.map((article) => (
                                <a key={article.id} href={`/blog/${article.id}`} className="Blog_card Blog_card_small" onClick={(e) => handleArticleClick(e, article.id)}>
                                    <div className="Blog_card_image_wrapper">
                                        <img src={article.image} alt={article.title} className="Blog_card_image" />
                                    </div>
                                    <div className="Blog_card_content">
                                        <h3 className="Blog_card_title">{article.title}</h3>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </>
                )}

                
                {variant === 'extended' && showSelects && (
                    <>
                        {hasFilteredResults && (
                            <div className="Blog_grid Blog_grid--extended-selects">
                                {visibleExtendedArticles.map((article, index) => (
                                    <div key={article.id} className={`Blog_card_wrapper Blog_card_wrapper--ext-${index + 1}`}>
                                        <a href={`/blog/${article.id}`} className={`Blog_card Blog_card--ext-${index + 1}`} onClick={(e) => handleArticleClick(e, article.id)}>
                                            <div className="Blog_card_image_wrapper">
                                                <img src={article.image} alt={article.title} className="Blog_card_image" />
                                            </div>
                                            <div className="Blog_card_overlay">
                                                <span className="Blog_card_tag_center">Чайный журнал</span>
                                                <button className="Blog_card_btn_center" type="button">
                                                    читать статью <img src={Pointer} alt="" />
                                                </button>
                                            </div>
                                        </a>
                                        <h3 className="Blog_card_title_external">{article.title}</h3>
                                    </div>
                                ))}
                            </div>
                        )}
                        {extendedArticles.length > 8 ? (
                            <button
                                className="Blog_extended_toggle"
                                type="button"
                                onClick={() => setShowAllExtended(value => !value)}
                            >
                                {showAllExtended ? 'Скрыть часть статей' : `Показать ещё ${extendedArticles.length - 8}`}
                            </button>
                        ) : null}
                    </>
                )}

                
                {variant === 'extended' && !showSelects && (
                    <>
                        <div className="Blog_grid Blog_grid--default">
                            <a href={`/blog/${mainArticle.id}`} className="Blog_card Blog_card_large" onClick={(e) => handleArticleClick(e, mainArticle.id)}>
                                <div className="Blog_card_content">
                                    <span className="Blog_card_tag">{mainArticle.tag}</span>
                                    <h3 className="Blog_card_title">{mainArticle.title}</h3>
                                </div>
                                <div className="Blog_card_image_wrapper">
                                    <img src={mainArticle.image} alt={mainArticle.title} className="Blog_card_image" />
                                </div>
                            </a>

                            {articles.map((article) => (
                                <a key={article.id} href={`/blog/${article.id}`} className="Blog_card Blog_card_small" onClick={(e) => handleArticleClick(e, article.id)}>
                                    <div className="Blog_card_content">
                                        <span className="Blog_card_tag">{article.tag}</span>
                                        <h3 className="Blog_card_title">{article.title}</h3>
                                    </div>
                                    <div className="Blog_card_image_wrapper">
                                        <img src={article.image} alt={article.title} className="Blog_card_image" />
                                    </div>
                                </a>
                            ))}
                        </div>
                    </>
                )}

                
            </div>
        </section>
    );
};
