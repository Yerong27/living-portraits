"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";

const poems = [
  {
    line: '“Hope” is the thing with feathers —',
    title: '“Hope” is the thing with feathers (314)',
    meaning: "希望，是栖息在灵魂里的小鸟。",
    source: "https://www.poetryfoundation.org/poems/42889/hope-is-the-thing-with-feathers-314",
  },
  {
    line: "Because I could not stop for Death —\nHe kindly stopped for me —",
    title: "Because I could not stop for Death (479)",
    meaning: "当我无暇停步面对死亡，死亡却温和地为我停下。",
    source: "https://www.poetryfoundation.org/poems/47652/because-i-could-not-stop-for-death-479",
  },
  {
    line: "Tell all the truth but tell it slant —",
    title: "Tell all the truth but tell it slant (1263)",
    meaning: "说出全部真相，但让它从斜光里抵达。",
    source: "https://www.poetryfoundation.org/poems/56824/tell-all-the-truth-but-tell-it-slant-1263",
  },
  {
    line: "I dwell in Possibility —",
    title: "I dwell in Possibility (466)",
    meaning: "我居住在可能性里——那是比散文更辽阔的房子。",
    source: "https://poets.org/poem/i-dwell-possibility-466",
  },
  {
    line: "Forever — is composed of Nows —",
    title: "Forever is composed of Nows (25)",
    meaning: "永恒并不遥远，它由每一个此刻组成。",
    source: "https://poets.org/poem/forever-composed-nows-25",
  },
  {
    line: "The Soul selects her own Society —",
    title: "The Soul selects her own Society (303)",
    meaning: "灵魂选择自己的知己，然后轻轻关上门。",
    source: "https://poets.org/anthology/emily-dickinson-14",
  },
] as const;

const motions = {
  idle: { row: 0, frames: 6, speed: 260 },
  wave: { row: 3, frames: 4, speed: 125 },
  read: { row: 8, frames: 6, speed: 185 },
} as const;

type Motion = keyof typeof motions;

export default function Home() {
  const [poemIndex, setPoemIndex] = useState(0);
  const [motion, setMotion] = useState<Motion>("idle");
  const [frame, setFrame] = useState(0);
  const [hasSpoken, setHasSpoken] = useState(false);
  const timers = useRef<number[]>([]);
  const poem = poems[poemIndex];

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      return;
    }

    const timer = window.setInterval(() => {
      setFrame((current) => (current + 1) % motions[motion].frames);
    }, motions[motion].speed);

    return () => window.clearInterval(timer);
  }, [motion]);

  useEffect(() => {
    const activeTimers = timers.current;
    return () => activeTimers.forEach(window.clearTimeout);
  }, []);

  const speak = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];

    setPoemIndex((current) => {
      const jump = 1 + Math.floor(Math.random() * (poems.length - 1));
      return (current + jump) % poems.length;
    });
    setHasSpoken(true);
    setFrame(0);
    setMotion("wave");

    timers.current.push(
      window.setTimeout(() => {
        setFrame(0);
        setMotion("read");
      }, 620),
      window.setTimeout(() => {
        setFrame(0);
        setMotion("idle");
      }, 2200),
    );
  }, []);

  const spriteStyle = {
    "--sprite-x": `${frame * -192}px`,
    "--sprite-y": `${motions[motion].row * -208}px`,
  } as CSSProperties;

  return (
    <main className="page-shell">
      <div className="paper-grain" aria-hidden="true" />
      <header className="masthead">
        <a className="wordmark" href="#top" aria-label="回到页面顶部">
          The Amherst Window
        </a>
        <span className="issue">A small room for large possibilities</span>
      </header>

      <section className="hero" id="top">
        <div className="intro">
          <p className="eyebrow">An interactive poetry companion</p>
          <h1>
            Knock softly.
            <br />
            <em>Emily may answer.</em>
          </h1>
          <p className="lede">
            点击她，收下一句 Emily Dickinson。她不追踪项目进度，
            只在你经过时，从诗里打开一扇小小的门。
          </p>
          <div className="instruction" aria-hidden="true">
            <span className="instruction-line" />
            <span>Click Emily for a line</span>
          </div>
        </div>

        <div className="poetry-room">
          <div className={`quote-card ${hasSpoken ? "is-awake" : ""}`} aria-live="polite">
            <span className="quote-mark" aria-hidden="true">“</span>
            <blockquote>{hasSpoken ? poem.line : "Would you like a line?"}</blockquote>
            {hasSpoken ? (
              <div className="quote-notes">
                <p className="meaning">{poem.meaning}</p>
                <p className="attribution">
                  Emily Dickinson · {poem.title}
                  <a href={poem.source} target="_blank" rel="noreferrer">查看原诗 ↗</a>
                </p>
              </div>
            ) : (
              <p className="waiting">我把诗藏在袖口里了。</p>
            )}
          </div>

          <div className="pet-stage">
            <div className="window-light" aria-hidden="true" />
            <button className="pet-button" type="button" onClick={speak} aria-label="点击 Emily，听一句诗">
              <span className="pet-sprite" style={spriteStyle} aria-hidden="true" />
              <span className="pet-ring" aria-hidden="true" />
            </button>
            <span className="floor-shadow" aria-hidden="true" />
          </div>

          <button className="another-line" type="button" onClick={speak}>
            {hasSpoken ? "再听一句" : "请她开口"}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>

      <footer>
        <p>Original verses by Emily Dickinson · Chinese notes are interpretive paraphrases.</p>
        <p>Amherst, imagined anew</p>
      </footer>
    </main>
  );
}
