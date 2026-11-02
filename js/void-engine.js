import * as THREE from 'three';
import { NODES, SIGIL_OUTLINE } from './nodes-data.js';
import { AudioNexus } from './audio-nexus.js';

let gravityWaveBoost = 0.0;
let diveTarget = 0.0;
let diveCurrent = 0.0;
let focusedShardIdx = -1;

// Uncanny 4D Glitch State (Quantized non-Euclidean shear slices on music transients)
let glitchSliceY = 0.0;
let glitchSliceDir = 0.0;
let glitchShearX = 0.0;
let glitchShearZ = 0.0;
let glitchScaleW = 1.0;
let glitchHoldFrames = 0;

const audioNexus = new AudioNexus(() => {
  gravityWaveBoost = 1.0;
  if (focusedShardIdx !== -1) closeShardProjection();
});

// 1. THREE.JS SCENE: PITCH-BLACK VOID CHAMBER
const container = document.getElementById('webglCanvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020204);
scene.fog = new THREE.FogExp2(0x020204, 0.075);

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 80);
camera.position.set(0, 0.15, 7.2);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.98;
container.appendChild(renderer.domElement);

const dpr = Math.min(window.devicePixelRatio, 2);
const envTarget = new THREE.WebGLRenderTarget(
  window.innerWidth * dpr,
  window.innerHeight * dpr,
  { format: THREE.RGBAFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter }
);

// 2. GRAVITY-SETTLED FLOOR FOG & VOLUMETRIC MIST PLUME
const mouseNDC = new THREE.Vector2(0, 0);
const smoothMouseNDC = new THREE.Vector2(0, 0);
const smoothMouse3D = new THREE.Vector3(0, -1.2, 0);
const mouseWorldTarget = new THREE.Vector3(0, -1.2, 0);
const raycaster = new THREE.Raycaster();
const floorPlaneMath = new THREE.Plane(new THREE.Vector3(0, 1, 0), 1.45);

const backMistGeo = new THREE.PlaneGeometry(36, 22);
const backMistMat = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  uniforms: {
    uTime: { value: 0 },
    uTint: { value: audioNexus.activeNode.tint.clone() },
    uRim: { value: audioNexus.activeNode.rim.clone() },
    uSigilOffset: { value: new THREE.Vector2(0, 0) },
    uGravityPulse: { value: 0 },
    uDive: { value: 0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uTint;
    uniform vec3 uRim;
    uniform vec2 uSigilOffset;
    uniform float uGravityPulse;
    uniform float uDive;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                 mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
    }

    float fbm(vec2 p) {
      float v = 0.0, a = 0.5;
      mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
      for (int i = 0; i < 6; i++) {
        v += a * noise(p);
        p = rot * p * 2.03 + vec2(uTime * 0.022, -uTime * 0.015);
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 uv = (vUv - 0.5) * 2.0;
      uv.x *= 1.65;

      vec2 toSigil = uv - uSigilOffset;
      float distSq = dot(toSigil, toSigil);
      vec2 warpedUv = uv - toSigil * (0.14 + uGravityPulse * 0.10) * exp(-distSq * 2.2);

      float n1 = fbm(warpedUv * 1.65);
      float n2 = fbm(warpedUv * 3.1 - vec2(uTime * 0.03, n1 * 1.1));
      float wisps = smoothstep(0.35, 0.84, n2);

      float centerPlume = exp(-dot(uv * vec2(0.85, 0.95), uv * vec2(0.85, 0.95)) * (1.45 - uDive * 0.55));
      float horizon = exp(-pow((vUv.y - 0.24) * 4.5, 2.0)) * 0.55;

      vec3 col = uTint * (centerPlume * 0.65 + horizon * 0.50) * (0.4 + n1 * 0.78);
      col += uRim * wisps * centerPlume * (0.26 + uGravityPulse * 0.28 + uDive * 0.22);

      gl_FragColor = vec4(col, 0.95);
    }
  `
});
const backMistMesh = new THREE.Mesh(backMistGeo, backMistMat);
backMistMesh.position.set(0, 0, -11.0);
scene.add(backMistMesh);

// 3. 5-LAYER GRAVITY-SETTLED FLOOR FOG
const floorLayers = [];
const floorFragmentShader = `
  uniform float uTime;
  uniform float uLayer;
  uniform vec3 uTint;
  uniform vec3 uRim;
  uniform vec3 uMouseWorld;
  uniform vec2 uSigilTilt;
  uniform float uBassWave;
  varying vec3 vWorldPos;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = rot * p * 2.03 + vec2(uTime * 0.04, uTime * 0.02);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 p = vWorldPos.xz * 0.38;

    vec2 toMouse = vWorldPos.xz - uMouseWorld.xz;
    float mouseDistSq = dot(toMouse, toMouse);
    float mousePush = exp(-mouseDistSq * 0.95);
    p -= toMouse * mousePush * 0.32;

    vec2 sigilCenter = uSigilTilt * 0.6;
    vec2 toSigil = vWorldPos.xz - sigilCenter;
    float sigilDist = length(toSigil);

    float gravRipple = sin(sigilDist * 4.2 - uTime * 1.4 - uBassWave * 5.0) * exp(-sigilDist * 0.55);
    p += toSigil * (gravRipple * 0.08 - 0.12 * exp(-sigilDist * sigilDist * 0.8));

    float mist = fbm(p + vec2(uLayer * 1.7, -uTime * 0.03));
    float mist2 = fbm(p * 1.8 - vec2(uTime * 0.05, uLayer * 2.3));
    float combined = mist * 0.65 + mist2 * 0.35;

    float roomFade = exp(-dot(vWorldPos.xz * vec2(0.11, 0.10), vWorldPos.xz * vec2(0.11, 0.10)));

    float underSigilVoid = smoothstep(0.25, 1.35, sigilDist);
    float wakeRing = smoothstep(0.45, 0.0, abs(sigilDist - (1.05 + uBassWave * 0.35)));
    float mouseRim = smoothstep(0.55, 0.0, abs(sqrt(mouseDistSq) - 0.65)) * mousePush;

    vec3 fogCol = mix(uTint * 0.52, uRim * 0.38, combined);
    fogCol += uRim * wakeRing * (0.24 + uBassWave * 0.40);
    fogCol += uRim * mouseRim * 0.20;

    float alpha = smoothstep(0.22, 0.85, combined) * roomFade * (0.45 + 0.55 * underSigilVoid);
    alpha *= (1.0 - mousePush * 0.48);
    alpha *= (0.22 - uLayer * 0.032);

    gl_FragColor = vec4(fogCol, clamp(alpha, 0.0, 0.42));
  }
`;

const floorVertexShader = `
  varying vec3 vWorldPos;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

for (let i = 0; i < 5; i++) {
  const fGeo = new THREE.PlaneGeometry(28, 28, 1, 1);
  fGeo.rotateX(-Math.PI / 2);
  const fMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    uniforms: {
      uTime: { value: 0 },
      uLayer: { value: i },
      uTint: { value: audioNexus.activeNode.tint.clone() },
      uRim: { value: audioNexus.activeNode.rim.clone() },
      uMouseWorld: { value: new THREE.Vector3(0, -1.45, 0) },
      uSigilTilt: { value: new THREE.Vector2(0, 0) },
      uBassWave: { value: 0 }
    },
    vertexShader: floorVertexShader,
    fragmentShader: floorFragmentShader
  });
  const fMesh = new THREE.Mesh(fGeo, fMat);
  fMesh.position.set(0, -1.68 + i * 0.13, -2.5);
  scene.add(fMesh);
  floorLayers.push(fMat);
}

// 4. INTERACTIVE GRAVITATIONAL MIST PARTICLES
const PARTICLE_COUNT = 1800;
const pGeo = new THREE.BufferGeometry();
const pPositions = new Float32Array(PARTICLE_COUNT * 3);
const pVelocities = new Float32Array(PARTICLE_COUNT * 3);
const pSizes = new Float32Array(PARTICLE_COUNT);

for (let i = 0; i < PARTICLE_COUNT; i++) {
  const i3 = i * 3;
  const isFloor = Math.random() < 0.62;
  pPositions[i3]     = (Math.random() - 0.5) * 14;
  pPositions[i3 + 1] = isFloor ? (-1.72 + Math.random() * 0.95) : ((Math.random() - 0.5) * 3.8);
  pPositions[i3 + 2] = (Math.random() - 0.5) * 16 - 3.0;

  pVelocities[i3]     = (Math.random() - 0.5) * 0.004;
  pVelocities[i3 + 1] = isFloor ? (-0.001 - Math.random() * 0.002) : ((Math.random() - 0.5) * 0.0025);
  pVelocities[i3 + 2] = (Math.random() - 0.5) * 0.003;

  pSizes[i] = isFloor ? (18 + Math.random() * 28) : (9 + Math.random() * 20);
}

pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
pGeo.setAttribute('aSize', new THREE.BufferAttribute(pSizes, 1));

const pMat = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  uniforms: {
    uColor: { value: audioNexus.activeNode.rim.clone() }
  },
  vertexShader: `
    attribute float aSize;
    varying float vAlpha;
    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = aSize * (1.0 / max(0.5, -mvPosition.z));
      float distFade = smoothstep(14.0, 2.0, length(mvPosition.xyz));
      vAlpha = distFade * 0.08;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    varying float vAlpha;
    void main() {
      vec2 c = gl_PointCoord - 0.5;
      float d = length(c);
      if (d > 0.5) discard;
      float soft = pow(1.0 - d * 2.0, 2.2);
      gl_FragColor = vec4(uColor, soft * vAlpha);
    }
  `
});

const mistParticles = new THREE.Points(pGeo, pMat);
scene.add(mistParticles);

// ============================================================================
// 5. THE OPTICAL SCRYING LAYER (INVISIBLE IN THE ROOM — VISIBLE *ONLY* THROUGH GLASS!)
// Rendered ONLY during Pass 1 (envTarget) and hidden during Pass 2!
// ============================================================================
const scryGroup = new THREE.Group();
scryGroup.position.set(0, 0.18, -0.8);
scene.add(scryGroup);

const scryLineMat = new THREE.LineBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.72,
  blending: THREE.AdditiveBlending
});

const scryCoreMat = new THREE.MeshBasicMaterial({
  color: 0x88e0b8,
  wireframe: true,
  transparent: true,
  opacity: 0.38,
  blending: THREE.AdditiveBlending
});

// Build 7 distinct 3D Scrying Sculptures (1 for each Roman numeral I - VII)
const scryEntities = [];
for (let i = 0; i < 7; i++) {
  const g = new THREE.Group();
  g.visible = (i === 0);
  scryGroup.add(g);

  if (i === 0) {
    // I. SIMULACRA: Subject 00-94 on the Operating Slab + Cranial Neural Conduits
    const slab = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.5, 0.06, 2.6)), scryLineMat);
    slab.position.set(0, -0.55, 0);
    slab.rotation.x = 0.25;
    g.add(slab);

    const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 1), scryCoreMat);
    head.position.set(0, 0.25, 0);
    g.add(head);

    const ribCage = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.24, 0.75, 8, 4, true), scryCoreMat);
    ribCage.position.set(0, -0.25, 0);
    g.add(ribCage);

    // Neural assimilation conduits rising from the cranium
    const conduitPts = [];
    for (let c = 0; c < 12; c++) {
      const ang = (c / 12) * Math.PI * 2;
      conduitPts.push(new THREE.Vector3(Math.cos(ang) * 0.18, 0.35, Math.sin(ang) * 0.18));
      conduitPts.push(new THREE.Vector3(Math.cos(ang) * 1.35, 1.65, Math.sin(ang) * 0.85));
    }
    const conduits = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(conduitPts), scryLineMat);
    g.add(conduits);
  } else if (i === 1) {
    // II. STARGAZE: The Gates of Orion & Solar Astrolabe
    for (let r = 0; r < 3; r++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55 + r * 0.34, 0.015, 8, 48), scryCoreMat);
      ring.rotation.set(r * 0.6, r * 0.4, 0);
      g.add(ring);
    }
    const starCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.38, 0), scryLineMat);
    g.add(starCore);
  } else if (i === 2) {
    // III. IN DREAMS: The Fragile Rose blooming in the void
    const roseGeo = new THREE.TorusKnotGeometry(0.58, 0.16, 96, 12, 5, 3);
    const roseMesh = new THREE.Mesh(roseGeo, scryCoreMat);
    g.add(roseMesh);
  } else if (i === 3) {
    // IV. LOTUS: Kintsugi Lotus Crown & Golden Fracture Veins
    for (let p = 0; p < 8; p++) {
      const petal = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.ConeGeometry(0.32, 1.15, 4)), scryLineMat);
      const ang = (p / 8) * Math.PI * 2;
      petal.position.set(Math.cos(ang) * 0.45, 0, Math.sin(ang) * 0.45);
      petal.rotation.z = Math.cos(ang) * 0.65;
      petal.rotation.x = Math.sin(ang) * 0.65;
      g.add(petal);
    }
  } else if (i === 4) {
    // V. BLOODLUST: Six-Winged Gothic Seraphic Cage of Lilith
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 1), scryCoreMat);
    g.add(core);
    for (let w = 0; w < 6; w++) {
      const wing = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.ConeGeometry(0.28, 1.65, 3)), scryLineMat);
      const side = w % 2 === 0 ? 1 : -1;
      const tier = Math.floor(w / 2);
      wing.position.set(side * 0.55, 0.35 - tier * 0.35, 0);
      wing.rotation.z = side * (0.55 + tier * 0.42);
      g.add(wing);
    }
  } else if (i === 5) {
    // VI. CHRYSALIS: The All-Seeing Eye & Chrono-Hourglass
    const upperCone = new THREE.Mesh(new THREE.ConeGeometry(0.68, 0.95, 8, 2, true), scryCoreMat);
    upperCone.position.y = 0.48;
    upperCone.rotation.x = Math.PI;
    const lowerCone = new THREE.Mesh(new THREE.ConeGeometry(0.68, 0.95, 8, 2, true), scryCoreMat);
    lowerCone.position.y = -0.48;
    g.add(upperCone, lowerCone);
    const eyeRing = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.02, 8, 48), scryLineMat);
    g.add(eyeRing);
  } else {
    // VII. MOON: The Azure Moon & Undying Star Constellation Web
    const moonSphere = new THREE.Mesh(new THREE.SphereGeometry(0.62, 16, 12), scryCoreMat);
    const orbitRing = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.015, 8, 64), scryLineMat);
    orbitRing.rotation.x = 1.1;
    g.add(moonSphere, orbitRing);
  }

  scryEntities.push(g);
}

// ============================================================================
// 6. UNCANNY 4D GLITCH-WARP + LIQUID-MERCURY VOCAL RIPPLE SHADER
// ============================================================================
const crystalVertexShader = `
  uniform float uTime;
  uniform float uBass;
  uniform float uHigh;
  uniform float uIsSigil;
  uniform float uGlitchSliceY;
  uniform float uGlitchSliceDir;
  uniform float uGlitchShearX;
  uniform float uGlitchShearZ;

  varying vec3 vObjNormal;
  varying vec3 vViewNormal;
  varying vec3 vWorldPos;
  varying vec3 vLocalPos;
  varying vec3 vViewDir;

  void main() {
    vObjNormal = normalize(normal);
    vLocalPos = position;

    vec3 pos = position;

    // UNCANNY 4D DISLOCATION ON THE SIGIL (Quantized planar shear slices — zero soft jello!)
    if (uIsSigil > 0.5) {
      float planeCoord = pos.y * cos(uGlitchSliceDir) + pos.x * sin(uGlitchSliceDir);
      float sliceBand = step(uGlitchSliceY - 0.28, planeCoord) * step(planeCoord, uGlitchSliceY + 0.28);

      pos.x += sliceBand * uGlitchShearX;
      pos.z += sliceBand * uGlitchShearZ;

      float quantY = floor(pos.y * 5.0) / 5.0;
      float hashStep = fract(sin(quantY * 91.7 + floor(uTime * 16.0) * 17.3) * 43758.5453);
      if (hashStep > 0.86 && abs(uGlitchShearX) > 0.005) {
        pos.x += (hashStep - 0.9) * uGlitchShearX * 2.2;
        pos.z -= uGlitchShearZ * 0.8;
      }
    }

    vec4 wp = modelMatrix * vec4(pos, 1.0);
    vWorldPos = wp.xyz;
    vViewNormal = normalize(normalMatrix * normal);
    vec4 mvPos = viewMatrix * wp;
    vViewDir = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

function createBackFaceMat(isSigilVal) {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uBass: { value: 0 },
      uHigh: { value: 0 },
      uIsSigil: { value: isSigilVal },
      uGlitchSliceY: { value: 0 },
      uGlitchSliceDir: { value: 0 },
      uGlitchShearX: { value: 0 },
      uGlitchShearZ: { value: 0 },
      uRimColor: { value: audioNexus.activeNode.rim.clone() },
      uLightPos: { value: new THREE.Vector3(1.5, 2.0, 3.5) },
      uOpacity: { value: 1.0 }
    },
    vertexShader: crystalVertexShader,
    fragmentShader: `
      uniform vec3 uRimColor;
      uniform vec3 uLightPos;
      uniform float uOpacity;
      varying vec3 vObjNormal;
      varying vec3 vViewNormal;
      varying vec3 vWorldPos;
      void main() {
        float isBevel = 1.0 - smoothstep(0.82, 0.97, abs(vObjNormal.z));
        vec3 lightDir = normalize(uLightPos - vWorldPos);
        float internalGlint = pow(max(dot(-vViewNormal, lightDir), 0.0), 3.0) * isBevel;
        float internalEdge = (isBevel * 0.24 + internalGlint * 0.48) * uOpacity;
        gl_FragColor = vec4(uRimColor, internalEdge);
      }
    `
  });
}

function createFrontFaceMat(isSigilVal) {
  return new THREE.ShaderMaterial({
    side: THREE.FrontSide,
    transparent: true,
    uniforms: {
      uEnvTex: { value: envTarget.texture },
      uResolution: { value: new THREE.Vector2(window.innerWidth * dpr, window.innerHeight * dpr) },
      uTime: { value: 0 },
      uBass: { value: 0 },
      uHigh: { value: 0 },
      uIsSigil: { value: isSigilVal },
      uGlitchSliceY: { value: 0 },
      uGlitchSliceDir: { value: 0 },
      uGlitchShearX: { value: 0 },
      uGlitchShearZ: { value: 0 },
      uRimColor: { value: audioNexus.activeNode.rim.clone() },
      uLightPos: { value: new THREE.Vector3(1.5, 2.0, 3.5) },
      uOpacity: { value: 1.0 },
      uHoverGlow: { value: 0.0 }
    },
    vertexShader: crystalVertexShader,
    fragmentShader: `
      uniform sampler2D uEnvTex;
      uniform vec2 uResolution;
      uniform float uTime;
      uniform float uBass;
      uniform float uHigh;
      uniform float uGlitchShearX;
      uniform vec3 uRimColor;
      uniform vec3 uLightPos;
      uniform float uOpacity;
      uniform float uHoverGlow;

      varying vec3 vObjNormal;
      varying vec3 vViewNormal;
      varying vec3 vWorldPos;
      varying vec3 vLocalPos;
      varying vec3 vViewDir;

      void main() {
        vec2 screenUv = gl_FragCoord.xy / uResolution;

        // Object-space bevel lock: 0.0 on flat faces at ALL angles, 1.0 on 3D bevels
        float isBevel = 1.0 - smoothstep(0.84, 0.97, abs(vObjNormal.z));

        // Procedural Liquid-Mercury Normal Ripple driven by high/mid vocal screams & synth transients
        vec2 mercuryRipple = vec2(
          sin(vLocalPos.y * 18.0 + uTime * 9.0) * cos(vLocalPos.x * 14.0 - uTime * 7.0),
          cos(vLocalPos.x * 18.0 - uTime * 8.0) * sin(vLocalPos.y * 14.0 + uTime * 6.0)
        ) * (0.002 + uHigh * 0.024);

        vec2 refractOffset = vViewNormal.xy * (0.018 + isBevel * 0.058) + vLocalPos.xy * 0.014 + mercuryRipple;
        float dispersion = 1.0 + uBass * 0.65 + uHigh * 0.45 + abs(uGlitchShearX) * 8.0;

        vec2 uvR = clamp(screenUv - refractOffset * dispersion * 0.85, 0.001, 0.999);
        vec2 uvG = clamp(screenUv - refractOffset * dispersion * 1.02, 0.001, 0.999);
        vec2 uvB = clamp(screenUv - refractOffset * dispersion * 1.19, 0.001, 0.999);

        vec3 refractedScene;
        refractedScene.r = texture2D(uEnvTex, uvR).r;
        refractedScene.g = texture2D(uEnvTex, uvG).g;
        refractedScene.b = texture2D(uEnvTex, uvB).b;

        // Internal quantum reflection lattice (visible inside the glass facets)
        vec3 reflectVec = reflect(-vViewDir, normalize(vViewNormal + vec3(mercuryRipple * 8.0, 0.0)));
        float lattice = smoothstep(0.76, 0.99, sin(reflectVec.x * 14.0 + vWorldPos.y * 4.0) * cos(reflectVec.y * 14.0 - vWorldPos.x * 4.0));
        vec3 internalScrying = uRimColor * lattice * (0.06 + uBass * 0.14 + uHigh * 0.18 + uHoverGlow * 0.25);

        float viewGrazing = pow(1.0 - abs(dot(vViewNormal, vViewDir)), 2.4);
        float bevelFresnel = isBevel * (0.35 + viewGrazing * 0.88 + uHoverGlow * 0.55);

        vec3 lightDir = normalize(uLightPos - vWorldPos);
        vec3 halfVec = normalize(lightDir + vViewDir);

        float bevelSpec = pow(max(dot(vViewNormal, halfVec), 0.0), 52.0) * isBevel;
        float bevelDiffuseGlint = pow(max(dot(vViewNormal, lightDir), 0.0), 2.2) * isBevel;
        float floorBounce = max(0.0, -vViewNormal.y) * isBevel * 0.35;

        vec3 glassHighlights = uRimColor * (bevelFresnel * 0.58 + bevelDiffuseGlint * 0.88 + floorBounce)
                             + vec3(0.95, 0.98, 1.0) * (bevelSpec * (0.95 + uBass * 0.7 + uHoverGlow * 0.6))
                             + internalScrying;

        vec3 finalCol = refractedScene + glassHighlights * uOpacity;
        gl_FragColor = vec4(finalCol, uOpacity);
      }
    `
  });
}

// ============================================================================
// 7. BUILD THE UNBROKEN 58-POINT DTE CRYSTAL SIGIL + 4D GHOST-ECHO DOUBLE
// ============================================================================
const sigilShape = new THREE.Shape();
SIGIL_OUTLINE.forEach(([px, py], idx) => {
  const x = (px - 500) / 310;
  const y = -(py - 485) / 310;
  if (idx === 0) sigilShape.moveTo(x, y);
  else sigilShape.lineTo(x, y);
});
sigilShape.closePath();

const sigilGeo = new THREE.ExtrudeGeometry(sigilShape, {
  depth: 0.16,
  bevelEnabled: true,
  bevelSegments: 6,
  steps: 1,
  bevelSize: 0.036,
  bevelThickness: 0.095,
  curveSegments: 16
});
sigilGeo.center();
sigilGeo.computeVertexNormals();

const sigilBackMat = createBackFaceMat(1.0);
const sigilFrontMat = createFrontFaceMat(1.0);
const sigilGhostMat = createBackFaceMat(1.0);

const sigilGroup = new THREE.Group();
sigilGroup.position.set(0, 0.18, 0);
scene.add(sigilGroup);

const sigilBackMesh = new THREE.Mesh(sigilGeo, sigilBackMat);
const sigilFrontMesh = new THREE.Mesh(sigilGeo, sigilFrontMat);
const sigilGhostMesh = new THREE.Mesh(sigilGeo, sigilGhostMat);
sigilGhostMesh.visible = false;
sigilGroup.add(sigilBackMesh);
sigilGroup.add(sigilFrontMesh);
sigilGroup.add(sigilGhostMesh);

// ============================================================================
// 8. BUILD THE ENCOMPASSING 360° QUANTUM REFRACTION REALM & CONSTELLATION WEAVING
// ============================================================================
const quantumRealmGroup = new THREE.Group();
quantumRealmGroup.position.set(0, 0.1, -3.5);
scene.add(quantumRealmGroup);

const cageGeo = new THREE.IcosahedronGeometry(5.6, 1);
const cageEdgesGeo = new THREE.EdgesGeometry(cageGeo);
const cageLinesMat = new THREE.LineBasicMaterial({
  color: 0x78d8b0,
  transparent: true,
  opacity: 0.0,
  blending: THREE.AdditiveBlending
});
const cageWireframe = new THREE.LineSegments(cageEdgesGeo, cageLinesMat);
quantumRealmGroup.add(cageWireframe);

const innerShellGeo = new THREE.OctahedronGeometry(4.4, 1);
const innerShellEdges = new THREE.EdgesGeometry(innerShellGeo);
const innerShellLinesMat = new THREE.LineBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.0,
  blending: THREE.AdditiveBlending
});
const innerShellWireframe = new THREE.LineSegments(innerShellEdges, innerShellLinesMat);
quantumRealmGroup.add(innerShellWireframe);

const wallFacetGeo = new THREE.ExtrudeGeometry(sigilShape, {
  depth: 0.08,
  bevelEnabled: true,
  bevelSegments: 3,
  steps: 1,
  bevelSize: 0.025,
  bevelThickness: 0.05,
  curveSegments: 8
});
wallFacetGeo.center();
wallFacetGeo.computeVertexNormals();

const wallBackMat = createBackFaceMat(0.0);
const wallFrontMat = createFrontFaceMat(0.0);
const wallMirrors = [];

for (let i = 0; i < 8; i++) {
  const ang = (i / 8) * Math.PI * 2;
  const holder = new THREE.Group();
  const radius = 4.2;
  holder.position.set(Math.cos(ang) * radius, 0.25 + (i % 2 === 0 ? 0.4 : -0.3), Math.sin(ang) * radius);
  holder.lookAt(0, 0.1, 0);
  holder.scale.set(1.55, 1.55, 1.0);

  const bM = new THREE.Mesh(wallFacetGeo, wallBackMat);
  const fM = new THREE.Mesh(wallFacetGeo, wallFrontMat);
  holder.add(bM);
  holder.add(fM);
  quantumRealmGroup.add(holder);
  wallMirrors.push({ holder, bM, fM, baseAng: ang });
}

// The 4 Interactive Refractive Memory Monoliths
const shardShape = new THREE.Shape();
const sw = 0.48, sh = 0.92;
shardShape.moveTo(0, sh);
shardShape.lineTo(sw, sh * 0.68);
shardShape.lineTo(sw * 0.85, -sh * 0.72);
shardShape.lineTo(0, -sh);
shardShape.lineTo(-sw * 0.85, -sh * 0.72);
shardShape.lineTo(-sw, sh * 0.68);
shardShape.closePath();

const shardGeo = new THREE.ExtrudeGeometry(shardShape, {
  depth: 0.10,
  bevelEnabled: true,
  bevelSegments: 5,
  steps: 1,
  bevelSize: 0.028,
  bevelThickness: 0.065,
  curveSegments: 8
});
shardGeo.center();
shardGeo.computeVertexNormals();

const memoryShards = [];
const shardInteractMeshes = [];
const shardAngles = [-0.85, -0.28, 0.28, 0.85];

for (let i = 0; i < 4; i++) {
  const holder = new THREE.Group();
  const ang = shardAngles[i];
  const radius = 2.65;
  holder.position.set(Math.sin(ang) * radius, 0.08, -Math.cos(ang) * radius + 0.4);
  holder.lookAt(0, 0.08, 1.2);

  const bMat = createBackFaceMat(0.0);
  const fMat = createFrontFaceMat(0.0);

  const bMesh = new THREE.Mesh(shardGeo, bMat);
  const fMesh = new THREE.Mesh(shardGeo, fMat);
  fMesh.userData.memoryShardIndex = i;

  holder.add(bMesh);
  holder.add(fMesh);
  quantumRealmGroup.add(holder);
  shardInteractMeshes.push(fMesh);

  memoryShards.push({
    idx: i,
    holder,
    bMesh,
    fMesh,
    bMat,
    fMat,
    basePos: holder.position.clone(),
    baseRot: holder.rotation.clone(),
    hoverVal: 0.0,
    labelEl: document.getElementById(`shardLabel${i}`)
  });
}

// ZERO-UI CONSTELLATION WEAVING & SHADOW HUSK DISSOLUTION
// Dragging from one Crystal Shard to another weaves a glowing Constellation Thread!
const wovenLinks = [[0, 1], [1, 2], [2, 3]]; // Initial harmonic arc; user can weave custom links!
let weavingFromShardIdx = -1;

const constellationMat = new THREE.LineBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.65,
  blending: THREE.AdditiveBlending
});
const constellationGeo = new THREE.BufferGeometry();
const constellationLines = new THREE.LineSegments(constellationGeo, constellationMat);
quantumRealmGroup.add(constellationLines);

// Encroaching Shadow Husks in the Quantum Floor Mist (Vaporized by Constellation Beams on music transients!)
const shadowHusks = [];
const huskGeo = new THREE.OctahedronGeometry(0.18, 0);
const huskMat = new THREE.MeshBasicMaterial({
  color: 0x050508,
  wireframe: true,
  transparent: true,
  opacity: 0.65
});

for (let h = 0; h < 6; h++) {
  const mesh = new THREE.Mesh(huskGeo, huskMat.clone());
  const ang = (h / 6) * Math.PI * 2;
  mesh.position.set(Math.cos(ang) * 3.8, -1.35, Math.sin(ang) * 3.8);
  quantumRealmGroup.add(mesh);
  shadowHusks.push({
    mesh,
    ang,
    dist: 3.4 + Math.random() * 1.5,
    speed: 0.003 + Math.random() * 0.002,
    targetShard: h % 4,
    laserFlash: 0
  });
}

const laserBeamMat = new THREE.LineBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.9,
  blending: THREE.AdditiveBlending
});
const laserBeamGeo = new THREE.BufferGeometry();
const laserBeams = new THREE.LineSegments(laserBeamGeo, laserBeamMat);
quantumRealmGroup.add(laserBeams);

// ============================================================================
// 9. ETCHED-INSIDE-GLASS PROJECTION & AUDIO-REACTIVE TRANSMISSION STATIC
// ============================================================================
const projOverlayEl = document.getElementById('crystalProjection');
const projTagEl = document.getElementById('projTag');
const projHeadingEl = document.getElementById('projHeading');
const projBodyEl = document.getElementById('projBody');
const projArtFrameEl = document.getElementById('projArtFrame');
const projArtCanvas = document.getElementById('projArtCanvas');
const projArtCtx = projArtCanvas.getContext('2d');
const loadedArtImages = new Map();
let cleanProjectionText = "";
let cleanProjectionHeading = "";

const GLITCH_CHARS = "▓▒░█▌▐▀▄┼╬╫※¤§";

function applyAudioReactiveSignalDistortion(bass, high, t) {
  if (focusedShardIdx === -1) return;

  const burst = Math.max(0, (bass - 0.26) * 2.4 + high * 1.5);
  document.documentElement.style.setProperty('--static-burst', Math.min(1, burst).toFixed(3));
  document.documentElement.style.setProperty('--static-alpha', (0.015 + burst * 0.08).toFixed(3));

  if (burst > 0.28) {
    const gx = ((Math.random() - 0.5) * burst * 8).toFixed(1) + 'px';
    const gy = ((Math.random() - 0.5) * burst * 4).toFixed(1) + 'px';
    const gSkew = ((Math.random() - 0.5) * burst * 3.5).toFixed(2) + 'deg';
    const chroma = (burst * 6.5).toFixed(1) + 'px';
    document.documentElement.style.setProperty('--glitch-x', gx);
    document.documentElement.style.setProperty('--glitch-y', gy);
    document.documentElement.style.setProperty('--glitch-skew', gSkew);
    document.documentElement.style.setProperty('--chroma-shift', chroma);

    // Carrier-wave character degradation on heavy transients (especially dramatic on Last Public Transmission!)
    if (burst > 0.42 && cleanProjectionText.length > 0 && Math.random() < 0.55) {
      const chars = cleanProjectionText.split('');
      const corruptCount = Math.floor(burst * 14);
      for (let c = 0; c < corruptCount; c++) {
        const idx = Math.floor(Math.random() * chars.length);
        if (chars[idx] !== '\n' && chars[idx] !== ' ') {
          chars[idx] = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        }
      }
      projBodyEl.textContent = chars.join('');
    }
  } else {
    document.documentElement.style.setProperty('--glitch-x', '0px');
    document.documentElement.style.setProperty('--glitch-y', '0px');
    document.documentElement.style.setProperty('--glitch-skew', '0deg');
    document.documentElement.style.setProperty('--chroma-shift', '0px');
    if (projBodyEl.textContent !== cleanProjectionText) {
      projBodyEl.textContent = cleanProjectionText;
    }
  }
}

function drawRelicArtCanvas(node, shard, t, bass) {
  const W = projArtCanvas.width;
  const H = projArtCanvas.height;
  projArtCtx.clearRect(0, 0, W, H);

  if (shard.artImage) {
    if (!loadedArtImages.has(shard.artImage)) {
      const img = new Image();
      img.src = shard.artImage;
      loadedArtImages.set(shard.artImage, img);
    }
    const img = loadedArtImages.get(shard.artImage);
    if (img && img.complete && img.naturalWidth > 0) {
      projArtCtx.save();
      projArtCtx.beginPath();
      projArtCtx.moveTo(W * 0.5, H * 0.04);
      projArtCtx.lineTo(W * 0.92, H * 0.25);
      projArtCtx.lineTo(W * 0.86, H * 0.78);
      projArtCtx.lineTo(W * 0.5, H * 0.96);
      projArtCtx.lineTo(W * 0.14, H * 0.78);
      projArtCtx.lineTo(W * 0.08, H * 0.25);
      projArtCtx.closePath();
      projArtCtx.clip();
      projArtCtx.drawImage(img, 0, 0, W, H);
      projArtCtx.restore();
    }
  }

  const r = Math.floor(node.rim.r * 255);
  const g = Math.floor(node.rim.g * 255);
  const b = Math.floor(node.rim.b * 255);

  projArtCtx.save();
  projArtCtx.translate(W / 2, H / 2);

  projArtCtx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.35 + bass * 0.45})`;
  projArtCtx.lineWidth = 1.5;
  for (let rad of [190, 155, 115]) {
    projArtCtx.beginPath();
    projArtCtx.arc(0, 0, rad + bass * 12, 0, Math.PI * 2);
    projArtCtx.stroke();
  }

  for (let i = 0; i < 12; i++) {
    const ang = (i / 12) * Math.PI * 2 + t * 0.15;
    projArtCtx.beginPath();
    projArtCtx.moveTo(Math.cos(ang) * 115, Math.sin(ang) * 115);
    projArtCtx.lineTo(Math.cos(ang) * 190, Math.sin(ang) * 190);
    projArtCtx.stroke();
  }

  projArtCtx.strokeStyle = `rgba(255, 255, 255, 0.90)`;
  projArtCtx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.14)`;
  projArtCtx.lineWidth = 2.2;
  projArtCtx.shadowColor = `rgb(${r}, ${g}, ${b})`;
  projArtCtx.shadowBlur = 18 + bass * 20;
  projArtCtx.beginPath();
  SIGIL_OUTLINE.forEach(([px, py], idx) => {
    const sx = (px - 500) * 0.36;
    const sy = (py - 485) * 0.36;
    if (idx === 0) projArtCtx.moveTo(sx, sy);
    else projArtCtx.lineTo(sx, sy);
  });
  projArtCtx.closePath();
  projArtCtx.fill();
  projArtCtx.stroke();

  projArtCtx.restore();
}

function openShardProjection(shardIdx) {
  const node = audioNexus.activeNode;
  const shardData = node.shards && node.shards[shardIdx];
  if (!shardData) return;

  focusedShardIdx = shardIdx;
  const r = Math.floor(node.rim.r * 255);
  const g = Math.floor(node.rim.g * 255);
  const b = Math.floor(node.rim.b * 255);
  document.documentElement.style.setProperty('--node-rim', `rgb(${r}, ${g}, ${b})`);
  document.documentElement.style.setProperty('--node-glow', node.hex);

  cleanProjectionHeading = shardData.heading;
  cleanProjectionText = shardData.body;

  projTagEl.textContent = shardData.tag;
  projHeadingEl.textContent = cleanProjectionHeading;
  projBodyEl.textContent = cleanProjectionText;

  if (shardData.isArt) {
    projArtFrameEl.classList.add('visible');
    drawRelicArtCanvas(node, shardData, performance.now() * 0.001, 0);
  } else {
    projArtFrameEl.classList.remove('visible');
  }

  projOverlayEl.classList.add('manifest');
}

function closeShardProjection() {
  focusedShardIdx = -1;
  projOverlayEl.classList.remove('manifest');
}

document.getElementById('projDismiss').addEventListener('click', (e) => {
  e.stopPropagation();
  closeShardProjection();
});

projOverlayEl.addEventListener('click', (e) => {
  if (e.target === projOverlayEl) closeShardProjection();
});

// ============================================================================
// 10. INTERACTION: SCRYING LENS DRAG, REALM BREACH & CONSTELLATION WEAVING
// ============================================================================
let currentRotX = 0.0, currentRotY = 0.0;
let targetRotX = 0.0, targetRotY = 0.0;
let dragOffsetX = 0.0, dragOffsetY = 0.0;
// Scrying Lens X/Y translation offset when dragging the crystal across the dark void!
let scryPanX = 0.0, scryPanY = 0.0;
let isDragging = false, lastX = 0, lastY = 0, downX = 0, downY = 0;
let hoveredMemoryShard = null;

function setDiveProgress(val) {
  diveTarget = Math.max(0.0, Math.min(1.0, val));
  if (diveTarget < 0.6 && focusedShardIdx !== -1) closeShardProjection();
  document.body.classList.toggle('realm-breached', diveTarget > 0.45);
}

window.addEventListener('dblclick', () => {
  if (focusedShardIdx !== -1) {
    closeShardProjection();
    return;
  }
  const nextDive = diveTarget < 0.5 ? 1.0 : 0.0;
  setDiveProgress(nextDive);
  gravityWaveBoost = 1.2;

  const node = audioNexus.activeNode;
  if (nextDive > 0.5) {
    audioNexus.showTitleWhisper(`QUANTUM REALM  ·  CLICK SHARDS TO READ  ·  DRAG BETWEEN SHARDS TO WEAVE LIGHT`, 5500);
    if (!audioNexus.hasStartedFirstTrack || audioNexus.audioElement.paused) {
      audioNexus.selectNode(audioNexus.activeIdx, true);
    }
  } else {
    audioNexus.showTitleWhisper(`${node.roman}  ·  ${node.title}`, 3500);
  }
});

window.addEventListener('wheel', (e) => {
  if (focusedShardIdx !== -1) return;
  setDiveProgress(diveTarget + e.deltaY * 0.0009);
  gravityWaveBoost = Math.min(1.0, gravityWaveBoost + 0.22);
}, { passive: true });

window.addEventListener('keydown', (e) => {
  if (e.code === 'Escape') {
    if (focusedShardIdx !== -1) closeShardProjection();
    else setDiveProgress(0.0);
  } else if (e.code === 'Space') {
    e.preventDefault();
    audioNexus.selectNode(audioNexus.activeIdx);
  } else if (e.code === 'Enter') {
    e.preventDefault();
    setDiveProgress(diveTarget < 0.5 ? 1.0 : 0.0);
  } else if (e.key >= '1' && e.key <= '7') {
    audioNexus.selectNode(parseInt(e.key, 10) - 1, true);
  } else if (e.code === 'ArrowRight') {
    audioNexus.selectNode((audioNexus.activeIdx + 1) % NODES.length, true);
  } else if (e.code === 'ArrowLeft') {
    audioNexus.selectNode((audioNexus.activeIdx - 1 + NODES.length) % NODES.length, true);
  }
});

window.addEventListener('pointerdown', (e) => {
  isDragging = true;
  lastX = downX = e.clientX;
  lastY = downY = e.clientY;
  mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;

  // Check if starting a Constellation Weave drag from one of the 4 Memory Shards
  if (diveCurrent > 0.65 && focusedShardIdx === -1) {
    raycaster.setFromCamera(mouseNDC, camera);
    const hits = raycaster.intersectObjects(shardInteractMeshes, false);
    weavingFromShardIdx = hits.length > 0 ? hits[0].object.userData.memoryShardIndex : -1;
  } else {
    weavingFromShardIdx = -1;
  }
});

window.addEventListener('pointermove', (e) => {
  mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouseNDC, camera);
  raycaster.ray.intersectPlane(floorPlaneMath, mouseWorldTarget);

  if (diveCurrent > 0.65 && focusedShardIdx === -1) {
    const hits = raycaster.intersectObjects(shardInteractMeshes, false);
    hoveredMemoryShard = hits.length > 0 ? memoryShards[hits[0].object.userData.memoryShardIndex] : null;
    document.body.style.cursor = hoveredMemoryShard ? 'pointer' : 'crosshair';

    // If dragging from one shard and passing over another shard, weave a Constellation Link!
    if (isDragging && weavingFromShardIdx !== -1 && hoveredMemoryShard && hoveredMemoryShard.idx !== weavingFromShardIdx) {
      const a = Math.min(weavingFromShardIdx, hoveredMemoryShard.idx);
      const b = Math.max(weavingFromShardIdx, hoveredMemoryShard.idx);
      const exists = wovenLinks.some(([u, v]) => u === a && v === b);
      if (!exists) {
        wovenLinks.push([a, b]);
        gravityWaveBoost = 1.0;
        audioNexus.showTitleWhisper(`CONSTELLATION THREAD WOVEN  ·  SHARD ${a + 1} ──► SHARD ${b + 1}`, 3000);
      }
      weavingFromShardIdx = hoveredMemoryShard.idx;
    }
  } else if (!isDragging) {
    hoveredMemoryShard = null;
    document.body.style.cursor = 'crosshair';
  }

  if (isDragging && weavingFromShardIdx === -1) {
    const dx = (e.clientX - lastX) / window.innerWidth;
    const dy = (e.clientY - lastY) / window.innerHeight;
    lastX = e.clientX;
    lastY = e.clientY;
    dragOffsetY = Math.max(-0.95, Math.min(0.95, dragOffsetY + dx * 1.6));
    dragOffsetX = Math.max(-0.45, Math.min(0.45, dragOffsetX + dy * 1.2));

    // When outside at the Threshold, dragging also pans the Crystal Scrying Lens across the hidden 3D entity!
    if (diveCurrent < 0.4) {
      scryPanX = Math.max(-1.35, Math.min(1.35, scryPanX + dx * 3.2));
      scryPanY = Math.max(-0.85, Math.min(0.85, scryPanY - dy * 2.4));
    }
    gravityWaveBoost = Math.min(1.0, gravityWaveBoost + Math.hypot(dx, dy) * 3.0);
  }
});

window.addEventListener('pointerup', (e) => {
  isDragging = false;
  weavingFromShardIdx = -1;
  const moveDist = Math.hypot(e.clientX - downX, e.clientY - downY);

  if (moveDist < 8) {
    raycaster.setFromCamera(mouseNDC, camera);

    // 1. Inside Quantum Realm: Clicking a Memory Shard opens its Etched Glass Projection
    if (diveCurrent > 0.65 && focusedShardIdx === -1) {
      const shardHits = raycaster.intersectObjects(shardInteractMeshes, false);
      if (shardHits.length > 0) {
        openShardProjection(shardHits[0].object.userData.memoryShardIndex);
        return;
      }
    }

    // 2. Outside at Threshold: Clicking the Sigil transitions INSIDE the Quantum Refraction Realm
    if (diveCurrent < 0.4) {
      const sigilHits = raycaster.intersectObject(sigilFrontMesh, false);
      if (sigilHits.length > 0) {
        if (!audioNexus.hasStartedFirstTrack) {
          audioNexus.selectNode(audioNexus.activeIdx, true);
        }
        setDiveProgress(1.0);
        gravityWaveBoost = 1.2;
        const node = audioNexus.activeNode;
        audioNexus.showTitleWhisper(`INSIDE ${node.roman} · ${node.title}  [CLICK SHARDS TO READ · DRAG TO WEAVE]`, 5200);
        return;
      }
    }

    if (!audioNexus.hasStartedFirstTrack) {
      audioNexus.selectNode(audioNexus.activeIdx, true);
    }
  }
});

window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const curDpr = Math.min(window.devicePixelRatio, 2);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  envTarget.setSize(w * curDpr, h * curDpr);
  sigilFrontMat.uniforms.uResolution.value.set(w * curDpr, h * curDpr);
  wallFrontMat.uniforms.uResolution.value.set(w * curDpr, h * curDpr);
  memoryShards.forEach(s => s.fMat.uniforms.uResolution.value.set(w * curDpr, h * curDpr));
});

// ============================================================================
// 11. MAIN LOOP: OPTICAL SCRYING PASS, 4D GLITCH-WARP & CONSTELLATION LASERS
// ============================================================================
const clock = new THREE.Clock();
let prevBass = 0;

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  const activeNode = audioNexus.activeNode;

  const { bass, mid, high } = audioNexus.getSpectrum(t);
  const bassDelta = Math.max(0, bass - prevBass);
  prevBass = bass;

  gravityWaveBoost *= 0.95;
  const totalPulse = Math.min(1.2, bass * 1.15 + gravityWaveBoost * 0.6);

  // Drive live audio-reactive carrier wave static & scanline distortion on open Projections
  applyAudioReactiveSignalDistortion(bass, high, t);

  // UNCANNY 4D HYPER-WARP TRIGGER (Discrete, choppy non-Euclidean snaps on music transients)
  if (glitchHoldFrames > 0) {
    glitchHoldFrames--;
    if (glitchHoldFrames === 0) {
      glitchShearX = 0.0;
      glitchShearZ = 0.0;
      glitchScaleW = 1.0;
      sigilGhostMesh.visible = false;
    }
  } else if (!audioNexus.audioElement.paused && (bassDelta > 0.065 || (bass > 0.36 && Math.random() < 0.18))) {
    glitchHoldFrames = 2 + Math.floor(Math.random() * 4);
    glitchSliceY = (Math.random() - 0.5) * 2.2;
    glitchSliceDir = (Math.floor(Math.random() * 4) * Math.PI) / 4.0;
    const intensity = 0.06 + bass * 0.18;
    glitchShearX = (Math.random() > 0.5 ? 1 : -1) * intensity;
    glitchShearZ = (Math.random() > 0.5 ? 1 : -1) * intensity * 1.4;
    glitchScaleW = 1.0 + (Math.random() - 0.5) * 0.08;

    sigilGhostMesh.visible = true;
    sigilGhostMesh.position.set(glitchShearX * 1.8, (Math.random() - 0.5) * 0.08, -glitchShearZ * 2.2);
    sigilGhostMesh.rotation.z = (Math.random() - 0.5) * 0.12;
  }

  diveCurrent += (diveTarget - diveCurrent) * 0.042;
  smoothMouseNDC.lerp(mouseNDC, 0.08);
  smoothMouse3D.lerp(mouseWorldTarget, 0.08);

  if (!isDragging) {
    dragOffsetX *= 0.96;
    dragOffsetY *= 0.96;
    scryPanX *= 0.965;
    scryPanY *= 0.965;
  }

  // CAMERA NAVIGATION
  let camGoalX = smoothMouseNDC.x * 0.45 * diveCurrent;
  let camGoalY = THREE.MathUtils.lerp(0.15, 0.12, diveCurrent);
  let camGoalZ = THREE.MathUtils.lerp(7.2, -3.5, diveCurrent);

  let lookGoalX = (smoothMouseNDC.x + dragOffsetY * 1.8) * (0.25 + diveCurrent * 2.2);
  let lookGoalY = -0.15 + (smoothMouseNDC.y - dragOffsetX * 1.4) * (0.18 + diveCurrent * 1.1);
  let lookGoalZ = camGoalZ - 5.0;

  if (focusedShardIdx !== -1 && diveCurrent > 0.6) {
    const sh = memoryShards[focusedShardIdx];
    const worldShardPos = sh.basePos.clone().add(quantumRealmGroup.position);
    const toCenter = new THREE.Vector3(0, 0.12, -3.5).sub(worldShardPos).normalize();
    camGoalX = worldShardPos.x + toCenter.x * 1.45;
    camGoalY = worldShardPos.y + 0.02;
    camGoalZ = worldShardPos.z + toCenter.z * 1.45;
    lookGoalX = worldShardPos.x;
    lookGoalY = worldShardPos.y;
    lookGoalZ = worldShardPos.z;

    if (activeNode.shards[focusedShardIdx] && activeNode.shards[focusedShardIdx].isArt) {
      drawRelicArtCanvas(activeNode, activeNode.shards[focusedShardIdx], t, bass);
    }
  }

  camera.position.x += (camGoalX - camera.position.x) * 0.055;
  camera.position.y += (camGoalY - camera.position.y) * 0.055;
  camera.position.z += (camGoalZ - camera.position.z) * 0.055;
  camera.lookAt(lookGoalX, lookGoalY, lookGoalZ);

  targetRotY = activeNode.targetRotY + smoothMouseNDC.x * 0.22 + dragOffsetY + Math.sin(t * 0.35) * 0.04;
  targetRotX = activeNode.targetRotX - smoothMouseNDC.y * 0.14 + dragOffsetX + Math.cos(t * 0.28) * 0.03;

  currentRotY += (targetRotY - currentRotY) * 0.03;
  currentRotX += (targetRotX - currentRotX) * 0.03;

  const sigilPortalScale = (1.0 + diveCurrent * 2.4) * glitchScaleW;
  sigilGroup.scale.set(sigilPortalScale, sigilPortalScale, 1.0 + diveCurrent * 1.5);
  sigilGroup.rotation.y = currentRotY;
  sigilGroup.rotation.x = currentRotX;
  sigilGroup.position.x = scryPanX * (1.0 - diveCurrent);
  sigilGroup.position.y = 0.18 + scryPanY * (1.0 - diveCurrent) + Math.sin(t * 0.55) * 0.045 - totalPulse * 0.03;

  const sigilFade = THREE.MathUtils.smoothstep(camera.position.z, -0.5, 2.5);
  sigilGroup.visible = sigilFade > 0.01;
  sigilBackMat.uniforms.uOpacity.value = sigilFade;
  sigilFrontMat.uniforms.uOpacity.value = sigilFade;
  sigilGhostMat.uniforms.uOpacity.value = sigilFade * 0.65;

  // Update the 7 Hidden Optical Scrying Sculptures (Visible ONLY inside the glass!)
  scryLineMat.color.lerp(activeNode.rim, 0.05);
  scryCoreMat.color.lerp(activeNode.rim, 0.05);
  scryGroup.position.z = THREE.MathUtils.lerp(-0.8, -3.5, diveCurrent);
  scryEntities.forEach((ent, idx) => {
    ent.visible = (idx === audioNexus.activeIdx);
    if (ent.visible) {
      ent.rotation.y = t * 0.22 - currentRotY * 0.5;
      ent.rotation.x = Math.sin(t * 0.35) * 0.12 - currentRotX * 0.4;
      const scryScale = 1.0 + totalPulse * 0.15;
      ent.scale.set(scryScale, scryScale, scryScale);
    }
  });

  // Encompassing 360° Quantum Refraction Chamber
  const realmFade = THREE.MathUtils.smoothstep(diveCurrent, 0.10, 0.65);
  quantumRealmGroup.visible = realmFade > 0.01;
  cageLinesMat.color.lerp(activeNode.rim, 0.05);
  cageLinesMat.opacity = realmFade * (0.14 + totalPulse * 0.22);
  innerShellLinesMat.color.lerp(activeNode.rim, 0.05);
  innerShellLinesMat.opacity = realmFade * (0.09 + totalPulse * 0.16);

  cageWireframe.rotation.y = t * 0.04;
  cageWireframe.rotation.x = Math.sin(t * 0.03) * 0.15;
  innerShellWireframe.rotation.y = -t * 0.06;
  innerShellWireframe.rotation.z = t * 0.03;

  wallBackMat.uniforms.uOpacity.value = realmFade * 0.55;
  wallFrontMat.uniforms.uOpacity.value = realmFade * 0.55;

  wallMirrors.forEach((wm, i) => {
    const ang = wm.baseAng + t * 0.025;
    const rad = 4.2 + Math.sin(t * 0.5 + i) * 0.15;
    wm.holder.position.x = Math.cos(ang) * rad;
    wm.holder.position.z = Math.sin(ang) * rad;
    wm.holder.lookAt(0, 0.1, 0);
  });

  // Update Memory Shards, Woven Constellation Threads & Shadow Husk Defense
  memoryShards.forEach((ms, i) => {
    const isHov = (hoveredMemoryShard === ms) || (focusedShardIdx === i);
    ms.hoverVal += ((isHov ? 1.0 : 0.0) - ms.hoverVal) * 0.12;

    ms.holder.position.y = ms.basePos.y + Math.sin(t * 0.8 + i * 1.4) * 0.05 + ms.hoverVal * 0.06;
    ms.holder.rotation.y = ms.baseRot.y + Math.sin(t * 0.4 + i) * 0.06;

    ms.bMat.uniforms.uOpacity.value = realmFade;
    ms.fMat.uniforms.uOpacity.value = realmFade;
    ms.fMat.uniforms.uHoverGlow.value = ms.hoverVal;

    if (realmFade > 0.55 && focusedShardIdx === -1 && activeNode.shards && activeNode.shards[i]) {
      const worldPos = ms.holder.position.clone().add(quantumRealmGroup.position);
      worldPos.y -= 1.08;
      worldPos.project(camera);

      if (worldPos.z < 1.0) {
        const sx = (worldPos.x * 0.5 + 0.5) * window.innerWidth;
        const sy = (-worldPos.y * 0.5 + 0.5) * window.innerHeight;
        ms.labelEl.textContent = activeNode.shards[i].label;
        ms.labelEl.style.left = `${sx}px`;
        ms.labelEl.style.top = `${sy}px`;
        ms.labelEl.classList.add('visible');
        ms.labelEl.classList.toggle('hovered', isHov);
      } else {
        ms.labelEl.classList.remove('visible');
      }
    } else {
      ms.labelEl.classList.remove('visible');
    }
  });

  // Update Woven Constellation Threads & Shadow Husk Vaporization Lasers
  if (quantumRealmGroup.visible) {
    const threadPts = [];
    wovenLinks.forEach(([u, v]) => {
      threadPts.push(memoryShards[u].holder.position.clone());
      threadPts.push(memoryShards[v].holder.position.clone());
    });
    constellationGeo.setFromPoints(threadPts);
    constellationMat.color.lerp(activeNode.rim, 0.08);
    constellationMat.opacity = realmFade * (0.35 + totalPulse * 0.65);

    const laserPts = [];
    shadowHusks.forEach((husk) => {
      const targetPos = memoryShards[husk.targetShard].holder.position;
      husk.dist -= husk.speed * (1.0 + bass * 0.8);

      // When a transient hits and Constellation links exist, fire a refractive beam to vaporize close husks!
      if ((bass > 0.28 || high > 0.24) && husk.dist < 2.9 && wovenLinks.length > 0) {
        husk.laserFlash = 6;
        husk.dist = 4.2 + Math.random() * 1.4;
        husk.ang += (Math.random() - 0.5) * 1.2;
      }

      if (husk.dist < 0.65) {
        husk.dist = 4.4;
      }

      husk.mesh.position.set(
        targetPos.x + Math.cos(husk.ang) * husk.dist,
        -1.35 + Math.sin(t * 2.0 + husk.ang) * 0.12,
        targetPos.z + Math.sin(husk.ang) * husk.dist
      );
      husk.mesh.rotation.y += 0.03;
      husk.mesh.rotation.x += 0.02;
      husk.mesh.material.color.lerp(activeNode.tint, 0.05);
      husk.mesh.material.opacity = realmFade * 0.55;

      if (husk.laserFlash > 0) {
        husk.laserFlash--;
        laserPts.push(targetPos.clone());
        laserPts.push(husk.mesh.position.clone());
      }
    });
    laserBeamGeo.setFromPoints(laserPts);
    laserBeamMat.color.lerp(activeNode.rim, 0.15);
    laserBeamMat.opacity = realmFade * 0.9;
  }

  backMistMat.uniforms.uTint.value.lerp(activeNode.tint, 0.03);
  backMistMat.uniforms.uRim.value.lerp(activeNode.rim, 0.03);
  backMistMat.uniforms.uTime.value = t;
  backMistMat.uniforms.uSigilOffset.value.set(currentRotY * 0.35, -currentRotX * 0.35);
  backMistMat.uniforms.uGravityPulse.value = totalPulse;
  backMistMat.uniforms.uDive.value = diveCurrent;

  floorLayers.forEach(mat => {
    mat.uniforms.uTime.value = t;
    mat.uniforms.uTint.value.lerp(activeNode.tint, 0.03);
    mat.uniforms.uRim.value.lerp(activeNode.rim, 0.03);
    mat.uniforms.uMouseWorld.value.copy(smoothMouse3D);
    mat.uniforms.uSigilTilt.value.set(currentRotY * 0.8, currentRotX * 0.8);
    mat.uniforms.uBassWave.value = totalPulse;
  });

  pMat.uniforms.uColor.value.lerp(activeNode.rim, 0.03);

  const posArr = pGeo.attributes.position.array;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    let px = posArr[i3];
    let py = posArr[i3 + 1];
    let pz = posArr[i3 + 2];

    px += pVelocities[i3];
    py += pVelocities[i3 + 1];
    pz += pVelocities[i3 + 2];

    if (py < -1.70) {
      py = -1.70 + Math.random() * 0.05;
      pVelocities[i3] += (Math.random() - 0.5) * 0.001;
    }

    const dxM = px - smoothMouse3D.x;
    const dzM = pz - smoothMouse3D.z;
    const distSqM = dxM * dxM + dzM * dzM;
    if (distSqM < 2.2 && distSqM > 0.001) {
      const force = (1.0 - Math.sqrt(distSqM) / 1.48) * 0.022;
      px += (dxM / Math.sqrt(distSqM)) * force;
      pz += (dzM / Math.sqrt(distSqM)) * force;
      py += force * 0.35;
    }

    if (px > 7) px = -7;
    if (px < -7) px = 7;
    if (pz > 5) pz = -11;
    if (pz < -11) pz = 5;
    if (py > 2.4) py = -1.65;

    posArr[i3]     = px;
    posArr[i3 + 1] = py;
    posArr[i3 + 2] = pz;
  }
  pGeo.attributes.position.needsUpdate = true;

  const lightX = smoothMouseNDC.x * 2.8 + Math.sin(t * 0.4) * 0.8;
  const lightY = 1.6 + smoothMouseNDC.y * 1.2;
  const lightZ = camera.position.z - 2.2;

  const allMats = [
    sigilBackMat, sigilFrontMat, sigilGhostMat,
    wallBackMat, wallFrontMat,
    ...memoryShards.flatMap(s => [s.bMat, s.fMat])
  ];

  allMats.forEach(mat => {
    mat.uniforms.uTime.value = t;
    mat.uniforms.uBass.value = totalPulse;
    mat.uniforms.uHigh.value = high + mid * 0.5;
    mat.uniforms.uGlitchSliceY.value = glitchSliceY;
    mat.uniforms.uGlitchSliceDir.value = glitchSliceDir;
    mat.uniforms.uGlitchShearX.value = glitchShearX;
    mat.uniforms.uGlitchShearZ.value = glitchShearZ;
    mat.uniforms.uRimColor.value.lerp(activeNode.rim, 0.04);
    mat.uniforms.uLightPos.value.set(lightX, lightY, lightZ);
  });

  // PASS 1: Render room, mist, internal back-bevels, AND the hidden 3D Scrying Sculptures (scryGroup.visible = true)!
  scryGroup.visible = true;
  sigilFrontMesh.visible = false;
  sigilBackMesh.visible = sigilGroup.visible;
  wallMirrors.forEach(wm => { wm.fM.visible = false; wm.bM.visible = quantumRealmGroup.visible; });
  memoryShards.forEach(ms => { ms.fMesh.visible = false; ms.bMesh.visible = quantumRealmGroup.visible; });

  renderer.setRenderTarget(envTarget);
  renderer.render(scene, camera);

  // PASS 2: Hide scryGroup (so it is INVISIBLE in the room) and render the see-through crystal faces refracting envTarget!
  scryGroup.visible = false;
  sigilFrontMesh.visible = sigilGroup.visible;
  wallMirrors.forEach(wm => { wm.fM.visible = quantumRealmGroup.visible; });
  memoryShards.forEach(ms => { ms.fMesh.visible = quantumRealmGroup.visible; });

  renderer.setRenderTarget(null);
  renderer.render(scene, camera);
}

animate();
