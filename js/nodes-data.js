import * as THREE from 'three';

// The 7 articulated shards that form the exact 58-point DTE Sigil when converged at (0,0,0)
export const SHARD_POLYGONS = [
  {
    name: "central_spine",
    mass: 1.35,
    baseZ: 0.04,
    points: [
      [532,400],[532,248],[520,230],[510,197],[502,141],[500,90],[496,155],[489,199],
      [479,231],[468,248],[468,399],[449,413],[451,471],[468,484],[468,701],[482,730],
      [491,778],[497,844],[499,920],[502,838],[509,768],[519,722],[531,700],[531,486],
      [544,473],[553,414]
    ]
  },
  {
    name: "upper_right_wing",
    mass: 0.95,
    baseZ: -0.05,
    points: [
      [847,89],[806,140],[758,191],[724,220],[694,237],[595,424],[657,430]
    ]
  },
  {
    name: "upper_left_wing",
    mass: 0.95,
    baseZ: -0.05,
    points: [
      [403,423],[306,238],[279,223],[244,194],[197,145],[152,90],[343,430]
    ]
  },
  {
    name: "lower_left_wing",
    mass: 1.05,
    baseZ: -0.03,
    points: [
      [344,453],[153,885],[192,821],[233,763],[278,714],[299,701],[407,459]
    ]
  },
  {
    name: "lower_right_wing",
    mass: 1.05,
    baseZ: -0.03,
    points: [
      [594,459],[702,699],[720,711],[765,761],[804,817],[848,890],[657,456]
    ]
  },
  {
    name: "left_cross_blade",
    mass: 0.80,
    baseZ: 0.08,
    points: [
      [468,399],[449,413],[408,424],[343,430],[182,442],[344,453],[407,459],[451,471],[468,484]
    ]
  },
  {
    name: "right_cross_blade",
    mass: 0.80,
    baseZ: 0.08,
    points: [
      [532,400],[553,414],[595,424],[657,430],[818,442],[659,453],[594,459],[544,473],[531,486]
    ]
  }
];

// Each Realm has its own 4D Unfolded Architecture (pos offset [x,y,z] & rot [rx,ry,rz] for each of the 7 shards)
export const NODES = [
  {
    roman: "I",
    title: "SIMULACRA",
    paths: ["assets/audio/simulacra.mp3", "assets/audio/simulacra.wav"],
    tint: new THREE.Color(0x1f4232),
    rim: new THREE.Color(0x88e0b8),
    hex: "rgba(136, 224, 184, 0.55)",
    targetRotY: -0.28,
    targetRotX: -0.06,
    // Fractured Scanner Planes: staggered Z-corridor of parallel surgical glass blades
    formation: [
      { pos: [0.0, 0.15, -0.9],  rot: [0.0, 0.55, 0.0] },
      { pos: [1.35, 0.45, 0.5],  rot: [0.25, -0.75, 0.15] },
      { pos: [-1.35, 0.45, 0.5], rot: [0.25, 0.75, -0.15] },
      { pos: [-1.1, -0.45, 1.4], rot: [-0.2, 0.95, 0.1] },
      { pos: [1.1, -0.45, 1.4],  rot: [-0.2, -0.95, -0.1] },
      { pos: [-0.65, 0.0, 2.1],  rot: [0.0, 1.25, 1.57] },
      { pos: [0.65, 0.0, 2.1],   rot: [0.0, -1.25, -1.57] }
    ],
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
    targetRotY: -0.18,
    targetRotX: 0.05,
    // Cosmic Slipgate Aperture: wide open star-portal ring
    formation: [
      { pos: [0.0, 0.55, -1.2],  rot: [0.45, 0.0, 0.0] },
      { pos: [1.65, 0.35, 0.2],  rot: [0.0, -0.9, -0.35] },
      { pos: [-1.65, 0.35, 0.2], rot: [0.0, 0.9, 0.35] },
      { pos: [-1.45, -0.35, 0.9],rot: [0.0, 0.85, -0.35] },
      { pos: [1.45, -0.35, 0.9], rot: [0.0, -0.85, 0.35] },
      { pos: [-0.85, -0.6, 1.8], rot: [0.5, 0.4, 0.8] },
      { pos: [0.85, -0.6, 1.8],  rot: [0.5, -0.4, -0.8] }
    ],
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
    // Hall of Scrying Mirrors: tall angled monoliths flanking a dream aisle
    formation: [
      { pos: [0.0, 0.1, -1.4],   rot: [0.0, 0.35, 0.0] },
      { pos: [1.25, 0.2, -0.2],  rot: [0.1, -1.05, 0.12] },
      { pos: [-1.25, 0.2, -0.2], rot: [0.1, 1.05, -0.12] },
      { pos: [-1.05, -0.1, 1.1], rot: [-0.1, 1.15, 0.08] },
      { pos: [1.05, -0.1, 1.1],  rot: [-0.1, -1.15, -0.08] },
      { pos: [-0.75, 0.25, 2.1], rot: [0.2, 0.9, 1.4] },
      { pos: [0.75, 0.25, 2.1],  rot: [0.2, -0.9, -1.4] }
    ],
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
    targetRotX: 0.06,
    // Blooming Lotus Mandala: radial petals unfolding outward from the golden heart
    formation: [
      { pos: [0.0, 0.0, -0.4],   rot: [0.0, 0.0, 0.0] },
      { pos: [1.15, 0.55, 0.6],  rot: [-0.55, -0.5, -0.45] },
      { pos: [-1.15, 0.55, 0.6], rot: [-0.55, 0.5, 0.45] },
      { pos: [-1.15, -0.55, 0.6],rot: [0.55, 0.5, -0.45] },
      { pos: [1.15, -0.55, 0.6], rot: [0.55, -0.5, 0.45] },
      { pos: [-1.45, 0.0, 1.2],  rot: [0.0, 0.95, 0.4] },
      { pos: [1.45, 0.0, 1.2],   rot: [0.0, -0.95, -0.4] }
    ],
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
    targetRotY: 0.28,
    targetRotX: -0.05,
    // Crimson Cathedral Cage: inverted blades looming aggressively around the camera
    formation: [
      { pos: [0.0, 0.2, -0.8],   rot: [0.0, 0.0, 3.1415] },
      { pos: [0.95, 0.35, 0.9],  rot: [0.35, -1.15, 0.25] },
      { pos: [-0.95, 0.35, 0.9], rot: [0.35, 1.15, -0.25] },
      { pos: [-0.85, -0.35, 1.6],rot: [-0.35, 1.25, -0.2] },
      { pos: [0.85, -0.35, 1.6], rot: [-0.35, -1.25, 0.2] },
      { pos: [-0.45, 0.55, 2.2], rot: [0.65, 0.6, 1.2] },
      { pos: [0.45, 0.55, 2.2],  rot: [0.65, -0.6, -1.2] }
    ],
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
    targetRotX: -0.08,
    // Chrono-Stasis Gyroscope: orthogonal interlocking crystal rings
    formation: [
      { pos: [0.0, 0.0, 0.2],    rot: [0.0, 0.78, 0.0] },
      { pos: [0.9, 0.4, 0.6],    rot: [0.78, -0.6, 0.5] },
      { pos: [-0.9, 0.4, 0.6],   rot: [-0.78, 0.6, -0.5] },
      { pos: [-0.9, -0.4, 1.2],  rot: [0.78, 0.6, 0.5] },
      { pos: [0.9, -0.4, 1.2],   rot: [-0.78, -0.6, -0.5] },
      { pos: [0.0, 0.65, 1.6],   rot: [1.3, 0.0, 1.57] },
      { pos: [0.0, -0.65, 1.6],  rot: [-1.3, 0.0, -1.57] }
    ],
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
    targetRotX: -0.08,
    // Zero-Gravity Astral Constellation: shards levitating high in an arc
    formation: [
      { pos: [0.0, 0.65, -0.8],  rot: [-0.35, 0.0, 0.0] },
      { pos: [1.55, 0.75, 0.2],  rot: [-0.4, -0.8, -0.3] },
      { pos: [-1.55, 0.75, 0.2], rot: [-0.4, 0.8, 0.3] },
      { pos: [-1.25, -0.15, 1.2],rot: [0.3, 1.1, 0.4] },
      { pos: [1.25, -0.15, 1.2], rot: [0.3, -1.1, -0.4] },
      { pos: [-0.55, 0.4, 1.9],  rot: [-0.5, 0.7, 0.9] },
      { pos: [0.55, 0.4, 1.9],   rot: [-0.5, -0.7, -0.9] }
    ],
    cues: [
      { t: 0, lyric: "Night, dividing clouds, you surface... calling me into the abyss" },
      { t: 27, lyric: "Towering walls encased in stone" },
      { t: 69, lyric: "Under the glow of the azure moon... guide me, undying star" },
      { t: 208, lyric: "Dancing constellations beyond the edge of reality" }
    ]
  }
];
