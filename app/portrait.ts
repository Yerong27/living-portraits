export type ResponseLine = {
  kind: "quotation" | "original" | "fact";
  line: string;
  title: string;
  meaning: string;
  source: string;
};

export type RightsRecord = {
  characterBasis: "original" | "historical-person" | "public-domain" | "licensed";
  artwork: string;
  text: string;
  translationSource?: string;
  reviewedOn: string;
};

export type Portrait = {
  id: string;
  name: string;
  category: string;
  sprite: string;
  chineseOutput: boolean;
  responses: readonly ResponseLine[];
  rights: RightsRecord;
};

export const emilyPortrait: Portrait = {
  id: "emily-dickinson",
  name: "Emily Dickinson",
  category: "historical writer",
  sprite: "/emily-spritesheet.webp",
  chineseOutput: true,
  rights: {
    characterBasis: "historical-person",
    artwork: "Original project-generated illustration; not based on a film or studio adaptation.",
    text: "Short Emily Dickinson first-line excerpts. Chinese first-line translations are sourced from Xu Cuihua's Compendium of Dickinson Poems Translated into Chinese (2012), which documents published Chinese translators and editions.",
    translationSource:
      "https://edl.byu.edu/essays/2012XuCuihuaCompendiumofDickinsonPoemsTranslatedintoChinese.pdf",
    reviewedOn: "2026-07-29",
  },
  responses: [
    {
      kind: "quotation",
      line: '"Hope" is the thing with feathers —',
      title: '“Hope” is the thing with feathers (314)',
      meaning: "希望长着羽毛 —",
      source: "https://www.poetryfoundation.org/poems/42889/hope-is-the-thing-with-feathers-314",
    },
    {
      kind: "quotation",
      line: "Because I could not stop for Death —",
      title: "Because I could not stop for Death (479)",
      meaning: "因为我不能停步等候死神 —",
      source: "https://www.poetryfoundation.org/poems/47652/because-i-could-not-stop-for-death-479",
    },
    {
      kind: "quotation",
      line: "I'm Nobody! Who are you?",
      title: "I'm Nobody! Who are you?",
      meaning: "我是个无名小卒！你呢？",
      source: "https://www.poetryfoundation.org/poems/1647321/im-nobody-who-are-you",
    },
    {
      kind: "quotation",
      line: "Tell all the truth but tell it slant —",
      title: "Tell all the truth but tell it slant (1263)",
      meaning: "要说出全部真理，但不能直说 —",
      source: "https://www.poetryfoundation.org/poems/56824/tell-all-the-truth-but-tell-it-slant-1263",
    },
    {
      kind: "quotation",
      line: "I dwell in Possibility —",
      title: "I dwell in Possibility (466)",
      meaning: "我寓居可能之中 —",
      source: "https://www.poetryfoundation.org/poems/52197/i-dwell-in-possibility-466",
    },
    {
      kind: "quotation",
      line: "Forever — is composed of Nows —",
      title: "Forever is composed of Nows (690)",
      meaning: "永远 — 由无数的此刻组成 —",
      source: "https://www.poetryfoundation.org/poems/52202/forever-is-composed-of-nows-690",
    },
    {
      kind: "quotation",
      line: "The Soul selects her own Society —",
      title: "The Soul selects her own Society (303)",
      meaning: "灵魂选择自己的伴侣 —",
      source: "https://poets.org/anthology/emily-dickinson-14",
    },
    {
      kind: "quotation",
      line: "Success is counted sweetest",
      title: "Success is counted sweetest (112)",
      meaning: "成功的滋味最甜",
      source: "https://www.poetryfoundation.org/poems/45721/success-is-counted-sweetest-112",
    },
    {
      kind: "quotation",
      line: "If I can stop one Heart from breaking",
      title: "If I can stop one Heart from breaking",
      meaning: "如果我能使一颗心免于哀伤",
      source: "https://www.poetryfoundation.org/poets/emily-dickinson",
    },
    {
      kind: "quotation",
      line: "There is no Frigate like a Book",
      title: "There is no Frigate like a Book (1286)",
      meaning: "没有战舰像书卷",
      source: "https://www.poetryfoundation.org/poems/52199/there-is-no-frigate-like-a-book-1286",
    },
  ],
};
