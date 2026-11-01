import * as THREE from 'three';
import { NODES, SIGIL_OUTLINE } from './nodes-data.js';
import { AudioNexus } from './audio-nexus.js';

let gravityWaveBoost = 0.0;
// diveProgress: 0.0 = At the Sigil Threshold, 1.0 = Inside the Crystalline Monolith Sanctuary
let diveTarget = 0.0;
let diveCurrent = 0.0;

const audioNexus = new AudioNexus(() => {
  gravityWaveBoost = 1.0;
});

// 1. THREE.JS SCENE: PITCH-BLACK VOID CHAMBER
const container = document.getElementById('webglCanvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020204);
scene.fog = new THREE.FogExp2(0x020204, 0.085);

const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 70);
camera.position.set(0, 0.15, 7.2);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;
container.appendChild(renderer.domElement);

const dpr = Math.min(window.devicePixelRatio, 2);
const envTarget = new THREE.WebGLRenderTarget(
  window.innerWidth * dpr,
  window.innerHeight * dpr,
  { format: THREE.RGBAFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter }
);

// 2. GRAVITY-SETTLED FLOOR FOG & PINCH-FREE VOLUMETRIC MIST PLUME
const mouseNDC = new THREE.Vector2(0, 0);
const smoothMouseNDC = new THREE.Vector2(0, 0);
const smoothMouse3D = new THREE.Vector3(0, -1.2, 0);
const mouseWorldTarget = new THREE.Vector3(0, -1.2, 0);
const raycaster = new THREE.Raycaster();
const floorPlaneMath = new THREE.Plane(new THREE.Vector3(0, 1, 0), 1.45);

const backMistGeo = new THREE.PlaneGeometry(36, 20);
const backMistMat = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  uniforms: {
    uTime: { value: 0 },
    uTint: { value: audioNexus.activeNode.tint.clone() },
    uRim: { value: audioNexus.activeNode.rim.clone() },
    uSigilOffset: { value: new THREE.Vector2(0, 0) },
    uGravityPulse: { value: 0 }
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

      // Smooth Gaussian lens warp (Zero center-pinch singularity!)
      vec2 toSigil = uv - uSigilOffset;
      float distSq = dot(toSigil, toSigil);
      vec2 warpedUv = uv - toSigil * (0.14 + uGravityPulse * 0.10) * exp(-distSq * 2.2);

      float n1 = fbm(warpedUv * 1.65);
      float n2 = fbm(warpedUv * 3.1 - vec2(uTime * 0.03, n1 * 1.1));
      float wisps = smoothstep(0.35, 0.84, n2);

      float centerPlume = exp(-dot(uv * vec2(0.85, 0.95), uv * vec2(0.85, 0.95)) * 1.45);
      float horizon = exp(-pow((vUv.y - 0.24) * 4.5, 2.0)) * 0.55;

      vec3 col = uTint * (centerPlume * 0.62 + horizon * 0.48) * (0.38 + n1 * 0.75);
      col += uRim * wisps * centerPlume * (0.24 + uGravityPulse * 0.25);

      gl_FragColor = vec4(col, 0.95);
    }
  `
});
const backMistMesh = new THREE.Mesh(backMistGeo, backMistMat);
backMistMesh.position.set(0, 0, -14.0);
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

    // Smooth mouse parting without sharp center pinch
    vec2 toMouse = vWorldPos.xz - uMouseWorld.xz;
    float mouseDistSq = dot(toMouse, toMouse);
    float mousePush = exp(-mouseDistSq * 0.95);
    p -= toMouse * mousePush * 0.32;

    // Sigil gravitational wake
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
  const fGeo = new THREE.PlaneGeometry(28, 30, 1, 1);
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
  fMesh.position.set(0, -1.68 + i * 0.13, -4.0);
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
  pPositions[i3 + 2] = (Math.random() - 0.5) * 18 - 4.0;

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

// 5. UNBROKEN 4D CRYSTAL SHADER (WITH SMOOTH NON-EUCLIDEAN VERTEX FLEX & SCRYING REFLECTIONS)
const crystalVertexShader = `
  uniform float uTime;
  uniform float uBass;
  uniform vec2 uCursor;
  uniform float uIsSigil;

  varying vec3 vObjNormal;
  varying vec3 vViewNormal;
  varying vec3 vWorldPos;
  varying vec3 vLocalPos;
  varying vec3 vViewDir;

  void main() {
    vObjNormal = normalize(normal);
    vLocalPos = position;

    vec3 pos = position;

    // Smooth, seamless 4th-dimensional vertex flex on the unified Sigil (zero cuts or seams!)
    if (uIsSigil > 0.5) {
      float distFromCenter = length(pos.xy);
      // 4D W-axis torsion wave across the blades
      float torsion = sin(pos.y * 2.2 - uTime * 1.1) * cos(pos.x * 2.2 + uTime * 0.8);
      pos.z += torsion * 0.055 * (1.0 + uBass * 1.4);

      // Subtle cursor-gravity pull on whichever blade tip your mouse approaches
      vec2 toCursor = pos.xy - uCursor * 1.15;
      float cursorPull = exp(-dot(toCursor, toCursor) * 2.4);
      pos.z += cursorPull * 0.14;
      pos.xy += toCursor * cursorPull * 0.035;

      // Breathing radial expansion on sub-bass hits
      pos.xy *= (1.0 + sin(uTime * 0.7 + distFromCenter * 1.5) * 0.012 + uBass * 0.03);
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
      uCursor: { value: new THREE.Vector2(0, 0) },
      uIsSigil: { value: isSigilVal },
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
        float internalEdge = (isBevel * 0.22 + internalGlint * 0.45) * uOpacity;
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
      uCursor: { value: new THREE.Vector2(0, 0) },
      uIsSigil: { value: isSigilVal },
      uRimColor: { value: audioNexus.activeNode.rim.clone() },
      uLightPos: { value: new THREE.Vector3(1.5, 2.0, 3.5) },
      uOpacity: { value: 1.0 }
    },
    vertexShader: crystalVertexShader,
    fragmentShader: `
      uniform sampler2D uEnvTex;
      uniform vec2 uResolution;
      uniform float uTime;
      uniform float uBass;
      uniform vec3 uRimColor;
      uniform vec3 uLightPos;
      uniform float uOpacity;

      varying vec3 vObjNormal;
      varying vec3 vViewNormal;
      varying vec3 vWorldPos;
      varying vec3 vLocalPos;
      varying vec3 vViewDir;

      void main() {
        vec2 screenUv = gl_FragCoord.xy / uResolution;

        // Object-space bevel lock: 0.0 on flat faces at ALL angles, 1.0 on 3D bevels
        float isBevel = 1.0 - smoothstep(0.84, 0.97, abs(vObjNormal.z));

        vec2 refractOffset = vViewNormal.xy * (0.016 + isBevel * 0.055) + vLocalPos.xy * 0.012;
        float dispersion = 1.0 + uBass * 0.65;

        vec2 uvR = clamp(screenUv - refractOffset * dispersion * 0.88, 0.001, 0.999);
        vec2 uvG = clamp(screenUv - refractOffset * dispersion * 1.02, 0.001, 0.999);
        vec2 uvB = clamp(screenUv - refractOffset * dispersion * 1.16, 0.001, 0.999);

        vec3 refractedScene;
        refractedScene.r = texture2D(uEnvTex, uvR).r;
        refractedScene.g = texture2D(uEnvTex, uvG).g;
        refractedScene.b = texture2D(uEnvTex, uvB).b;

        // Subtle 4D internal caustic reflection (visible only inside the glass facets)
        vec3 reflectVec = reflect(-vViewDir, vViewNormal);
        float caustic = smoothstep(0.76, 0.99, sin(reflectVec.x * 12.0 + vWorldPos.y * 4.0 + uTime * 0.8) * cos(reflectVec.y * 12.0 - uTime * 0.6));
        vec3 internalScrying = uRimColor * caustic * (0.05 + uBass * 0.12);

        float viewGrazing = pow(1.0 - abs(dot(vViewNormal, vViewDir)), 2.4);
        float bevelFresnel = isBevel * (0.35 + viewGrazing * 0.85);

        vec3 lightDir = normalize(uLightPos - vWorldPos);
        vec3 halfVec = normalize(lightDir + vViewDir);

        float bevelSpec = pow(max(dot(vViewNormal, halfVec), 0.0), 52.0) * isBevel;
        float bevelDiffuseGlint = pow(max(dot(vViewNormal, lightDir), 0.0), 2.2) * isBevel;
        float floorBounce = max(0.0, -vViewNormal.y) * isBevel * 0.35;

        vec3 glassHighlights = uRimColor * (bevelFresnel * 0.55 + bevelDiffuseGlint * 0.85 + floorBounce)
                             + vec3(0.95, 0.98, 1.0) * (bevelSpec * (0.95 + uBass * 0.7))
                             + internalScrying;

        vec3 finalCol = refractedScene + glassHighlights * uOpacity;
        gl_FragColor = vec4(finalCol, uOpacity);
      }
    `
  });
}

// 6. BUILD THE UNBROKEN, SEAMLESS 58-POINT DTE CRYSTAL SIGIL AT THE THRESHOLD (Z = 0)
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

const sigilGroup = new THREE.Group();
sigilGroup.position.set(0, 0.18, 0);
scene.add(sigilGroup);

const sigilBackMesh = new THREE.Mesh(sigilGeo, sigilBackMat);
const sigilFrontMesh = new THREE.Mesh(sigilGeo, sigilFrontMat);
sigilGroup.add(sigilBackMesh);
sigilGroup.add(sigilFrontMesh);

// 7. BUILD THE INNER CRYSTALLINE SANCTUARY (12 PRECISION GLASS MONOLITHS BEYOND THE REFLECTION)
// When you scroll or double-click through the Sigil, you enter this 3D hall of seamless glass pillars!
const pillarShape = new THREE.Shape();
const pw = 0.22, ph = 1.65;
pillarShape.moveTo(0, ph);
pillarShape.lineTo(pw, ph * 0.72);
pillarShape.lineTo(pw, -ph * 0.72);
pillarShape.lineTo(0, -ph);
pillarShape.lineTo(-pw, -ph * 0.72);
pillarShape.lineTo(-pw, ph * 0.72);
pillarShape.closePath();

const pillarGeo = new THREE.ExtrudeGeometry(pillarShape, {
  depth: 0.14,
  bevelEnabled: true,
  bevelSegments: 5,
  steps: 1,
  bevelSize: 0.032,
  bevelThickness: 0.08,
  curveSegments: 8
});
pillarGeo.center();
pillarGeo.computeVertexNormals();

const pillarBackMat = createBackFaceMat(0.0);
const pillarFrontMat = createFrontFaceMat(0.0);

const sanctuaryGroup = new THREE.Group();
scene.add(sanctuaryGroup);

const monoliths = [];
const MONOLITH_COUNT = 12;
for (let i = 0; i < MONOLITH_COUNT; i++) {
  const holder = new THREE.Group();
  const bMesh = new THREE.Mesh(pillarGeo, pillarBackMat);
  const fMesh = new THREE.Mesh(pillarGeo, pillarFrontMat);
  holder.add(bMesh);
  holder.add(fMesh);
  sanctuaryGroup.add(holder);

  monoliths.push({
    idx: i,
    holder,
    bMesh,
    fMesh,
    curPos: new THREE.Vector3((i % 2 === 0 ? -1 : 1) * 2.2, 0.1, -3.5 - i * 1.4),
    curRot: new THREE.Vector3(0, 0, 0)
  });
}

// Compute target architectural layout for the 12 seamless glass monoliths per song
function getMonolithTarget(i, style, t, bass) {
  const side = (i % 2 === 0) ? -1 : 1;
  const row = Math.floor(i / 2); // 0 to 5
  const floatWave = Math.sin(t * 0.6 + i * 0.9) * 0.08;

  if (style === 0) {
    // I. SIMULACRA: Staggered surgical scanner gates
    return {
      x: side * (1.55 + (row % 2) * 0.55),
      y: 0.15 + floatWave,
      z: -2.8 - row * 1.85,
      rx: 0.0,
      ry: -side * 0.75,
      rz: 0.0
    };
  } else if (style === 1) {
    // II. STARGAZE: Wide cosmic observatory ring
    const ang = ((i / MONOLITH_COUNT) * Math.PI * 2) + t * 0.06;
    return {
      x: Math.cos(ang) * 2.8,
      y: 0.2 + Math.sin(ang * 2.0) * 0.25 + floatWave,
      z: -6.2 + Math.sin(ang) * 2.8,
      rx: 0.15 * Math.cos(ang),
      ry: -ang + Math.PI / 2,
      rz: 0.0
    };
  } else if (style === 2) {
    // III. IN DREAMS: Hall of tilted scrying mirrors flanking the dream aisle
    return {
      x: side * (1.75 + Math.sin(row * 0.8 + t * 0.3) * 0.25),
      y: 0.12 + floatWave,
      z: -2.6 - row * 1.75,
      rx: 0.08 * side,
      ry: -side * (1.05 + Math.sin(t * 0.4 + i) * 0.15),
      rz: side * 0.08
    };
  } else if (style === 3) {
    // IV. LOTUS: Blooming mandala temple
    const ang = ((i / MONOLITH_COUNT) * Math.PI * 2) - t * 0.05;
    const radius = 2.35 + (i % 2) * 0.55;
    return {
      x: Math.cos(ang) * radius,
      y: 0.05 + (i % 2) * 0.3 + floatWave,
      z: -5.8 + Math.sin(ang) * radius,
      rx: -0.28,
      ry: -ang + Math.PI / 2,
      rz: side * 0.22
    };
  } else if (style === 4) {
    // V. BLOODLUST: Towering crimson cathedral cage angled inward
    return {
      x: side * (1.45 + row * 0.12),
      y: 0.22 + floatWave,
      z: -2.5 - row * 1.65,
      rx: 0.18,
      ry: -side * 1.15,
      rz: side * (0.28 + bass * 0.15)
    };
  } else if (style === 5) {
    // VI. CHRYSALIS: Helical DNA stasis spiral
    const ang = row * 0.65 + (side > 0 ? 0 : Math.PI) + t * 0.12;
    return {
      x: Math.cos(ang) * 2.1,
      y: -0.6 + row * 0.32 + floatWave,
      z: -3.2 - row * 1.55,
      rx: 0.35,
      ry: -ang,
      rz: 0.45 * side
    };
  } else {
    // VII. MOON: Zero-gravity levitating astral constellation
    return {
      x: side * (1.6 + (row % 3) * 0.65),
      y: 0.45 + Math.sin(i * 1.7 + t * 0.5) * 0.55,
      z: -2.8 - row * 1.85,
      rx: Math.sin(t * 0.3 + i) * 0.25,
      ry: -side * 0.85 + t * 0.15,
      rz: Math.cos(t * 0.25 + i) * 0.22
    };
  }
}

// 8. INTERACTION: TURN THE UNIFIED SIGIL OR DIVE THROUGH ITS REFLECTION
let currentRotX = 0.0, currentRotY = 0.0;
let targetRotX = 0.0, targetRotY = 0.0;
let dragOffsetX = 0.0, dragOffsetY = 0.0;
let isDragging = false, lastX = 0, lastY = 0, downX = 0, downY = 0;

function setDiveProgress(val) {
  diveTarget = Math.max(0.0, Math.min(1.0, val));
  document.body.classList.toggle('realm-breached', diveTarget > 0.45);
}

window.addEventListener('dblclick', () => {
  const nextDive = diveTarget < 0.5 ? 1.0 : 0.0;
  setDiveProgress(nextDive);
  gravityWaveBoost = 1.2;

  const node = audioNexus.activeNode;
  if (nextDive > 0.5) {
    audioNexus.showTitleWhisper(`INSIDE REFLECTION  ·  ${node.roman} ${node.title}  [SCROLL OR DBL-CLICK TO RETURN]`, 5200);
    if (!audioNexus.hasStartedFirstTrack || audioNexus.audioElement.paused) {
      audioNexus.selectNode(audioNexus.activeIdx, true);
    }
  } else {
    audioNexus.showTitleWhisper(`${node.roman}  ·  ${node.title}`, 3500);
  }
});

// Scroll wheel smoothly glides camera through the front face of the crystal into the Monolith Sanctuary
window.addEventListener('wheel', (e) => {
  setDiveProgress(diveTarget + e.deltaY * 0.0009);
  gravityWaveBoost = Math.min(1.0, gravityWaveBoost + 0.22);
}, { passive: true });

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    audioNexus.selectNode(audioNexus.activeIdx);
  } else if (e.code === 'Enter') {
    e.preventDefault();
    setDiveProgress(diveTarget < 0.5 ? 1.0 : 0.0);
  } else if (e.code === 'Escape') {
    setDiveProgress(0.0);
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
});

window.addEventListener('pointermove', (e) => {
  mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouseNDC, camera);
  raycaster.ray.intersectPlane(floorPlaneMath, mouseWorldTarget);

  if (isDragging) {
    const dx = (e.clientX - lastX) / window.innerWidth;
    const dy = (e.clientY - lastY) / window.innerHeight;
    lastX = e.clientX;
    lastY = e.clientY;
    dragOffsetY = Math.max(-0.75, Math.min(0.75, dragOffsetY + dx * 1.6));
    dragOffsetX = Math.max(-0.40, Math.min(0.40, dragOffsetX + dy * 1.2));
    gravityWaveBoost = Math.min(1.0, gravityWaveBoost + Math.hypot(dx, dy) * 3.0);

    // Turning the crystal far left/right clicks into the next/prev Roman numeral
    if (dragOffsetY > 0.48) {
      dragOffsetY = -0.15;
      audioNexus.selectNode((audioNexus.activeIdx + 1) % NODES.length, true);
    } else if (dragOffsetY < -0.48) {
      dragOffsetY = 0.15;
      audioNexus.selectNode((audioNexus.activeIdx - 1 + NODES.length) % NODES.length, true);
    }
  }
});

window.addEventListener('pointerup', (e) => {
  isDragging = false;
  const moveDist = Math.hypot(e.clientX - downX, e.clientY - downY);
  if (moveDist < 8 && !audioNexus.hasStartedFirstTrack) {
    audioNexus.selectNode(audioNexus.activeIdx, true);
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
  pillarFrontMat.uniforms.uResolution.value.set(w * curDpr, h * curDpr);
});

// 9. MAIN LOOP: SEAMLESS 4D SIGIL + CAMERA DIVE THROUGH THE REFLECTION INTO THE MONOLITH HALL
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  const activeNode = audioNexus.activeNode;

  const bass = audioNexus.getBassEnergy(t);
  gravityWaveBoost *= 0.95;
  const totalPulse = Math.min(1.2, bass * 1.15 + gravityWaveBoost * 0.6);

  diveCurrent += (diveTarget - diveCurrent) * 0.038;
  smoothMouseNDC.lerp(mouseNDC, 0.08);
  smoothMouse3D.lerp(mouseWorldTarget, 0.08);

  // Camera glides from z = 7.2 (in front of Sigil) straight through z = 0 into z = -1.8 (inside the Monolith Hall)
  const targetCamZ = THREE.MathUtils.lerp(7.2, -1.8, diveCurrent);
  const targetCamY = THREE.MathUtils.lerp(0.15, 0.12, diveCurrent);
  camera.position.z += (targetCamZ - camera.position.z) * 0.05;
  camera.position.y += (targetCamY - camera.position.y) * 0.05;
  camera.position.x = smoothMouseNDC.x * 0.35 * diveCurrent;
  camera.lookAt(
    smoothMouseNDC.x * (0.15 + diveCurrent * 0.65),
    -0.18 + smoothMouseNDC.y * (0.12 + diveCurrent * 0.35),
    camera.position.z - 6.0
  );

  if (!isDragging) {
    dragOffsetX *= 0.96;
    dragOffsetY *= 0.96;
  }

  targetRotY = activeNode.targetRotY + smoothMouseNDC.x * 0.24 + dragOffsetY + Math.sin(t * 0.35) * 0.04;
  targetRotX = activeNode.targetRotX - smoothMouseNDC.y * 0.14 + dragOffsetX + Math.cos(t * 0.28) * 0.03;

  currentRotY += (targetRotY - currentRotY) * 0.028;
  currentRotX += (targetRotX - currentRotX) * 0.028;

  sigilGroup.rotation.y = currentRotY;
  sigilGroup.rotation.x = currentRotX;
  sigilGroup.position.y = 0.18 + Math.sin(t * 0.55) * 0.045 - totalPulse * 0.03;

  // Fade the entrance Sigil out smoothly once the camera passes through its front glass face
  const sigilFade = THREE.MathUtils.smoothstep(camera.position.z, 0.4, 2.2);
  sigilGroup.visible = sigilFade > 0.01;
  sigilBackMat.uniforms.uOpacity.value = sigilFade;
  sigilFrontMat.uniforms.uOpacity.value = sigilFade;

  // Fade the interior Monolith Sanctuary in as we approach and pass through the Sigil reflection
  const sanctuaryFade = THREE.MathUtils.smoothstep(diveCurrent, 0.08, 0.55);
  sanctuaryGroup.visible = sanctuaryFade > 0.01;
  pillarBackMat.uniforms.uOpacity.value = sanctuaryFade;
  pillarFrontMat.uniforms.uOpacity.value = sanctuaryFade;

  // Update the 12 precision glass monoliths inside the reflection chamber
  if (sanctuaryGroup.visible) {
    monoliths.forEach((m, i) => {
      const goal = getMonolithTarget(i, activeNode.hallStyle, t, totalPulse);
      m.curPos.x += (goal.x - m.curPos.x) * 0.04;
      m.curPos.y += (goal.y - m.curPos.y) * 0.04;
      m.curPos.z += (goal.z - m.curPos.z) * 0.04;

      m.curRot.x += (goal.rx - m.curRot.x) * 0.04;
      m.curRot.y += (goal.ry - m.curRot.y) * 0.04;
      m.curRot.z += (goal.rz - m.curRot.z) * 0.04;

      m.holder.position.copy(m.curPos);
      m.holder.rotation.set(m.curRot.x, m.curRot.y, m.curRot.z);
    });
  }

  backMistMat.uniforms.uTint.value.lerp(activeNode.tint, 0.03);
  backMistMat.uniforms.uRim.value.lerp(activeNode.rim, 0.03);
  backMistMat.uniforms.uTime.value = t;
  backMistMat.uniforms.uSigilOffset.value.set(currentRotY * 0.35, -currentRotX * 0.35);
  backMistMat.uniforms.uGravityPulse.value = totalPulse;

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
    if (pz > 5) pz = -13;
    if (pz < -13) pz = 5;
    if (py > 2.4) py = -1.65;

    posArr[i3]     = px;
    posArr[i3 + 1] = py;
    posArr[i3 + 2] = pz;
  }
  pGeo.attributes.position.needsUpdate = true;

  const lightX = smoothMouseNDC.x * 2.8 + Math.sin(t * 0.4) * 0.8;
  const lightY = 1.6 + smoothMouseNDC.y * 1.2;
  const lightZ = camera.position.z - 2.5;

  [sigilBackMat, sigilFrontMat, pillarBackMat, pillarFrontMat].forEach(mat => {
    mat.uniforms.uTime.value = t;
    mat.uniforms.uBass.value = totalPulse;
    mat.uniforms.uCursor.value.copy(smoothMouseNDC);
    mat.uniforms.uRimColor.value.lerp(activeNode.rim, 0.04);
    mat.uniforms.uLightPos.value.set(lightX, lightY, lightZ);
  });

  // PASS 1: Render room, mist, particles, and internal back-bevels of visible crystal meshes
  sigilFrontMesh.visible = false;
  sigilBackMesh.visible = sigilGroup.visible;
  monoliths.forEach(m => { m.fMesh.visible = false; m.bMesh.visible = sanctuaryGroup.visible; });

  renderer.setRenderTarget(envTarget);
  renderer.render(scene, camera);

  // PASS 2: Render see-through front crystal faces refracting envTarget
  sigilFrontMesh.visible = sigilGroup.visible;
  monoliths.forEach(m => { m.fMesh.visible = sanctuaryGroup.visible; });

  renderer.setRenderTarget(null);
  renderer.render(scene, camera);
}

animate();
