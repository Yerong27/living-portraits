# Character rights checklist

Use this checklist for every portrait. Copyright and related rights are territorial, fact-specific, and can overlap. A public repository, a non-commercial site, or a newly drawn image does not automatically make third-party material safe to use.

This document is a project workflow, not legal advice.

## 1. Classify the character basis

Choose one and keep evidence:

- **Original** — character, appearance, writing, and assets were created for this project.
- **Historical person** — the person is real; the artwork and text still need separate review.
- **Public domain** — the relevant source work is out of copyright in every territory you intend to serve.
- **Licensed** — written permission covers the character, artwork, text, territory, platform, duration, and commercial status of the use.

Do not label fan art “original” merely because it was redrawn. A new rendering can still be a derivative use of a protected character or studio design.

## 2. Review each rights layer separately

| Layer | Questions to record |
| --- | --- |
| Character | Is the underlying character original, public domain, or licensed? Which version? |
| Appearance | Is this an original design, or does it copy a film costume, actor likeness, album artwork, logo, or signature pose? |
| Text | Is every quote, lyric, dialogue line, translation, and biography note original, public domain, or licensed? |
| Audio | Who owns the composition, lyrics, master recording, performance, and sample? |
| Person | Could the use imply endorsement by a living or recently deceased person or their estate? |
| Trade mark | Are the name, logo, costume, symbol, or project title registered or used as a brand in relevant classes? |
| Territory | Where will the website be accessible and monetised? Rights and terms differ by country. |

## 3. Practical risk bands

These are triage labels, not legal conclusions.

- **Lower risk:** wholly original character and dialogue; documented licence; or verified public-domain source paired with independently created artwork.
- **Needs review:** historical or living celebrity likeness; a famous name used commercially; a short movie quote; a public-domain book character depicted like a later film adaptation; fan art.
- **Do not publish without permission:** copied studio character art, film stills, album covers, logos, song lyrics, audio recordings, voice clones, or a promotional use that suggests endorsement.

## 4. Public-domain checks

Record:

- author or creator;
- type of work;
- creation and first-publication dates;
- death date where relevant;
- country of first publication;
- target territories;
- edition or adaptation actually used;
- official or library source supporting the conclusion;
- date the check was performed.

In Australia, copyright generally lasts 70 years after the author's death for works, while films and sound recordings use different calculations. The Australian Government notes that the duration varies by material and publication history: [Copyright basics](https://www.ag.gov.au/rights-and-protections/copyright/copyright-basics).

For the United States, use the Copyright Office's [Duration of Copyright circular](https://www.copyright.gov/circs/circ15a.pdf). Older works can have different publication and renewal rules. The Copyright Office states that, as of 2026, works published in the United States before 1 January 1931 are in the public domain, but later adaptations remain separate works: [What is Copyright?](https://www.copyright.gov/what-is-copyright/).

Public domain in the book does not put a later film's costume, dialogue, logo, music, or visual design into the public domain.

## 5. Quotations, dialogue, and lyrics

There is no universal “safe number of words.” The U.S. Copyright Office says fair use depends on all the circumstances, including purpose, amount, nature, and market effect: [Fair Use FAQ](https://www.copyright.gov/help/faq/faq-fairuse.html) and [More Information on Fair Use](https://www.copyright.gov/fair-use/more-info.html).

Australian fair dealing is purpose-specific, commonly covering research or study, criticism or review, news reporting, professional advice, parody, and satire. A decorative character widget will not automatically fit one of those purposes: [Australian copyright exceptions](https://www.ag.gov.au/rights-and-protections/copyright/copyright-basics).

Project rule: do not use protected song lyrics, screenplay dialogue, or substantial literary passages without permission. Prefer original dialogue, sourced facts, or confirmed public-domain text.

## 6. Names, logos, likeness, and endorsement

Search names and images, including close variants, in the relevant trade mark registers. For Australia, start with [Australian Trade Mark Search](https://search.ipaustralia.gov.au/trademarks/) and record the classes and results. IP Australia warns that a search result is not a guarantee and that copyright has no Australian register: [IP rights search guidance](https://ipfirstresponse.ipaustralia.gov.au/options/check-if-someone-else-already-owns-word-logo-or-idea-you-want).

Avoid language or presentation that suggests an official relationship. The ACCC states that website and promotional claims must not create a false impression, including about sponsorship or association: [False or misleading claims](https://www.accc.gov.au/consumers/advertising-and-promotions/false-or-misleading-claims).

For living people, estates, voice imitation, commercial merchandise, sponsorship, or uncertain character rights, obtain jurisdiction-specific legal advice before publication.

## 7. Evidence file for each portrait

Create a dated record containing:

```yaml
character: Example
character_basis: original | historical-person | public-domain | licensed
territories: [AU, US]
commercial_use: false
appearance_source: original artwork
text_source: original dialogue
audio_source: none
trade_mark_search:
  registry: Australian Trade Mark Search
  searched_on: YYYY-MM-DD
  result_notes: ""
licence_or_permission: ""
reviewed_on: YYYY-MM-DD
decision: publish | revise | seek-permission | legal-review
```

Save licences, correspondence, screenshots, catalogue records, and source links outside the public repository when they contain private information.

## Current record: Emily Dickinson

- **Basis:** historical person, 1830–1886.
- **Appearance:** project-generated original illustration; it is not based on a screen adaptation or copied portrait asset.
- **English text:** short excerpts from Dickinson poems first published in the nineteenth or early twentieth century. Longer additions should be transcribed from a confirmed public-domain edition because modern critical editions may contain protected editorial material.
- **Chinese text:** short first-line translations documented in Xu Cuihua's *Compendium of Dickinson Poems Translated into Chinese* (2012), which records published Chinese translators and editions. Translation rights remain edition- and territory-specific; review before commercial reuse or longer quotation.
- **Translation source:** https://edl.byu.edu/essays/2012XuCuihuaCompendiumofDickinsonPoemsTranslatedintoChinese.pdf
- **Audio:** none.
- **Branding:** no publisher, studio, estate, or institutional endorsement is claimed.
- **Review date:** 2026-07-29.
