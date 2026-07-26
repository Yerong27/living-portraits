"use client";

import { useState } from "react";
import { FloatingPortrait } from "./FloatingPortrait";
import { AnimatedPortrait, useLivingPortrait } from "./portrait-motion";
import { emilyPortrait } from "./portrait";

type DemoMode = "stage" | "floating";

function StageDemo({ chineseOutput }: { chineseOutput: boolean }) {
  const { response, hasSpoken, motion, speak } = useLivingPortrait(emilyPortrait);

  return (
    <section className="hero" id="top">
      <div className="intro">
        <p className="eyebrow">Effect 01 · Portrait stage</p>
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
          <blockquote>{hasSpoken ? response.line : "Would you like a line?"}</blockquote>
          {hasSpoken ? (
            <div className="quote-notes">
              {chineseOutput ? <p className="meaning">{response.meaning}</p> : null}
              <p className="attribution">
                Emily Dickinson · {response.title}
                <a href={response.source} target="_blank" rel="noreferrer">查看原诗 ↗</a>
              </p>
            </div>
          ) : (
            <p className="waiting">我把诗藏在袖口里了。</p>
          )}
        </div>

        <div className="pet-stage">
          <div className="window-light" aria-hidden="true" />
          <button className="pet-button" type="button" onClick={speak} aria-label="点击 Emily，听一句诗">
            <AnimatedPortrait portrait={emilyPortrait} motion={motion} />
            <span className="pet-ring" aria-hidden="true" />
          </button>
          <span className="floor-shadow" aria-hidden="true" />
          <p className="pet-hint">点击人物换一句</p>
        </div>
      </div>
    </section>
  );
}

function FloatingDemo({ chineseOutput }: { chineseOutput: boolean }) {
  return (
    <>
      <section className="article-demo" id="top">
        <p className="eyebrow">Effect 02 · Floating companion</p>
        <h1>A quiet companion<br /><em>beside what you love.</em></h1>
        <div className="article-grid">
          <article>
            <p className="article-kicker">Field notes · July 2026</p>
            <h2>Why a personal website should still feel personal</h2>
            <p>
              A personal site can be more than a sequence of documents. A writer, musician,
              screen icon, fictional character, or original creation can give it temperament.
            </p>
            <p>
              Emily is the first example, not the boundary. Each portrait can respond with licensed
              or public-domain lines, original dialogue, facts, or another interaction you design.
            </p>
          </article>
          <aside>
            <span>Try it</span>
            <strong>Drag Emily.<br />Then click her.</strong>
            <p>The widget stays independent from the article beneath it.</p>
          </aside>
        </div>
      </section>
      <FloatingPortrait portrait={emilyPortrait} chineseOutput={chineseOutput} />
    </>
  );
}

export default function Home() {
  const [demoMode, setDemoMode] = useState<DemoMode>("stage");
  const [chineseOutput, setChineseOutput] = useState(emilyPortrait.chineseOutput);

  return (
    <main className="page-shell">
      <div className="paper-grain" aria-hidden="true" />
      <header className="masthead">
        <a className="wordmark" href="#top" aria-label="回到页面顶部">
          Living Portraits
        </a>
        <div className="demo-settings">
          <div className="mode-switch" aria-label="选择演示效果">
            <button
              type="button"
              className={demoMode === "stage" ? "is-active" : ""}
              onClick={() => setDemoMode("stage")}
              aria-pressed={demoMode === "stage"}
            >
              展示页
            </button>
            <button
              type="button"
              className={demoMode === "floating" ? "is-active" : ""}
              onClick={() => setDemoMode("floating")}
              aria-pressed={demoMode === "floating"}
            >
              悬浮宠物
            </button>
          </div>
          <label className="language-switch">
            <input
              type="checkbox"
              checked={chineseOutput}
              onChange={(event) => setChineseOutput(event.target.checked)}
            />
            <span aria-hidden="true" />
            中文释义
          </label>
        </div>
      </header>

      {demoMode === "stage" ? (
        <StageDemo chineseOutput={chineseOutput} />
      ) : (
        <FloatingDemo chineseOutput={chineseOutput} />
      )}

      <footer>
        <p>Original verses by Emily Dickinson · Chinese notes are interpretive paraphrases.</p>
        <p>Amherst, imagined anew</p>
      </footer>
    </main>
  );
}
