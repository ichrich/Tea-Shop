import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../../apiConfig';
import { apiRequest } from '../../utils/api';
import DownloadIcon from '../../assets/icons/download.png';
import PointerIcon from '../../assets/icons/pointer.svg';
import DeleteIcon from '../../assets/icons/delete.png';
import './AddEditProductModal.css';
import PhotoLibraryModal from '../PhotoLibraryModal/PhotoLibraryModal.jsx';
import PlaceholderImg from '../../assets/images/placeholder.jpg';


const AddEditProductModal = ({ isOpen, onClose, product = null, onSave,allProducts }) => {
    const isEditMode = !!product;
    const imageInputRef = useRef(null);
    const [isPhotoLibraryOpen, setIsPhotoLibraryOpen] = useState(false);
    const [uploadTargetIndex, setUploadTargetIndex] = useState(null);
    const [isMobileLayout, setIsMobileLayout] = useState(false);
const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: '',
    costPrice: '',
    price: '',
    category:'',
    type:'',
    catalogSection: ''
});

const [Char, setChar] = useState([]);
const [CERF,setCERF] = useState([]);
const [cerf, setCERFIMG] = useState([]);
const [images, setImages] = useState([]);
const [tonicTypes, setTonicTypes] = useState([{ id: 1, value: '' }]);
const [benefitTypes, setBenefitTypes] = useState([{ id: 1, value: '' }]);
const [features, setFeatures] = useState([{ id: 1, title: '', description: '' }]);
const [certs, setCerts] = useState([{ id: 1, title: '', file: null }]);
const [extraProducts, setExtraProducts] = useState([{ id: 1, productId: null }]);
const categoryOptions = React.useMemo(() => {
    const base = [
        { value: 'Главная', label: 'Главная' },
        { value: 'О нас', label: 'О нас' },
        { value: 'Каталог', label: 'Каталог' },
    ];
    if (isEditMode && product?.category && !base.find(b => b.value === product.category)) {
        base.unshift({ value: product.category, label: product.category });
    }
    return base;
}, [isEditMode, product?.category]);
useEffect(() => {
    if (isEditMode && product) {
        setFormData({
            name: product.name || '',
            description: product.description || '',
            quantity: product.quantity || '',
            costPrice: product.costPrice || '',
            price: product.price || '',
            category: product.category || ''
        });
        if (product.images) {
            setImages(product.images);
        }

        console.log('Editing product:', product);
    } else {
        setFormData({
            name: '',
            description: '',
            quantity: '',
            costPrice: '',
            price: '',
            category: ''
        });
        setImages([]);
        setTonicTypes([{ id: 1, value: '' }]);
        setBenefitTypes([{ id: 1, value: '' }]);
        setFeatures([{ id: 1, title: '', description: '' }]);
        setCerts([{ id: 1, title: '', file: null }]);
        setExtraProducts([{ id: 1, productId: null }]);
    }
}, [isEditMode, product]);
useEffect(() => {
        let canceled = false;
        apiRequest('/api/characteristic/').then(async (r) => {
            if (canceled) return;
            if (!r.ok) { setChar([]); return; }
            const data = await r.json();
            setChar(Array.isArray(data) ? data : []);
        });
        return () => { canceled = true; };
    }, []);

    useEffect(() => {
        let canceled = false;
        apiRequest('/api/cerf').then(async (r) => {
            if (canceled) return;
            if (!r.ok) { setCERF([]); return; }
            const data = await r.json();
            setCERF(Array.isArray(data) ? data : []);
        });
        return () => { canceled = true; };
    }, []);
const handleInputChange = (field, value) => {
    setFormData(prev => ({
        ...prev,
        [field]: value
    }));
};
const handleFeatureChange = (id, field, value) => {
    setFeatures(prev => prev.map(feat =>
        feat.id === id ? { ...feat, [field]: value } : feat
    ));
};

const addFeature = () => {
    setFeatures((prev) => [...prev, { id: crypto.randomUUID(), title: '', description: '' }]);
};
const handleTonicTypeChange = (id, value) => {
    setTonicTypes(prev => prev.map(item =>
        item.id === id ? { ...item, value } : item
    ));
};

const addTonicType = () => {
    setTonicTypes((prev) => [...prev, { id: crypto.randomUUID(), value: '' }]);
};
const handleBenefitTypeChange = (id, value) => {
    setBenefitTypes(prev => prev.map(item =>
        item.id === id ? { ...item, value } : item
    ));
};

const addBenefitType = () => {
    setBenefitTypes((prev) => [...prev, { id: crypto.randomUUID(), value: '' }]);
};
const handleCertChange = (id, field, value) => {
    setCerts(prev => prev.map(cert =>
        cert.id === id ? { ...cert, [field]: value } : cert
    ));
};

const addCert = () => {
    setCerts((prev) => [...prev, { id: crypto.randomUUID(), title: '', file: null }]);
};
const addExtraProduct = () => {
    setExtraProducts((prev) => [...prev, { id: crypto.randomUUID(), productId: null }]);
};

useEffect(() => {
    if (!isEditMode || !product) return;
    if (Char.length && CERF.length) {
    const feats = Char.filter(c => c.product_id === product.id).map(c => ({
      id: c.id,
      name: c.name || '',
      description: c.description || ''
    }));
    const certsList = CERF.filter(c => c.product_id === product.id).map(c => ({
      id: c.id,
      header: c.header || '',
      file: c.file || null
    }));
    setFeatures(feats.length ? feats : [{ name: '', description: '' }]);
    setCerts(certsList.length ? certsList : [{ header: '', file: null }]);

    }
}, [Char, CERF, isEditMode, product]);
useEffect(() => {
if (isEditMode && product) {
  setFormData({
    name: product.name || '',
    description: product.description || '',
    quantity: product.quantity || '',
    costPrice: product.costPrice || '',
    price: product.price || '',
    category: product.category || '',
    type:product.type,
    catalogSection: 3
  }); 
if (product.images && product.images.length) {
  setImages(product.images.map((src) => ({
    id: crypto.randomUUID(),
    url: src,
    file: null
  })));
} else if (product.image) {
  setImages([{ id: crypto.randomUUID(), url: product.image, file: null }]);
}

console.log('Editing product:', product);

} else {
    setFormData({
      name: '',
      description: '',
      quantity: '',
      costPrice: '',
      price: '',
      category: ''
    });
    setImages([]);
    setTonicTypes([{ id: 1, value: '' }]);
    setBenefitTypes([{ id: 1, value: '' }]);
    setFeatures([{ id: 1, title: '', description: '' }]);
    setCerts([{ id: 1, title: '', file: null }]);
    setExtraProducts([{ id: 1, productId: null }]);
}
}, [isEditMode, product]);

useEffect(() => {
    const isTouchDevice = () => {
        if (typeof window === 'undefined') return false;
        const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
        const smallViewport = window.innerWidth <= 1024;
        const uaMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
        return coarse || (uaMobile && smallViewport);
    };
    const apply = () => setIsMobileLayout(isTouchDevice());
    apply();
    window.addEventListener('resize', apply);
    return () => window.removeEventListener('resize', apply);
}, []);
const handleImagesUpload = (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    const newImages = files.map((file) => ({
        id: crypto.randomUUID(),
        url: URL.createObjectURL(file),
        file,
    }));

    setImages((prev) => {
        if (uploadTargetIndex == null) {
            return [...prev, ...newImages].slice(0, 4);
        }
        const next = [...prev];
        for (let i = 0; i < newImages.length; i += 1) {
            const target = uploadTargetIndex + i;
            if (target > 3) break;
            next[target] = newImages[i];
        }
        return next.slice(0, 4);
    });
    setUploadTargetIndex(null);
    event.target.value = '';
};

const handleRemoveImage = (id) => {
    setImages((prev) => {
        const idx = prev.findIndex((img) => img?.id === id);
        if (idx === -1) return prev;
        const next = [...prev];
        next[idx] = undefined;
        while (next.length && !next[next.length - 1]) next.pop();
        return next;
    });
};

const handleImageError = (e) => {
    const img = e?.currentTarget;
    if (!img) return;
    if (img.dataset.fallbackApplied) return;
    img.dataset.fallbackApplied = 'true';
    img.src = PlaceholderImg;
};

const handlePhotoLibrarySelect = (selectedImages) => {
    const mapped = (selectedImages || []).map((img) => ({
        id: crypto.randomUUID(),
        url: img.url,
        file: null,
    }));
    setImages((prev) => [...prev, ...mapped].slice(0, 4));
    setIsPhotoLibraryOpen(false);
};

const openImagePickerForSlot = (index) => {
    setUploadTargetIndex(index);
    imageInputRef.current?.click();
};
const validateForm = () => {
    if (!formData.name.trim()) {
        alert('Введите название товара');
        return false;
    }
    if (!formData.price) {
        alert('Введите цену товара');
        return false;
    }
    return true;
};
    const handleCERFUpload = async(event) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;
        const newImages = files.map((file) => ({
            id: crypto.randomUUID(),
            url: URL.createObjectURL(file),
            file,
        }));

        setCERFIMG((prev) => [...prev, ...newImages].slice(0, 4));
    };
const toBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
const handleSave = async () => {
    if (!validateForm()) return;
    const imagesPayload = await Promise.all(
        images.map(async (img) => {
            if (!img) return null;
            if (img.file) {
                const dataUrl = await toBase64(img.file);
                return { name: img.file.name, type: img.file.type, dataUrl };
            }
            if (img.url && typeof img.url === 'string' && !img.url.startsWith('blob:')) {
                return { url: img.url };
            }
            return null;
        })
    );
    const imagesForServer = imagesPayload.filter(Boolean);

    const productData = {
        ...(isEditMode ? { id: product.id } : {}),
        ...formData,
        cerf: cerf,
        images: imagesForServer,
        features: features.filter(f => f.name?.trim() || f.description?.trim()),
        tonicTypes: tonicTypes.filter(t => t.value?.trim()),
        benefitTypes: benefitTypes.filter(b => b.value?.trim()),
        certs: certs.filter(c =>
            c.header?.trim() ||
            c.file?.name
        ),
    };

    try {
        const endpoint = isEditMode ? '/api/addProduct/update' : '/api/addProduct';
        const res = await apiRequest(endpoint, {
            method: 'POST',
            body: JSON.stringify(productData),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Ошибка отправки');
        }
        const data = await res.json();
        console.log('Успешно сохранено:', data);
        if (onSave) {
            onSave(productData, isEditMode);
        }
        onClose();
    } catch (e) {
        console.error('Ошибка сохранения товара:', e);
        alert(e.message || 'Ошибка сохранения товара');
    }
};
const tonicTypeOptions = React.useMemo(() => {
    const values = allProducts.map(p => p.category);
    const unique = Array.from(new Set(values.filter(v => typeof v === 'string' && v.trim() !== '')));
    if (isEditMode && product?.category && !unique.includes(product.category)) {
        unique.unshift(product.category);
    }
    return unique;
}, [allProducts, isEditMode, product?.category]);

const benefitOptions = React.useMemo(() => {
    const values = (allProducts || []).map(p => p.usefull);
    const unique = Array.from(new Set(values.filter(v => typeof v === 'string' && v.trim() !== '')));
    if (isEditMode && product?.usefull && !unique.includes(product.usefull)) {
        unique.unshift(product.usefull);
    }
    return unique;
}, [allProducts, isEditMode, product?.usefull]);

if (!isOpen) return null;

return (
    <>
        <div className="AddProductOverlay" onClick={onClose}></div>
        <aside className={`AddProductPanel ${isMobileLayout ? 'AddProductPanel--mobile' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="AddProductPanel_header">
                <h2>{isEditMode ? 'Редактирование товара' : 'Создание товара'}</h2>
                <button className="AddProductPanel_close" onClick={onClose}>
                    ✕
                </button>
            </div>

            <div className="AddProductPanel_body">
                <div className="AddProductPanel_grid">
                    
                    <div className="AddProductPanel_col">
                        <div className="AddProductPanel_group">
                            <label>Название товара</label>
                            <input
                                type="text"
                                placeholder="Название товара"
                                className="field-input"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                            />
                        </div>

                        <div className="AddProductPanel_group">
                            <label>Описание</label>
                            <textarea
                                placeholder="Описание"
                                className="field-textarea field-textarea--description"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                            ></textarea>
                        </div>

                        <div className="AddProductPanel_block">
                            <p className="AddProductPanel_block_title">Характеристики товара</p>
                            {features.map((feat, index) => (
                                <React.Fragment key={feat.id}>
                                    <p className="AddProductPanel_subtitle">Раздел №{index + 1}</p>
                                    <div className="AddProductPanel_group">
                                        <input
                                            type="text"
                                            placeholder="Заголовок"
                                            className="field-input"
                                            value={feat.name}
                                            onChange={(e) => handleFeatureChange(feat.id, 'name', e.target.value)}
                                        />
                                    </div>
                                    <div className="AddProductPanel_group">
                                        <input
                                            type="text"
                                            placeholder="Описание"
                                            className="field-input"
                                            value={feat.description}
                                            onChange={(e) => handleFeatureChange(feat.id, 'description', e.target.value)}
                                        />
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
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImagesUpload}
                                        className="AddProductPanel_upload_input"
                                    />
                                    <div className="AddProductPanel_upload_content">
                                        {images[0] ? (
                                            <img
                                                src={images[0].url || PlaceholderImg}
                                                alt=""
                                                className="AddProductPanel_photo_img"
                                                onError={handleImageError}
                                            />
                                        ) : (
                                            <>
                                                <img src={DownloadIcon} alt="" />
                                                <span>
                                                    Перетащите фото чтобы Загрузить или{' '}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setIsPhotoLibraryOpen(true);
                                                        }}
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            color: 'rgba(205, 255, 255, 0.95)',
                                                            cursor: 'pointer',
                                                            fontWeight: 600,
                                                            padding: 0,
                                                        }}
                                                    >
                                                        Выберете
                                                    </button>
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </label>
                                <button
                                    type="button"
                                    className="AddProductPanel_slotAction"
                                    onClick={() => openImagePickerForSlot(0)}
                                >
                                    {images[0] ? 'Заменить титульное фото' : 'Выбрать титульное фото'}
                                </button>
                            </div>

                            <div className="AddProductPanel_photos_row">
                                {[1, 2, 3].map((slotIndex) => {
                                    const img = images[slotIndex];
                                    return (
                                        <div
                                            key={slotIndex}
                                            className="AddProductPanel_photo_small"
                                            onClick={() => openImagePickerForSlot(slotIndex)}
                                        >
                                            {img ? (
                                                <>
                                                    <img
                                                        src={img.url || PlaceholderImg}
                                                        alt=""
                                                        className="AddProductPanel_photo_img"
                                                        onError={handleImageError}
                                                    />
                                                    <div
                                                        className="AddProductPanel_photo_actions"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <button
                                                            type="button"
                                                            className="AddProductPanel_icon-btn"
                                                            onClick={() => handleRemoveImage(img.id)}
                                                        >
                                                            <img src={DeleteIcon} alt="" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="AddProductPanel_icon-btn"
                                                            onClick={() => {
                                                                const cover = images[0];
                                                                const clone = [...images];
                                                                clone[0] = img;
                                                                clone[slotIndex] = cover;
                                                                setImages(clone.filter(Boolean));
                                                            }}
                                                        >
                                                            <img src={PointerIcon} alt="" />
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="AddProductPanel_emptySlot">+</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImagesUpload}
                                className="AddProductPanel_upload_input"
                            />
                        </div>

                        <div className="AddProductPanel_inline">
                            <div className="AddProductPanel_group">
                                <label>Количество</label>
                                <input
                                    type="text"
                                    placeholder="1 шт."
                                    className="field-input"
                                    value={formData.quantity}
                                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="AddProductPanel_inline AddProductPanel_inline--2">
                            <div className="AddProductPanel_group">
                                <label>Себестоимость</label>
                                <input
                                    type="text"
                                    placeholder="10 000"
                                    className="field-input"
                                    value={formData.costPrice}
                                    onChange={(e) => handleInputChange('costPrice', e.target.value)}
                                />
                            </div>
                            <div className="AddProductPanel_group">
                                <label>Цена</label>
                                <input
                                    type="text"
                                    placeholder="20 000"
                                    className="field-input"
                                    value={formData.price}
                                    onChange={(e) => handleInputChange('price', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="AddProductPanel_group">
                            <label>Раздел каталога</label>
                            <select
                                className="field-input"
                                onChange={(e) => setFormData({ ...formData, catalogSection: e.target.value })}
                            >
                                            <option value={1}>Главная</option>
                                            <option value={2}>О нас</option>
                                            <option value={3}>Каталог</option>
                            </select>
                        </div>
                    </div>
                </div>

                
                <div className="AddProductPanel_row">
                    <div className="AddProductPanel_block">
                        <p className="AddProductPanel_block_title AddProductPanel_block_title--accent">
                            Сертификаты
                        </p>
                        {certs.map((cert) => (
                            <div className="AddProductPanel_group" key={cert.id}>
                                <label>Заголовок</label>
                                <input
                                    type="text"
                                    placeholder="Заголовок"
                                    className="field-input"
                                    value={cert.header}
                                    onChange={(e) => handleCertChange(cert.id, 'header', e.target.value)}
                                />
                                <label>Файл документа</label>
                                <label className="AddProductPanel_upload AddProductPanel_upload--main">
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.png,.doc,.docx"
                                        className="AddProductPanel_upload_input"
                                        onChange={handleCERFUpload}
                                    />
                                    <div className="AddProductPanel_upload_content">
                                        <img src={DownloadIcon} alt="" />
                                        <span>
                                            {cert.file ? cert.file.name : <button type="button">Загрузить</button>}
                                        </span>
                                    </div>
                                </label>
                            </div>
                        ))}
                        <button type="button" className="AddProductPanel_link" onClick={addCert}>
                            Добавить еще
                        </button>
                    </div>

                    <div className="AddProductPanel_block">
                        <p className="AddProductPanel_block_title AddProductPanel_block_title--accent">
                            Дополнительные товары
                        </p>
                        {extraProducts.map((ep) => (
                            <div className="AddProductPanel_group" key={ep.id}>
                                <label>Выбрать Товар</label>
                                <button type="button" className="AddProductPanel_select-btn">
                                    Выбрать из каталога
                                </button>
                            </div>
                        ))}
                        <button type="button" className="AddProductPanel_link" onClick={addExtraProduct}>
                            Добавить товар
                        </button>
                    </div>
                </div>

                
                <div className="AddProductPanel_bottom-row">
                    <div className="AddProductPanel_group">
                        <p className="AddProductPanel_block_title AddProductPanel_block_title--accent">
                            Тип тоника
                        </p>
                        <label>Тип</label>
                        {tonicTypes.map((item) => (
                            <select
                                key={item.id}
                                className="field-input"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="">Тип тоника</option>
                                  {tonicTypeOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                            </select>
                        ))}
                        <button type="button" className="AddProductPanel_link" onClick={addTonicType}>
                            Добавить еще
                        </button>
                    </div>

                    <div className="AddProductPanel_group">
                        <p className="AddProductPanel_block_title AddProductPanel_block_title--accent">
                            Вид пользы
                        </p>
                        <label>Вид пользы</label>
                        {benefitTypes.map((item) => (
                            <select
                                key={item.id}
                                className="field-input"
                                value={product?.usefull}
                                 onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="">Вид пользы</option>
                                  {benefitOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                            </select>
                        ))}
                        <button type="button" className="AddProductPanel_link" onClick={addBenefitType}>
                            Добавить еще
                        </button>
                    </div>
                </div>
            </div>

            <div className="AddProductPanel_footer">
                <button className="AddProductPanel_save" onClick={handleSave}>
                    {isEditMode ? 'Сохранить' : 'Создать'}
                </button>
                <button className="AddProductPanel_cancel" onClick={onClose}>
                    Отменить
                </button>
            </div>
        </aside>

        <PhotoLibraryModal
            isOpen={isPhotoLibraryOpen}
            onClose={() => setIsPhotoLibraryOpen(false)}
            onSelect={handlePhotoLibrarySelect}
            max={4}
        />
    </>
);

};


export default AddEditProductModal;