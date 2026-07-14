export const CATALOG_TONIC_FILTER_TYPES = ['Сенча', 'Матча', 'Улун', 'Белый чай', 'Пуэр'];

export const UNDER_DEVELOPMENT_PATH = '/under-development';

const CATEGORY_TO_FILTER = {
  Улун: 'Улун',
  'Да Хун Пао': 'Улун',
  Матча: 'Матча',
  'Матча Удзи': 'Матча',
  'Белый пион': 'Белый чай',
  Пуэр: 'Пуэр',
  'Сенча\nПремиум': 'Сенча',
  'Сенча\nКагосима': 'Сенча',
  Сенча: 'Сенча',
};

export function getCatalogTileLink(categoryName) {
  if (categoryName === 'Весь чай') return '/catalog/all';
  const key = categoryName.replace(/\r\n/g, '\n');
  const tonic = CATEGORY_TO_FILTER[key] ?? CATEGORY_TO_FILTER[categoryName];
  if (tonic && CATALOG_TONIC_FILTER_TYPES.includes(tonic)) {
    const q = new URLSearchParams({ tonicType: tonic });
    return `/catalog/all?${q.toString()}`;
  }
  return UNDER_DEVELOPMENT_PATH;
}
