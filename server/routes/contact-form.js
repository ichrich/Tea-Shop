const { Router } = require('express');
const { endpoint } = require('../utils/endpoint');
const { body, validationResult } = require('express-validator');
const { sendFormEmail } = require('../utils/mailer');
const { createRequestId, enqueueFormSubmission } = require('../utils/formQueue');
module.exports = (query) => {
  const r = Router();
  let schemaPromise = null;

  const ensureContactSchema = () => {
    if (schemaPromise) return schemaPromise;
    schemaPromise = (async () => {
      await query(`
        CREATE TABLE IF NOT EXISTS contact_form_submissions (
          id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(320) NOT NULL DEFAULT '',
          phone VARCHAR(32) NOT NULL DEFAULT '',
          message TEXT NOT NULL,
          consent_given TINYINT(1) NOT NULL DEFAULT 0,
          ip_address VARCHAR(45) NULL,
          user_agent VARCHAR(512) NULL,
          formUIQUE VARCHAR(255) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          status ENUM('new','seen','in_progress','sent','closed') NOT NULL DEFAULT 'new',
          PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
      `);
      const columns = await query('SHOW COLUMNS FROM contact_form_submissions');
      if (!columns.some(column => column.Field === 'phone')) {
        await query("ALTER TABLE contact_form_submissions ADD COLUMN phone VARCHAR(32) NOT NULL DEFAULT '' AFTER email");
      }
    })().catch(error => {
      schemaPromise = null;
      throw error;
    });
    return schemaPromise;
  };
r.post(
    '/',
    [
      body('name').trim().notEmpty().withMessage('Имя обязательно для заполнения'),
      body('email').optional({ nullable: true, checkFalsy: true }).trim().isEmail().withMessage('Необходимо ввести корректный email'),
      body('phone').trim().matches(/^\+?[0-9\s\-()]{10,18}$/).withMessage('Введите корректный номер телефона'),
      body('message').trim().notEmpty().withMessage('Сообщение обязательно для заполнения'),
      body('agree').isBoolean().withMessage('Необходимо принять условия соглашения'),
    ],
    endpoint(async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Вы неправильно ввели данные',
          errors: errors.array(),
        });
      }
      try {
        const { name, email, phone, message, agree, formUIQUE } = req.body;
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];
        const requestId = createRequestId('CONTACT');
        const payload = {
          name,
          email: email || null,
          phone,
          message,
          agree,
          formUIQUE: formUIQUE || 'contact-form',
          ipAddress,
          userAgent,
        };

        let storedInDatabase = false;
        try {
          await ensureContactSchema();
          await query(
            `
            INSERT INTO contact_form_submissions (name, email, phone, message, consent_given, ip_address, user_agent, formUIQUE)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
            [name, email || '', phone, message, agree, ipAddress, userAgent, formUIQUE || null]
          );
          storedInDatabase = true;
        } catch (databaseError) {
          console.warn(`[forms:${requestId}] database unavailable, using queue:`, databaseError.code || databaseError.message);
        }

        let emailSent = false;
        try {
          const emailResult = await sendFormEmail({
            subject: `Новая заявка ${requestId}: ${formUIQUE || 'contact-form'}`,
            text:
              `Заявка: ${requestId}\nФорма: ${formUIQUE || 'contact-form'}\n` +
              `Имя: ${name}\nEmail: ${email || '-'}\nТелефон: ${phone}\n` +
              `Сообщение: ${message}\nIP: ${ipAddress || '-'}\n`,
          });
          emailSent = Boolean(emailResult?.sent);
        } catch (emailError) {
          console.warn(`[forms:${requestId}] email delivery failed:`, emailError.code || emailError.message);
        }

        const queued = !storedInDatabase && !emailSent;
        if (queued) await enqueueFormSubmission('contact', payload, requestId);

        return res.status(queued ? 202 : 201).json({
          message: queued
            ? 'Заявка принята. Мы свяжемся с вами в ближайшее время.'
            : 'Сообщение успешно отправлено',
          requestId,
          delivery: queued ? 'queued' : 'accepted',
        });
      } catch (error) {
        console.error('Ошибка обработки формы:', error);
        return res.status(500).json({ message: 'Не удалось принять заявку. Попробуйте ещё раз.' });
      }
    })
  );

  return r;
};
