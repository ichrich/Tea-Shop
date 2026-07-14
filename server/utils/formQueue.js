const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const QUEUE_DIR = path.resolve(__dirname, '..', 'data');
const QUEUE_FILE = path.join(QUEUE_DIR, 'form-submissions.ndjson');

const createRequestId = prefix => (
  `${prefix}-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`.toUpperCase()
);

async function enqueueFormSubmission(type, payload, requestId = createRequestId('FORM')) {
  await fs.mkdir(QUEUE_DIR, { recursive: true });
  const record = {
    requestId,
    type,
    receivedAt: new Date().toISOString(),
    status: 'pending',
    payload,
  };
  await fs.appendFile(QUEUE_FILE, `${JSON.stringify(record)}\n`, 'utf8');
  return record;
}

module.exports = { createRequestId, enqueueFormSubmission, QUEUE_FILE };
