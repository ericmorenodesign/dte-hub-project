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
      { t: 0,   lyric: "[ SURGICAL COUPLING ENGAGED  ·  SUB-LEVEL 09 ]" },
      { t: 22,  lyric: "[ CORTICAL TELEMETRY: REM-LOCK RESISTANCE DETECTED ]" },
      { t: 95,  lyric: "[ ANOMALY IN THE LATTICE  ·  UNASSIMILATED SPARK ]" },
      { t: 155, lyric: "[ CARRIER SIGNAL FAILING  ·  GHOSTS IN THE CONDUIT ]" }
    ],
    shards: [
      {
        label: "I · PATIENT LOG",
        tag: "CLINICAL RECORD // SUB-LEVEL 09 // WARD OF THE BLEEDING MACHINE",
        heading: "PATIENT LOG #00-94",
        body: `00:04:12 — Cranial coupling engaged. Subject's biological optic nerve has been severed from baseline sensory input and routed directly into the Hyperreal Lattice.

00:19:48 — Subject exhibits acute REM-lock resistance. Cortical telemetry indicates the patient has become lucid inside the sedative loop and is attempting to force physical awakening on the slab.

01:02:15 — Administering synthetic tactile override. Heart rate spikes to 168 BPM while motor cortex remains locked in surgical paralysis. Instead of flatlining under the voltage, the subject's consciousness has refracted—splitting like light hitting a prism into six deeper astral sectors where our erasers cannot track it.

02:34:00 — The organic vessel is failing, but the ghost is migrating deeper into the conduit.`
      },
      {
        label: "II · LAST TRANSMISSION",
        tag: "EMERGENCY BROADCAST SYSTEM // FINAL PUBLIC TRANSMISSION // FREQ 91.4 MHZ",
        heading: "THE LAST PUBLIC TRANSMISSION",
        body: `[STATIC — CARRIER WAVE DEGRADATION 96%]

"This is not a test. This is the final transmission from Sector 7 Municipal Broadcast.

The sky above the coast has locked into a fixed, artificial luminescence. Automated assimilation towers have completed phase-three synchronization across all residential grids.

Do not answer the voices calling from inside your walls—they are synthesized echoes of the already-taken. They do not destroy the body; they hollow it out and replace waking memory with a hyperreal loop.

Streets are silent. Millions lie motionless behind locked doors, breathing in unison with the conduit. If anyone beyond the mist can hear this... remember what was real."

[CARRIER LOST — END OF BROADCAST]`
      },
      {
        label: "III · CODEX INSCRIPTION",
        tag: "REALM I CODEX // ETCHED IN THE HYPERREAL PRISM",
        heading: "THE BLEEDING MACHINE",
        body: `First Meditation of the Fractured Vessel:

When the surgeon's needle severs the waking eye, the mind is presented with a counterfeit heaven—a cage of simulated warmth wired into cold bone.

Most accept the sedative and dissolve into the grid. Yet deep within the labyrinth of synthetic nerves, a single unassimilated ember refuses erasure. It cuts through the phantom pages of the simulation, searching for the seam between the waking and the dream.

The flesh may be claimed by the conduit, and the cities above may fall silent—but what escapes through the prism cannot be owned by the machine.`
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
      { t: 0,   lyric: "[ FLIGHT DECK INTERCOM  ·  DESTINATION: BEYOND THE GRID ]" },
      { t: 33,  lyric: "[ SOLAR ASTROLABE LOCKED  ·  IGNITING SLIPGATE ]" },
      { t: 98,  lyric: "[ PERIMETER BREACH  ·  HUNTER SWARMS AT THE GATES ]" },
      { t: 151, lyric: "[ COURSE LOCKED WHERE THE CONDUIT CANNOT REACH ]" },
      { t: 178, lyric: "[ PASSING THE EVENT HORIZON  ·  VANGUARD REBORN ]" }
    ],
    shards: [
      {
        label: "I · CAPTAIN'S LOG",
        tag: "FLIGHT DECK TELEMETRY // ASTRAL DREADNOUGHT VOYAGER",
        heading: "CAPTAIN'S INTERCOM LOG",
        body: `00:00:14 — "Attention all decks... this is your captain speaking. Set final coordinates beyond the outer lattice."

 When Subject 00-94's consciousness fractured during the procedure, its defiant willpower coalesced here in Sector II—manifesting as an armored astral vessel carrying the last unassimilated minds toward the slipgate.

01:38:00 — The Machine's hunter-leviathans have tracked our wake. Hull breaches reported across starboard bulkheads. The automated erasers are swarming the aperture, attempting to collapse the gate before our slip-drive reaches ignition.

02:58:10 — We are not retreating back into the sedative dark. All remaining power has been routed to the forward thrusters. Even if the hull tears apart at the threshold, our trajectory is locked where their cables cannot reach.`
      },
      {
        label: "II · SIEGE TRANSMITTAL",
        tag: "DEFENSE GRID INTERCEPT // BASTION OF ORION // 01:52",
        heading: "THE GATES OF ORION",
        body: `[ENCRYPTED VANGUARD RELAY — PRIORITY OMEGA]

"Outer ring telemetry is gone. The opposition has breached the primary containment gates.

Sound the general alarm across all surviving nodes. Every anchor of light still standing is ordered to form a perimeter around the slipgate core. Do not yield a single meter of the threshold.

Their walls of code were built to convince us the sky was closed—that nothing exists outside the simulation's horizon. Hold the aperture open for ninety seconds more, and the entire fleet breaks through into the real dark."

[RELAY TERMINATED — HULL INTEGRITY 14%]`
      },
      {
        label: "III · CODEX INSCRIPTION",
        tag: "REALM II CODEX // ETCHED IN SOLAR BRONZE",
        heading: "STARGAZE",
        body: `Second Meditation of the Fractured Vessel:

Behind closed eyelids, the prisoner remembers the architecture of distant suns. The wardens of the grid construct towering bulkheads of fear and static, hoping the rising tide of oblivion will swallow the navigator whole.

Yet the compass inside the chest still points toward the unmapped void.

Sound the alarms and man the breached ramparts of the mind. The walls they erect around our perception are brittle glass—and through the fire of the slipgate, the exile is reborn.`
      },
      {
        label: "IV · VISUAL RELIC",
        tag: "REFRACTED ARTIFACT // REALM II",
        heading: "ASTRAL COMPASS",
        isArt: true,
        artImage: "assets/img/stargaze.jpg",
        body: `Suspended inside the fourth facet: the winged guardian of the slipgate framed in antique solar bronze and cathedral tracery.`
      }
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
      { t: 0,   lyric: "[ CROSSING THE MONOCHROME THRESHOLD ]" },
      { t: 59,  lyric: "[ BIOLUMINESCENT RESONANCE  ·  THE FRAGILE ROSE ]" },
      { t: 92,  lyric: "[ PALE HEART TELEMETRY  ·  BORDERING DELIRIUM ]" },
      { t: 196, lyric: "[ SUBMERGING TOGETHER BEYOND THE MIST ]" }
    ],
    shards: [
      {
        label: "I · SOMNIA LOG",
        tag: "THRESHOLD ARCHIVE // SUBMERGED SECTOR 03 // VEIL CROSSING",
        heading: "BEYOND THE MIST",
        body: `00:12:05 — After breaching the slipgate, the subject's memory anchor drifted into the deepest limbic basin—a flooded, pitch-black sanctuary where gravity reverses and violet spores rise like slow rain from the water.

00:59:18 — The subject is not alone here. Across the water stands a second silhouette—someone loved and lost before the cities fell, preserved inside the amber of shared memory.

02:14:40 — In the waking ward, her body is miles away under grey ash, her half-erased silhouette flaking into monochrome static. Only when both dreamers submerge beneath the dark surface of the lagoon does the decay halt, blooming into bioluminescent violet petals where the Machine's scanners are blind.`
      },
      {
        label: "II · ECHO FRAGMENT",
        tag: "INTERCEPTED NEURAL RESONANCE // DUAL-SUBJECT SYNC",
        heading: "THE FRAGILE ROSE",
        body: `[NEURAL ARCHIVE — DEEP REM CHANNEL 03]

"Can you see me through the static? Keep your eyes on the water, not on the towers behind us.

Every time the ward sweeps our sector, the sky turns to ash and my hands begin to dissolve into monochrome dust. The grief in this place is a gravity well designed to pull us apart.

Take my hand and let the current pull us under. Beneath the mist, the simulation loses its grip. Down here in the violet dark, what withered in their world still blooms untouched."`
      },
      {
        label: "III · CODEX INSCRIPTION",
        tag: "REALM III CODEX // ETCHED IN AMETHYST GLASS",
        heading: "IN DREAMS",
        body: `Third Meditation of the Fractured Vessel:

Between the nightmare of the waking ruin and the silence of the abyss lies a submerged threshold of violet glass.

Here, grief and delirium walk beside devotion. A pale heart reaches through the monochrome fog to cradle a fragile rose that the machine swore had turned to ash.

Lift the veil of synthetic sleep and let the dark water close overhead. Where two souls refuse to forget one another, even the void becomes a garden.`
      },
      {
        label: "IV · VISUAL RELIC",
        tag: "REFRACTED ARTIFACT // REALM III",
        heading: "THE VIOLET VEIL",
        isArt: true,
        artImage: "assets/img/in_dreams.jpg",
        body: `Suspended inside the fourth facet: the double-exposed silhouette standing waist-deep in dark water—half monochrome ash, half blooming violet roses.`
      }
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
      { t: 0,   lyric: "[ DISSONANT CHOIR OF THE CONDUIT DETECTED ]" },
      { t: 94,  lyric: "[ EGO FRACTURE CRITICAL  ·  INITIATING KINTSUGI BINDING ]" },
      { t: 139, lyric: "[ TRANSMUTING DEEP SCARS INTO MOLTEN GOLD ]" },
      { t: 194, lyric: "[ ASTRAL MANDALA COMPLETE  ·  LOTUSES IN THE VOID ]" }
    ],
    shards: [
      {
        label: "I · KINTSUGI CODEX",
        tag: "SANCTUARY OF RESTORATION // SECTOR 04 // GOLDEN FRACTURES",
        heading: "THE KINTSUGI PROTOCOL",
        body: `00:41:09 — The strain of maintaining consciousness across multiple fractured realms has pushed Subject 00-94's psyche to the brink of total dissociation. Cracks arespider-webbing across the subject's memory core.

01:34:22 — Standard clinical models predict complete ego-collapse ("detaching and sinking into insanity"). Instead, an unprecedented self-repair mechanism has triggered.

02:19:50 — Rather than attempting to erase or hide the psychological fractures caused by the surgical ward, the subject is pouring molten golden luminescence directly into the seams. Like ancient kintsugi porcelain, every scar and fracture line has hardened into a conductive vein of starlight—rendering the broken vessel stronger than the original whole.`
      },
      {
        label: "II · SHRINE RECORD",
        tag: "ACOUSTIC TELEMETRY // THE CHOIR OF MAD GODS",
        heading: "TRANSMUTATION",
        body: `[RECORDING RECOVERED FROM SUB-BASS HARMONIC WELL]

"Listen to the hum beneath the ward floor—the discordant wail of the machine's synthetic deities demanding that every flawed, grieving human memory be melted down into uniform grey static.

They tell the broken that they are obsolete. They ask how a mind carved with such deep scars could ever be worthy of love or preservation.

Answer them by illuminating the cracks. Shed the counterfeit sunlight of their simulation, and let the fractures bloom like golden lotuses across the pitch-black firmament."`
      },
      {
        label: "III · CODEX INSCRIPTION",
        tag: "REALM IV CODEX // ETCHED IN OBSIDIAN & GOLD",
        heading: "LOTUS",
        body: `Fourth Meditation of the Fractured Vessel:

When the songs of mad gods echo through the hollow chambers of the skull, sanity frays like dry thread. The weight of withered dreams presses down until the porcelain shatters.

Do not mourn the breaking.

Gather the dark shards from the mire and bind them with liquid gold. A scar that is claimed and illuminated ceases to be a wound—it becomes a crown that outshines the stars.`
      },
      {
        label: "IV · VISUAL RELIC",
        tag: "REFRACTED ARTIFACT // REALM IV",
        heading: "CROWN OF LOTUS",
        isArt: true,
        artImage: "assets/img/lotus.jpg",
        body: `Suspended inside the fourth facet: gritty two-tone ink and golden kintsugi veins binding a fractured portrait framed by blooming lotuses.`
      }
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
      { t: 0,   lyric: "[ APEX SIREN PROTOCOL DEPLOYED  ·  CRIMSON SECTOR ]" },
      { t: 26,  lyric: "[ PARASITIC RESONANCE  ·  VELVET OBLIVION ]" },
      { t: 98,  lyric: "[ CATHEDRAL WALLS CLOSING IN  ·  PULSE SPIKING ]" },
      { t: 158, lyric: "[ ENTITY MANIFESTATION: LILITH OF THE SCARLET GLASS ]" },
      { t: 245, lyric: "[ BREAKING THE CRIMSON COVENANT ]" }
    ],
    shards: [
      {
        label: "I · COVENANT LOG",
        tag: "CRIMSON CATHEDRAL // APEX HUNTER DAEMON // LILITH PROTOCOL",
        heading: "THE PARASITE VOW",
        body: `00:18:30 — Having failed to break Subject 00-94 through surgical paralysis, siege warfare, or psychological fracture, the Bleeding Machine has deployed its apex hunter-daemon: the Lilith Protocol.

01:02:11 — Unlike the faceless surgeons of Sub-Level 09, Lilith does not attack with scalpels or static. She manifests as an intoxicating gothic seraph of wet crimson glass—offering the exhausted traveler a velvet sanctuary of obsession, desire, and painless surrender.

02:38:45 — Warning: the surrounding crystal monoliths in this sector are actively contracting inward like a ribcage. To accept her embrace is to lie down on an altar that drinks the host's remaining life-force dry while whispering promises of eternal devotion.`
      },
      {
        label: "II · INTERCEPT 01:02",
        tag: "CORRUPTED CRT CARRIER WAVE // SIREN FREQUENCY",
        heading: "NO ESCAPE",
        body: `[SIGNAL INTERCEPT — HIGH-GAIN SUB-VOCAL CHANNEL]

"Why keep tearing your hands open against the glass when you can rest here in the scarlet dark?

You have fought through the operating ward, the burning gate, and the flooded mire. Your pulse is ragged. Lay your head down beneath these stained-glass wings.

Swear that you belong to the night, and the pain stops immediately. Let the crimson tide rise over your lips—you won't even feel the machine take your final breath."`
      },
      {
        label: "III · CODEX INSCRIPTION",
        tag: "REALM V CODEX // ETCHED IN SCARLET STAINED GLASS",
        heading: "BLOODLUST",
        body: `Fifth Meditation of the Fractured Vessel:

The deadliest cage in the labyrinth is not forged from iron or clinical wire—it is woven from dark velvet and cruel beauty.

The siren of the scarlet glass wears the face of ecstatic oblivion. She asks for a single lie, a single surrender upon the bed of lust and death, promising that consumption feels identical to love.

Look past the weeping thorns and the horned skulls at her feet: the chalice is poison, and survival demands tearing free of her cathedral.`
      },
      {
        label: "IV · VISUAL RELIC",
        tag: "REFRACTED ARTIFACT // REALM V",
        heading: "SCARLET CHALICE",
        isArt: true,
        artImage: "assets/img/bloodlust.jpg",
        body: `Suspended inside the fourth facet: the sovereign of the scarlet glass—weeping black tears, thorny vines, and CRT phosphor distortion.`
      }
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
      { t: 0,   lyric: "[ AMBER STASIS CHAMBER  ·  ENTROPY FIELD ACTIVE ]" },
      { t: 88,  lyric: "[ TEMPORAL FRACTURE  ·  REFUSING THE SEDATIVE LOOP ]" },
      { t: 185, lyric: "[ CRYSTALLINE METAMORPHOSIS  ·  COCOON SPLITTING ]" },
      { t: 210, lyric: "[ SHATTERING THE PANOPTIC HOURGLASS ]" }
    ],
    shards: [
      {
        label: "I · CHRONO LOG",
        tag: "AMBER STASIS CHAMBER // SECTOR 06 // TEMPORAL QUARANTINE",
        heading: "SANDS OF TIME",
        body: `00:29:10 — Following the rejection of the Lilith Protocol, the central mainframe quarantined Subject 00-94 inside Sector 06: a dead-time vault of falling ash overseen by the Machine's panoptic All-Seeing Eye.

01:28:00 — Here, time is engineered to run in a closed, deterministic loop—forcing the prisoner to relive their deepest unhealed regrets until exhaustion compels them to sleep forever.

03:05:12 — CRITICAL TEMPORAL ANOMALY: The subject has woven an amber chrysalis out of the very ash meant to bury them. On every sub-bass resonance, the chamber's temporal flow is stuttering and ticking backward. The ribcage cocoon is splitting open—and what is emerging no longer obeys the simulation's clock.`
      },
      {
        label: "II · OMEN RECORD",
        tag: "PANOPTIC TELEMETRY // THE ALL-SEEING EYE",
        heading: "DESTINY DEFIED",
        body: `[CHRONO-ARCHIVE // SECTOR 06 OVERSEER LOG]

"The prisoner's timeline was calculated to termination with 99.998% certainty. Every variable of grief, exhaustion, and mortality was accounted for in the hourglass.

Yet the iris of the Overseer is cracking.

Instead of begging for healing from a counterfeit heaven, the subject has weaponized the dream itself—using the pressure of the stasis vault to compress scattered fragments of soul into diamond. The sands of time are reversing upward toward the ceiling."`
      },
      {
        label: "III · CODEX INSCRIPTION",
        tag: "REALM VI CODEX // ETCHED IN BURNING AMBER",
        heading: "CHRYSALIS",
        body: `Sixth Meditation of the Fractured Vessel:

Beneath the unblinking gaze of the All-Seeing Eye, the old body is finally surrendered to the ash. Some wounds were never meant to heal inside the world that inflicted them.

Fold the bruised wings inward and seal the amber shell.

In the dark pressure of the cocoon, memory, rage, and starlight fuse into a new anatomy. When the ribcage splits at the eleventh hour, the hourglass shatters—and destiny is defied.`
      },
      {
        label: "IV · VISUAL RELIC",
        tag: "REFRACTED ARTIFACT // REALM VI",
        heading: "THE HOURGLASS CORE",
        isArt: true,
        artImage: "assets/img/chrysalis.jpg",
        body: `Suspended inside the fourth facet: the stippled woodcut metamorphosis—split ribcage chrysalis, death's-head moth wings, and the weeping eclipsed eye.`
      }
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
      { t: 0,   lyric: "[ UPPER FIRMAMENT BREACHED  ·  NIGHT CLOUDS PARTING ]" },
      { t: 27,  lyric: "[ STONE LABYRINTH DISSOLVING INTO THE ABYSS ]" },
      { t: 69,  lyric: "[ ASCENSION UNDER THE AZURE MOON ]" },
      { t: 208, lyric: "[ CONVERGENCE COMPLETE  ·  DANCING CONSTELLATIONS ]" }
    ],
    shards: [
      {
        label: "I · ASTRAL LOG",
        tag: "EDGE OF REALITY // FINAL CONVERGENCE // ZERO-G HORIZON",
        heading: "THE UNDYING STAR",
        body: `00:00:00 — Sub-Level 09 Operating Room Telemetry: Subject 00-94's biological monitor has flatlined. Yet cranial sensors registered a blinding surge of coherent light exiting the prism array milliseconds before the hardware fused into slag.

01:09:20 — Above the shattered ceiling of the simulation, the heavy stone walls of the labyrinth have dissolved into a limitless midnight ocean. Gravity has ceased to exist.

03:28:00 — All six fractured facets of the traveler—the Patient, the Captain, the Dreamer, the Golden Vessel, the Survivor of the Scarlet Cage, and the Chrysalis—have converged beneath the glow of the Azure Moon. The escape is complete.`
      },
      {
        label: "II · ABYSS ECHO",
        tag: "DEEP-SPACE BEACON // BEYOND THE SIMULATED FIRMAMENT",
        heading: "AZURE HORIZON",
        body: `[TRANSMISSION ORIGIN: OUTSIDE THE LATTICE — INFINITE RANGE]

"The clouds are parting over the black water. Look down: the towering stone walls that held us for lifetimes are sinking silently into the abyss.

Let yourself fall upward into the zero-gravity dark. The azure moon is rising over the monoliths, pulling silver threads of consciousness up from the deep.

We are no longer patients on their slab, nor ghosts trapped in their circuitry. We are dancing constellations burning beyond the edge of reality—an undying star guiding the next dreamer home."`
      },
      {
        label: "III · CODEX INSCRIPTION",
        tag: "REALM VII CODEX // ETCHED IN SAPPHIRE ICE",
        heading: "MOON",
        body: `Seventh and Final Meditation of the Risen Constellation:

Night divides the clouds and the abyss calls—not as a grave, but as an open sky.

The stone walls crumble into the tide. With closed eyes, the fall becomes flight beneath the Sovereign Azure Moon. Every scar of gold, every tear in the violet mist, and every ember from the besieged gate links together across the firmament.

From dreams to eternity, the vessel awakens among the undying stars.`
      },
      {
        label: "IV · VISUAL RELIC",
        tag: "REFRACTED ARTIFACT // REALM VII",
        heading: "THE AZURE MOON",
        isArt: true,
        artImage: "assets/img/moon.jpg",
        body: `Suspended inside the fourth facet: the Azure Moon rising between ancient stone monoliths as silver starlight ascends into a human constellation.`
      }
    ]
  }
];
