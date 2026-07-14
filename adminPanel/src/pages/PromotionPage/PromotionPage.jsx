import React, { useEffect, useMemo, useRef, useState } from 'react';
import { apiRequest } from '../../utils/api';
import StatusIconActive from '../../assets/icons/status_active.png';
import StatusIconNo from '../../assets/icons/status_no.png';
import twoBlockIcon from '../../assets/icons/two_block.svg';
import './PromotionPage.css';

const FORMAT_LABELS = {
  'photo+text': 'Фото + текст',
  'text+text': 'Текст + текст',
};

const PromotionPage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingRow, setEditingRow] = useState(null);
  const [editLeftText, setEditLeftText] = useState('');
  const [editText, setEditText] = useState('');
  const [editStatus, setEditStatus] = useState('published');
  const [editImage, setEditImage] = useState(null);
  const [editFormat, setEditFormat] = useState('photo');
  const [editSecondaryType, setEditSecondaryType] = useState('text');
  const [openModalSelect, setOpenModalSelect] = useState(null);
  const uploadInputRef = useRef(null);

  const loadRows = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiRequest('/api/adminSeoBlocks');
      const raw = await res.text();
      let data = [];
      try {
        data = raw ? JSON.parse(raw) : [];
      } catch (_) {
        data = [];
      }
      if (!res.ok) {
        const backendMsg =
          (data && typeof data === 'object' && (data.message || data.error)) ||
          (raw && !raw.startsWith('<') ? raw : '') ||
          'Не удалось загрузить страницы';
        throw new Error(backendMsg);
      }
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  useEffect(() => {
    const closeMenus = () => {
      setOpenMenuId(null);
      setOpenModalSelect(null);
    };
    document.addEventListener('click', closeMenus);
    return () => document.removeEventListener('click', closeMenus);
  }, []);

  const filteredRows = useMemo(() => {
    const q = String(search || '').trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      const title = String(row.title || '').toLowerCase();
      const pageKey = String(row.pageKey || '').toLowerCase();
      return title.includes(q) || pageKey.includes(q);
    });
  }, [rows, search]);

  const patchRow = async (pageKey, patch) => {
    const res = await apiRequest(`/api/adminSeoBlocks/${encodeURIComponent(pageKey)}`, {
      method: 'POST',
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message || err?.error || 'Не удалось сохранить изменения');
    }
  };

  const handleTogglePublish = async (row) => {
    try {
      const nextActive = !row.isActive;
      await patchRow(row.pageKey, { isActive: nextActive });
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, isActive: nextActive } : r)));
    } catch (e) {
      alert(e?.message || 'Ошибка смены статуса');
    } finally {
      setOpenMenuId(null);
    }
  };

  const openEdit = (row) => {
    setEditingRow(row);
    setEditLeftText(row.textLeft || '');
    setEditText(row.text || '');
    setEditStatus(row.isActive ? 'published' : 'draft');
    setEditImage(row.image ? { url: row.image } : null);
    setEditFormat(row.format === 'text+text' ? 'text' : 'photo');
    setEditSecondaryType('text');
    setOpenModalSelect(null);
    setOpenMenuId(null);
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const onPickImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setEditImage({ file, url: localUrl });
    event.target.value = '';
  };

  const saveEdit = async () => {
    if (!editingRow) return;
    try {
      let imagePayload;
      if (editImage?.file) {
        imagePayload = {
          name: editImage.file.name,
          type: editImage.file.type,
          dataUrl: await toBase64(editImage.file),
        };
      } else if (editImage?.url) {
        imagePayload = { url: editImage.url };
      }

      await patchRow(editingRow.pageKey, {
        textLeft: editLeftText,
        text: editText,
        isActive: editStatus === 'published',
        format: editFormat === 'text' ? 'text+text' : 'photo+text',
        image: editFormat === 'text' ? null : imagePayload,
      });
      setRows((prev) =>
        prev.map((r) =>
          r.id === editingRow.id
            ? {
                ...r,
                textLeft: editLeftText,
                text: editText,
                isActive: editStatus === 'published',
                format: editFormat === 'text' ? 'text+text' : 'photo+text',
                image: editFormat === 'text' ? '' : (editImage?.url || r.image),
              }
            : r
        )
      );
      setEditingRow(null);
    } catch (e) {
      alert(e?.message || 'Ошибка сохранения');
    }
  };

  return (
    <div className="PromotionPage">
      <div className="PromotionPage_card">
        <h1 className="PromotionPage_title">ПРОДВИЖЕНИЕ</h1>
        <div className="PromotionPage_search">
          <input placeholder="Поиск" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <table className="PromotionPage_table">
          <thead>
            <tr>
              <th>НАЗВАНИЕ СТРАНИЦЫ</th>
              <th>ФОРМАТ</th>
              <th>СТАТУС</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3}>Загрузка...</td></tr>
            ) : error ? (
              <tr><td colSpan={3}>{error}</td></tr>
            ) : filteredRows.length === 0 ? (
              <tr><td colSpan={3}>Страницы не найдены</td></tr>
            ) : (
              filteredRows.map((row) => (
                <tr key={row.id}>
                  <td className="PromotionPage_cellTitle">
                    <span>{row.title || row.pageKey || `Страница #${row.id}`}</span>
                    <button
                      type="button"
                      className="PromotionPage_more"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId((prev) => (prev === row.id ? null : row.id));
                      }}
                    >
                      ...
                    </button>
                    {openMenuId === row.id && (
                      <div className="PromotionPage_menu" onClick={(e) => e.stopPropagation()}>
                        <button type="button" onClick={() => openEdit(row)}>Редактировать</button>
                        <button type="button" onClick={() => handleTogglePublish(row)}>
                          {row.isActive ? 'Снять с публикации' : 'Опубликовать'}
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="PromotionPage_cellFormat">
                    <div className="PromotionPage_cellFormatContent">
                      <img
                        src={twoBlockIcon}
                        alt=""
                        aria-hidden="true"
                        className="PromotionPage_formatIcon"
                      />
                      <span>{FORMAT_LABELS[row.format] || 'Фото + текст'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`PromotionPage_status ${row.isActive ? 'PromotionPage_status--active' : ''}`}>
                      <img
                        src={row.isActive ? StatusIconActive : StatusIconNo}
                        alt=""
                        aria-hidden="true"
                        className="PromotionPage_statusIcon"
                      />
                      {row.isActive ? 'Активный' : 'Не активный'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingRow && <div className="PromotionPage_overlay" onClick={() => { setEditingRow(null); setOpenModalSelect(null); }} />}
      {editingRow && (
        <aside className="PromotionPage_modal" onClick={(e) => e.stopPropagation()}>
          <h2 className="PromotionPage_modalTitle">{String(editingRow.title || editingRow.pageKey || '').toUpperCase()}</h2>
          <div className="PromotionPage_modalSection">
            <label className="PromotionPage_modalLabel">Тип раздела</label>
            <div className="PromotionPage_typeCol" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="PromotionPage_selectTrigger"
                onClick={() => setOpenModalSelect((prev) => (prev === 'primaryType' ? null : 'primaryType'))}
              >
                <span>{editFormat === 'photo' ? 'Фото' : 'Текст'}</span>
                <span className={`PromotionPage_selectArrow ${openModalSelect === 'primaryType' ? 'PromotionPage_selectArrow--open' : ''}`}>▾</span>
              </button>
              {openModalSelect === 'primaryType' && (
                <div className="PromotionPage_selectDropdown">
                  <button
                    type="button"
                    className="PromotionPage_selectOption"
                    onClick={() => { setEditFormat('photo'); setOpenModalSelect(null); }}
                  >
                    Фото
                  </button>
                  <button
                    type="button"
                    className="PromotionPage_selectOption"
                    onClick={() => { setEditFormat('text'); setOpenModalSelect(null); }}
                  >
                    Текст
                  </button>
                </div>
              )}
              <div
                className="PromotionPage_previewBox PromotionPage_previewBox--upload"
                onClick={() => {
                  if (editFormat === 'text') return;
                  uploadInputRef.current?.click();
                }}
              >
                {editFormat === 'text' ? (
                  <textarea
                    className="PromotionPage_textArea"
                    value={editLeftText}
                    onChange={(e) => setEditLeftText(e.target.value)}
                    placeholder="Текст"
                  />
                ) : editImage?.url ? (
                  <img src={editImage.url} alt="" className="PromotionPage_previewImage" />
                ) : (
                  <>
                    <div className="PromotionPage_uploadIcon">↥</div>
                    <div>Перетащите фото или загрузите</div>
                  </>
                )}
              </div>
              <input
                ref={uploadInputRef}
                type="file"
                accept="image/*"
                className="PromotionPage_hiddenInput"
                onChange={onPickImage}
              />
            </div>
          </div>

          <div className="PromotionPage_modalSection">
            <div className="PromotionPage_typeCol" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="PromotionPage_selectTrigger"
                onClick={() => setOpenModalSelect((prev) => (prev === 'secondaryType' ? null : 'secondaryType'))}
              >
                <span>{editSecondaryType === 'text' ? 'Текст' : 'Фото'}</span>
                <span className={`PromotionPage_selectArrow ${openModalSelect === 'secondaryType' ? 'PromotionPage_selectArrow--open' : ''}`}>▾</span>
              </button>
              {openModalSelect === 'secondaryType' && (
                <div className="PromotionPage_selectDropdown">
                  <button
                    type="button"
                    className="PromotionPage_selectOption"
                    onClick={() => { setEditSecondaryType('text'); setOpenModalSelect(null); }}
                  >
                    Текст
                  </button>
                  <button
                    type="button"
                    className="PromotionPage_selectOption"
                    onClick={() => { setEditSecondaryType('photo'); setOpenModalSelect(null); }}
                  >
                    Фото
                  </button>
                </div>
              )}
              <div className="PromotionPage_previewBox PromotionPage_previewBox--text">
                {editSecondaryType === 'text' ? (
                  <textarea
                    className="PromotionPage_textArea"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    placeholder="Текст"
                  />
                ) : (
                  <div className="PromotionPage_previewPlaceholder">Фото</div>
                )}
              </div>
            </div>
          </div>

          <div className="PromotionPage_modalSection">
            <label className="PromotionPage_modalLabel">Функционал блока</label>
            <div className="PromotionPage_statusBox" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="PromotionPage_selectTrigger"
                onClick={() => setOpenModalSelect((prev) => (prev === 'status' ? null : 'status'))}
              >
                <span>Статус</span>
                <span className={`PromotionPage_selectArrow ${openModalSelect === 'status' ? 'PromotionPage_selectArrow--open' : ''}`}>▾</span>
              </button>
              {openModalSelect === 'status' && (
                <div className="PromotionPage_selectDropdown">
                  <button
                    type="button"
                    className="PromotionPage_selectOption"
                    onClick={() => { setEditStatus('published'); setOpenModalSelect(null); }}
                  >
                    <span>Активный</span>
                    <span className={`PromotionPage_optionCheck ${editStatus === 'published' ? 'PromotionPage_optionCheck--active' : ''}`} />
                  </button>
                  <button
                    type="button"
                    className="PromotionPage_selectOption"
                    onClick={() => { setEditStatus('draft'); setOpenModalSelect(null); }}
                  >
                    <span>Деактивировать</span>
                    <span className={`PromotionPage_optionCheck ${editStatus === 'draft' ? 'PromotionPage_optionCheck--active' : ''}`} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="PromotionPage_actions">
            <button type="button" className="save" onClick={saveEdit}>Сохранить изменения</button>
            <button type="button" className="cancel" onClick={() => setEditingRow(null)}>Отменить изменения</button>
          </div>
        </aside>
      )}
    </div>
  );
};

export default PromotionPage;

