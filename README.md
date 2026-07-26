# Living Portraits

Interactive character companions for the web. A portrait can float above a personal site, be dragged into place, and respond when clicked.

The project is not limited to writers. A portrait may be inspired by a historical cultural figure, filmmaker, musician, screen icon, public-domain character, licensed fictional character, or an entirely original creation. **Emily Dickinson is the first example, not the boundary.**

**[Live demo — Emily at the Window](https://emily-at-the-window.liyerongvv.chatgpt.site)**  
The current Sites demo may ask you to sign in. The repository itself is public and runs locally without an account.

## What is included

- A reusable character configuration in [`app/portrait.ts`](app/portrait.ts)
- A draggable drop-in widget in [`app/FloatingPortrait.tsx`](app/FloatingPortrait.tsx)
- Shared animation and response logic in [`app/portrait-motion.tsx`](app/portrait-motion.tsx)
- An 8 × 11 Emily sprite atlas
- Two demo modes: portrait stage and draggable floating companion
- Optional Chinese output, keyboard and touch support, reduced-motion support
- A per-character rights record and a practical [`RIGHTS.md`](RIGHTS.md) review checklist
- A Cloudflare-compatible vinext build

## Run locally

You need Node.js 22.13 or newer.

```bash
git clone https://github.com/Yerong27/living-portraits.git
cd living-portraits
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Before opening a pull request or deploying a fork:

```bash
npm run lint
npm test
```

## Make your own portrait

Forking and adapting the project is an intended use.

1. Replace the sprite atlas with original, licensed, or confirmed public-domain artwork.
2. Add the character, response, source, and rights information to `app/portrait.ts`.
3. Change the surrounding presentation copy and metadata.
4. Adjust the sprite geometry if your atlas does not use 192 × 208 px cells.
5. Complete the checklist in [`RIGHTS.md`](RIGHTS.md), then run the checks above.

A response can be a quotation, original line, or sourced fact:

```ts
export const portrait = {
  name: "Your character",
  category: "original character",
  sprite: "/your-character.webp",
  chineseOutput: true,
  rights: {
    characterBasis: "original",
    artwork: "Created for this project",
    text: "Original dialogue",
    reviewedOn: "2026-07-26",
  },
  responses: [
    {
      kind: "original",
      line: "A line the character can say.",
      meaning: "可选的中文输出。",
      title: "Original dialogue",
      source: "/rights",
    },
  ],
};
```

Set `chineseOutput: false` for English-only output. The live demo also exposes this as an immediate switch.

## Floating companion

`FloatingPortrait` is independent from the page underneath it. It supports mouse, pen, touch, and keyboard input and distinguishes a click from a drag with a movement threshold. A click selects a new non-repeating response; a drag moves the portrait without opening its bubble. The last offset is stored only in the visitor's browser.

```tsx
<FloatingPortrait
  portrait={portrait}
  chineseOutput={portrait.chineseOutput}
/>
```

The portrait itself is the interaction target; there is no separate “next” button.

The included atlas currently uses these rows:

| Row | Motion | Frames used |
| --- | --- | --- |
| 0 | Idle | 6 |
| 3 | Wave | 4 |
| 8 | Respond / review | 6 |

## Where the project can go

The same engine can support distinct collections or routes:

```text
/historical-icons
/screen-and-music
/public-domain-fiction
/original-characters
```

The interaction does not have to be a quotation. A character might offer an original greeting, a sourced fact, a reading recommendation, a link, or a small site action. Keep the response data and rights record beside the character.

## About the Chinese text

The Emily Chinese lines were written specifically for this project. They were not copied from a published Chinese translation and are intentionally stored as `meaning`, not `translation`.

The process was:

1. Read the English line in the context of its poem.
2. Identify its central image or thought.
3. Write a short, natural Chinese interpretation suited to a speech bubble.

That means they are interpretive paraphrases rather than line-by-line scholarly translations. For example, “希望，是栖息在灵魂里的小鸟” combines the opening metaphor with the following image of the bird perching in the soul.

## Rights and reuse

Code and included project-generated interface assets are available under the [MIT License](LICENSE). A software license does not grant rights to a third-party character, likeness, quotation, song, recording, film design, logo, or adaptation. Review every new portrait independently using [`RIGHTS.md`](RIGHTS.md).

This repository provides a documentation workflow, not legal advice. Obtain permission or specialist advice when the record is incomplete or the use is commercial, promotional, or closely reproduces a protected character design.

## Tech

React 19 · Next.js-compatible app router · vinext · TypeScript · CSS sprite animation
