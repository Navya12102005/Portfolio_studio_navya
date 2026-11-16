import { NextResponse } from "next/server";

/**
 * Text-to-speech for the J.A.R.V.I.S. voice widget, using ElevenLabs. The browser never sees the key: it posts
 * { text } here and gets audio/mpeg back. If ElevenLabs isn't configured or fails, this returns a non-200 and the
 * widget falls back to the browser's built-in voice.
 * Env: ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID (optional ELEVENLABS_MODEL, default eleven_flash_v2_5).
 */

const MAX_CHARS = 500;
const TIMEOUT_MS = 20000;
// Higher-quality model: clones pronounce more naturally than on the low-latency Flash model.
// Override with ELEVENLABS_MODEL (e.g. "eleven_flash_v2_5" for speed, "eleven_v3" for expressiveness).
const MODEL = process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2";

/**
 * Text is respelled for the voice only (the on-screen text is untouched). Add a [pattern, spoken form] pair whenever
 * a word is mispronounced. Patterns are matched case-sensitively as whole words unless they contain punctuation.
 */
const SAY: [RegExp, string][] = [
  [/J\.A\.R\.V\.I\.S\.?/g, "Jarvis"],
  [/\bNavya\b/g, "Nuv-yah"],
  [/\bVIT\b/g, "V I T"],
  [/\bAWS\b/g, "A W S"],
  [/\bB\.?Tech\b/g, "B Tech"],
  [/\bNoviCord\b/g, "Novi Cord"],
  [/\bAI\b/g, "A I"],
  [/\bML\b/g, "M L"],
  [/\bMedTech\b/g, "Med Tech"],
  [/\bPDB\b/g, "P D B"],
  [/\bKPI\b/g, "K P I"],
  [/\bCSV\b/g, "C S V"],
  [/\bOPS\b/g, "ops"],
  [/&/g, " and "],
  [/\s*[—–]\s*/g, ", "],
  [/…/g, "..."],
];
function forSpeech(text: string): string {
  return SAY.reduce((t, [re, to]) => t.replace(re, to), text).replace(/\s{2,}/g, " ").trim();
}

// Best-effort per-IP limit so a stranger can't burn the credits. In-memory, so it resets per serverless instance.
const hits = new Map<string, number[]>();
function limited(ip: string): boolean {
  const now = Date.now(), recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now); hits.set(ip, recent);
  if (hits.size > 500) for (const [k, v] of hits) if (!v.some((t) => now - t < 60_000)) hits.delete(k);
  return recent.length > 12;
}

export async function POST(req: Request) {
  const key = process.env.ELEVENLABS_API_KEY, voice = process.env.ELEVENLABS_VOICE_ID;
  if (!key || !voice) return NextResponse.json({ error: "tts_not_configured" }, { status: 503 });

  // same-origin only (browsers send Origin on POST); blocks other sites from calling this endpoint
  const origin = req.headers.get("origin"), host = req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (limited(req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown")) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  let text = "";
  try { const b = await req.json(); text = typeof b?.text === "string" ? b.text.trim().slice(0, MAX_CHARS) : ""; } catch { /* handled below */ }
  if (!text) return NextResponse.json({ error: "text_required" }, { status: 400 });

  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify({
        text: forSpeech(text),
        model_id: MODEL,
        // steadier delivery = more consistent pronunciation; style 0 avoids exaggerated, drifting intonation
        voice_settings: { stability: 0.6, similarity_boost: 0.75, style: 0, use_speaker_boost: true },
      }),
      signal: ctl.signal,
    });
    if (!res.ok || !res.body) {
      console.error("jarvis-tts: ElevenLabs responded", res.status);
      return NextResponse.json({ error: "tts_failed", status: res.status }, { status: 502 });
    }
    return new Response(res.body, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("jarvis-tts: request failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "tts_failed" }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
