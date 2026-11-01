import * as THREE from 'three';
import { NODES, SHARD_POLYGONS } from './nodes-data.js';
import { AudioNexus } from './audio-nexus.js';

let gravityWaveBoost = 0.0;
// unfoldTarget: 0.0 = Converged Modular Sigil, 1.0 = Unfolded 4D Reflection Chamber
let unfoldTarget = 0.0;
let unfoldCurrent = 0.0;

const audioNexus = new AudioNexus(() => {
  gravityWaveBoost = 1.0;
});

// 1. THREE.JS SCENE: PITCH-BLACK VOID CHAMBER
const container = document.getElementById('webglCanvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020204);
scene.fog = new THREE.FogExp2(0x020204, 0.09);

const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 60);
camera.position.set(0, 0.15, 7.2);
camera.lookAt(0, -0.15, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
container.appendChild(renderer.domElement);

const dpr = Math.min(window.devicePixelRatio, 2);
const envTarget = new THREE.WebGLRenderTarget(
  window.innerWidth * dpr,
  window.innerHeight * dpr,
  { format: THREE.RGBAFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter }
);

// 2. GRAVITY-SETTLED FLOOR FOG & VOLUMETRIC MIST PLUME
const mouseNDC = new THREE.Vector2(0, 0);
const smoothMouse3D = new THREE.Vector3(0, -1.2, 0);
const mouseWorldTarget = new THREE.Vector3(0, -1.2, 0);
const raycaster = new THREE.Raycaster();
const floorPlaneMath = new THREE.Plane(new THREE.Vector3(0, 1, 0), 1.45);

const backMistGeo = new THREE.PlaneGeometry(26, 15);
const backMistMat = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  uniforms: {
    uTime: { value: 0 },
    uTint: { value: audioNexus.activeNode.tint.clone() },
    uRim: { value: audioNexus.activeNode.rim.clone() },
    uSigilOffset: { value: new THREE.Vector2(0, 0) },
    uGravityPulse: { value: 0 },
    uUnfold: { value: 0 }
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
    uniform float uUnfold;
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
        p = rot * p * 2.04 + vec2(uTime * 0.028, -uTime * 0.018);
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 uv = (vUv - 0.5) * 2.0;
      uv.x *= 1.6;

      vec2 toSigil = uv - uSigilOffset;
      float distSigil = length(toSigil);
      vec2 warpedUv = uv - normalize(toSigil + 0.0001) * (0.06 + uGravityPulse * 0.05 + uUnfold * 0.14) * exp(-distSigil * 1.4);

      float n1 = fbm(warpedUv * (1.75 + uUnfold * 0.5));
      float n2 = fbm(warpedUv * 3.4 - vec2(uTime * 0.035, n1 * 1.2));
      float wisps = smoothstep(0.32, 0.82, n2);

      float centerPlume = exp(-length((uv - vec2(0.0, 0.05)) * vec2(0.95, 0.95)) * (1.65 - uUnfold * 0.45));
      float horizon = exp(-pow((vUv.y - 0.24) * 4.5, 2.0)) * 0.65;

      vec3 col = uTint * (centerPlume * 0.72 + horizon * 0.55) * (0.4 + n1 * 0.85);
      col += uRim * wisps * centerPlume * (0.32 + uGravityPulse * 0.30 + uUnfold * 0.35);

      gl_FragColor = vec4(col, 0.96);
    }
  `
});
const backMistMesh = new THREE.Mesh(backMistGeo, backMistMat);
backMistMesh.position.set(0, 0, -2.6);
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
    vec2 p = vWorldPos.xz * 0.42;

    vec2 toMouse = vWorldPos.xz - uMouseWorld.xz;
    float mouseDist = length(toMouse);
    float mousePush = exp(-mouseDist * 1.35);
    p -= normalize(toMouse + 0.0001) * mousePush * 0.45;

    vec2 sigilCenter = uSigilTilt * 0.6;
    vec2 toSigil = vWorldPos.xz - sigilCenter;
    float sigilDist = length(toSigil);

    float gravRipple = sin(sigilDist * 4.5 - uTime * 1.4 - uBassWave * 5.0) * exp(-sigilDist * 0.65);
    p += normalize(toSigil + 0.0001) * (gravRipple * 0.12 - 0.18 * exp(-sigilDist * 1.2));

    float mist = fbm(p + vec2(uLayer * 1.7, -uTime * 0.03));
    float mist2 = fbm(p * 1.8 - vec2(uTime * 0.05, uLayer * 2.3));
    float combined = mist * 0.65 + mist2 * 0.35;

    float roomFade = exp(- dot(vWorldPos.xz * vec2(0.16, 0.22), vWorldPos.xz * vec2(0.16, 0.22)));

    float underSigilVoid = smoothstep(0.25, 1.35, sigilDist);
    float wakeRing = smoothstep(0.45, 0.0, abs(sigilDist - (1.05 + uBassWave * 0.35)));
    float mouseRim = smoothstep(0.5, 0.0, abs(mouseDist - 0.65)) * mousePush;

    vec3 fogCol = mix(uTint * 0.55, uRim * 0.42, combined);
    fogCol += uRim * wakeRing * (0.28 + uBassWave * 0.45);
    fogCol += uRim * mouseRim * 0.22;

    float alpha = smoothstep(0.22, 0.85, combined) * roomFade * (0.45 + 0.55 * underSigilVoid);
    alpha *= (1.0 - mousePush * 0.52);
    alpha *= (0.24 - uLayer * 0.035);

    gl_FragColor = vec4(fogCol, clamp(alpha, 0.0, 0.45));
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
  const fGeo = new THREE.PlaneGeometry(24, 18, 1, 1);
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
  fMesh.position.y = -1.68 + i * 0.13;
  scene.add(fMesh);
  floorLayers.push(fMat);
}

// 4. INTERACTIVE GRAVITATIONAL MIST PARTICLES
const PARTICLE_COUNT = 1600;
const pGeo = new THREE.BufferGeometry();
const pPositions = new Float32Array(PARTICLE_COUNT * 3);
const pVelocities = new Float32Array(PARTICLE_COUNT * 3);
const pSizes = new Float32Array(PARTICLE_COUNT);

for (let i = 0; i < PARTICLE_COUNT; i++) {
  const i3 = i * 3;
  const isFloor = Math.random() < 0.65;
  pPositions[i3]     = (Math.random() - 0.5) * 11;
  pPositions[i3 + 1] = isFloor ? (-1.72 + Math.random() * 0.95) : ((Math.random() - 0.5) * 3.4);
  pPositions[i3 + 2] = isFloor ? ((Math.random() - 0.5) * 8) : (-0.35 - Math.random() * 1.8);

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
      gl_PointSize = aSize * (1.0 / -mvPosition.z);
      float distFade = smoothstep(8.5, 1.2, length(position.xz));
      vAlpha = distFade * 0.085;
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

// 5. SHADERS FOR THE 7 MODULAR 4D CRYSTAL SHARDS (WITH INTERNAL SCRYING REFLECTIONS)
const backFaceGlassMat = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  uniforms: {
    uRimColor: { value: audioNexus.activeNode.rim.clone() },
    uLightPos: { value: new THREE.Vector3(1.5, 2.0, 3.5) }
  },
  vertexShader: `
    varying vec3 vObjNormal;
    varying vec3 vViewNormal;
    varying vec3 vWorldPos;
    void main() {
      vObjNormal = normalize(normal);
      vViewNormal = normalize(normalMatrix * normal);
      vec4 wp = modelMatrix * vec4(position, 1.0);
      vWorldPos = wp.xyz;
      gl_Position = projectionMatrix * viewMatrix * wp;
    }
  `,
  fragmentShader: `
    uniform vec3 uRimColor;
    uniform vec3 uLightPos;
    varying vec3 vObjNormal;
    varying vec3 vViewNormal;
    varying vec3 vWorldPos;
    void main() {
      float isBevel = 1.0 - smoothstep(0.82, 0.97, abs(vObjNormal.z));
      vec3 lightDir = normalize(uLightPos - vWorldPos);
      float internalGlint = pow(max(dot(-vViewNormal, lightDir), 0.0), 3.0) * isBevel;
      float internalEdge = isBevel * 0.22 + internalGlint * 0.45;
      gl_FragColor = vec4(uRimColor, internalEdge);
    }
  `
});

const frontGlassMat = new THREE.ShaderMaterial({
  side: THREE.FrontSide,
  transparent: true,
  uniforms: {
    uEnvTex: { value: envTarget.texture },
    uResolution: { value: new THREE.Vector2(window.innerWidth * dpr, window.innerHeight * dpr) },
    uRimColor: { value: audioNexus.activeNode.rim.clone() },
    uTintColor: { value: audioNexus.activeNode.tint.clone() },
    uLightPos: { value: new THREE.Vector3(1.5, 2.0, 3.5) },
    uTime: { value: 0.0 },
    uBass: { value: 0.0 },
    uUnfold: { value: 0.0 }
  },
  vertexShader: `
    varying vec3 vObjNormal;
    varying vec3 vViewNormal;
    varying vec3 vWorldPos;
    varying vec3 vLocalPos;
    varying vec3 vViewDir;
    void main() {
      vObjNormal = normalize(normal);
      vLocalPos = position;
      vec4 wp = modelMatrix * vec4(position, 1.0);
      vWorldPos = wp.xyz;
      vViewNormal = normalize(normalMatrix * normal);
      vec4 mvPos = viewMatrix * wp;
      vViewDir = normalize(-mvPos.xyz);
      gl_Position = projectionMatrix * mvPos;
    }
  `,
  fragmentShader: `
    uniform sampler2D uEnvTex;
    uniform vec2 uResolution;
    uniform vec3 uRimColor;
    uniform vec3 uTintColor;
    uniform vec3 uLightPos;
    uniform float uTime;
    uniform float uBass;
    uniform float uUnfold;

    varying vec3 vObjNormal;
    varying vec3 vViewNormal;
    varying vec3 vWorldPos;
    varying vec3 vLocalPos;
    varying vec3 vViewDir;

    void main() {
      vec2 screenUv = gl_FragCoord.xy / uResolution;

      // True object-space bevel mask: 0 on flat face, 1 on 3D bevels at all angles
      float isBevel = 1.0 - smoothstep(0.84, 0.97, abs(vObjNormal.z));

      // Optical glass refraction & chromatic dispersion
      vec2 refractOffset = vViewNormal.xy * (0.018 + isBevel * 0.058) + vLocalPos.xy * 0.014;
      float dispersion = 1.0 + uBass * 0.65 + uUnfold * 0.35;

      vec2 uvR = clamp(screenUv - refractOffset * dispersion * 0.86, 0.001, 0.999);
      vec2 uvG = clamp(screenUv - refractOffset * dispersion * 1.02, 0.001, 0.999);
      vec2 uvB = clamp(screenUv - refractOffset * dispersion * 1.18, 0.001, 0.999);

      vec3 refractedScene;
      refractedScene.r = texture2D(uEnvTex, uvR).r;
      refractedScene.g = texture2D(uEnvTex, uvG).g;
      refractedScene.b = texture2D(uEnvTex, uvB).b;

      // 4D INTERNAL SCRYING REFLECTION (Visible *only* inside the crystal when tilted or unfolded!)
      vec3 reflectVec = reflect(-vViewDir, vViewNormal);
      float scryWave1 = sin(reflectVec.x * 14.0 + vWorldPos.y * 5.0 + uTime * 0.9);
      float scryWave2 = cos(reflectVec.y * 14.0 - vWorldPos.x * 5.0 - uTime * 0.7);
      float scryCaustic = smoothstep(0.72, 0.98, scryWave1 * scryWave2);
      vec3 internalScrying = uRimColor * scryCaustic * (0.06 + uUnfold * 0.18 + uBass * 0.14);

      // Grazing Fresnel & Specular highlights strictly on the 3D beveled edges
      float viewGrazing = pow(1.0 - abs(dot(vViewNormal, vViewDir)), 2.4);
      float bevelFresnel = isBevel * (0.35 + viewGrazing * 0.88);

      vec3 lightDir = normalize(uLightPos - vWorldPos);
      vec3 halfVec = normalize(lightDir + vViewDir);

      float bevelSpec = pow(max(dot(vViewNormal, halfVec), 0.0), 52.0) * isBevel;
      float bevelDiffuseGlint = pow(max(dot(vViewNormal, lightDir), 0.0), 2.2) * isBevel;
      float floorBounce = max(0.0, -vViewNormal.y) * isBevel * 0.35;

      vec3 glassHighlights = uRimColor * (bevelFresnel * 0.55 + bevelDiffuseGlint * 0.85 + floorBounce)
                           + vec3(0.95, 0.98, 1.0) * (bevelSpec * (0.95 + uBass * 0.75))
                           + internalScrying;

      vec3 finalCol = refractedScene + glassHighlights;
      gl_FragColor = vec4(finalCol, 1.0);
    }
  `
});

// 6. BUILD THE 7 ARTICULATED CRYSTAL SHARDS WITH LOCAL PIVOT ORIGINS
const sigilGroup = new THREE.Group();
sigilGroup.position.set(0, 0.18, 0);
scene.add(sigilGroup);

const shards = [];
const interactMeshes = [];

SHARD_POLYGONS.forEach((def, idx) => {
  // Compute polygon centroid in sigil space so each shard rotates around its own center of mass
  let cx = 0, cy = 0;
  const scaledPts = def.points.map(([px, py]) => {
    const sx = (px - 500) / 310;
    const sy = -(py - 485) / 310;
    cx += sx;
    cy += sy;
    return [sx, sy];
  });
  cx /= scaledPts.length;
  cy /= scaledPts.length;

  const shape = new THREE.Shape();
  scaledPts.forEach(([sx, sy], i) => {
    if (i === 0) shape.moveTo(sx - cx, sy - cy);
    else shape.lineTo(sx - cx, sy - cy);
  });
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.14,
    bevelEnabled: true,
    bevelSegments: 5,
    steps: 1,
    bevelSize: 0.030,
    bevelThickness: 0.085,
    curveSegments: 12
  });
  geo.translate(0, 0, -0.07);
  geo.computeVertexNormals();

  const shardHolder = new THREE.Group();
  shardHolder.position.set(cx, cy, def.baseZ);
  sigilGroup.add(shardHolder);

  const backMesh = new THREE.Mesh(geo, backFaceGlassMat);
  const frontMesh = new THREE.Mesh(geo, frontGlassMat);
  frontMesh.userData.shardIndex = idx;

  shardHolder.add(backMesh);
  shardHolder.add(frontMesh);
  interactMeshes.push(frontMesh);

  shards.push({
    idx,
    name: def.name,
    mass: def.mass,
    holder: shardHolder,
    backMesh,
    frontMesh,
    homePos: new THREE.Vector3(cx, cy, def.baseZ),
    curPos: new THREE.Vector3(cx, cy, def.baseZ),
    curRot: new THREE.Vector3(0, 0, 0),
    userDragOffset: new THREE.Vector3(0, 0, 0),
    userRotOffset: new THREE.Vector3(0, 0, 0),
    hoverBoost: 0
  });
});

// 7. INTERACTIVE 4D SHARD MANIPULATION (GRAB SHARDS, SCROLL TO UNFOLD REALM)
let currentRotX = 0.0, currentRotY = 0.0;
let targetRotX = 0.0, targetRotY = 0.0;
let dragOffsetX = 0.0, dragOffsetY = 0.0;
let isDragging = false, lastX = 0, lastY = 0, downX = 0, downY = 0;
let grabbedShard = null;
let hoveredShard = null;

function setUnfoldPhase(val) {
  unfoldTarget = Math.max(0.0, Math.min(1.0, val));
  document.body.classList.toggle('realm-breached', unfoldTarget > 0.45);
}

window.addEventListener('dblclick', () => {
  // Double-clicking toggles between the Converged Sigil (0.0) and Going Inside the Reflections (1.0)
  const nextState = unfoldTarget < 0.5 ? 1.0 : 0.0;
  setUnfoldPhase(nextState);
  gravityWaveBoost = 1.2;

  // Reset any manually pulled shard offsets back into formation
  shards.forEach(s => {
    s.userDragOffset.set(0, 0, 0);
    s.userRotOffset.set(0, 0, 0);
  });

  const node = audioNexus.activeNode;
  if (nextState > 0.5) {
    audioNexus.showTitleWhisper(`INSIDE REFLECTION  ·  ${node.roman} ${node.title}  [SCROLL OR DBL-CLICK TO CONVERGE]`, 5200);
    if (!audioNexus.hasStartedFirstTrack || audioNexus.audioElement.paused) {
      audioNexus.selectNode(audioNexus.activeIdx, true);
    }
  } else {
    audioNexus.showTitleWhisper(`SIGIL CONVERGED  ·  ${node.roman} ${node.title}`, 3500);
  }
});

// Scroll wheel smoothly dials the 4D Unfold & Camera Immersion depth
window.addEventListener('wheel', (e) => {
  setUnfoldPhase(unfoldTarget + e.deltaY * 0.0009);
  gravityWaveBoost = Math.min(1.0, gravityWaveBoost + 0.25);
}, { passive: true });

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    audioNexus.selectNode(audioNexus.activeIdx);
  } else if (e.code === 'Enter') {
    e.preventDefault();
    setUnfoldPhase(unfoldTarget < 0.5 ? 1.0 : 0.0);
  } else if (e.code === 'Escape') {
    setUnfoldPhase(0.0);
    shards.forEach(s => {
      s.userDragOffset.set(0, 0, 0);
      s.userRotOffset.set(0, 0, 0);
    });
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

  // Check if user clicked directly on one of the 7 modular crystal shards
  raycaster.setFromCamera(mouseNDC, camera);
  const hits = raycaster.intersectObjects(interactMeshes, false);
  if (hits.length > 0) {
    const sIdx = hits[0].object.userData.shardIndex;
    grabbedShard = shards[sIdx];
  } else {
    grabbedShard = null;
  }
});

window.addEventListener('pointermove', (e) => {
  mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouseNDC, camera);
  raycaster.ray.intersectPlane(floorPlaneMath, mouseWorldTarget);

  if (!isDragging) {
    const hits = raycaster.intersectObjects(interactMeshes, false);
    hoveredShard = hits.length > 0 ? shards[hits[0].object.userData.shardIndex] : null;
    document.body.style.cursor = hoveredShard ? 'grab' : 'crosshair';
    return;
  }

  const dx = (e.clientX - lastX) / window.innerWidth;
  const dy = (e.clientY - lastY) / window.innerHeight;
  lastX = e.clientX;
  lastY = e.clientY;
  gravityWaveBoost = Math.min(1.0, gravityWaveBoost + Math.hypot(dx, dy) * 3.0);

  if (grabbedShard) {
    // Directly shift & twist the grabbed crystal shard in 3D/4D space!
    document.body.style.cursor = 'grabbing';
    grabbedShard.userDragOffset.x = Math.max(-1.6, Math.min(1.6, grabbedShard.userDragOffset.x + dx * 3.6));
    grabbedShard.userDragOffset.y = Math.max(-1.4, Math.min(1.4, grabbedShard.userDragOffset.y - dy * 3.0));
    grabbedShard.userRotOffset.y += dx * 2.8;
    grabbedShard.userRotOffset.x += dy * 2.4;
  } else {
    // Rotate the entire 4D constellation
    dragOffsetY = Math.max(-0.85, Math.min(0.85, dragOffsetY + dx * 1.6));
    dragOffsetX = Math.max(-0.45, Math.min(0.45, dragOffsetX + dy * 1.2));
  }
});

window.addEventListener('pointerup', (e) => {
  isDragging = false;
  grabbedShard = null;
  document.body.style.cursor = hoveredShard ? 'grab' : 'crosshair';

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
  frontGlassMat.uniforms.uResolution.value.set(w * curDpr, h * curDpr);
});

// 8. MAIN LOOP: 4D SHARD ARTICULATION, CAMERA IMMERSION & MULTI-LAYER REFRACTION
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  const activeNode = audioNexus.activeNode;

  const bass = audioNexus.getBassEnergy(t);
  gravityWaveBoost *= 0.95;
  const totalPulse = Math.min(1.2, bass * 1.15 + gravityWaveBoost * 0.6);

  // When a song is playing, add a subtle autonomous 4D breathing unfold so it never sits stiff
  const autoBreathUnfold = (!audioNexus.audioElement.paused && unfoldTarget < 0.2)
    ? (0.12 + Math.sin(t * 0.45) * 0.08 + bass * 0.18)
    : 0.0;
  const effectiveUnfoldTarget = Math.min(1.0, unfoldTarget + autoBreathUnfold);
  unfoldCurrent += (effectiveUnfoldTarget - unfoldCurrent) * 0.035;

  // Smooth Camera Glide into the Unfolded Reflection Chamber
  const targetCamZ = 7.2 - unfoldCurrent * 4.4; // Glides from 7.2 into 2.8 (inside the shard ring)
  const targetCamY = 0.15 + unfoldCurrent * 0.05;
  camera.position.z += (targetCamZ - camera.position.z) * 0.04;
  camera.position.y += (targetCamY - camera.position.y) * 0.04;
  camera.lookAt(mouseNDC.x * 0.25 * unfoldCurrent, -0.15 + mouseNDC.y * 0.18 * unfoldCurrent, 0);

  smoothMouse3D.lerp(mouseWorldTarget, 0.08);

  if (!isDragging) {
    dragOffsetX *= 0.96;
    dragOffsetY *= 0.96;
  }

  targetRotY = activeNode.targetRotY + mouseNDC.x * 0.24 + dragOffsetY + Math.sin(t * 0.32) * 0.05;
  targetRotX = activeNode.targetRotX - mouseNDC.y * 0.15 + dragOffsetX + Math.cos(t * 0.26) * 0.04;

  currentRotY += (targetRotY - currentRotY) * 0.03;
  currentRotX += (targetRotX - currentRotX) * 0.03;

  sigilGroup.rotation.y = currentRotY;
  sigilGroup.rotation.x = currentRotX;
  sigilGroup.position.y = 0.18 + Math.sin(t * 0.55) * 0.04 - totalPulse * 0.025;

  // Update each of the 7 modular crystal shards!
  const formation = activeNode.formation;
  shards.forEach((s, i) => {
    const form = formation[i];
    const isHovered = (hoveredShard === s);
    s.hoverBoost += ((isHovered ? 1.0 : 0.0) - s.hoverBoost) * 0.1;

    // Gentle spring-back on user-dragged shards when released
    if (grabbedShard !== s) {
      s.userDragOffset.multiplyScalar(0.985);
      s.userRotOffset.multiplyScalar(0.985);
    }

    // 4th-Dimensional Breathing & Parallax per shard (even when converged, each blade shifts independently!)
    const phase = t * (0.7 + i * 0.12) + i * 1.1;
    const microX = Math.cos(phase) * 0.022 * (1.0 + bass * 1.5);
    const microY = Math.sin(phase * 0.8) * 0.022 * (1.0 + bass * 1.5);
    const microZ = Math.sin(phase * 1.2) * 0.065 + s.hoverBoost * 0.18 + bass * (i % 2 === 0 ? 0.12 : -0.10);

    // Interpolate between Converged Sigil Home and Unfolded 4D Realm Architecture
    const goalX = THREE.MathUtils.lerp(s.homePos.x, form.pos[0], unfoldCurrent) + microX + s.userDragOffset.x;
    const goalY = THREE.MathUtils.lerp(s.homePos.y, form.pos[1], unfoldCurrent) + microY + s.userDragOffset.y;
    const goalZ = THREE.MathUtils.lerp(s.homePos.z, form.pos[2], unfoldCurrent) + microZ + s.userDragOffset.z;

    const goalRx = form.rot[0] * unfoldCurrent + Math.sin(phase) * 0.06 + s.userRotOffset.x - mouseNDC.y * 0.08 * (1.0 / s.mass);
    const goalRy = form.rot[1] * unfoldCurrent + Math.cos(phase * 0.9) * 0.08 + s.userRotOffset.y + mouseNDC.x * 0.12 * (1.0 / s.mass) + s.hoverBoost * 0.22;
    const goalRz = form.rot[2] * unfoldCurrent + Math.sin(phase * 0.5) * 0.03;

    const inertia = 0.045 / s.mass;
    s.curPos.x += (goalX - s.curPos.x) * inertia;
    s.curPos.y += (goalY - s.curPos.y) * inertia;
    s.curPos.z += (goalZ - s.curPos.z) * inertia;

    s.curRot.x += (goalRx - s.curRot.x) * inertia;
    s.curRot.y += (goalRy - s.curRot.y) * inertia;
    s.curRot.z += (goalRz - s.curRot.z) * inertia;

    s.holder.position.copy(s.curPos);
    s.holder.rotation.set(s.curRot.x, s.curRot.y, s.curRot.z);
  });

  backMistMat.uniforms.uTint.value.lerp(activeNode.tint, 0.03);
  backMistMat.uniforms.uRim.value.lerp(activeNode.rim, 0.03);
  backMistMat.uniforms.uTime.value = t;
  backMistMat.uniforms.uSigilOffset.value.set(currentRotY * 0.35, -currentRotX * 0.35);
  backMistMat.uniforms.uGravityPulse.value = totalPulse;
  backMistMat.uniforms.uUnfold.value = unfoldCurrent;

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

    const dxS = px - currentRotY * 0.5;
    const dyS = py - 0.18;
    const dzS = pz;
    const distS = Math.hypot(dxS, dyS, dzS);
    if (distS < 2.6 && distS > 0.35) {
      const pull = 0.0025 * (1.0 + totalPulse + unfoldCurrent * 1.2);
      px += (-dzS * 0.003 - dxS * pull);
      pz += (dxS * 0.003 - dzS * pull);
    }

    if (px > 6) px = -6;
    if (px < -6) px = 6;
    if (pz > 4) pz = -4;
    if (pz < -4) pz = 4;
    if (py > 2.4) py = -1.65;

    posArr[i3]     = px;
    posArr[i3 + 1] = py;
    posArr[i3 + 2] = pz;
  }
  pGeo.attributes.position.needsUpdate = true;

  const lightX = mouseNDC.x * 2.8 + Math.sin(t * 0.4) * 0.8;
  const lightY = 1.6 + mouseNDC.y * 1.2;
  backFaceGlassMat.uniforms.uRimColor.value.lerp(activeNode.rim, 0.04);
  backFaceGlassMat.uniforms.uLightPos.value.set(lightX, lightY, 3.2);

  frontGlassMat.uniforms.uRimColor.value.lerp(activeNode.rim, 0.04);
  frontGlassMat.uniforms.uTintColor.value.lerp(activeNode.tint, 0.04);
  frontGlassMat.uniforms.uLightPos.value.set(lightX, lightY, 3.2);
  frontGlassMat.uniforms.uTime.value = t;
  frontGlassMat.uniforms.uBass.value = totalPulse;
  frontGlassMat.uniforms.uUnfold.value = unfoldCurrent;

  // PASS 1: Render room, mist, particles, and internal back-bevels of all 7 shards
  shards.forEach(s => { s.frontMesh.visible = false; s.backMesh.visible = true; });
  renderer.setRenderTarget(envTarget);
  renderer.render(scene, camera);

  // PASS 2: Render see-through front crystal shards refracting envTarget + 4D internal scrying reflections
  shards.forEach(s => { s.frontMesh.visible = true; });
  renderer.setRenderTarget(null);
  renderer.render(scene, camera);
}

animate();
