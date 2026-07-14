import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Breadcrumbs.css';
import { partnersData } from '../../data/partnersData.js';

const PATH_NAMES = {
  '': 'Главная',
  about: 'О бренде',
  all: 'Вся коллекция',
  blog: 'Журнал',
  catalog: 'Каталог',
  partners: 'Партнерам',
  product: 'Чай',
  'policy-opd': 'Политика обработки данных',
  sencha: 'Сенча Кагосима',
  tea: 'Чайная коллекция',
  tonics: 'Чайная коллекция',
  'under-development': 'Каталог',
};

const formatFallbackLabel = slug => {
  const value = decodeURIComponent(String(slug || '').trim());
  if (!value) return 'Раздел';

  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase());
};

const Breadcrumbs = ({ articleTitle } = {}) => {
  const location = useLocation();
  const pathArray = location.pathname.split('/').filter(Boolean);

  if (location.pathname === '/') {
    return null;
  }

  const crumbs = [{ name: 'Главная', path: '/' }];
  const isTeaProductRoute =
    pathArray.includes('product') || (pathArray[0] === 'tea' && pathArray[1]);
  const partnerEntry =
    pathArray[0] === 'partners' && pathArray[1]
      ? partnersData.find(item => String(item.id) === String(pathArray[1]))
      : null;

  if (isTeaProductRoute && pathArray[0] === 'tea' && pathArray[1]) {
    crumbs.push(
      { name: 'Чайная коллекция', path: '/tea' },
      {
        name: articleTitle?.trim() || PATH_NAMES[pathArray[1]] || formatFallbackLabel(pathArray[1]),
        path: location.pathname,
      },
    );
  } else if (partnerEntry) {
    crumbs.push(
      { name: 'Партнерам', path: '/partners' },
      { name: partnerEntry.title, path: location.pathname },
    );
  } else if (pathArray[0] === 'blog' && pathArray.length > 1) {
    crumbs.push(
      { name: 'Журнал', path: '/blog' },
      { name: articleTitle?.trim() || 'Статья', path: location.pathname },
    );
  } else {
    pathArray.forEach((segment, index) => {
      crumbs.push({
        name: PATH_NAMES[segment] || formatFallbackLabel(segment),
        path: `/${pathArray.slice(0, index + 1).join('/')}`,
      });
    });
  }

  return (
    <nav className="breadcrumbs" aria-label="Хлебные крошки">
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;

        return (
          <span key={crumb.path} className="breadcrumb-item">
            {index > 0 && <span className="breadcrumb-separator">&gt;</span>}
            {isLast ? (
              <span className="breadcrumb-current">{crumb.name}</span>
            ) : (
              <Link to={crumb.path} className="breadcrumb-link">
                {crumb.name}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
