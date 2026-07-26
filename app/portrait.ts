export type Quote = {
  line: string;
  title: string;
  meaning: string;
  source: string;
};

export type Portrait = {
  name: string;
  sprite: string;
  quotes: readonly Quote[];
};

export const emilyPortrait: Portrait = {
  name: "Emily Dickinson",
  sprite: "/emily-spritesheet.webp",
  quotes: [
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
  ],
};
