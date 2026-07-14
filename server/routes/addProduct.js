const { Router } = require('express');
const { endpoint } = require('../utils/endpoint');
const { authenticateToken } = require('../middleware/auth');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

const IMAGES_DIR = path.resolve(__dirname, '../images');
try {
  fsSync.mkdirSync(IMAGES_DIR, { recursive: true });
} catch (_) {}
function normalizeNumberish(value) {
  if (value == null) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string') return null;
  const normalized = value.replace(',', '.').replace(/[^\d.-]/g, '');
  if (!normalized || normalized === '-' || normalized === '.' || normalized === '-.') return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}
async function insertProductRow(queryFn, productParams) {
  const sql = `
    INSERT INTO products
    (name, discription, price, cost_price, image, size, category_id, active, views, quantity, category, type, count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const sqlNoCost = `
    INSERT INTO products
    (name, discription, price, image, size, category_id, active, views, quantity, category, type, count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const noCostParams = [
    productParams[0],
    productParams[1],
    productParams[2],
    productParams[4],
    productParams[5],
    productParams[6],
    productParams[7],
    productParams[8],
    productParams[9],
    productParams[10],
    productParams[11],
    productParams[12],
  ];
  try {
    return await queryFn(sql, productParams);
  } catch (e) {
    if (isMissingCostPriceColumn(e)) {
      return await queryFn(sqlNoCost, noCostParams);
    }
    throw e;
  }
}

async function updateProductRow(queryFn, params) {
  const sql = `
    UPDATE products
    SET name = ?, discription = ?, price = ?, cost_price = ?, count = ?, category_id = ?, category = ?, type = ?
    WHERE id = ?
  `;
  const sqlNoCost = `
    UPDATE products
    SET name = ?, discription = ?, price = ?, count = ?, category_id = ?, category = ?, type = ?
    WHERE id = ?
  `;
  const noCost = [params[0], params[1], params[2], params[4], params[5], params[6], params[7], params[8]];
  try {
    return await queryFn(sql, params);
  } catch (e) {
    if (isMissingCostPriceColumn(e)) {
      return await queryFn(sqlNoCost, noCost);
    }
    throw e;
  }
}
module.exports = (query) => {
  const r = Router();
  r.use(authenticateToken);
r.post(
    '/',
    endpoint(async (req, res) => {
      const {
        name, description, category, price, costPrice, catalogSection, type,
        quantity, cost, images,
        cerf, cerfFile, features
      } = req.body;

      const parsedPrice = normalizeNumberish(price);
      const parsedCostPrice = normalizeNumberish(costPrice ?? cost);
      const parsedQuantity = normalizeNumberish(quantity);
      const categoryId = parseCategoryId(catalogSection);

      const nameTrim = typeof name === 'string' ? name.trim() : String(name || '').trim();
      if (!nameTrim) {
        return res.status(400).json({
          ok: false,
          error: 'VALIDATION',
          message: 'Укажите название товара',
        });
      }
      if (parsedPrice == null) {
        return res.status(400).json({
          ok: false,
          error: 'VALIDATION',
          message: 'Укажите корректную цену',
        });
      }

      let imageForDb = null;

      if (!imageForDb && Array.isArray(images) && images.length > 0) {
        try {
          for (const img of images) {
            if (!img || typeof img !== 'object') continue;
            const { dataUrl, name: origName, url } = img;
            if (dataUrl) {
              const ext = path.extname(origName || '') || '';
              const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
              await saveDataUrlToFile(dataUrl, IMAGES_DIR, filename);
              imageForDb = filename;
              break;
            }
            if (url && typeof url === 'string' && !url.startsWith('blob:')) {
              const nameFromUrl = path.basename(url);
              if (nameFromUrl && nameFromUrl !== url) {
                imageForDb = nameFromUrl;
                break;
              }
            }
          }
        } catch (err) {
          console.error('Error saving main image (data URL / url):', err);
          return res.status(500).json({
            ok: false,
            error: 'Image save failed',
            message: err.message || String(err),
          });
        }
      }

      let productId;
      try {
        const qty = parsedQuantity ?? 0;
        const productParams = [
          nameTrim,
          truncate255(description),
          String(parsedPrice),
          parsedCostPrice != null ? String(parsedCostPrice) : null,
          imageForDb,
          'big',
          categoryId,
          true,
          0,
          qty,
          category ?? null,
          type ?? null,
          String(qty),
        ];
        const result = await insertProductRow(query, productParams);
        productId = result.insertId;
      } catch (err) {
        console.error('Error inserting product:', err);
        return res.status(500).json({
          ok: false,
          error: 'Database error',
          message: err.message || String(err),
        });
      }
      try {
        if (Array.isArray(cerf) && cerf.length > 0) {
          const cerfFilesArr = Array.isArray(cerfFile) ? cerfFile : [];
          const count = Math.min(cerf.length, cerfFilesArr.length);

          for (let i = 0; i < count; i++) {
            const header = truncate255(cerf[i]?.header ?? cerf[i]?.title ?? '') || ' ';
            const fileObj = cerfFilesArr[i];
            let filename = null;

            if (fileObj && fileObj.dataUrl) {
              const ext = path.extname(fileObj.name || '') || '';
              filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
              await saveDataUrlToFile(fileObj.dataUrl, IMAGES_DIR, filename);
            }

            if (!filename) continue;

            const sqlCerf = `INSERT INTO cerf (product_id, header, url) VALUES (?, ?, ?)`;
            await query(sqlCerf, [productId, header, filename]);
          }
        }
        if (Array.isArray(features) && features.length > 0) {
          for (const f of features) {
            const nameFeat = truncate255(f?.header ?? f?.name ?? '') || '';
            const descFeat = truncate255(f?.description ?? '') || '';
            if (!nameFeat.trim() && !descFeat.trim()) continue;

            const sqlFeat = `INSERT INTO characteristic (product_id, name, description) VALUES (?, ?, ?)`;
            await query(sqlFeat, [productId, nameFeat || ' ', descFeat || ' ']);
          }
        }

        res.json({ ok: true, id: productId });
        return;
      } catch (err) {
        console.error('Error inserting cerf/features:', err);
        try {
          if (productId) await query('DELETE FROM cerf WHERE product_id = ?', [productId]);
        } catch (_) {}

        try {
          if (productId) await query('DELETE FROM characteristic WHERE product_id = ?', [productId]);
        } catch (_) {}

        try {
          if (productId) await query('DELETE FROM products WHERE id = ?', [productId]);
        } catch (_) {}

        res.status(500).json({
          ok: false,
          error: 'Database error (partial insert, compensating deletes applied)',
          message: err.message || String(err),
        });
      }
    })
  );
r.post('/update',
    endpoint(async (req, res) => {
      const {
        id,
        name, description, category, price, costPrice, catalogSection, type,
        quantity, images,
        certs, cerfFile, features, cerf
      } = req.body;

      if (!id) {
        return res.status(400).json({ ok: false, error: 'Missing id' });
      }
      const parsedPrice = normalizeNumberish(price);
      const parsedCostPrice = normalizeNumberish(costPrice ?? req.body?.cost);
      const parsedQuantity = normalizeNumberish(quantity);
      const categoryId = parseCategoryId(catalogSection);

      const nameTrim =
        typeof name === 'string' ? name.trim() : String(name || '').trim();
      if (!nameTrim) {
        return res.status(400).json({
          ok: false,
          error: 'VALIDATION',
          message: 'Укажите название товара',
        });
      }
      if (parsedPrice == null) {
        return res.status(400).json({
          ok: false,
          error: 'VALIDATION',
          message: 'Укажите корректную цену',
        });
      }
      try {
        let imageForDb = null;

        if (Array.isArray(images) && images.length > 0) {
          for (const img of images) {
            if (!img || typeof img !== 'object') continue;
            const { dataUrl, name: origName, url } = img;
            if (dataUrl) {
              const ext = path.extname(origName || '') || '';
              const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
              await saveDataUrlToFile(dataUrl, IMAGES_DIR, filename);
              imageForDb = filename;
              break;
            } else if (url && typeof url === 'string' && !url.startsWith('blob:')) {
              const nameFromUrl = path.basename(url);
              if (nameFromUrl && nameFromUrl !== url) imageForDb = nameFromUrl;
              break;
            }
          }
        }
        if (imageForDb) {
          const sqlUpdImg = `
            UPDATE products
            SET image = ?
            WHERE id = ?
          `;
          await query(sqlUpdImg, [imageForDb, id]);
        }
      } catch (err) {
        console.error('Error updating product image:', err);
      }
      try {
        const qty = parsedQuantity ?? 100;
        const productParams = [
          nameTrim,
          truncate255(description),
          String(parsedPrice),
          parsedCostPrice != null ? String(parsedCostPrice) : null,
          qty,
          categoryId,
          category ?? null,
          type ?? null,
          id,
        ];
        await updateProductRow(query, productParams);
      } catch (err) {
        console.error('Error updating product:', err);
        return res.status(500).json({
          ok: false,
          error: 'Database error',
          message: err.message || String(err),
        });
      }
      try {
        await query('DELETE FROM cerf WHERE product_id = ?', [id]);
        if (Array.isArray(certs) && certs.length > 0) {
          const cerfsArr = certs;
          let ind = 0;
          for (const c of cerfsArr) {
            const header = c?.header ?? null;
            let urlFile = null;
            const fileObj = Array.isArray(cerfFile) ? cerfFile[ind] : (Array.isArray(cerf) ? cerf[ind] : null);
            ind++;
            if (fileObj && typeof fileObj === 'object') {
              if (fileObj.dataUrl) {
                const ext = path.extname(fileObj.name || '') || '';
                const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
                await saveDataUrlToFile(fileObj.dataUrl, IMAGES_DIR, filename);
                urlFile = filename;
              } else if (fileObj.url) {
                urlFile = path.basename(fileObj.url);
              }
            } else if (typeof fileObj === 'string') {
              urlFile = fileObj;
            } else if (c?.url) {
              urlFile = c.url;
            }
            const sqlCerf = `INSERT INTO cerf (product_id, header, url) VALUES (?, ?, ?)`;
            await query(sqlCerf, [id, header, urlFile]);
          }
        }
      } catch (err) {
        console.error('Error updating cerf:', err);
      }
      try {
        if (Array.isArray(features) && features.length > 0) {
          for (const f of features) {
            const fid = f?.id;
            const nameFeat = f?.name ?? null;
            const descFeat = f?.description ?? null;
            if (fid) {
              const sqlFeatUpd = `UPDATE characteristic SET name=?, description=? WHERE id=? AND product_id=?`;
              await query(sqlFeatUpd, [nameFeat, descFeat, fid, id]);
            } else {
              const sqlFeatIns = `INSERT INTO characteristic (product_id, name, description) VALUES (?, ?, ?)`;
              await query(sqlFeatIns, [id, nameFeat, descFeat]);
            }
          }
        }
      } catch (err) {
        console.error('Error updating features:', err);
      }

      res.json({ ok: true, id });
    })
  );

  return r;
};