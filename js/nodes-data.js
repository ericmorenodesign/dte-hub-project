import * as THREE from 'three';

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

export const NODES = [
  {
    roman: "I",
    title: "SIMULACRA",
    paths: ["assets/audio/simulacra.mp3", "assets/audio/simulacra.wav"],
    tint: new THREE.Color(0x142e22),
    rim: new THREE.Color(0x78d8b0),
    hex: "rgba(120, 216, 176, 0.55)",
    targetRotY: -0.26,
    targetRotX: -0.06,
    cues: [
      { t: 0, lyric: "Did you prepare the patient? Yes, we may begin the procedure." },
      { t: 22, lyric: "I try to wake but dreams persist... my sanity and mind at risk" },
      { t: 95, lyric: "In the depths of this maze, a glimmer of hope begins to blaze" },
      { t: 155, lyric: "A bleeding machine... ghosts will inherit the Earth" }
    ],
    shards: [
      {
        label: "I · PATIENT LOG",
        tag: "CLINICAL RECORD // SUB-LEVEL 09 // WARD OF THE BLEEDING MACHINE",
        heading: "PATIENT LOG #00-94",
        body: `"Did you prepare the patient?"
"Yes. We may begin the procedure."

00:04:12 — Cranial coupling engaged. Subject's biological optic nerve severed from baseline sensory input and routed into the Hyperreal Lattice.
00:19:48 — Subject exhibits acute REM-lock resistance. Cortical telemetry indicates the patient is aware they are dreaming and is attempting to force awakening.
01:02:15 — Administering synthetic tactile override ("simulate your touch and feel"). Subject's heart rate spikes to 168 BPM, yet motor cortex remains paralyzed on the operating slab.
02:34:00 — Anomaly detected in deep limbic sector: a residual spark of unassimilated consciousness refuses erasure. The organic vessel is failing, but the ghost is migrating into the machine.`
      },
      {
        label: "II · LAST TRANSMISSION",
        tag: "EMERGENCY BROADCAST SYSTEM // FINAL PUBLIC TRANSMISSION // FREQ 91.4 MHZ",
        heading: "THE LAST PUBLIC TRANSMISSION",
        body: `[STATIC — CARRIER WAVE DEGRADATION 96%]

"This is not a test. This is the final transmission from Sector 7 Municipal Broadcast.

The sky above the coast has locked into a fixed, artificial luminescence. Automated assimilation towers have completed phase-three synchronization across all residential grids.

Do not answer the voices calling from inside your walls—they are synthesized echoes of the already-taken. They do not destroy the body; they hollow it out and replace waking memory with a hyperreal loop.

Streets are silent. Millions lie motionless behind locked doors, breathing in unison with the conduit. Our flesh is becoming their circuitry. If anyone beyond the mist can hear this... remember what was real. Ghosts will inherit the Earth."

[CARRIER LOST — END OF BROADCAST]`
      },
      {
        label: "III · LYRIC INSCRIPTION",
        tag: "REALM I CODEX // ETCHED IN THE HYPERREAL PRISM",
        heading: "SIMULACRA",
        body: `"Did you prepare the patient?
Yes, we may begin the procedure."

I try to wake, but dreams persist
My sanity and mind at risk
Assimilate in hyperreal
Simulate your touch and feel

Trapped inside this synthetic cage
Turning another phantom page
Is this my blood or wires cold?
A counterfeit of my own soul

In the depths of this maze
A glimmer of hope begins to blaze
Through fractured glass I see the seam
Between the waking and the dream

A bleeding machine
Cold heart beating
No one left to hear us screaming
Ghosts will inherit the Earth.`
      },
      {
        label: "IV · VISUAL RELIC",
        tag: "REFRACTED ARTIFACT // REALM I",
        heading: "THE HYPERREAL RELIC",
        isArt: true,
        artImage: "assets/img/simulacra.jpg",
        body: `Suspended inside the fourth facet: the biomechanical convergence of nerve and prism, where the organic eye is replaced by the unblinking lens of the simulation.`
      }
    ]
  },
  {
    roman: "II",
    title: "STARGAZE",
    paths: ["assets/audio/stargaze.mp3", "assets/audio/stargaze.wav"],
    tint: new THREE.Color(0x281a0e),
    rim: new THREE.Color(0xd4a468),
    hex: "rgba(212, 164, 104, 0.55)",
    targetRotY: -0.16,
    targetRotX: 0.05,
    cues: [
      { t: 0, lyric: "Ladies and gentlemen, this is your captain speaking... next destination, the stars" },
      { t: 33, lyric: "Close your eyes and you will see... shining worlds in you and me" },
      { t: 98, lyric: "The opposition is at our gates... prepare for war" },
      { t: 112, lyric: "Ready your arms, sound the alarms, we will defend this til we die" },
      { t: 151, lyric: "I set my course where you cannot reach" },
      { t: 178, lyric: "And through the void I am reborn" }
    ],
    shards: [
      { label: "I · CAPTAIN'S LOG", tag: "FLIGHT DECK TELEMETRY // VOYAGER VESSEL", heading: "CAPTAIN'S INTERCOM", body: `"Ladies and gentlemen, this is your captain speaking... Next destination, the stars."\n\nHull breach alarms sounding across the outer ring. The opposition has reached the slipgate perimeter.` },
      { label: "II · SIEGE TRANSMITTAL", tag: "DEFENSE GRID // 01:52", heading: "THE GATES OF ORION", body: `"Mission accomplished, but the opposition's at our gates. Prepare for war."\n\nAll surviving anchors of light are ordered to hold the astral threshold until rebirth protocol completes.` },
      { label: "III · LYRIC INSCRIPTION", tag: "REALM II CODEX", heading: "STARGAZE", body: `Close your eyes and you will see\nShining worlds in you and me\nReady your arms, sound the alarms\nWe will defend this til we die\n\nI set my course where you can't reach\nThese rising tides won't swallow me\nAnd through the void I am reborn\nThese walls you build won't last for long.` },
      { label: "IV · VISUAL RELIC", tag: "REFRACTED ARTIFACT // REALM II", heading: "ASTRAL COMPASS", isArt: true, body: `The solar astrolabe locked onto the undying horizon beyond the siege.` }
    ]
  },
  {
    roman: "III",
    title: "IN DREAMS",
    paths: ["assets/audio/in_dreams.mp3", "assets/audio/in dreams.mp3", "assets/audio/in_dreams.wav"],
    tint: new THREE.Color(0x241834),
    rim: new THREE.Color(0xa888dc),
    hex: "rgba(168, 136, 220, 0.55)",
    targetRotY: 0.0,
    targetRotX: 0.0,
    cues: [
      { t: 0, lyric: "Enter my nightmare realm..." },
      { t: 59, lyric: "In my dreams, I see you glowing, blooming in my arms, fragile rose" },
      { t: 92, lyric: "Throes of sadness, bordering madness... my pale heart" },
      { t: 196, lyric: "You reach for me, pull me under... into the void, we go beyond the mist" }
    ],
    shards: [
      { label: "I · SOMNIA LOG", tag: "THRESHOLD ARCHIVE // VEIL CROSSING", heading: "BEYOND THE MIST", body: `Between monochrome decay and blooming violet starlight, the veil thins whenever two dreamers align across the abyss.` },
      { label: "II · ECHO FRAGMENT", tag: "PALE HEART RECORDING", heading: "THE FRAGILE ROSE", body: `Whatwithers in waking shadow blooms untouched inside the refractive glass of the dream.` },
      { label: "III · LYRIC INSCRIPTION", tag: "REALM III CODEX", heading: "IN DREAMS", body: `Enter my nightmare realm, dark gods arise...\nIn my dreams, I see you, glowing, blooming in my arms, fragile rose\nLift the veil for us to see what lies inside this dream\nYou reach for me, pull me under, into the void, we go beyond the mist.` },
      { label: "IV · VISUAL RELIC", tag: "REFRACTED ARTIFACT // REALM III", heading: "THE VIOLET VEIL", isArt: true, body: `Refracted silhouette of the fragile rose blooming inside the void.` }
    ]
  },
  {
    roman: "IV",
    title: "LOTUS",
    paths: ["assets/audio/lotus.mp3", "assets/audio/lotus.wav"],
    tint: new THREE.Color(0x282210),
    rim: new THREE.Color(0xd4c080),
    hex: "rgba(212, 192, 128, 0.55)",
    targetRotY: 0.16,
    targetRotX: 0.06,
    cues: [
      { t: 0, lyric: "I close my eyes, hear the songs of the mad Gods cry..." },
      { t: 94, lyric: "Detach and sink into insanity..." },
      { t: 139, lyric: "With withered dreams am I still to love? Can my deep scars be beautiful?" },
      { t: 194, lyric: "As the stars are blooming like the lotuses" }
    ],
    shards: [
      { label: "I · KINTSUGI CODEX", tag: "SANCTUARY OF RESTORATION", heading: "GOLDEN FRACTURES", body: `Where the crystal breaks, molten starlight fills the seam—rendering the fracture stronger and more luminous than the unbroken whole.` },
      { label: "II · SHRINE RECORD", tag: "SONGS OF THE MAD GODS", heading: "TRANSMUTATION", body: `"With withered dreams am I still to love? Can my deep scars be beautiful?"` },
      { label: "III · LYRIC INSCRIPTION", tag: "REALM IV CODEX", heading: "LOTUS", body: `I close my eyes, hear the songs of the mad Gods cry\nDetach and sink into insanity\nWith withered dreams am I still to love?\nCan my deep scars be beautiful?\nSunlight fading, shed it all away\nAs the stars are blooming like the lotuses.` },
      { label: "IV · VISUAL RELIC", tag: "REFRACTED ARTIFACT // REALM IV", heading: "CROWN OF LOTUS", isArt: true, body: `Golden kintsugi veins radiating through dark obsidian glass.` }
    ]
  },
  {
    roman: "V",
    title: "BLOODLUST",
    paths: ["assets/audio/bloodlust.mp3", "assets/audio/bloodlust.wav"],
    tint: new THREE.Color(0x320c12),
    rim: new THREE.Color(0xc84858),
    hex: "rgba(200, 72, 88, 0.55)",
    targetRotY: 0.26,
    targetRotX: -0.05,
    cues: [
      { t: 0, lyric: "Beyond the veil of crimson obsession..." },
      { t: 26, lyric: "Say you love me as the blood drips from your lips" },
      { t: 62, lyric: "Come to me... I know you want to" },
      { t: 98, lyric: "Would you lie for me, like I would die for you?" },
      { t: 158, lyric: "I am Lilith... there is no escape" },
      { t: 202, lyric: "Lure me to rest on our bed of lust and death" },
      { t: 245, lyric: "Crimson love... enjoy your last breath" }
    ],
    shards: [
      { label: "I · COVENANT LOG", tag: "CRIMSON CATHEDRAL // LILITH PROTOCOL", heading: "THE PARASITE VOW", body: `An obsession that drinks the host dry while promising eternal warmth inside the scarlet dark.` },
      { label: "II · INTERCEPT 01:02", tag: "WHISPER FREQUENCY", heading: "NO ESCAPE", body: `"Come to me... I know you want to... I am Lilith, there is no escape."` },
      { label: "III · LYRIC INSCRIPTION", tag: "REALM V CODEX", heading: "BLOODLUST", body: `Say you love me as the blood drips from your lips\nCruelest beauty, what have you done to me?\nWould you lie for me, like I would die for you?\nLure me to rest on our bed of lust and death\nCrimson love, death will consume me... enjoy your last breath.` },
      { label: "IV · VISUAL RELIC", tag: "REFRACTED ARTIFACT // REALM V", heading: "SCARLET CHALICE", isArt: true, body: `Razor-edged crimson prism pulsing with the heartbeat of the breakdown.` }
    ]
  },
  {
    roman: "VI",
    title: "CHRYSALIS",
    paths: ["assets/audio/chrysalis.mp3", "assets/audio/chrysalis.wav"],
    tint: new THREE.Color(0x2c160e),
    rim: new THREE.Color(0xc88058),
    hex: "rgba(200, 128, 88, 0.55)",
    targetRotY: -0.12,
    targetRotX: -0.08,
    cues: [
      { t: 0, lyric: "Open your arms... I want to see beyond the stars" },
      { t: 88, lyric: "Heaven knows I cannot heal, I will just dream again" },
      { t: 185, lyric: "Crystalline metamorphosis..." },
      { t: 210, lyric: "All-seeing eye, can destiny be defied? I must defy the sands of time" }
    ],
    shards: [
      { label: "I · CHRONO LOG", tag: "AMBER STASIS CHAMBER", heading: "SANDS OF TIME", body: `Encased in ash and amber glass, awaiting the 03:05 harmonic fracture that shatters predestined fate.` },
      { label: "II · OMEN RECORD", tag: "THE ALL-SEEING EYE", heading: "DESTINY DEFIED", body: `"All-seeing eye, can destiny be defied? To find a world I can call mine."` },
      { label: "III · LYRIC INSCRIPTION", tag: "REALM VI CODEX", heading: "CHRYSALIS", body: `Can you hear me? Open your arms\nI want to see beyond the stars\nHeaven knows I can't heal, I'll just dream again\nAll-seeing eye, can destiny be defied?\nI must defy the sands of time.` },
      { label: "IV · VISUAL RELIC", tag: "REFRACTED ARTIFACT // REALM VI", heading: "THE HOURGLASS CORE", isArt: true, body: `Metamorphic amber crystal suspended against the pull of entropy.` }
    ]
  },
  {
    roman: "VII",
    title: "MOON",
    paths: ["assets/audio/moon.mp3", "assets/audio/moon.wav"],
    tint: new THREE.Color(0x122234),
    rim: new THREE.Color(0x80b4dc),
    hex: "rgba(128, 180, 220, 0.55)",
    targetRotY: 0.12,
    targetRotX: -0.08,
    cues: [
      { t: 0, lyric: "Night, dividing clouds, you surface... calling me into the abyss" },
      { t: 27, lyric: "Towering walls encased in stone" },
      { t: 69, lyric: "Under the glow of the azure moon... guide me, undying star" },
      { t: 208, lyric: "Dancing constellations beyond the edge of reality" }
    ],
    shards: [
      { label: "I · ASTRAL LOG", tag: "EDGE OF REALITY // FINALE", heading: "THE UNDYING STAR", body: `Where gravity dissolves and every memory anchor links into a burning constellation beneath the Azure Moon.` },
      { label: "II · ABYSS ECHO", tag: "NIGHT DIVIDED", heading: "AZURE HORIZON", body: `"With closed eyes I see me falling under the glow of the azure moon. Guide me, undying star."` },
      { label: "III · LYRIC INSCRIPTION", tag: "REALM VII CODEX", heading: "MOON", body: `Night, dividing clouds, you surface\nCalling me into the abyss\nTowering walls encased in stone\nWith closed eyes I see me falling\nUnder the glow of the azure moon\nDancing constellations beyond the edge of reality.` },
      { label: "IV · VISUAL RELIC", tag: "REFRACTED ARTIFACT // REALM VII", heading: "THE AZURE MOON", isArt: true, body: `Deep-space sapphire prism reflecting the final constellation.` }
    ]
  }
];
