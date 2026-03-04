import React, { useState, useRef } from "react";

const ENCOURAGEMENTS = [
  "You're doing AMAZING! 🌟",
  "Super star reader! ⭐",
  "Wow, look at you go! 🚀",
  "You've got this! 💪",
  "Learning is SO cool! 🎉",
  "Words are your superpower! 🦸",
];

const ELEVEN_VOICE_ID = "IKne3meq5aSn9XLyUdCD";

const BubbleDecor = () => (
  <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
    {[...Array(12)].map((_, i) => (
      <div key={i} style={{
        position: "absolute", borderRadius: "50%", opacity: 0.12,
        background: ["#FF6B9D","#FFD93D","#6BCB77","#4D96FF","#FF6B6B","#C77DFF"][i % 6],
        width: `${40 + (i * 23) % 80}px`, height: `${40 + (i * 23) % 80}px`,
        left: `${(i * 137) % 100}%`, top: `${(i * 89) % 100}%`,
        animation: `float ${3 + (i % 4)}s ease-in-out infinite alternate`,
        animationDelay: `${i * 0.4}s`,
      }} />
    ))}
  </div>
);

export default function PronunciationHelper() {
  const [word, setWord] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [encouragement] = useState(() => ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]);
  const [speaking, setSpeaking] = useState(false);
  const [speechText, setSpeechText] = useState("");
  const inputRef = useRef(null);
  const audioRef = useRef(null);

  const speak = async (text) => {
    if (!text || typeof text !== "string" || text.trim() === "") return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setSpeaking(true);
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_VOICE_ID}`,
        {
          method: "POST",
          headers: {
            "xi-api-key": process.env.REACT_APP_ELEVEN_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: text.trim(),
            model_id: "eleven_turbo_v2_5",
            voice_settings: { stability: 0.55, similarity_boost: 0.80, style: 0.2, use_speaker_boost: true },
          }),
        }
      );
      if (!response.ok) throw new Error(`ElevenLabs error: ${response.status}`);
      const audioBuffer = await response.arrayBuffer();
      const blob = new Blob([audioBuffer], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setSpeaking(false); URL.revokeObjectURL(url); audioRef.current = null; };
      audio.onerror = () => { setSpeaking(false); audioRef.current = null; };
      audio.play();
    } catch (err) {
      console.error("Speech error:", err);
      setSpeaking(false);
      if (window.speechSynthesis) {
        const utter = new SpeechSynthesisUtterance(text.trim());
        utter.rate = 0.75; utter.pitch = 1.1;
        utter.onend = () => setSpeaking(false);
        window.speechSynthesis.speak(utter);
      }
    }
  };

  const handleSubmit = async () => {
    const trimmed = word.trim();
    if (!trimmed) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const response = await fetch("/api/pronounce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: trimmed }),
      });
      const parsed = await response.json();
      if (!response.ok) throw new Error(parsed.error);
      setResult(parsed);
      const fullSpeech = `${parsed.word}. ${parsed.howToSay}`;
      setSpeechText(fullSpeech);
      setTimeout(() => speak(fullSpeech), 400);
    } catch (e) {
      setError("Oops! Something went wrong. Try again! 🙈");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    window.speechSynthesis?.cancel();
    setSpeaking(false); setResult(null); setError(null); setWord(""); setSpeechText("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #FFF8F0; }
        @keyframes float { from { transform: translateY(0px) rotate(0deg); } to { transform: translateY(-20px) rotate(5deg); } }
        @keyframes bounceIn { 0% { transform: scale(0.5); opacity: 0; } 70% { transform: scale(1.08); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes wiggle { 0%,100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes speakPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(255,107,157,0.4); } 50% { box-shadow: 0 0 0 16px rgba(255,107,157,0); } }
        .card-enter { animation: bounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        .section-card { animation: slideUp 0.4s ease both; }
        .btn-main:hover { transform: scale(1.07) rotate(-1deg); filter: brightness(1.08); }
        .btn-main:active { transform: scale(0.95); }
        .btn-icon:hover { transform: scale(1.13); }
        input:focus { outline: none; }
      `}</style>
      <BubbleDecor />
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #FFF0FA 0%, #F0F4FF 50%, #FFF8E7 100%)", fontFamily: "'Nunito', sans-serif", position: "relative", zIndex: 1, padding: "20px 16px 40px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "52px", marginBottom: "4px", animation: "wiggle 2s ease-in-out infinite" }}>🗣️</div>
          <h1 style={{ fontFamily: "'Fredoka One', cursive", fontSize: "clamp(32px, 7vw, 52px)", background: "linear-gradient(135deg, #C77DFF, #FF6B9D, #FFD93D)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", lineHeight: 1.1, marginBottom: "6px" }}>Word Helper!</h1>
          <p style={{ fontSize: "clamp(14px, 3.5vw, 18px)", color: "#9B72CF", fontWeight: 700, background: "rgba(199,125,255,0.1)", display: "inline-block", padding: "6px 18px", borderRadius: "20px" }}>{encouragement}</p>
        </div>

        <div style={{ maxWidth: "560px", margin: "0 auto 24px", background: "white", borderRadius: "28px", padding: "20px 22px", boxShadow: "0 8px 32px rgba(199,125,255,0.18), 0 2px 8px rgba(0,0,0,0.06)", border: "3px solid rgba(199,125,255,0.25)" }}>
          <label style={{ fontFamily: "'Fredoka One', cursive", fontSize: "20px", color: "#7B4DBF", display: "block", marginBottom: "12px" }}>Type a word here! 👇</label>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input ref={inputRef} value={word} onChange={e => setWord(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} placeholder="e.g. elephant"
              style={{ flex: 1, fontSize: "clamp(18px, 4vw, 26px)", fontFamily: "'Fredoka One', cursive", padding: "12px 18px", borderRadius: "18px", border: "3px solid #E0C8FF", background: "#FDF6FF", color: "#4A2080", transition: "border-color 0.2s" }}
              onFocus={e => e.target.style.borderColor = "#C77DFF"} onBlur={e => e.target.style.borderColor = "#E0C8FF"} />
            <button onClick={handleSubmit} disabled={loading || !word.trim()} className="btn-main"
              style={{ background: loading ? "#C0A0E0" : "linear-gradient(135deg, #C77DFF, #FF6B9D)", color: "white", border: "none", borderRadius: "18px", padding: "12px 22px", fontSize: "clamp(14px, 3vw, 18px)", fontFamily: "'Fredoka One', cursive", cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s", whiteSpace: "nowrap", boxShadow: "0 4px 16px rgba(199,125,255,0.4)" }}>
              {loading ? "🔮 Thinking..." : "🔊 Say It!"}
            </button>
          </div>
        </div>

        {error && <div style={{ maxWidth: "560px", margin: "0 auto 20px", background: "#FFF0F3", border: "2px solid #FFB3C6", borderRadius: "20px", padding: "16px 20px", color: "#D63065", fontWeight: 700, fontSize: "18px", textAlign: "center" }}>{error}</div>}
        {loading && <div style={{ textAlign: "center", padding: "30px", fontSize: "40px", animation: "pulse 0.8s ease-in-out infinite" }}>✨✨✨</div>}

        {result && (
          <div className="card-enter" style={{ maxWidth: "560px", margin: "0 auto", borderRadius: "28px", overflow: "hidden", boxShadow: "0 12px 48px rgba(199,125,255,0.22), 0 4px 16px rgba(0,0,0,0.08)" }}>
            <div style={{ background: "linear-gradient(135deg, #C77DFF 0%, #FF6B9D 60%, #FFB347 100%)", padding: "22px 24px 18px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: "clamp(36px, 8vw, 56px)", color: "white", lineHeight: 1, textShadow: "0 3px 10px rgba(0,0,0,0.15)" }}>{result.word}</div>
                  {result.syllableCount && <div style={{ color: "rgba(255,255,255,0.85)", fontWeight: 700, fontSize: "14px", marginTop: "4px" }}>{result.syllableCount} syllable{result.syllableCount !== 1 ? "s" : ""}</div>}
                </div>
                <button onClick={handleClear} className="btn-icon" style={{ background: "rgba(255,255,255,0.25)", border: "none", borderRadius: "50%", width: "38px", height: "38px", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0 }}>✕</button>
              </div>
            </div>
            <div style={{ background: "white", padding: "6px 0" }}>
              <div className="section-card" style={{ animationDelay: "0.1s", margin: "14px 16px", background: "linear-gradient(135deg, #F3E8FF, #EDE0FF)", borderRadius: "20px", padding: "14px 18px", border: "2px solid #DCC8FF" }}>
                <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: "13px", color: "#9B72CF", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>🔤 Sounds like...</div>
                <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: "clamp(22px, 5vw, 32px)", color: "#6B2FBF", letterSpacing: "3px" }}>{result.phonetic}</div>
              </div>
              <div className="section-card" style={{ animationDelay: "0.2s", margin: "14px 16px", background: "linear-gradient(135deg, #FFE8F4, #FFD6EE)", borderRadius: "20px", padding: "14px 18px", border: "2px solid #FFBDE0" }}>
                <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: "13px", color: "#D6609A", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>💬 How to say it</div>
                <p style={{ fontSize: "clamp(14px, 3.2vw, 17px)", color: "#7A2050", fontWeight: 700, lineHeight: 1.55 }}>{result.howToSay}</p>
                <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
                  <button onClick={() => speak(speechText)} className="btn-main"
                    style={{ background: speaking ? "linear-gradient(135deg, #FF6B9D, #C77DFF)" : "linear-gradient(135deg, #FF6B9D, #FFB347)", color: "white", border: "none", borderRadius: "14px", padding: "10px 20px", fontSize: "15px", fontFamily: "'Fredoka One', cursive", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "6px", animation: speaking ? "speakPulse 1s ease infinite" : "none", boxShadow: "0 4px 14px rgba(255,107,157,0.35)" }}>
                    {speaking ? "🔊 Speaking..." : "🔁 Repeat"}
                  </button>
                </div>
              </div>
              {result.funFact && (
                <div className="section-card" style={{ animationDelay: "0.3s", margin: "14px 16px 16px", background: "linear-gradient(135deg, #E8FFF0, #D6FFE8)", borderRadius: "20px", padding: "14px 18px", border: "2px solid #B3EFD0" }}>
                  <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: "13px", color: "#3A9B6A", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>🌟 Fun Fact!</div>
                  <p style={{ fontSize: "clamp(13px, 3vw, 16px)", color: "#1A6040", fontWeight: 700, lineHeight: 1.5 }}>{result.funFact}</p>
                </div>
              )}
            </div>
            <div style={{ background: "linear-gradient(135deg, #FFF8E7, #FFF0FA)", padding: "14px 20px", textAlign: "center", borderTop: "2px dashed #F0DEFF" }}>
              <p style={{ fontFamily: "'Fredoka One', cursive", color: "#C77DFF", fontSize: "clamp(14px, 3vw, 16px)" }}>🎉 Great job! Try another word!</p>
            </div>
          </div>
        )}

        {!result && !loading && !error && (
          <div style={{ textAlign: "center", marginTop: "10px", color: "#BCA0DC", fontFamily: "'Fredoka One', cursive", fontSize: "clamp(15px, 3.5vw, 19px)" }}>
            Type any word above and press <strong style={{ color: "#C77DFF" }}>Say It!</strong> 👆
          </div>
        )}
      </div>
    </>
  );
}
