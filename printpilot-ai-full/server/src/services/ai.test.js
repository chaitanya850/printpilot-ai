import test from 'node:test';
import assert from 'node:assert/strict';
import { extractOrder } from './ai.js';

test('fallback extracts common order fields when local AI is not configured', async () => {
  const result = await extractOrder('Create an order for 100 black T-shirts. The customer is ABC Clothing with 50 medium and 50 large, front logo print.');
  assert.equal(result.order.quantity, 100);
  assert.equal(result.order.garment, 'T-Shirts');
  assert.equal(result.order.color, 'Black');
  assert.ok(result.missingFields.includes('customer') === false);
  assert.ok(['rule-based-fallback','ollama:qwen2.5:3b'].includes(result.provider));
});
