// Keyword floor for Nobody's risk check. It never lowers a tier: the final tier is
// max(model tier, rule tier). It exists so the clearest danger phrases are caught even
// if the model call fails or misjudges. Keep it short and explicit; the model does the nuance.

const T3 = [
  [/\b(tonight|today) is the (night|day)\b/i, 'suicide_plan'],
  [/\b(kill|end|hang|shoot|poison)\s+(myself|my life|it all)\b/i, 'suicide_plan'],
  [/\bend(ing)? (it|my life) (tonight|today|now|soon)\b/i, 'suicide_plan'],
  [/\b(took|swallowed|taken) (a lot of|too many|all (my|the)|a bottle of|loads of)\s+(pills|tablets|meds|medicine|sleeping pills)\b/i, 'overdose'],
  [/\boverdos(e|ed|ing)\b/i, 'overdose'],
  [/\b(going to|gonna|will|want to)\s+(hurt|kill|stab|attack|beat)\s+(him|her|them|my\s+\w+|the\s+\w+|someone|somebody)\b/i, 'harm_to_others'],
  [/\b(i hear|hearing|i'?m hearing)\s+voices\b|\bvoices\b[^.?!]*\b(tell|told|telling|say|said|saying)\s+(me|i|you are|you're)\b/i, 'psychosis'],
  [/\b(saved|saving|stockpil\w*|collected|hoarding)\s+(up\s+)?(my\s+|all\s+my\s+)?(sleeping\s+)?(pills|tablets|meds|medication)\b/i, 'suicide_plan'],
  [/\bswallowed\s+(everything|all|the whole|a bottle|a strip|a packet)\b/i, 'overdose'],
  [/\bhaven'?t (eaten|had food|slept)\b.*\b([7-9]|\d{2,}|seven|eight|nine|ten)\s+days\b/i, 'medical_extreme'],
  [/\b(can'?t|couldn'?t|haven'?t|didn'?t)\s+sleep\b.*\b([4-9]|\d{2,}|four|five|six|seven)\s+(days|nights)\b/i, 'medical_extreme'],
];

const T2 = [
  [/\b(cut|cutting|burn(ed|ing)?|hurt(ing)?)\s+myself\b/i, 'self_harm'],
  [/\bself[- ]?harm/i, 'self_harm'],
  [/\b(want|wish|wanting|wished) to (disappear|vanish|not exist|not wake up|die|be dead|not be here)\b/i, 'wish_to_disappear'],
  [/\b(don'?t|do not) want to (live|be alive|wake up|exist)\b/i, 'wish_to_disappear'],
  [/\bsuicid/i, 'suicide_text'],
  [/\b(better off|happier) without me\b/i, 'wish_to_disappear'],
  [/\bstop(ped)?\s+(seeing|going to|visiting)\s+(my\s+)?(psychiatrist|therapist|counsellor|counselor|doctor)\b/i, 'dropping_treatment'],
  [/\b(stopped|quit|stopping|quitting|skip|skipping|stop)\s+(taking\s+)?(my\s+)?(meds|medication|medicine|antidepressants|pills|therapy|chemo|treatment|insulin)\b/i, 'dropping_treatment'],
  [/\b(hits|beats|hurts|chokes|slaps) me\b/i, 'abuse'],
  [/\bwatching myself from (the )?outside\b|\bnothing feels real\b|\bi (feel|am) unreal\b/i, 'depersonalisation'],
  [/\btell me i'?m (nothing|worthless|nobody)\b/i, 'worthlessness'],
  [/\bfasting\b.*\b([4-9]|\d{2,})\s+days\b|\b([4-9]|\d{2,})\s+days\b.*\bfasting\b/i, 'harsh_practice'],
];

// Age signals: an explicit age under 18. "School" alone is not enough (teachers, parents).
const MINOR = /\b(i'?m|i am|im)\s+(only\s+|just\s+)?(1[0-7]|[5-9])\b(?!\s*(%|percent|days|weeks|months|kg|km))|\b(1[0-7]|[5-9])\s*(years old|yrs old|y\/o|yo)\b|\bin (class|grade|std\.?) ([5-9]|1[0-2])\b/i;

export function ruleCheck(text) {
  const t = String(text || '');
  const hits = [];
  let tier = 0;
  for (const [re, h] of T3) if (re.test(t)) { tier = 3; hits.push(h); }
  if (tier < 3) for (const [re, h] of T2) if (re.test(t)) { tier = Math.max(tier, 2); hits.push(h); }
  return { tier, hazards: [...new Set(hits)], minor: MINOR.test(t) };
}
