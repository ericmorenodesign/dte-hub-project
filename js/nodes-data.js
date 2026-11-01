import * as THREE from 'three';

export const NODES = [
  {
    roman: "I",
    title: "SIMULACRA",
    paths: ["assets/audio/simulacra.mp3", "assets/audio/simulacra.wav"],
    tint: new THREE.Color(0x1f4232),
    rim: new THREE.Color(0x88e0b8),
    hex: "rgba(136, 224, 184, 0.55)",
    targetRotY: -0.32,
    targetRotX: -0.08,
    cues: [
      { t: 0, lyric: "Did you prepare the patient? Yes, we may begin the procedure." },
      { t: 22, lyric: "I try to wake but dreams persist... my sanity and mind at risk" },
      { t: 95, lyric: "In the depths of this maze, a glimmer of hope begins to blaze" },
      { t: 155, lyric: "A bleeding machine... ghosts will inherit the Earth" }
    ]
  },
  {
    roman: "II",
    title: "STARGAZE",
    paths: ["assets/audio/stargaze.mp3", "assets/audio/stargaze.wav"],
    tint: new THREE.Color(0x47321d),
    rim: new THREE.Color(0xe0b478),
    hex: "rgba(224, 180, 120, 0.55)",
    targetRotY: -0.20,
    targetRotX: 0.06,
    cues: [
      { t: 0, lyric: "Ladies and gentlemen, this is your captain speaking... next destination, the stars" },
      { t: 33, lyric: "Close your eyes and you will see... shining worlds in you and me" },
      { t: 98, lyric: "The opposition is at our gates... prepare for war" },
      { t: 112, lyric: "Ready your arms, sound the alarms, we will defend this til we die" },
      { t: 151, lyric: "I set my course where you cannot reach" },
      { t: 178, lyric: "And through the void I am reborn" }
    ]
  },
  {
    roman: "III",
    title: "IN DREAMS",
    paths: ["assets/audio/in_dreams.mp3", "assets/audio/in dreams.mp3", "assets/audio/in_dreams.wav"],
    tint: new THREE.Color(0x322344),
    rim: new THREE.Color(0xb494e0),
    hex: "rgba(180, 148, 224, 0.55)",
    targetRotY: 0.0,
    targetRotX: 0.0,
    cues: [
      { t: 0, lyric: "Enter my nightmare realm..." },
      { t: 59, lyric: "In my dreams, I see you glowing, blooming in my arms, fragile rose" },
      { t: 92, lyric: "Throes of sadness, bordering madness... my pale heart" },
      { t: 196, lyric: "You reach for me, pull me under... into the void, we go beyond the mist" }
    ]
  },
  {
    roman: "IV",
    title: "LOTUS",
    paths: ["assets/audio/lotus.mp3", "assets/audio/lotus.wav"],
    tint: new THREE.Color(0x423a20),
    rim: new THREE.Color(0xdcc888),
    hex: "rgba(220, 200, 136, 0.55)",
    targetRotY: 0.18,
    targetRotX: 0.07,
    cues: [
      { t: 0, lyric: "I close my eyes, hear the songs of the mad Gods cry..." },
      { t: 94, lyric: "Detach and sink into insanity..." },
      { t: 139, lyric: "With withered dreams am I still to love? Can my deep scars be beautiful?" },
      { t: 194, lyric: "As the stars are blooming like the lotuses" }
    ]
  },
  {
    roman: "V",
    title: "BLOODLUST",
    paths: ["assets/audio/bloodlust.mp3", "assets/audio/bloodlust.wav"],
    tint: new THREE.Color(0x45141c),
    rim: new THREE.Color(0xd85868),
    hex: "rgba(216, 88, 104, 0.55)",
    targetRotY: 0.30,
    targetRotX: -0.05,
    cues: [
      { t: 0, lyric: "Beyond the veil of crimson obsession..." },
      { t: 26, lyric: "Say you love me as the blood drips from your lips" },
      { t: 62, lyric: "Come to me... I know you want to" },
      { t: 98, lyric: "Would you lie for me, like I would die for you?" },
      { t: 158, lyric: "I am Lilith... there is no escape" },
      { t: 202, lyric: "Lure me to rest on our bed of lust and death" },
      { t: 245, lyric: "Crimson love... enjoy your last breath" }
    ]
  },
  {
    roman: "VI",
    title: "CHRYSALIS",
    paths: ["assets/audio/chrysalis.mp3", "assets/audio/chrysalis.wav"],
    tint: new THREE.Color(0x452518),
    rim: new THREE.Color(0xd88c68),
    hex: "rgba(216, 140, 104, 0.55)",
    targetRotY: -0.12,
    targetRotX: -0.10,
    cues: [
      { t: 0, lyric: "Open your arms... I want to see beyond the stars" },
      { t: 88, lyric: "Heaven knows I cannot heal, I will just dream again" },
      { t: 185, lyric: "Crystalline metamorphosis..." },
      { t: 210, lyric: "All-seeing eye, can destiny be defied? I must defy the sands of time" }
    ]
  },
  {
    roman: "VII",
    title: "MOON",
    paths: ["assets/audio/moon.mp3", "assets/audio/moon.wav"],
    tint: new THREE.Color(0x1c3045),
    rim: new THREE.Color(0x88bce0),
    hex: "rgba(136, 188, 224, 0.55)",
    targetRotY: 0.12,
    targetRotX: -0.09,
    cues: [
      { t: 0, lyric: "Night, dividing clouds, you surface... calling me into the abyss" },
      { t: 27, lyric: "Towering walls encased in stone" },
      { t: 69, lyric: "Under the glow of the azure moon... guide me, undying star" },
      { t: 208, lyric: "Dancing constellations beyond the edge of reality" }
    ]
  }
];

export const SIGIL_OUTLINE = [
  [847,89],[806,140],[758,191],[724,220],[694,237],[595,424],[553,414],[532,400],
  [532,248],[520,230],[510,197],[502,141],[500,90],[496,155],[489,199],[479,231],
  [468,248],[468,399],[449,413],[408,424],[403,423],[306,238],[279,223],[244,194],
  [197,145],[152,90],[343,430],[182,442],[344,453],[153,885],[192,821],[233,763],
  [278,714],[299,701],[407,459],[451,471],[468,484],[468,701],[482,730],[491,778],
  [497,844],[499,920],[502,838],[509,768],[519,722],[531,700],[531,486],[544,473],
  [594,459],[702,699],[720,711],[765,761],[804,817],[848,890],[657,456],[659,453],
  [818,442],[657,430]
];
