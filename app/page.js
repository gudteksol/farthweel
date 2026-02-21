"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const ASCII_LOGO = `
 ███████╗ █████╗ ██████╗ ████████╗██╗    ██╗██╗  ██╗███████╗███████╗██╗     
 ██╔════╝██╔══██╗██╔══██╗╚══██╔══╝██║    ██║██║  ██║██╔════╝██╔════╝██║     
 █████╗  ███████║██████╔╝   ██║   ██║ █╗ ██║███████║█████╗  █████╗  ██║     
 ██╔══╝  ██╔══██║██╔══██╗   ██║   ██║███╗██║██╔══██║██╔══╝  ██╔══╝  ██║     
 ██║     ██║  ██║██║  ██║   ██║   ╚███╔███╔╝██║  ██║███████╗███████╗███████╗
 ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝    ╚══╝╚══╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝
`;

const WHEEL_FRAMES = [
  "  ○\n /|\\\n / \\",
  "  ○\n /|\\\n  |💨",
  "  ○💨\n /|\\\n / \\",
  "  ○\n /|\\💨💨\n / \\",
  "  ○ 💨💨💨\n \\|/\n  |  BRAAAP",
];

const FART_FACES = [
  "( -_-)~",
  "( ・_・)~💨",
  "( ˃᷄⌓˂᷅ )💨💨",
  "(╬ Ò﹏Ó)💨💨💨",
  "ᕦ(ò_óˇ)ᕤ💨💨💨💨💨",
];

const FART_LABELS = ["tiny poot", "lil' toot", "solid rip", "THUNDER CHEEKS", "EARTH SHAKER 💀"];
const SIZE_THRESHOLDS = [0.1, 1, 10, 50];
const TIER_COLORS = ["#555", "#888", "#aaa", "#ddd", "#fff"];

function getFartTier(sol) {
  if (sol < 0.1) return 0;
  if (sol < 1) return 1;
  if (sol < 10) return 2;
  if (sol < 50) return 3;
  return 4;
}

function playFartSound(tier) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    const configs = [
      { dur: 0.15, freq: 120, vol: 0.15, noiseVol: 0.05 },
      { dur: 0.3, freq: 100, vol: 0.25, noiseVol: 0.1 },
      { dur: 0.6, freq: 80, vol: 0.4, noiseVol: 0.2 },
      { dur: 1.0, freq: 60, vol: 0.6, noiseVol: 0.35 },
      { dur: 1.8, freq: 40, vol: 0.8, noiseVol: 0.5 },
    ];
    const c = configs[tier];

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(c.freq, now);
    osc.frequency.exponentialRampToValueAtTime(c.freq * 0.4, now + c.dur);
    oscGain.gain.setValueAtTime(c.vol, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + c.dur);
    osc.connect(oscGain).connect(ctx.destination);

    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = "sine";
    sub.frequency.setValueAtTime(c.freq * 0.5, now);
    sub.frequency.exponentialRampToValueAtTime(c.freq * 0.2, now + c.dur);
    subGain.gain.setValueAtTime(c.vol * 0.6, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + c.dur);
    sub.connect(subGain).connect(ctx.destination);

    const bufferSize = ctx.sampleRate * c.dur;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(c.noiseVol, now);

    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(c.freq * 2, now);
    bp.Q.setValueAtTime(2, now);
    noise.connect(bp).connect(noiseGain).connect(ctx.destination);

    if (tier >= 2) {
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(15 + tier * 8, now);
      lfoGain.gain.setValueAtTime(c.freq * 0.3, now);
      lfo.connect(lfoGain).connect(osc.frequency);
      lfo.start(now);
      lfo.stop(now + c.dur);
    }

    osc.start(now); sub.start(now); noise.start(now);
    osc.stop(now + c.dur); sub.stop(now + c.dur); noise.stop(now + c.dur);
    setTimeout(() => ctx.close(), (c.dur + 0.5) * 1000);
  } catch (e) {}
}

function FartCloud({ tier }) {
  const [opacity, setOpacity] = useState(1);
  const clouds = ["~", "~~💨", "~~~💨💨", "~~~~💨💨💨", "~~~~~💨💨💨💨💨"];
  const pos = useRef({ bottom: 60 + Math.random() * 200, right: 20 + Math.random() * 100 });
  useEffect(() => {
    const t = setTimeout(() => setOpacity(0), 100);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{
      position: "fixed", bottom: pos.current.bottom, right: pos.current.right,
      fontSize: 16 + tier * 8, opacity,
      transition: `opacity ${2 + tier}s ease-out, transform ${2 + tier}s ease-out`,
      transform: opacity === 1 ? "translateY(0)" : "translateY(-120px) translateX(40px)",
      pointerEvents: "none", zIndex: 999, color: "#666",
    }}>
      {clouds[tier]}
    </div>
  );
}

function TxRow({ tx, isNew }) {
  const tier = getFartTier(tx.sol);
  const bar = "█".repeat(Math.min(Math.ceil(tx.sol * 2), 30));
  return (
    <div style={{
      padding: "6px 0", borderBottom: "1px solid #222",
      fontFamily: "'Courier New', monospace", fontSize: 13,
      animation: isNew ? "flashIn 0.3s ease-out" : "none",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <span style={{ color: "#555" }}>[{tx.time}]</span>
        <span style={{ color: "#0f0", flex: 1 }}>BUY {tx.sol.toFixed(4)} SOL</span>
        <span style={{ color: TIER_COLORS[tier], whiteSpace: "nowrap" }}>
          {FART_FACES[tier]} {FART_LABELS[tier]}
        </span>
      </div>
      <div style={{ color: TIER_COLORS[tier], opacity: 0.6, marginTop: 2 }}>{bar}</div>
      <div style={{ color: "#444", fontSize: 11, marginTop: 2 }}>sig: {tx.sig}</div>
    </div>
  );
}

export default function Fartwheel() {
  const [transactions, setTransactions] = useState([]);
  const [fartClouds, setFartClouds] = useState([]);
  const [totalFarts, setTotalFarts] = useState(0);
  const [biggestFart, setBiggestFart] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastFartArt, setLastFartArt] = useState(null);
  const [newSigs, setNewSigs] = useState(new Set());
  const knownSigs = useRef(new Set());
  const soundRef = useRef(true);
  const cloudId = useRef(0);
  const shakeRef = useRef(null);
  const isFirstLoad = useRef(true);

  useEffect(() => { soundRef.current = soundEnabled; }, [soundEnabled]);

  const screenShake = useCallback((tier) => {
    if (!shakeRef.current || tier < 2) return;
    const intensity = [0, 0, 2, 5, 10][tier];
    const dur = [0, 0, 200, 400, 800][tier];
    let start = Date.now();
    (function loop() {
      const elapsed = Date.now() - start;
      if (elapsed > dur) { shakeRef.current.style.transform = ""; return; }
      const decay = 1 - elapsed / dur;
      const x = (Math.random() - 0.5) * intensity * decay;
      const y = (Math.random() - 0.5) * intensity * decay;
      shakeRef.current.style.transform = `translate(${x}px, ${y}px)`;
      requestAnimationFrame(loop);
    })();
  }, []);

  const addFartCloud = useCallback((tier) => {
    const id = ++cloudId.current;
    setFartClouds((prev) => [...prev, { tier, id }]);
    setTimeout(() => setFartClouds((prev) => prev.filter((c) => c.id !== id)), 5000);
  }, []);

  const triggerFart = useCallback((tier) => {
    addFartCloud(tier);
    if (soundRef.current) playFartSound(tier);
    screenShake(tier);
    setLastFartArt(WHEEL_FRAMES[tier]);
    setTimeout(() => setLastFartArt(null), 3000);
  }, [addFartCloud, screenShake]);

  const fetchFromApi = useCallback(async () => {
    try {
      const res = await fetch("/api/transactions");
      const data = await res.json();
      const txs = data.transactions || [];

      setTransactions(txs);
      setTotalFarts(txs.length);
      setBiggestFart(txs.reduce((max, t) => Math.max(max, t.sol), 0));

      // First load: record known sigs, don't trigger farts for history
      if (isFirstLoad.current) {
        txs.forEach((t) => knownSigs.current.add(t.sig));
        isFirstLoad.current = false;
        return;
      }

      // Trigger farts only for new buys
      for (const tx of txs) {
        if (!knownSigs.current.has(tx.sig)) {
          knownSigs.current.add(tx.sig);
          triggerFart(getFartTier(tx.sol));
          setNewSigs((prev) => new Set([...prev, tx.sig]));
          setTimeout(() => {
            setNewSigs((prev) => {
              const next = new Set(prev);
              next.delete(tx.sig);
              return next;
            });
          }, 3000);
        }
      }
    } catch (e) {}
  }, [triggerFart]);

  useEffect(() => {
    fetchFromApi();
    const id = setInterval(fetchFromApi, 10000);
    return () => clearInterval(id);
  }, [fetchFromApi]);

  return (
    <div ref={shakeRef} style={{
      background: "#0a0a0a", color: "#ccc", minHeight: "100vh",
      fontFamily: "'Courier New', Courier, monospace", fontSize: 14,
      padding: "16px 20px", position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @keyframes flashIn { 0% { background: #1a1a00; } 100% { background: transparent; } }
        @keyframes blink { 0%,100% { opacity:1 } 50% { opacity:0 } }
        @keyframes scanline { 0% { top:-10% } 100% { top:110% } }
        @keyframes pulse { 0%,100% { text-shadow: 0 0 5px rgba(0,255,0,0.3); } 50% { text-shadow: 0 0 20px rgba(0,255,0,0.6); } }
        button {
          background: #111; border: 1px solid #444; color: #fff;
          font-family: 'Courier New', monospace; font-size: 13px;
          padding: 8px 16px; cursor: pointer; transition: all 0.15s;
        }
        button:hover { background: #222; border-color: #0f0; color: #0f0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #333; }
      `}</style>

      <div style={{ position:"fixed",top:0,left:0,right:0,height:"2px",background:"rgba(0,255,0,0.03)",animation:"scanline 4s linear infinite",pointerEvents:"none",zIndex:1000 }} />
      <div style={{ position:"fixed",inset:0,background:"radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.5) 100%)",pointerEvents:"none",zIndex:999 }} />

      {fartClouds.map((c) => <FartCloud key={c.id} tier={c.tier} />)}

      <pre style={{ color:"#0f0",fontSize:7.5,lineHeight:1.1,textAlign:"center",margin:"0 auto 4px",textShadow:"0 0 10px rgba(0,255,0,0.3)",overflow:"hidden",animation:"pulse 3s ease-in-out infinite" }}>
        {ASCII_LOGO}
      </pre>

      <div style={{ textAlign:"center",color:"#555",marginBottom:12,fontSize:11 }}>
        ══════════════════ THE SOLANA WALLET GAS DETECTOR v6.9 ══════════════════
      </div>

      {lastFartArt && (
        <div style={{ maxWidth:700,margin:"0 auto 10px",textAlign:"center",padding:"8px 0",border:"1px solid #333",background:"#111" }}>
          <pre style={{ color:"#0f0",fontSize:14,lineHeight:1.3,margin:0 }}>{lastFartArt}</pre>
        </div>
      )}

      <div style={{ maxWidth:700,margin:"0 auto" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,marginBottom:8 }}>
          <span style={{ color:"#888",fontSize:12 }}>
            FARTS: <span style={{ color:"#fff" }}>{totalFarts}</span>
            {"  |  "}
            BIGGEST: <span style={{ color:"#fff" }}>{biggestFart.toFixed(2)} SOL</span>
          </span>
          <button onClick={() => setSoundEnabled(!soundEnabled)}>
            {soundEnabled ? "[ 🔊 SOUND ON ]" : "[ 🔇 SOUND OFF ]"}
          </button>
        </div>

        <div style={{ padding:"6px 0",borderBottom:"1px solid #222",fontSize:11,color:"#555",marginBottom:12 }}>
          <div style={{ marginBottom:3 }}>FART SCALE:</div>
          <div style={{ display:"flex",flexWrap:"wrap",gap:"4px 14px" }}>
            {FART_LABELS.map((label, i) => (
              <span key={i}>
                <span style={{ color:TIER_COLORS[i] }}>
                  {"<"}{SIZE_THRESHOLDS[i] || "50+"}SOL
                </span> = {label}
              </span>
            ))}
          </div>
        </div>

        <div style={{ color:"#555" }}>╔══════════════════════════════════════════════════════════╗</div>
        <div style={{ color:"#0f0",padding:"2px 0 2px 2px" }}>
          ║ LIVE FARTWHEEL FEED
          <span style={{ animation:"blink 1s infinite" }}> █</span>
        </div>
        <div style={{ color:"#555" }}>╠══════════════════════════════════════════════════════════╣</div>

        <div style={{ maxHeight:500,overflowY:"auto",padding:"0 4px" }}>
          {transactions.length === 0 ? (
            <div style={{ color:"#333",padding:"20px 0",textAlign:"center" }}>
              Sniffing for buys... 👃💨
            </div>
          ) : (
            transactions.map((tx, i) => (
              <TxRow key={tx.sig + i} tx={tx} isNew={newSigs.has(tx.sig)} />
            ))
          )}
        </div>

        <div style={{ color:"#555",marginTop:4 }}>╚══════════════════════════════════════════════════════════╝</div>
      </div>
    </div>
  );
}
