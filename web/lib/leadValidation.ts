/** Shared by the lead form (browser) and /api/leads (server), so both enforce the same rules. */
export const INTERESTS = ["Tech", "Bio", "Ops", "Not sure"] as const;
export type Interest = (typeof INTERESTS)[number];

export type LeadInput = { name: string; email: string; interest: Interest; message: string; consent: boolean };
export type LeadErrors = Partial<Record<keyof LeadInput, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateLead(i: LeadInput): LeadErrors {
  const e: LeadErrors = {};
  const name = i.name.trim(), email = i.email.trim(), message = i.message.trim();
  if (name.length > 80) e.name = "Keep the name under 80 characters.";
  if (!email) e.email = "Enter your email so Navya can reply.";
  else if (email.length > 254 || !EMAIL.test(email)) e.email = "That email address doesn't look right.";
  if (!INTERESTS.includes(i.interest)) e.interest = "Pick one of the options.";
  if (message.length < 10) e.message = "Tell me a little about what you need (at least 10 characters).";
  else if (message.length > 1500) e.message = "Please keep the message under 1500 characters.";
  if (!i.consent) e.consent = "Please tick the box so I can contact you about this.";
  return e;
}
