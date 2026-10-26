const ALLOWED_GARMENTS = ['T-Shirts', 'Hoodies', 'Polo Shirts', 'Tote Bags', 'Other'];
const ALLOWED_METHODS = ['DTG Print', 'Screen Printing', 'Heat Transfer', 'Embroidery', 'Other'];

function parseWithRules(text) {
  const lower = text.toLowerCase();
  const quantityMatch = lower.match(/\b(\d{1,6})\s*(?:(?:black|white|red|blue|navy|green|yellow|grey|gray|pink|purple|orange)\s+)?(?:custom\s*)?(?:t-?shirts?|tees|hoodies|polo shirts?|tote bags?)\b/) || lower.match(/\b(?:quantity|qty|order of)\s*(\d{1,6})\b/);
  const quantity = quantityMatch ? Number(quantityMatch[1]) : null;
  let garment = 'T-Shirts';
  if (/hoodie/.test(lower)) garment = 'Hoodies';
  else if (/polo/.test(lower)) garment = 'Polo Shirts';
  else if (/tote/.test(lower)) garment = 'Tote Bags';
  let printMethod = 'DTG Print';
  if (/screen print/.test(lower)) printMethod = 'Screen Printing';
  else if (/heat transfer/.test(lower)) printMethod = 'Heat Transfer';
  else if (/embroider/.test(lower)) printMethod = 'Embroidery';
  const colorMatch = lower.match(/\b(black|white|red|blue|navy|green|yellow|grey|gray|pink|purple|orange)\b/);
  const customerMatch = text.match(/(?:customer(?: is)?|for)\s+([A-Za-z0-9 &'.,-]+?)(?=,|\.|\s+with\b|\s+and\b|$)/i);
  const sizes = [];
  const sizePattern = /(\d{1,5})\s*(xs|s|m|l|xl|xxl|xxxl)\b/gi;
  let m; while ((m = sizePattern.exec(text)) !== null) sizes.push(`${m[1]} ${m[2].toUpperCase()}`);
  const result = {
    customer: customerMatch?.[1]?.trim() || '', garment, color: colorMatch ? colorMatch[1][0].toUpperCase()+colorMatch[1].slice(1) : 'Black',
    quantity, sizes: sizes.join(', ') || 'Not specified', printMethod, notes: text.trim()
  };
  const missingFields = [];
  if (!result.customer) missingFields.push('customer');
  if (!result.quantity) missingFields.push('quantity');
  return { order: result, missingFields, provider: 'rule-based-fallback', explanation: 'Ollama was not available, so a rule-based parser extracted likely details. Review every field before saving.' };
}

export async function extractOrder(text) {
  const base = (process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434').replace(/\/$/, '');
  const model = process.env.OLLAMA_MODEL || 'qwen2.5:3b';
  try {
    const response = await fetch(`${base}/api/generate`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(12000),
      body: JSON.stringify({ model, stream: false, format: 'json', prompt: `Extract a print shop order from the user's text. Return ONLY JSON with keys customer, garment, color, quantity, sizes, printMethod, notes, missingFields. garment must be one of ${ALLOWED_GARMENTS.join(', ')}. printMethod must be one of ${ALLOWED_METHODS.join(', ')}. quantity must be a number or null. Do not invent missing details; use empty string for missing customer and list missing fields. User text: ${text}` })
    });
    if (!response.ok) throw new Error('Ollama returned an error');
    const payload = await response.json();
    const parsed = JSON.parse(payload.response);
    const order = {
      customer: String(parsed.customer || '').trim().slice(0,120),
      garment: ALLOWED_GARMENTS.includes(parsed.garment) ? parsed.garment : 'T-Shirts',
      color: String(parsed.color || 'Black').slice(0,60),
      quantity: Number.isInteger(Number(parsed.quantity)) && Number(parsed.quantity) > 0 ? Number(parsed.quantity) : null,
      sizes: String(parsed.sizes || 'Not specified').slice(0,200),
      printMethod: ALLOWED_METHODS.includes(parsed.printMethod) ? parsed.printMethod : 'DTG Print',
      notes: String(parsed.notes || text).slice(0,1000)
    };
    const missingFields = ['customer','quantity'].filter(k => !order[k]);
    return { order, missingFields, provider: `ollama:${model}`, explanation: 'Extracted by the local language model. Review the fields before saving.' };
  } catch {
    return parseWithRules(text);
  }
}

export async function getAiStatus() {
  const base = (process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434').replace(/\/$/, '');
  try {
    const res = await fetch(`${base}/api/tags`, { signal: AbortSignal.timeout(1500) });
    if (!res.ok) return { mode: 'fallback', ollamaAvailable: false, model: process.env.OLLAMA_MODEL || 'qwen2.5:3b' };
    const body = await res.json(); const model = process.env.OLLAMA_MODEL || 'qwen2.5:3b';
    return { mode: body.models?.some(m => m.name === model || m.name.startsWith(`${model}:`)) ? 'ollama' : 'fallback', ollamaAvailable: true, model };
  } catch { return { mode: 'fallback', ollamaAvailable: false, model: process.env.OLLAMA_MODEL || 'qwen2.5:3b' }; }
}
