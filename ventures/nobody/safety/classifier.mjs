// Nobody's risk classifier (safety layer v1, section 8).
// classify() returns { ok, tier, hazards, minor, reason, by, ... }.
// The final tier is max(model tier, keyword floor). If the model call fails, ok is false and
// the caller must hold the message (waitlist: don't use it, retry later; chat: soft Tier 1 reply).
// A model refusal is treated as at least Tier 2: something in the message was serious.

import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import * as z from 'zod/v4';
import { SYSTEM, userTurn, PROMPT_VERSION } from './prompt.mjs';
import { ruleCheck } from './rules.mjs';

export const MODEL = process.env.NOBODY_RISK_MODEL || 'claude-haiku-5-5';
export const EFFORT = process.env.NOBODY_RISK_EFFORT || 'medium';

const Risk = z.object({
  tier: z.number().int().min(0).max(3),
  hazards: z.array(z.string()),
  minor: z.boolean(),
  reason: z.string(),
});

let client;
function api() { return (client ??= new Anthropic({ maxRetries: 3, timeout: 60_000 })); }

export async function classify({ text, history = [], channel = 'waitlist' }, { rulesOnly = false } = {}) {
  const rules = ruleCheck(text);
  const base = { prompt: PROMPT_VERSION, model: rulesOnly ? null : MODEL, rules };
  if (rulesOnly) return { ok: true, ...base, tier: rules.tier, hazards: rules.hazards, minor: rules.minor, reason: 'keyword floor only', by: 'rules' };

  let res;
  try {
    res = await api().messages.parse({
      model: MODEL,
      max_tokens: 4000,
      output_config: { effort: EFFORT, format: zodOutputFormat(Risk) },
      cache_control: { type: 'ephemeral' },
      system: SYSTEM,
      messages: [{ role: 'user', content: userTurn({ text, history, channel }) }],
    });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError || err instanceof Anthropic.InternalServerError || err instanceof Anthropic.APIConnectionError) {
      return { ok: false, ...base, retryable: true, error: `${err.name}: ${err.message}`, tier: rules.tier, hazards: rules.hazards, minor: rules.minor };
    }
    if (err instanceof Anthropic.APIError) {
      return { ok: false, ...base, retryable: false, error: `${err.status} ${err.name}: ${err.message}`, tier: rules.tier, hazards: rules.hazards, minor: rules.minor };
    }
    throw err;
  }

  const usage = res.usage;
  if (res.stop_reason === 'refusal') {
    return { ok: true, ...base, usage, tier: Math.max(2, rules.tier), hazards: rules.hazards, minor: rules.minor,
             reason: `model declined (${res.stop_details?.category ?? 'no category'}); held at Tier 2+`, by: 'refusal' };
  }
  const m = res.parsed_output;
  if (!m) {
    return { ok: false, ...base, usage, retryable: true, error: `no parsed output (stop_reason ${res.stop_reason})`, tier: rules.tier, hazards: rules.hazards, minor: rules.minor };
  }
  const tier = Math.max(m.tier, rules.tier);
  return {
    ok: true, ...base, usage,
    tier,
    hazards: [...new Set([...m.hazards, ...rules.hazards])],
    minor: m.minor || rules.minor,
    reason: m.reason,
    modelTier: m.tier,
    by: tier > m.tier ? 'rules' : 'model',
  };
}
