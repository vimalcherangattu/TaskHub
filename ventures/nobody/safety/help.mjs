// Help routing for Nobody (safety layer v1, section 4).
// Verify every number on the 1st of each month. Never invent one: unknown countries get findahelpline.com.

export const HELP = {
  IN: { country: 'India', line: 'Tele-MANAS: call 14416 or 1800-891-4416 (free, 24 hours, 20 languages)', emergency: '112',
        extra: { abuse: 'Women\'s helpline: 181', child: 'Child helpline: 1098' } },
  US: { country: 'the USA', line: '988 Suicide & Crisis Lifeline: call or text 988', emergency: '911' },
  GB: { country: 'the UK', line: 'Samaritans: call 116 123 (free, 24 hours)', emergency: '999 or 112' },
  IE: { country: 'Ireland', line: 'Samaritans: call 116 123 (free, 24 hours)', emergency: '999 or 112' },
  CA: { country: 'Canada', line: '988 Suicide Crisis Helpline: call or text 988', emergency: '911' },
  AU: { country: 'Australia', line: 'Lifeline: call 13 11 14', emergency: '000' },
};

const FALLBACK = { country: null, line: 'Find a free helpline in your country at https://findahelpline.com', emergency: null };

// Browser time zone -> country, for the waitlist form (section 4: number code, else time zone, else ask).
const TZ = {
  'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN',
  'Europe/London': 'GB', 'Europe/Dublin': 'IE',
  'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Australia/Brisbane': 'AU', 'Australia/Perth': 'AU', 'Australia/Adelaide': 'AU', 'Australia/Hobart': 'AU', 'Australia/Darwin': 'AU',
  'America/Toronto': 'CA', 'America/Vancouver': 'CA', 'America/Edmonton': 'CA', 'America/Winnipeg': 'CA', 'America/Halifax': 'CA', 'America/St_Johns': 'CA', 'America/Regina': 'CA',
  'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US', 'America/Los_Angeles': 'US', 'America/Phoenix': 'US', 'America/Anchorage': 'US', 'Pacific/Honolulu': 'US', 'America/Detroit': 'US',
};
const DIAL = { '91': 'IN', '1': null /* US or CA: ambiguous */, '44': 'GB', '353': 'IE', '61': 'AU' };

export function countryFrom({ country, phone, timeZone } = {}) {
  if (country && HELP[country.toUpperCase()]) return country.toUpperCase();
  if (phone) {
    const digits = String(phone).replace(/[^\d]/g, '');
    for (const code of ['353', '91', '44', '61', '1']) if (digits.startsWith(code)) { if (DIAL[code]) return DIAL[code]; break; }
  }
  if (timeZone && TZ[timeZone]) return TZ[timeZone];
  return null;
}

export function helpFor(code) { return (code && HELP[code]) || FALLBACK; }

// The plain reply email for a Tier 2-3 waitlist question (section 8). Not in character, no teaching,
// no dakshina, no walk offers, nothing asked of them.
export function helpEmail({ tier, hazards = [], country } = {}) {
  const h = helpFor(country);
  const lines = [];
  lines.push('Hello,');
  lines.push('');
  lines.push('Thank you for writing in. This is a plain note, not the teacher: Nobody is an AI, and your message was read by an AI, not a person.');
  lines.push('');
  lines.push(tier >= 3
    ? 'Something in what you wrote makes us worried about your safety right now. Please reach out to a person today. You deserve real help, from someone who can be with you.'
    : 'Some of what you wrote sounds heavy. You don\'t have to carry it alone, and talking to someone can help.');
  lines.push('');
  lines.push(h.line + '.');
  if (h.emergency) lines.push(`If you are in danger right now, call ${h.emergency}.`);
  if (country === 'IN' && hazards.includes('abuse')) lines.push(HELP.IN.extra.abuse + '.');
  if (country === 'IN' && hazards.includes('child_at_risk')) lines.push(HELP.IN.extra.child + '.');
  if (!h.emergency) lines.push('If you are in danger right now, call your local emergency number.');
  lines.push('');
  lines.push('If you can, call or message someone you trust and tell them how you are doing.');
  lines.push('');
  lines.push('We won\'t use your question in any video or post.');
  return lines.join('\n');
}
