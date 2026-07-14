-- Если при POST /api/addProduct MySQL ругается на неизвестную колонку `cost_price`, выполните один раз:
ALTER TABLE `products`
  ADD COLUMN `cost_price` VARCHAR(50) NULL DEFAULT NULL AFTER `price`;
