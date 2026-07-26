# Living Portraits

Small animated literary companions for the web. Click a portrait and it responds with a line from its work.

The first portrait is **Emily Dickinson**: an 8 × 11 animated sprite atlas with six attributed quotations, short Chinese reflections, responsive interaction, keyboard support, and reduced-motion support.

**[Live demo — Emily at the Window](https://emily-at-the-window.liyerongvv.chatgpt.site)**  
The current Sites demo may ask you to sign in. The repository itself is public and runs locally without an account.

## What is included

- A reusable React portrait configuration in [`app/portrait.ts`](app/portrait.ts)
- Sprite animation and interaction logic in [`app/page.tsx`](app/page.tsx)
- The Emily sprite atlas in [`public/emily-spritesheet.webp`](public/emily-spritesheet.webp)
- A responsive editorial-style presentation
- Six non-repeating, source-linked Emily Dickinson excerpts
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
npm run build
```

## Make your own portrait

Yes—forking is an intended use of this project.

1. Replace `public/emily-spritesheet.webp` with your own transparent sprite atlas.
2. Edit `app/portrait.ts` with the character name, sprite path, quotations, notes, and source links.
3. Change the presentation copy in `app/page.tsx` and the page metadata in `app/layout.tsx`.
4. Adjust the sprite geometry in `app/globals.css` if your atlas does not use 192 × 208 px cells.
5. Run the checks above, then deploy to your preferred React-compatible host.

The included atlas uses this row contract:

| Row | Motion | Frames used |
| --- | --- | --- |
| 0 | Idle | 6 |
| 3 | Wave | 4 |
| 8 | Read / review | 6 |

The source atlas contains additional Codex pet motions and look directions, so future portraits can add richer pointer, focus, or scroll reactions without replacing the format.

## Adding more characters

`Living Portraits` is deliberately broader than a single Emily project. A natural next step is to turn `app/portrait.ts` into a collection and select a portrait by route, for example:

```text
/emily-dickinson
/jane-austen
/walt-whitman
```

Keep each character's quotations, attribution links, and sprite path together. This makes it easier to review rights and sources when the collection grows.

## Content and reuse

Emily Dickinson's original poems are in the public domain. The interface uses short excerpts and links to the source poem at the Poetry Foundation or Academy of American Poets. The Chinese lines are original interpretive paraphrases rather than published translations.

When creating another portrait, verify the rights for its writing, translations, likeness, and artwork. Public-domain status varies by author, country, edition, and type of asset.

The project code and included generated interface assets are available under the [MIT License](LICENSE).

## Tech

React 19 · Next.js-compatible app router · vinext · TypeScript · CSS sprite animation
