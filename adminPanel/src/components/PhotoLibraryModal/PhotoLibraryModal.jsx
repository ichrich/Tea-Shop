import React, { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../../utils/api';
import './PhotoLibraryModal.css';
import PlaceholderImg from '../../assets/images/placeholder.jpg';

const PhotoLibraryModal = ({ isOpen, onClose, onSelect, max = 4 }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorText, setErrorText] = useState('');

    const [selected, setSelected] = useState([]);

    const handleImageError = (e) => {
        const img = e?.currentTarget;
        if (!img) return;
        if (img.dataset.fallbackApplied) return;
        img.dataset.fallbackApplied = 'true';
        img.src = PlaceholderImg;
    };

    useEffect(() => {
        if (!isOpen) return;

        let cancelled = false;
        const load = async () => {
            setLoading(true);
            setErrorText('');
            try {
                const res = await apiRequest('/api/adminImages');
                if (!res.ok) throw new Error(`Failed to load images: ${res.status}`);
                const data = await res.json();
                if (!cancelled) setItems(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error(e);
                if (!cancelled) {
                    setItems([]);
                    setErrorText(e?.message || 'Не удалось загрузить фото');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) setSelected([]);
    }, [isOpen]);

    const canAddMore = selected.length < max;

    const toggle = (img) => {
        setSelected((prev) => {
            const exists = prev.some((x) => x.id === img.id);
            if (exists) return prev.filter((x) => x.id !== img.id);
            if (!canAddMore) return prev;
            return [...prev, img];
        });
    };

    const confirm = () => {
        if (typeof onSelect === 'function') {
            onSelect(selected);
        }
        onClose();
    };

    const selectedSet = useMemo(() => new Set(selected.map((s) => s.id)), [selected]);

    if (!isOpen) return null;

    return (
        <>
            <div className="PhotoLibraryModal_overlay" onClick={onClose} />
            <aside className="PhotoLibraryModal_panel" onClick={(e) => e.stopPropagation()}>
                <div className="PhotoLibraryModal_header">
                    <h2>Выберите фото</h2>
                    <button className="PhotoLibraryModal_close" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="PhotoLibraryModal_body">
                    {loading ? (
                        <div className="PhotoLibraryModal_loading">Загрузка...</div>
                    ) : errorText ? (
                        <div className="PhotoLibraryModal_loading" style={{ color: 'rgba(255, 200, 200, 0.9)' }}>
                            {errorText}
                        </div>
                    ) : (
                        <div className="PhotoLibraryModal_grid">
                            {items.map((img) => (
                                <button
                                    key={img.id}
                                    type="button"
                                    className={`PhotoLibraryModal_tile ${selectedSet.has(img.id) ? 'is-selected' : ''}`}
                                    onClick={() => toggle(img)}
                                >
                                    <img src={img.url || PlaceholderImg} alt="" onError={handleImageError} />
                                </button>
                            ))}
                        </div>
                    )}

                    {!loading && !errorText && items.length === 0 && (
                        <div className="PhotoLibraryModal_loading" style={{ padding: '1.8vw 0', color: 'rgba(255,255,255,0.7)' }}>
                            Фото не найдены (0).
                        </div>
                    )}
                </div>

                <div className="PhotoLibraryModal_footer">
                    <button className="PhotoLibraryModal_confirm" onClick={confirm} disabled={selected.length === 0}>
                        Выбрать ({selected.length})
                    </button>
                    <button className="PhotoLibraryModal_cancel" onClick={onClose}>
                        Отмена
                    </button>
                </div>
            </aside>
        </>
    );
};

export default PhotoLibraryModal;

