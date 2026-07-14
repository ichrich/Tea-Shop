const imageUrl = fileName => `/images/${encodeURIComponent(fileName)}`;

export const SITE_IMAGES = Object.freeze({
  home: imageUrl('Homescreen.png'),
  collection: imageUrl('General frame of the collection.png'),
  sencha: imageUrl('Sencha Kagoshima.png'),
  daHongPao: imageUrl('Da Hong Pao.png'),
  whiteTea: imageUrl('White tea Bai Mu Dan.png'),
  matcha: imageUrl('Uji Ceremonial Matcha.png'),
  puer: imageUrl('Aged shu puer.png'),
  gifts: imageUrl('Gift collection.png'),
  boutique: imageUrl('Tea boutique.png'),
  restaurant: imageUrl('Restaurant tea service.png'),
  corporate: imageUrl('Corporate gifts.png'),
  plantation: imageUrl('Tea plantation.png'),
  harvest: imageUrl('Manual leaf collection.png'),
  tasting: imageUrl('Tasting and selection.png'),
  storage: imageUrl('Tea storage.png'),
  brewing: imageUrl('Water temperature and brewing.png'),
  teaware: imageUrl('Teaware.png'),
  wholesale: imageUrl('Wholesale packaging.png'),
  placeholder: imageUrl('placeholder.png'),
});

export const TEA_PRODUCT_IMAGES = [
  SITE_IMAGES.sencha,
  SITE_IMAGES.daHongPao,
  SITE_IMAGES.whiteTea,
  SITE_IMAGES.matcha,
  SITE_IMAGES.puer,
];

export const JOURNAL_IMAGES = [
  SITE_IMAGES.brewing,
  SITE_IMAGES.teaware,
  SITE_IMAGES.tasting,
  SITE_IMAGES.storage,
  SITE_IMAGES.plantation,
  SITE_IMAGES.harvest,
  SITE_IMAGES.collection,
];

export const resolveSiteImage = (value, fallback = SITE_IMAGES.placeholder) => (
  typeof value === 'string' && value.trim() ? value : fallback
);
