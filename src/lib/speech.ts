/** Prefer Jordanian, then nearby Levantine voices supplied by the device. */
export function pickArabicVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const arabic = voices.filter(v => /^ar(?:-|_|$)/i.test(v.lang));
  const rank = (v: SpeechSynthesisVoice) => {
    const lang = v.lang.replace('_', '-').toLowerCase();
    return ['ar-jo', 'ar-ps', 'ar-lb', 'ar-sy'].indexOf(lang);
  };
  return arabic.find(v => rank(v) === 0)
    ?? arabic.filter(v => rank(v) > 0).sort((a, b) => rank(a) - rank(b))[0]
    ?? arabic[0] ?? null;
}

export function arabicUtterance(text: string, voice: SpeechSynthesisVoice | null) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = voice?.lang || 'ar-JO';
  if (voice) utterance.voice = voice;
  utterance.rate = 0.96;
  utterance.pitch = 1;
  return utterance;
}


