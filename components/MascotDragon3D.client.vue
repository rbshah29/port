<template>
  <canvas ref="canvas" class="dragon-3d" />
</template>

<script setup>
// Real-time 3D version of Kiri, built from primitives with toon shading.
// Mascot.vue owns the behaviour (modes, actions, moods) and passes it down as props;
// this component only turns that state into motion. Three.js is imported lazily so it
// never touches the initial page load.
const props = defineProps({
  target: { type: Object, required: true }, // { x, y, tilt } — mutated by the parent, read every frame
  mode: { type: String, default: 'awake' }, // awake | idle | sleep
  action: { type: String, default: '' },
  annoyed: Boolean, // poked: grumpy face + smoke
  fiery: Boolean, // poked too many times: breathes fire
  adored: Boolean, // being hovered: sparkly eyes, wiggles, nuzzles
  poked: Boolean,
  blinking: Boolean,
  eyes: { type: String, default: 'open' }, // open | closed | happy | sparkle | angry | wide
  mouth: { type: String, default: 'smile' }, // smile | grin | pout | yawn | o | sleep
})
const emit = defineEmits(['ready', 'failed'])

const canvas = ref(null)
let frame = 0
let disposed = false
let teardown = () => {}

const COLOR = {
  body: 0x4a6fe0,
  dark: 0x3d5fd1,
  belly: 0xcfeee9,
  mint: 0xb8dbd9,
  horn: 0xf4f4f9,
  ink: 0x121a3a,
  iris: 0xffc857,
  blush: 0xf2a7bd,
  blushAngry: 0xff6b8a,
  blushLove: 0xff8fb1,
}

// Sparkly anime eye (adoring), painted once onto a canvas and used as a texture.
// Thick upper lash line with an outer flick, gradient violet iris, big + small highlights, a sparkle.
function paintSparkleEye() {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')
  const cx = 128, cy = 142
  // iris
  const iris = g.createLinearGradient(0, cy - 88, 0, cy + 88)
  iris.addColorStop(0, '#24104a')
  iris.addColorStop(0.5, '#7a45d8')
  iris.addColorStop(0.85, '#c9a6ff')
  iris.addColorStop(1, '#e6d4ff')
  g.fillStyle = iris
  g.beginPath(); g.ellipse(cx, cy, 70, 86, 0, 0, Math.PI * 2); g.fill()
  g.lineWidth = 7; g.strokeStyle = '#1d0d3a'; g.stroke()
  // pupil
  const pupil = g.createRadialGradient(cx, cy - 6, 4, cx, cy - 6, 40)
  pupil.addColorStop(0, '#0d0520'); pupil.addColorStop(1, 'rgba(26, 11, 51, 0.75)')
  g.fillStyle = pupil
  g.beginPath(); g.ellipse(cx, cy - 6, 28, 38, 0, 0, Math.PI * 2); g.fill()
  // soft glow along the bottom of the iris
  g.strokeStyle = 'rgba(255, 240, 255, 0.55)'; g.lineWidth = 6
  g.beginPath(); g.ellipse(cx, cy + 6, 50, 64, 0, Math.PI * 0.2, Math.PI * 0.8); g.stroke()
  // highlights
  g.fillStyle = '#fff'
  g.beginPath(); g.ellipse(cx - 26, cy - 40, 24, 28, -0.3, 0, Math.PI * 2); g.fill()
  g.beginPath(); g.arc(cx + 28, cy + 36, 11, 0, Math.PI * 2); g.fill()
  // four-point sparkle
  const star = (x, y, r) => {
    g.beginPath()
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4
      const rr = i % 2 ? r * 0.28 : r
      g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr)
    }
    g.closePath(); g.fill()
  }
  star(cx + 30, cy - 46, 15)
  // thick upper lash line, with a flick at the outer (right) corner
  g.fillStyle = '#121a3a'
  g.beginPath()
  g.moveTo(cx - 78, cy - 52)
  g.quadraticCurveTo(cx, cy - 122, cx + 80, cy - 62)
  g.lineTo(cx + 108, cy - 86)
  g.lineTo(cx + 92, cy - 44)
  g.quadraticCurveTo(cx, cy - 98, cx - 74, cy - 38)
  g.closePath(); g.fill()
  // thin lower lid
  g.strokeStyle = 'rgba(18, 26, 58, 0.55)'; g.lineWidth = 4
  g.beginPath(); g.ellipse(cx, cy - 4, 66, 92, 0, Math.PI * 0.32, Math.PI * 0.68); g.stroke()
  return c
}

const rand = (min, max) => min + Math.random() * (max - min)
const clamp01 = (v) => Math.min(1, Math.max(0, v))
const smooth = (v) => { const x = clamp01(v); return x * x * (3 - 2 * x) }
const spring = (pos, vel, goal, k, c, dt) => {
  vel += (k * (goal - pos) - c * vel) * dt
  return [pos + vel * dt, vel]
}

onMounted(async () => {
  try {
    const THREE = await import('three')
    if (disposed) return
    build(THREE)
  } catch (error) {
    console.warn('[mascot] 3D unavailable, keeping 2D', error)
    emit('failed')
  }
})

onBeforeUnmount(() => {
  disposed = true
  cancelAnimationFrame(frame)
  teardown()
})

function build(THREE) {
  const SIZE = 128
  const renderer = new THREE.WebGLRenderer({ canvas: canvas.value, alpha: true, antialias: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(SIZE, SIZE, false)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50)
  camera.position.set(0, 1.45, 6)
  camera.lookAt(0, 1.0, 0)

  scene.add(new THREE.HemisphereLight(0xffffff, 0x2a3560, 1.5))
  const key = new THREE.DirectionalLight(0xffffff, 2.4)
  key.position.set(-2.5, 3.5, 4)
  scene.add(key)
  const rim = new THREE.DirectionalLight(COLOR.mint, 1.6)
  rim.position.set(3, 2, -3)
  scene.add(rim)

  // ---------- materials & helpers ----------
  const owned = [] // geometries/materials/textures to dispose
  const own = (x) => { owned.push(x); return x }

  const ramp = own(new THREE.DataTexture(new Uint8Array([70, 160, 255]), 3, 1, THREE.RedFormat))
  ramp.minFilter = ramp.magFilter = THREE.NearestFilter
  ramp.needsUpdate = true

  const toon = (color, extra = {}) => own(new THREE.MeshToonMaterial({ color, gradientMap: ramp, ...extra }))
  const flat = (color, extra = {}) => own(new THREE.MeshBasicMaterial({ color, ...extra }))
  const outlineMat = flat(COLOR.ink, { side: THREE.BackSide })

  const SPHERE = own(new THREE.SphereGeometry(1, 32, 24))
  const SMALL_SPHERE = own(new THREE.SphereGeometry(1, 12, 10))

  const add = (geometry, material, parent, pos = [0, 0, 0], scale = [1, 1, 1], rot = [0, 0, 0]) => {
    const m = new THREE.Mesh(geometry, material)
    m.position.set(...pos)
    m.scale.set(...scale)
    m.rotation.set(...rot)
    parent.add(m)
    return m
  }
  // Inverted-hull outline: a slightly larger back-faced copy in ink colour
  const outline = (m, thickness = 0.07) => {
    const o = new THREE.Mesh(m.geometry, outlineMat)
    o.scale.setScalar(1 + thickness)
    m.add(o)
    return m
  }
  const group = (parent, pos = [0, 0, 0]) => {
    const g = new THREE.Group()
    g.position.set(...pos)
    parent.add(g)
    return g
  }

  const mBody = toon(COLOR.body)
  const mDark = toon(COLOR.dark)
  const mBelly = toon(COLOR.belly)
  const mMint = toon(COLOR.mint, { side: THREE.DoubleSide })
  const mHorn = toon(COLOR.horn)
  const mInk = flat(COLOR.ink)
  const mIris = flat(COLOR.iris)
  const mWhite = flat(0xffffff)
  const mBlush = flat(COLOR.blush, { transparent: true, opacity: 0.7 })

  // ---------- rig ----------
  // Proportions follow the 2D drawing (big chibi head, small round body):
  // 1 unit here = 50 units of the SVG viewBox, feet at y = 0.
  const BASE_YAW = -0.32 // stands in a 3/4 pose, turned slightly toward the page
  const HEAD_Y = 0.72 // neck pivot
  const root = group(scene)
  root.rotation.y = BASE_YAW

  const shadow = add(own(new THREE.CircleGeometry(0.55, 32)), flat(0x000000, { transparent: true, opacity: 0.38, depthWrite: false }), scene, [0, 0.003, 0], [1, 1, 1], [-Math.PI / 2, 0, 0])

  const hop = group(root) // jumps + squash/stretch, pivots at the feet
  const body = group(hop) // lean + sway + breathing

  // Torso, belly (with scale lines), feet, little arms
  outline(add(SPHERE, mBody, body, [0, 0.4, 0], [0.44, 0.4, 0.4]), 0.06)
  add(SPHERE, mBelly, body, [0, 0.36, 0.17], [0.29, 0.27, 0.25])
  const stripe = own(new THREE.TorusGeometry(1, 0.035, 6, 32, Math.PI * 0.55))
  for (const [y, r] of [[0.44, 0.2], [0.35, 0.23], [0.26, 0.2]]) {
    add(stripe, toon(0x9fcfc8), body, [0, y + r * 0.35, 0.4], [r, r * 0.35, r], [0.25, 0, Math.PI + Math.PI * 0.225])
  }
  for (const s of [-1, 1]) {
    outline(add(SPHERE, mDark, body, [s * 0.22, 0.07, 0.13], [0.15, 0.08, 0.2]), 0.1)
    add(SPHERE, mBody, body, [s * 0.36, 0.42, 0.2], [0.08, 0.13, 0.08], [0.3, 0, s * 0.5])
  }

  // Wings: bat-wing shape, extruded thin. Order ZYX = sweep back first, then flap about the body axis.
  const wingShape = new THREE.Shape()
  wingShape.moveTo(0, 0)
  wingShape.quadraticCurveTo(0.35, 0.6, 0.88, 0.52)
  wingShape.quadraticCurveTo(0.72, 0.36, 0.78, 0.2)
  wingShape.quadraticCurveTo(0.58, 0.24, 0.54, 0.04)
  wingShape.quadraticCurveTo(0.38, 0.1, 0.27, -0.12)
  wingShape.quadraticCurveTo(0.12, -0.02, 0, 0)
  const wingGeo = own(new THREE.ExtrudeGeometry(wingShape, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2, curveSegments: 10 }))
  wingGeo.translate(0, 0, -0.015)
  wingGeo.scale(0.95, 0.95, 1)
  const wingGeoMirror = own(wingGeo.clone().scale(-1, 1, 1))
  const wings = [1, -1].map((s) => {
    const pivot = group(body, [s * 0.22, 0.58, -0.18])
    pivot.rotation.order = 'ZYX'
    add(s > 0 ? wingGeo : wingGeoMirror, mMint, pivot)
    return { pivot, s }
  })

  // Tail: a chain of shrinking spheres that a wave travels down; spade at the tip
  const TAIL_N = 12
  const tail = Array.from({ length: TAIL_N }, (_, i) => {
    const r = 0.14 - i * 0.0075
    return add(SPHERE, mBody, body, [0, 0, 0], [r, r, r])
  })
  const spadeShape = new THREE.Shape()
  spadeShape.moveTo(0, -0.02)
  spadeShape.lineTo(0.12, 0.07)
  spadeShape.quadraticCurveTo(0.055, 0.15, 0, 0.25)
  spadeShape.quadraticCurveTo(-0.055, 0.15, -0.12, 0.07)
  spadeShape.lineTo(0, -0.02)
  const spadeGeo = own(new THREE.ExtrudeGeometry(spadeShape, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.012, bevelSegments: 2 }))
  spadeGeo.translate(0, 0, -0.02)
  const spade = add(spadeGeo, mMint, body)
  const TAIL_BASE = new THREE.Vector3(0.1, 0.2, -0.3)

  // Head (pivot at the neck). Skull is an ellipsoid centred at local y 0.4, radii 0.6 x 0.5 x 0.5;
  // features sit just proud of its surface.
  const head = group(body, [0, HEAD_Y, 0.02])
  head.rotation.order = 'YXZ'
  outline(add(SPHERE, mBody, head, [0, 0.4, 0], [0.6, 0.5, 0.5]), 0.05)
  add(SPHERE, mBelly, head, [0, 0.16, 0.33], [0.3, 0.19, 0.21]) // muzzle
  const blushes = []
  for (const s of [-1, 1]) {
    add(SMALL_SPHERE, mInk, head, [s * 0.075, 0.22, 0.525], [0.028, 0.02, 0.02]) // nostril
    // Horns: base on the skull, leaning out and back
    const hornGeo = own(new THREE.ConeGeometry(0.1, 0.55, 20).translate(0, 0.275, 0))
    outline(add(hornGeo, mHorn, head, [s * 0.33, 0.74, -0.06], [1, 1, 0.8], [-0.3, 0, -s * 0.32]), 0.08)
    // Side frills
    add(own(new THREE.ConeGeometry(0.12, 0.3, 4)), mMint, head, [s * 0.62, 0.34, -0.05], [1, 1, 0.35], [0, 0, -s * (Math.PI / 2 - 0.3)])
    // Blush
    blushes.push(add(SMALL_SPHERE, mBlush, head, [s * 0.42, 0.27, 0.34], [0.09, 0.045, 0.02], [0, s * 0.85, 0]))
  }
  for (const x of [-0.08, 0.08]) add(own(new THREE.ConeGeometry(0.055, 0.16, 12)), mMint, head, [x, 0.9, 0.0], [1, 1, 0.6])

  // Sparkly eye decal: a small plane bent back to follow the curve of the face
  const SPARKLE_GEO = own(new THREE.PlaneGeometry(0.34, 0.34, 8, 8))
  const pos = SPARKLE_GEO.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i)
    pos.setZ(i, -(x * x + y * y) * 0.9)
  }
  SPARKLE_GEO.computeVertexNormals()
  const sparkleTex = own(new THREE.CanvasTexture(paintSparkleEye()))
  sparkleTex.colorSpace = THREE.SRGBColorSpace
  sparkleTex.anisotropy = 4
  const mSparkle = flat(0xffffff, { map: sparkleTex, transparent: true, side: THREE.DoubleSide, depthWrite: false })
  const HAPPY_GEO = own(new THREE.TorusGeometry(0.085, 0.02, 6, 18, Math.PI)) // ∩ arc = ^^

  // Eyes: dark oval, amber iris low, two highlights. Inner group darts; outer group blinks.
  const eyes = [-1, 1].map((s) => {
    const socket = group(head, [s * 0.27, 0.43, 0.41])
    socket.rotation.y = s * 0.5
    const lid = group(socket)
    add(SPHERE, mInk, lid, [0, 0, 0], [0.12, 0.15, 0.06])
    const pupil = group(lid)
    add(SPHERE, mIris, pupil, [0, -0.05, 0.045], [0.08, 0.06, 0.025])
    add(SMALL_SPHERE, mWhite, pupil, [-0.04, 0.055, 0.055], [0.038, 0.038, 0.015])
    add(SMALL_SPHERE, mWhite, pupil, [0.04, -0.04, 0.062], [0.016, 0.016, 0.01])
    const brow = add(own(new THREE.BoxGeometry(0.2, 0.04, 0.04)), mInk, head, [s * 0.27, 0.64, 0.42], [1, 1, 1], [0, s * 0.45, s * 0.38])
    // Sparkly eye (adoring) and ^^ closed-happy eye; shown instead of the normal eye.
    // The texture's lash flick is on its right, so mirror it on the left eye (outer corner).
    const sparkle = group(socket, [0, 0.01, 0.055])
    add(SPARKLE_GEO, mSparkle, sparkle, [0, 0, 0], [s, 1, 1])
    const happy = add(HAPPY_GEO, mInk, socket, [0, -0.03, 0.05])
    return { lid, pupil, brow, sparkle, happy }
  })

  // Mouths (one visible at a time)
  const smile = group(head, [0, 0.085, 0.525])
  add(own(new THREE.TorusGeometry(0.06, 0.012, 6, 18, Math.PI)), mInk, smile, [0, 0, 0], [1, 1, 1], [0, 0, Math.PI])
  add(own(new THREE.ConeGeometry(0.016, 0.045, 8)), mWhite, smile, [0.035, -0.07, 0.005], [1, 1, 1], [Math.PI, 0, 0])
  const openMouth = add(SPHERE, mInk, head, [0, 0.06, 0.52], [0.04, 0.035, 0.02])
  const grin = group(head, [0, 0.07, 0.525])
  const grinShape = new THREE.Shape()
  grinShape.moveTo(-0.09, 0.01)
  grinShape.quadraticCurveTo(0, 0.03, 0.09, 0.01)
  grinShape.quadraticCurveTo(0.06, -0.11, 0, -0.11)
  grinShape.quadraticCurveTo(-0.06, -0.11, -0.09, 0.01)
  add(own(new THREE.ExtrudeGeometry(grinShape, { depth: 0.02, bevelEnabled: false, curveSegments: 12 })), mInk, grin, [0, 0, -0.005])
  add(SMALL_SPHERE, toon(0xff7a9c), grin, [0, -0.075, 0.02], [0.05, 0.028, 0.012])
  const MOUTH = new THREE.Vector3(0, 0.06, 0.56)

  // Fire + smoke particles (world space)
  const FIRE = [0xff6a3d, 0xffb347, 0xfff2a8]
  const particles = Array.from({ length: 36 }, () => {
    const m = new THREE.Mesh(SMALL_SPHERE, flat(0xffffff, { transparent: true, depthWrite: false }))
    m.visible = false
    scene.add(m)
    return { m, life: 0, max: 1, vel: new THREE.Vector3(), size: 0.05, smoke: false }
  })
  const spawn = (pos, vel, { smoke = false, life = 0.5, size = 0.06 } = {}) => {
    const p = particles.find((q) => q.life <= 0)
    if (!p) return
    p.m.position.copy(pos)
    p.vel.copy(vel)
    p.life = p.max = life
    p.size = size
    p.smoke = smoke
    p.m.material.color.setHex(smoke ? 0xa4b4bc : FIRE[Math.floor(Math.random() * FIRE.length)])
        p.m.visible = true
  }

  // ---------- animation state ----------
  const st = {
    lx: 0, vx: 0, ly: 0, vy: 0, lean: 0, vlean: 0, tilt: 0, vtilt: 0,
    pitch: 0, vpitch: 0, wingRaise: 0.35, vwing: 0, curl: 0, tailAmp: 0.12, tailPhase: 0,
    eyeOpen: 1, eyeScale: 1, sx: 0, sy: 0, sxT: 0, syT: 0, nextSaccade: 0,
    hopAt: -10, flapAt: -10, stretchAt: -10, kickAt: -10, flutterAt: -10, nextFlutter: 4,
    fireAcc: 0, smokeAcc: 0, last: 0,
  }

  const stopAction = watch(() => props.action, (a) => {
    const now = performance.now() / 1000
    if (a === 'hop') st.hopAt = now
    if (a === 'flap') st.flapAt = now
    if (a === 'stretch') st.stretchAt = now
  })
  const stopPoke = watch(() => props.poked, (p) => {
    if (!p) return
    st.kickAt = performance.now() / 1000
    st.vlean += (Math.random() < 0.5 ? -1 : 1) * 5
    st.vpitch -= 3
  })

  const v = new THREE.Vector3()
  const dir = new THREE.Vector3()
  const up = new THREE.Vector3(0, 1, 0)
  const headQuat = new THREE.Quaternion()

  const render = (nowMs) => {
    const t = nowMs / 1000
    const dt = Math.min(0.05, st.last ? t - st.last : 1 / 60)
    st.last = t

    const sleeping = props.mode === 'sleep' && !props.annoyed
    const wagging = props.annoyed || props.adored || props.action === 'wag'
    const target = props.target

    // Springs: head snappy, body lags behind it
    // Breathing fire: turn toward the page (the cursor is on top of it). Adored: look at you.
    const goalX = props.fiery ? -0.85 : props.adored ? 0 : target.x || 0
    const goalY = props.fiery ? 0.1 : props.adored ? -0.15 : target.y || 0
    ;[st.lx, st.vx] = spring(st.lx, st.vx, goalX, 90, 13, dt)
    ;[st.ly, st.vy] = spring(st.ly, st.vy, goalY, 90, 13, dt)
    ;[st.lean, st.vlean] = spring(st.lean, st.vlean, st.lx * 0.6, 22, 5, dt)
    ;[st.tilt, st.vtilt] = spring(st.tilt, st.vtilt, (target.tilt || 0) * Math.PI / 180, 40, 7, dt)
    const pitchGoal = sleeping ? 0.4 : props.action === 'yawn' ? -0.3 : 0
    ;[st.pitch, st.vpitch] = spring(st.pitch, st.vpitch, pitchGoal, 30, 8, dt)

    const breath = Math.sin(t * 2 * Math.PI / (sleeping ? 4.6 : 3)) * (sleeping ? 1.3 : 1)
    const sway = (Math.sin(t * 0.53) + Math.sin(t * 0.29 + 1.7)) * 0.5 * (sleeping ? 0.2 : 1)

    // --- hop: crouch, launch with stretch, land with squash
    let y = 0, sy = 1
    const hp = (t - st.hopAt) / 0.85
    if (hp >= 0 && hp < 1) {
      if (hp < 0.18) { sy = 1 - 0.12 * smooth(hp / 0.18) }
      else if (hp < 0.62) {
        const a = (hp - 0.18) / 0.44
        y = 0.42 * Math.sin(Math.PI * a)
        sy = 1 + 0.1 * Math.cos(Math.PI * a)
      } else {
        const a = (hp - 0.62) / 0.38
        sy = 1 - 0.12 * Math.sin(Math.PI * Math.min(1, a * 1.6)) * (1 - a)
      }
    }
    // --- flap: hover up while beating wings
    const fp = (t - st.flapAt) / 1.4
    const flapping = fp >= 0 && fp < 1
    if (flapping) y += 0.2 * Math.sin(Math.PI * fp)
    // --- stretch
    const sp = (t - st.stretchAt) / 1.6
    if (sp >= 0 && sp < 1) sy *= 1 + 0.12 * Math.sin(Math.PI * sp)
    // --- poke jolt
    const kp = (t - st.kickAt) / 0.4
    if (kp >= 0 && kp < 1) y += 0.12 * Math.sin(Math.PI * kp)

    // Happy little bounce while adored
    if (props.adored) y += Math.abs(Math.sin(t * 5)) * 0.04
    hop.position.y = y
    hop.scale.set(1 / Math.sqrt(sy), sy, 1 / Math.sqrt(sy))
    shadow.scale.setScalar(1 - Math.min(0.5, y * 0.9))
    shadow.material.opacity = 0.38 * (1 - Math.min(0.6, y))

    // Body: lean toward the cursor, turn the torso a little, breathe, shift weight
    body.rotation.z = -st.lean * 0.12 + sway * 0.03
    body.rotation.y = st.lean * 0.25
    body.scale.set(1 + breath * 0.015, 1 + breath * 0.025, 1 + breath * 0.015)

    // Head: look at the cursor in world space (undo the 3/4 stance and torso turn)
    const shake = props.annoyed ? Math.sin(t * 55) * 0.04 : 0
    head.rotation.y = st.lx * 0.85 - BASE_YAW - st.lean * 0.25 + shake
    head.rotation.x = st.ly * 0.45 + st.pitch
    // Adored: nuzzles side to side toward you
    const nuzzle = props.adored ? Math.sin(t * 2.6) * 0.16 : 0
    head.rotation.z = st.tilt + st.lx * 0.05 + nuzzle
    head.position.y = HEAD_Y + breath * 0.012

    // Wings: rest pose depends on mood; breathing + random flutter + flap action on top
    if (!sleeping && !props.annoyed && t > st.nextFlutter) {
      st.flutterAt = t
      st.nextFlutter = t + rand(5, 11)
    }
    const ft = t - st.flutterAt
    const flutter = ft < 0.55 ? Math.sin(ft * 34) * 0.18 * Math.sin(Math.PI * ft / 0.55) : 0
    const raiseGoal = sleeping ? -0.25 : props.annoyed ? 0.75 : props.adored ? 0.5 : 0.35
    ;[st.wingRaise, st.vwing] = spring(st.wingRaise, st.vwing, raiseGoal, 30, 7, dt)
    const beat = flapping ? Math.sin(t * 26) * 0.55 : props.adored ? Math.sin(t * 17) * 0.14 : 0
    for (const w of wings) {
      w.pivot.rotation.y = w.s * (sleeping ? 0.9 : 0.38)
      w.pivot.rotation.z = w.s * (st.wingRaise + beat + flutter + breath * 0.05)
    }

    // Tail: chain with a travelling wave; whips when wagging, curls when asleep
    st.tailAmp += ((wagging ? 0.38 : sleeping ? 0.03 : 0.12) - st.tailAmp) * 0.06
    st.curl += ((sleeping ? 0.5 : 0) - st.curl) * 0.04
    st.tailPhase += (wagging ? (props.annoyed ? 11 : props.adored ? 7 : 9) : sleeping ? 1.2 : 2) * dt
    v.copy(TAIL_BASE)
    let yaw = 1.15 - st.lean * 0.3
    let pitch = -0.25
    for (let i = 0; i < TAIL_N; i++) {
      const w = (i + 1) / TAIL_N
      yaw += st.tailAmp * w * Math.sin(st.tailPhase - i * 0.55) * 0.6 + st.curl * 0.08
      pitch += 0.17 + st.curl * 0.02
      dir.set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch))
      v.addScaledVector(dir, i === 0 ? 0 : 0.105)
      tail[i].position.copy(v)
    }
    spade.position.copy(v).addScaledVector(dir, 0.04)
    spade.quaternion.setFromUnitVectors(up, dir)

    // Eyes: blink / squint / wide, plus small saccades
    const eyeOpenGoal = props.blinking ? 0.08 : { closed: 0.08, angry: 0.7, wide: 1.15 }[props.eyes] ?? 1
    st.eyeOpen += (eyeOpenGoal - st.eyeOpen) * Math.min(1, dt * 30)
    if (!sleeping && t > st.nextSaccade) {
      st.sxT = rand(-1, 1)
      st.syT = rand(-0.6, 0.6)
      st.nextSaccade = t + rand(0.7, 2.6)
    }
    st.sx += (st.sxT - st.sx) * 0.45
    st.sy += (st.syT - st.sy) * 0.45
    for (const e of eyes) {
      e.lid.visible = props.eyes !== 'sparkle' && props.eyes !== 'happy'
      e.sparkle.visible = props.eyes === 'sparkle'
      e.sparkle.scale.set(1, props.blinking ? 0.08 : 1, 1)
      e.sparkle.position.x = st.sx * 0.006
      e.happy.visible = props.eyes === 'happy'
      e.lid.scale.set(props.eyes === 'wide' ? 1.15 : 1, st.eyeOpen, 1)
      e.pupil.position.set(st.sx * 0.012, st.sy * 0.012, 0)
      e.brow.visible = props.eyes === 'angry'
    }
    mBlush.color.setHex(props.annoyed ? COLOR.blushAngry : props.adored ? COLOR.blushLove : COLOR.blush)
    mBlush.opacity = props.annoyed || props.adored ? 0.9 : 0.7
    for (const b of blushes) b.scale.set(props.adored ? 0.12 : 0.09, props.adored ? 0.06 : 0.045, 0.02)

    // Mouth
    const m = props.mouth
    smile.visible = m === 'smile' || m === 'sleep'
    grin.visible = m === 'grin'
    smile.scale.setScalar(m === 'sleep' ? 0.6 : 1)
    openMouth.visible = m === 'pout' || m === 'yawn' || m === 'o'
    if (m === 'yawn') openMouth.scale.set(0.06, 0.075, 0.03)
    else if (m === 'o') openMouth.scale.set(0.03, 0.03, 0.02)
    else openMouth.scale.set(0.04, 0.035, 0.02)

    // Fire breath when fiery, nostril smoke when grumpy or yawning
    scene.updateMatrixWorld()
    if (props.fiery) {
      st.fireAcc += dt * 55
      while (st.fireAcc > 1) {
        st.fireAcc -= 1
        const origin = head.localToWorld(v.copy(MOUTH))
        const vel = dir.set(rand(-0.18, 0.18), rand(-0.25, 0.05), 1).applyQuaternion(head.getWorldQuaternion(headQuat)).multiplyScalar(rand(2.2, 3.2))
        spawn(origin, vel, { life: rand(0.4, 0.65), size: rand(0.06, 0.11) })
      }
    }
    if (props.annoyed || props.action === 'yawn') {
      st.smokeAcc += dt * 6
      while (st.smokeAcc > 1) {
        st.smokeAcc -= 1
        const origin = head.localToWorld(v.set(rand(-0.08, 0.08), 0.24, 0.54))
        spawn(origin, dir.set(rand(-0.1, 0.1), 0.6, 0.1), { smoke: true, life: 0.9, size: 0.04 })
      }
    }
    for (const p of particles) {
      if (p.life <= 0) continue
      p.life -= dt
      if (p.life <= 0) { p.m.visible = false; continue }
      const age = 1 - p.life / p.max
      p.m.position.addScaledVector(p.vel, dt)
      if (!p.smoke) p.vel.multiplyScalar(1 - dt * 1.5)
      p.m.scale.setScalar(p.size * (p.smoke ? 1 + age * 2 : Math.sin(Math.PI * Math.min(1, age * 1.4 + 0.15)) * 1.6))
      p.m.material.opacity = (p.smoke ? 0.6 : 0.95) * (1 - age)
    }

    renderer.render(scene, camera)
    frame = requestAnimationFrame(render)
  }

  renderer.render(scene, camera)
  emit('ready')
  frame = requestAnimationFrame(render)

  teardown = () => {
    stopAction()
    stopPoke()
    for (const p of particles) p.m.material.dispose()
    for (const x of owned) x.dispose?.()
    renderer.dispose()
  }
}
</script>

<style scoped>
.dragon-3d {
  position: absolute;
  left: 50%;
  bottom: -18px;
  width: 128px;
  height: 128px;
  transform: translateX(-50%);
  pointer-events: none;
}
</style>
