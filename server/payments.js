// Stripe Checkout without the Stripe SDK: two HTTPS calls and an HMAC check.
// Without STRIPE_SECRET_KEY the server runs in dev mode and contests are
// activated directly (in production only with DEMO_MODE=1, see api.js).
import { createHmac, timingSafeEqual } from 'node:crypto';
import { SIZES } from '../public/shared/rules.js';

const API = 'https://api.stripe.com/v1';

export const stripeEnabled = () => Boolean(process.env.STRIPE_SECRET_KEY);

// Stripe expects nested form fields: line_items[0][price_data][currency]=eur
function form(obj, prefix = '', out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}[${k}]` : k;
    if (v && typeof v === 'object') form(v, key, out);
    else if (v !== undefined) out.append(key, String(v));
  }
  return out;
}

export async function createCheckout(contest, origin) {
  const s = SIZES[contest.size];
  const item = (name, eur) => ({ quantity: 1, price_data: { currency: 'eur', unit_amount: Math.round(eur * 100), tax_behavior: 'exclusive', product_data: { name } } });
  const items = [item(`Grand prize (${s.name} contest)`, s.grandPrize)];
  s.milestones.forEach((m, i) => items.push(item(`Milestone ${i + 1}`, m.prize)));
  if (s.lottery) items.push(item('Lottery', s.lottery));
  items.push(item('Joridiro fee', s.fee));

  const body = {
    mode: 'payment',
    line_items: Object.fromEntries(items.map((it, i) => [i, it])),
    success_url: `${origin}/c/${encodeURIComponent(contest.id)}?paid=1`,
    cancel_url: `${origin}/c/${encodeURIComponent(contest.id)}`,
    client_reference_id: contest.id,
    metadata: { contest_id: contest.id },
    tax_id_collection: { enabled: true },
  };
  if (process.env.STRIPE_AUTOMATIC_TAX === '1') body.automatic_tax = { enabled: true };

  const res = await fetch(`${API}/checkout/sessions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || `Stripe error ${res.status}`);
  return { id: json.id, url: json.url };
}

// Verifies the Stripe-Signature header (scheme v1) and returns the parsed event, or null.
export function verifyWebhook(rawBody, header, secret, now = Date.now(), toleranceSec = 300) {
  if (!header || !secret) return null;
  const fields = header.split(',').map((p) => p.trim());
  const t = Number(fields.find((p) => p.startsWith('t='))?.slice(2));
  const sigs = fields.filter((p) => p.startsWith('v1=')).map((p) => p.slice(3));
  if (!t || !sigs.length || Math.abs(now / 1000 - t) > toleranceSec) return null;
  const expected = createHmac('sha256', secret).update(`${t}.${rawBody}`).digest();
  const ok = sigs.some((s) => {
    const got = Buffer.from(s, 'hex');
    return got.length === expected.length && timingSafeEqual(got, expected);
  });
  if (!ok) return null;
  try { return JSON.parse(rawBody); } catch { return null; }
}
