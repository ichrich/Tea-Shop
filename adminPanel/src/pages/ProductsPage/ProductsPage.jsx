import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../apiConfig';
import { apiRequest } from '../../utils/api';

import CategoryTabs from '../../components/CategoryTabs/CategoryTabs';
import ProductsTable from '../../components/ProductsTable/ProductsTable';
import ProductModal from '../../components/ProductModal/ProductModal';
import AddEditProductModal from '../../components/AddEditProductModal/AddEditProductModal';

import DownloadIcon from '../../assets/icons/download.png';
import PointerIcon from '../../assets/icons/pointer.png';
import DeleteIcon from '../../assets/icons/delete.png';
import GalochkaIcon from '../../assets/icons/BlackGalochka.png';
import Export from '../../assets/icons/export.png';
import Filter from '../../assets/icons/filter.png';
import CalendarIcon from '../../assets/icons/blackdate.png';

import ProductPhoto from '../../assets/images/ProductPhoto.jpg';
import './ProductsPage.css';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
const ProductsPage = () => {
    const [searchValue, setSearchValue] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchHistory, setSearchHistory] = useState([]);
    const [formFields, setFormFields] = useState({
      name: '',
      description: '',
      quantity: '',
      cost: '',
      price: '',
      category:'',
      type:'',
      catalogSection: ''
    });
    const [formCERF, setFormCERF] = useState([

    ]);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [category, setCategory] = useState('all');
    const [status, setStatus] = useState('all');
    const [dateFrom, setDateFrom] = useState('2025-09-16');
    const [dateTo, setDateTo] = useState('2025-09-25');
    const [priceMin, setPriceMin] = useState(2000);
    const [priceMax, setPriceMax] = useState(10000);

    const MIN_PRICE = 2000;
    const MAX_PRICE = 10000;

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const [images, setImages] = useState([]);
    const [cerf, setCERF] = useState([]);
    const [tonicTypes, setTonicTypes] = useState([{ id: 1 }]);
    const [benefitTypes, setBenefitTypes] = useState([{ id: 1 }]);
    const [features, setFeatures] = useState([{ id: 1, section: 'Раздел №1', }]);
    const [certs, setCerts] = useState([{ id: 1 }]);
    const [extraProducts, setExtraProducts] = useState([{ id: 1 }]);
    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId);
        setCurrentPage(1);
    };
    const [allProducts, setAllProducts] = useState([]);
    const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState(null);
    useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const res = await apiRequest('/api/adminProducts'); 
        if (!res.ok) {
          throw new Error(`Ошибка загрузки: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        const mapped = (Array.isArray(data) ? data : []).map((p) => ({
          ...p,
          image: p.image || ProductPhoto
        }));
        if (mounted) {
            const dateTimes = mapped
            .map((p) => (p.date ? new Date(p.date).getTime() : null))
            .filter((t) => t != null);
            if (dateTimes.length > 0) {
              const minDate = new Date(Math.min(...dateTimes)).toISOString().slice(0, 10);
              const maxDate = new Date(Math.max(...dateTimes)).toISOString().slice(0, 10);
              setDateFrom(minDate);
              setDateTo(maxDate);
            }
            const priceValues = mapped
            .map((p) => Number(p.price) || 0)
            .filter((v) => typeof v === 'number' && !Number.isNaN(v));
            if (priceValues.length > 0) {
              setPriceMin(Math.min(...priceValues));
              setPriceMax(Math.max(...priceValues));
            }
            setAllProducts(mapped);
            const uniqueCategories = Array.from(
                new Set((mapped || []).map((p) => p.category).filter(Boolean))
            );
            if (uniqueCategories.length > 0) {
            setCategories(uniqueCategories);
  }
        }
      } catch (err) {
        if (mounted) {
          setProductsError(err.message);
        }
      } finally {
        if (mounted) setLoadingProducts(false);
      }
    };

    fetchProducts();
    return () => {
      mounted = false;
    };
  }, []);

    const refetchProducts = async () => {
      try {
        const res = await apiRequest('/api/adminProducts');
        if (!res.ok) return;
        const data = await res.json();
        const mapped = (Array.isArray(data) ? data : []).map((p) => ({
          ...p,
          image: p.image || ProductPhoto
        }));
        setAllProducts(mapped);
      } catch (_) {}
    };

    const openAddModal = () => setIsAddModalOpen(true);
    const closeAddModal = () => setIsAddModalOpen(false);
        const openEditModal = (productId) => {
            const product = allProducts.find(p => p.id === productId);
            if (product) {
                setEditingProduct(product);
                setIsModalOpen(true);
            }
        };
    
        const closeModal = () => {
            setIsModalOpen(false);
            setEditingProduct(null);
        };
    const openFilters = () => setIsFiltersOpen(true);
    const closeFilters = () => setIsFiltersOpen(false);

    const addTonicType = () => {
        setTonicTypes(prev => [...prev, { id: crypto.randomUUID() }]);
    };

    const addBenefitType = () => {
        setBenefitTypes(prev => [...prev, { id: crypto.randomUUID() }]);
    };

    const handleImagesUpload = async(event) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;
        const newImages = files.map((file) => ({
            id: crypto.randomUUID(),
            url: URL.createObjectURL(file),
            file,
        }));

        setImages((prev) => [...prev, ...newImages].slice(0, 4));
    };
    const handleCERFUpload = async(event) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;
        const newImages = files.map((file) => ({
            id: crypto.randomUUID(),
            url: URL.createObjectURL(file),
            file,
        }));

        setCERF((prev) => [...prev, ...newImages].slice(0, 4));
    };
    const handleRemoveImage = (id) => {
        setCERF((prev) => prev.filter((img) => img.id !== id));
    };

    const addFeature = () => {
        setFeatures((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                section: `Раздел №${prev.length + 1}`,
            },
        ]);
    };

    const addCert = () => {
        setCerts((prev) => [...prev, { id: crypto.randomUUID() }]);
    };

    const addExtraProduct = () => {
        setExtraProducts((prev) => [...prev, { id: crypto.randomUUID() }]);
    };
    const onCategoryChange = (tabId) => {
        setCategory(tabId || 'all');
        setCurrentPage(1);
    };
    const formatDisplayDate = (iso) => {
        if (!iso) return '';
        const [year, month, day] = iso.split('-');
        return `${day}.${month}.${year.slice(2)}`;
    };

    const handleSearchChange = (e) => {
        setSearchValue(e.target.value);
    };
        const handleSaveProduct = async (productData, isEdit) => {
        await refetchProducts();
    };
    const handleSearchFocus = () => {
        setIsSearchFocused(true);
    };

    const handleSearchBlur = () => {
        setTimeout(() => setIsSearchFocused(false), 200);
    };

    const handleHistoryClick = (value) => {
        setSearchValue(value);
        setIsSearchFocused(false);
    };
    const handleProductPreview = (productId) => {
        const product = allProducts.find(p => p.id === productId);
        if (product) {
            const modalProduct = {
                ...product,
                price: `${product.price.toLocaleString('ru-RU')} ₽`
            };
            setSelectedProduct(modalProduct);
            setIsPreviewOpen(true);
        }
    };
    const tonicTypeOptions = React.useMemo(() => {
        const values = allProducts.map(p => p.category);
        return Array.from(new Set(values.filter(v => typeof v === 'string' && v.trim() !== '')));
    }, [allProducts]);

    const benefitOptions = React.useMemo(() => {
        const values = (allProducts || []).map(p => p.usefull);
        return Array.from(new Set(values.filter(v => typeof v === 'string' && v.trim() !== '')));
    }, [allProducts]);

    const closePreview = () => {
        setIsPreviewOpen(false);
        setSelectedProduct(null);
    };
    function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // data URL
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
async function handleSubmit() {
  try {
    const payload = { ...formFields,features };
    const imagesPayload = await Promise.all(
      images.map((img) => {
        if (!img.file) return null;
        return toBase64(img.file).then((dataUrl) => ({
          name: img.file.name,
          type: img.file.type,
          dataUrl,
        }));
      })
    );
    payload.images = imagesPayload.filter(Boolean);
    const CERFPayload = await Promise.all(
      cerf.map((img) => {
        if (!img.file) return null;
        return toBase64(img.file).then((dataUrl) => ({
          name: img.file.name,
          type: img.file.type,
          dataUrl,
        }));
      })
    );
    payload.cerfFile = CERFPayload.filter(Boolean);
    payload.cerf= certs;
    console.log(payload)
    const res = await apiRequest('/api/addProduct', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Ошибка отправки');
    }
    const data = await res.json();
    console.log('Успешно:', data);
    window.location.reload()
  } catch (err) {
    console.error('Ошибка отправки:', err);
    throw err;
  }
}


const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
const currentMonthLabel = `${currentYear}-${currentMonth}`;
const exportToCSV = (filename = `export_${currentMonthLabel}.csv`) => {
  const headers = [
    'id',
    'name',
    'productId',
    'category',
    'views',
    'price',
    'quantity',
    'active',
    'date',
    'status',
    'image'
  ];

  const rows = allProducts.map((p) => [
    p.id,
    p.name,
    p.productId,
    p.category,
    p.views,
    p.price,
    p.quantity,
    p.active,
    p.date,
    p.status,
    p.image
  ]);

  const escape = (val) => `"${String(val).replace(/"/g, '""')}"`;
  const csv = [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    navigator.clipboard.writeText(csv);
  }
};
function exportAsExcel() {
  const data = allProducts.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    quantity: p.quantity,
    date: p.date,
    views: p.views,
    status: p.status
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Products');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'products.xlsx';
  link.click();
}
async function exportAsPDF() {
    try {
      const jspdfMod = await import('jspdf');
      const jsPDF = jspdfMod.default ?? jspdfMod;
      await import('jspdf-autotable');
      const doc = new jsPDF();
      const cols = ['ID','Name','Category','Price','Quantity','Date','Views','Status'];
      const rows = allProducts.map(p => [
        p.id, p.name, p.category, p.price, p.quantity, p.date, p.views, p.status
      ]);
      if (typeof doc.autoTable === 'function') {
        doc.autoTable({ head: [cols], body: rows });
      } else {
        doc.text('Products', 14, 20);
        let y = 30;
        rows.forEach(r => {
          doc.text(r.join(' | '), 14, y);
          y += 6;
        });
      }
      doc.save('products.pdf');
    } catch (e) {
      console.warn('PDF export failed', e);
      alert(e);
    }
  }
    return (
        <div className="ProductsPage">
            <div className="ProductsPage_container">
                <main className="ProductsPage_main">
                    <div className="ProductsPage_content">
                        <div className="ProductsPage_header">
                            <h1 className="ProductsPage_title">Товары</h1>

                            <div className="ProductsPage_actions">
                                

                                <button className="ProductsPage_add" onClick={openAddModal}>
                                    <div className="ProductsPage_export_button">
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                                            <path
                                                d="M10 4V16M4 10H16"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <span>Добавить</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                        <CategoryTabs onCategoryChange={onCategoryChange} /> 
                        <div className="ProductsPage_controls">
                            <div className="ProductsPage_search-wrapper">
                                <div className="ProductsPage_search">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <circle cx="9" cy="9" r="6" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
                                        <path d="M14 14L17 17" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Поиск товара"
                                        className="ProductsPage_search_input"
                                        value={searchValue}
                                        onChange={handleSearchChange}
                                        onFocus={handleSearchFocus}
                                        onBlur={handleSearchBlur}
                                    />
                                </div>

                                {isSearchFocused && searchHistory.length > 0 && (
                                    <div className="ProductsPage_search-history">
                                        {searchHistory.map((item, index) => (
                                            <button
                                                key={index}
                                                className="ProductsPage_search-history-item"
                                                onClick={() => handleHistoryClick(item)}
                                            >
                                                {item}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="ProductsPage_filters-wrap">
                                <button className="ProductsPage_filters" onClick={openFilters}>
                                    Фильтры
                                    <img src={Filter} alt="" />
                                </button>

                                {isFiltersOpen && (
                                    <div className="FiltersDropdown">
                                        <div className="FiltersDropdown_header">
                                            <h2>Фильтры</h2>
                                            <button className="FiltersDropdown_close" onClick={closeFilters}>
                                                ✕
                                            </button>
                                        </div>

                                        <div className="FiltersDropdown_body">
                                            
                                            <div className="FiltersDropdown_group">
                                              <label>Категория</label>
                                              <div className="FiltersDropdown_select--wrapper">
                                                <div className="FiltersDropdown_select">
                                                  <span className="FiltersDropdown_selected-text">
                                                    {category}
                                                  </span>
                                                  <img src={GalochkaIcon} alt="" />
                                                </div>
                                                <select
                                                  value={category}
                                                  onChange={(e) => setCategory(e.target.value.toLowerCase())}
                                                  className="FiltersDropdown_native"
                                                >
                                                  <option value="all">Все</option>
                                                  {categories.map((cat) => (
                                                    <option key={cat} value={String(cat).toLowerCase()}>
                                                      {cat}
                                                    </option>
                                                  ))}
                                                </select>
                                              </div>
                                            </div>

                                            
                                            <div className="FiltersDropdown_group">
                                                <label>Статус</label>
                                                <div className="FiltersDropdown_select--wrapper">
                                                    <div className="FiltersDropdown_select">
                                                        <span className="FiltersDropdown_selected-text">
                                                            {status === 'all' ? 'Все' :
                                                                status === 'in_stock' ? 'В наличии' : 'Нет в наличии'}
                                                        </span>
                                                        <img src={GalochkaIcon} alt="" />
                                                    </div>
                                                    <select
                                                        value={status}
                                                        onChange={(e) => setStatus(e.target.value)}
                                                        className="FiltersDropdown_native"
                                                    >
                                                        <option value="all">Все</option>
                                                        <option value="in_stock">В наличии</option>
                                                        <option value="out_of_stock">Нет в наличии</option>
                                                    </select>
                                                </div>
                                            </div>

                                            
                                            <div className="FiltersDropdown_group">
                                                <label>Дата</label>
                                                <div className="FiltersDropdown_date-row">
                                                    <div
                                                        className="FiltersDropdown_date"
                                                        onClick={(e) => {
                                                            e.currentTarget.querySelector('input[type="date"]').showPicker();
                                                        }}
                                                    >
                                                        <img src={CalendarIcon} alt="" />
                                                        <span>{formatDisplayDate(dateFrom)}</span>
                                                        <img src={GalochkaIcon} alt="" />
                                                        <input
                                                            type="date"
                                                            value={dateFrom}
                                                            onChange={(e) => setDateFrom(e.target.value)}
                                                            className="FiltersDate_input"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>

                                                    <div
                                                        className="FiltersDropdown_date"
                                                        onClick={(e) => {
                                                            e.currentTarget.querySelector('input[type="date"]').showPicker();
                                                        }}
                                                    >
                                                        <img src={CalendarIcon} alt="" />
                                                        <span>{formatDisplayDate(dateTo)}</span>
                                                        <img src={GalochkaIcon} alt="" />
                                                        <input
                                                            type="date"
                                                            value={dateTo}
                                                            onChange={(e) => setDateTo(e.target.value)}
                                                            className="FiltersDate_input"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            
                                            <div className="FiltersDropdown_group">
                                                <label>Цена</label>

                                                <div className="FiltersDropdown_range">
                                                    <div className="FiltersDropdown_range-track">
                                                        <div
                                                            className="FiltersDropdown_range-track-active"
                                                            style={{
                                                                left: `${((priceMin - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100}%`,
                                                                right: `${100 - ((priceMax - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100}%`,
                                                            }}
                                                        />
                                                    </div>

                                                    <input
                                                        type="range"
                                                        min={MIN_PRICE}
                                                        max={MAX_PRICE}
                                                        value={priceMin}
                                                        onChange={(e) => {
                                                            const val = Math.min(Number(e.target.value), priceMax - 1);
                                                            setPriceMin(val);
                                                        }}
                                                        className="FiltersDropdown_thumb FiltersDropdown_thumb--min"
                                                    />

                                                    <input
                                                        type="range"
                                                        min={MIN_PRICE}
                                                        max={MAX_PRICE}
                                                        value={priceMax}
                                                        onChange={(e) => {
                                                            const val = Math.max(Number(e.target.value), priceMin + 1);
                                                            setPriceMax(val);
                                                        }}
                                                        className="FiltersDropdown_thumb FiltersDropdown_thumb--max"
                                                    />
                                                </div>

                                                <div className="FiltersDropdown_range-labels">
                                                    <span>{priceMin.toLocaleString('ru-RU')} ₽</span>
                                                    <span>{priceMax.toLocaleString('ru-RU')} ₽</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="FiltersDropdown_footer">
                                            <button className="FiltersDropdown_save" onClick={closeFilters}>
                                                Применить
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <ProductsTable
                            searchValue={searchValue}
                            category={category}
                            status={status}
                            dateFrom={dateFrom}
                            dateTo={dateTo}
                            priceMin={priceMin}
                            priceMax={priceMax}
                            onProductPreview={handleProductPreview}
                            allProducts={allProducts}
                            setAllProducts={setAllProducts}
                            onProductEdit={openEditModal}
                        />
                    </div>
                </main>
            </div>

            
            {isAddModalOpen && (
                <>
                    <div className="AddProductOverlay" onClick={closeAddModal} />

                    <aside className="AddProductPanel" onClick={(e) => e.stopPropagation()}>
                        <div className="AddProductPanel_header">
                            <h2>Добавить товар</h2>
                            <button className="AddProductPanel_close" onClick={closeAddModal}>
                                ✕
                            </button>
                        </div>

                        <div className="AddProductPanel_body">
                            <div className="AddProductPanel_grid">
                                <div className="AddProductPanel_col">
                                    <div className="AddProductPanel_group">
                                        <label>Название товара</label>
                                        <input type="text" placeholder="Название товара" className="field-input" onChange={(e) => setFormFields({ ...formFields, name: e.target.value })} />
                                    </div>

                                    <div className="AddProductPanel_group">
                                        <label>Описание</label>
                                        <textarea placeholder="Описание товара" className="field-textarea field-textarea--description" onChange={(e) => setFormFields({ ...formFields, description: e.target.value })} />
                                    </div>

                                    <div className="AddProductPanel_block">
                                        <p className="AddProductPanel_block_title">Характеристики</p>

                                        {features.map((feat, index) => (
                                            <React.Fragment key={feat.id}>
                                                <p className="AddProductPanel_subtitle">Раздел №{index + 1}</p>
                                                <div className="AddProductPanel_group">
                                                    <input type="text" placeholder="Заголовок" className="field-input" onChange={(e) => setFeatures(features.map((elem,key)=>index==key?elem={...elem,header:e.target.value}:elem))} />
                                                </div>
                                                <div className="AddProductPanel_group">
                                                    <input type="text" placeholder="Описание" className="field-input" onChange={(e) => setFeatures(features.map((elem,key)=>index==key?elem={...elem,description:e.target.value}:elem))}/>
                                                </div>
                                            </React.Fragment>
                                        ))}

                                        <button type="button" className="AddProductPanel_link" onClick={addFeature}>
                                            Добавить характеристику
                                        </button>
                                    </div>
                                </div>

                                <div className="AddProductPanel_col">
                                    <div className="AddProductPanel_block">
                                        <p className="AddProductPanel_block_title">Фото товара</p>

                                        <div className="AddProductPanel_group">
                                            <label className="AddProductPanel_upload AddProductPanel_upload--main">
                                                <input type="file" accept="image/*" multiple onChange={handleImagesUpload} className="AddProductPanel_upload_input" />
                                                <div className="AddProductPanel_upload_content">
                                                    <img src={DownloadIcon} alt="" />
                                                    <span>Перетащите фото или <button type="button">загрузите</button></span>
                                                </div>
                                            </label>
                                        </div>

                                        <div className="AddProductPanel_photos_row">
                                            {images.map((img) => (
                                                <div key={img.id} className="AddProductPanel_photo_small">
                                                    <img src={img.url} alt="" className="AddProductPanel_photo_img" />
                                                    <div className="AddProductPanel_photo_actions">
                                                        <button type="button" className="AddProductPanel_icon-btn" onClick={() => handleRemoveImage(img.id)}>
                                                            <img src={DeleteIcon} alt="Удалить" />
                                                        </button>
                                                        <button type="button" className="AddProductPanel_icon-btn">
                                                            <img src={PointerIcon} alt="Еще" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="AddProductPanel_inline">
                                        <div className="AddProductPanel_group">
                                            <label>Количество</label>
                                            <input type="text" placeholder="1 шт." className="field-input" onChange={(e) => setFormFields({ ...formFields, quantity: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="AddProductPanel_inline AddProductPanel_inline--2">
                                        <div className="AddProductPanel_group">
                                            <label>Себестоимость</label>
                                            <input type="text" placeholder="10 000 ₽" className="field-input" onChange={(e) => setFormFields({ ...formFields, cost: e.target.value })} />
                                        </div>
                                        <div className="AddProductPanel_group">
                                            <label>Цена</label>
                                            <input type="text" placeholder="20 000 ₽" className="field-input" onChange={(e) => setFormFields({ ...formFields, price: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="AddProductPanel_group">
                                        <label>Раздел каталога</label>
                                        <select className="field-input" onChange={(e) => setFormFields({ ...formFields, catalogSection: e.target.value })}>
                                            <option value={1}>Главная</option>
                                            <option value={2}>О нас</option>
                                            <option value={3}>Каталог</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="AddProductPanel_row">
                                <div className="AddProductPanel_block">
                                    <p className="AddProductPanel_block_title AddProductPanel_block_title--accent">Сертификаты</p>

                                    {certs.map((cert,index) => (
                                        <div className="AddProductPanel_group" key={cert.id}>
                                            <label>Заголовок</label>
                                            <input type="text" placeholder="Заголовок" className="field-input" onChange={(e) => setCerts(certs.map((elem,key)=>index==key?elem={...elem,header:e.target.value}:elem))}/>

                                            <label>Файл документа</label>
                                            <label className="AddProductPanel_upload AddProductPanel_upload--main">
                                                <input type="file" accept=".pdf,.jpg,.png,.doc,.docx" onChange={handleCERFUpload} className="AddProductPanel_upload_input" />
                                                <div className="AddProductPanel_upload_content">
                                                    <img src={DownloadIcon} alt="" />
                                                    <span>Перетащите файл или <button type="button">загрузите</button></span>
                                                </div>
                                            </label>
                                        </div>
                                    ))}

                                    <button type="button" className="AddProductPanel_link" onClick={addCert}>
                                        Добавить еще
                                    </button>
                                </div>

                                <div className="AddProductPanel_block">
                                    <p className="AddProductPanel_block_title AddProductPanel_block_title--accent">Дополнительные товары</p>

                                    {extraProducts.map((ep) => (
                                        <div className="AddProductPanel_group" key={ep.id}>
                                            <label>Выбрать товар</label>
                                            <button type="button" className="AddProductPanel_select-btn">
                                                Выбрать из каталога
                                            </button>
                                        </div>
                                    ))}

                                    <button type="button" className="AddProductPanel_link" onClick={addExtraProduct}>
                                        Добавить еще
                                    </button>
                                </div>
                            </div>

                            <div className="AddProductPanel_bottom-row">
                                <div className="AddProductPanel_group">
                                  <p className="AddProductPanel_block_title AddProductPanel_block_title--accent">Тип чая</p>
                                  <label>Тип чая</label>               
                                  {tonicTypes.map(item => (
                                    <select key={item.id} className="field-input"  onChange={(e) => setFormFields({ ...formFields, type: e.target.value })}>
                                      <option value="">Тип чая</option>
                                      {tonicTypeOptions.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                      ))}
                                    </select>
                                  ))}
                                </div>

                                <div className="AddProductPanel_group">
                                  <p className="AddProductPanel_block_title AddProductPanel_block_title--accent">Вид пользы</p>
                                  <label>Вид пользы</label>

                                  {benefitTypes.map(item => (
                                    <select key={item.id} className="field-input" onChange={(e) => setFormFields({ ...formFields, category: e.target.value })}>
                                      <option value="">Вид пользы</option>
                                      {benefitOptions.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                      ))}
                                    </select>
                                  ))}
                                </div>
                            </div>
                        </div>

                        <div className="AddProductPanel_footer">
                            <button className="AddProductPanel_save" onClick={handleSubmit}>Сохранить</button>
                            <button className="AddProductPanel_cancel" onClick={closeAddModal}>Отменить</button>
                        </div>
                    </aside>
                </>
            )}

            
            <ProductModal
                isOpen={isPreviewOpen}
                onClose={closePreview}
                product={selectedProduct}
            />
                        
            <AddEditProductModal
                isOpen={isModalOpen}
                onClose={closeModal}
                product={editingProduct}
                onSave={handleSaveProduct}
                allProducts={allProducts}
            />
        </div>
    );
};

export default ProductsPage;
