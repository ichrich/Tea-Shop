const {  IMAGE_BASE } = require('../server_config/config');
function imageUrl(fileName) {
  if (!fileName) return '';
  if (/^https?:\/\//i.test(fileName)) return fileName;
  return IMAGE_BASE + fileName;
}
module.exports = { imageUrl };