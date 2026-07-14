import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'Сад Тишины';

const ROUTE_META = {
  '/': {
    title: 'Сад Тишины - премиальный чайный дом',
    description: 'Редкие листовые чаи, сезонные коллекции и подарочные наборы.',
  },
  '/tea': {
    title: 'Чайная коллекция - Сад Тишины',
    description: 'Зелёные чаи, улуны, белые сорта, пуэр и церемониальная матча.',
  },
  '/tea/sencha': {
    title: 'Сенча Кагосима - Сад Тишины',
    description: 'Японская сенча с чистым травянистым ароматом и мягкой сладостью.',
  },
  '/catalog': {
    title: 'Каталог чая - Сад Тишины',
    description: 'Каталог премиального листового чая и подарочных коллекций.',
  },
  '/catalog/all': {
    title: 'Вся коллекция - Сад Тишины',
    description: 'Выберите чай по происхождению, вкусу, случаю и стоимости.',
  },
  '/about': {
    title: 'О чайном доме - Сад Тишины',
    description: 'Наш подход к отбору листа, хранению, дегустации и сервировке.',
  },
  '/partners': {
    title: 'Партнёрам - Сад Тишины',
    description: 'Чайные карты, оптовые поставки и подарочные программы для бизнеса.',
  },
  '/blog': {
    title: 'Журнал о чае - Сад Тишины',
    description: 'Истории происхождения, способы заваривания и культура чайного ритуала.',
  },
  '/policy-opd': {
    title: 'Политика обработки данных - Сад Тишины',
    description: 'Условия обработки и защиты персональных данных пользователей сайта.',
  },
};

const resolveMeta = pathname => {
  if (ROUTE_META[pathname]) return ROUTE_META[pathname];
  if (pathname.startsWith('/partners/')) {
    return { title: `Партнёрская программа - ${SITE_NAME}`, description: 'Форматы сотрудничества с чайным домом.' };
  }
  if (pathname.startsWith('/blog/')) {
    return { title: `Статья о чае - ${SITE_NAME}`, description: 'Материалы о происхождении, вкусе и приготовлении чая.' };
  }
  return { title: `Страница - ${SITE_NAME}`, description: 'Премиальный чайный дом.' };
};

export function PageMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = resolveMeta(pathname);
    document.title = meta.title;
    document.documentElement.lang = 'ru';

    let description = document.querySelector('meta[name="description"]');
    if (!description) {
      description = document.createElement('meta');
      description.name = 'description';
      document.head.appendChild(description);
    }
    description.content = meta.description;
  }, [pathname]);

  return null;
}

export default PageMeta;
