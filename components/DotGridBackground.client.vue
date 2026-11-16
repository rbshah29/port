<template>
  <canvas ref="canvas" class="dot-grid" :class="{ 'is-ready': ready }" aria-hidden="true"></canvas>
</template>

<script setup>
// Full-screen WebGL background: a faint field of randomly scattered dots that
//  - swell and brighten around the cursor,
//  - send out a ripple ring on every click/tap,
//  - breathe with a slow ambient wave so it's alive on touch screens too,
//  - scroll with a slight parallax (slower than the content).
// If WebGL is unavailable it emits `unsupported` so the parent can fall back to the CSS glows.
const emit = defineEmits(['unsupported'])

const canvas = ref(null)
const ready = ref(false)

const MAX_RIPPLES = 6
const RIPPLE_LIFE = 1.8 // seconds; must match the fade in the shader
const PARALLAX = 0.25 // grid moves at 25% of scroll speed

const vertexSrc = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

const fragmentSrc = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uRes;      // canvas size in device pixels
uniform float uDpr;
uniform float uTime;    // seconds
uniform vec2 uMouse;    // CSS px, viewport, smoothed
uniform float uMouseOn; // 0..1, fades out when the pointer leaves
uniform float uScroll;  // CSS px
uniform vec4 uRipples[${MAX_RIPPLES}]; // xy = origin (CSS px), z = start time, w = active

uniform vec3 uBg;  // page background, from --bg-rgb
uniform vec3 uDot; // dot colour, from --dot-rgb
const float GAP = 28.0;        // grid spacing, CSS px
const float HOVER_R = 260.0;   // cursor influence radius
const float RIPPLE_SPEED = 420.0;
const float RIPPLE_WIDTH = 46.0;

// 1 at d = 0, falling smoothly to 0 at d = r
float falloff(float d, float r) { return 1.0 - smoothstep(0.0, r, d); }

// Stable pseudo-random pair per cell (no sin, so it's consistent across GPUs)
vec2 hash2(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}

// Fade dots toward the screen edges (c in CSS px)
float edgeFade(vec2 c) {
  vec2 uv = c * uDpr / uRes;
  return 0.4 + 0.6 * falloff(length((uv - 0.5) * vec2(1.1, 1.0)), 0.95);
}

// Brightness contribution of the dot living in grid cell n at pixel px
float dotAt(vec2 n, vec2 px, float shift) {
  vec2 r = hash2(n);
  vec2 r2 = hash2(n + 17.31);
  if (r2.x < 0.16) return 0.0; // leave some cells empty to break up the pattern

  // Scattered anywhere inside its cell (jittered grid: random, but evenly spread)
  vec2 c = (n + 0.1 + 0.8 * r) * GAP - vec2(0.0, shift);

  vec2 toMouse = uMouse - c;
  float hover = uMouseOn * falloff(length(toMouse), HOVER_R);
  hover *= hover;

  float ring = 0.0;
  vec2 push = vec2(0.0);
  for (int i = 0; i < ${MAX_RIPPLES}; i++) {
    vec4 rp = uRipples[i];
    if (rp.w < 0.5) continue;
    float age = uTime - rp.z;
    if (age < 0.0 || age > ${RIPPLE_LIFE.toFixed(1)}) continue;
    vec2 away = c - rp.xy;
    float d = length(away);
    float band = falloff(abs(d - age * RIPPLE_SPEED), RIPPLE_WIDTH)
               * (1.0 - smoothstep(0.0, ${RIPPLE_LIFE.toFixed(1)}, age));
    ring += band;
    push += (d > 0.001 ? away / d : vec2(0.0)) * band * 5.0;
  }
  ring = min(ring, 1.0);

  // Slow travelling wave plus a per-dot twinkle, so the field never looks static
  float amb = 0.5 + 0.5 * sin(c.x * 0.011 + c.y * 0.007 + uTime * 0.55)
                        * sin(c.y * 0.009 - c.x * 0.004 - uTime * 0.35);
  float twinkle = 0.75 + 0.25 * sin(uTime * (0.6 + r.y) + r.x * 6.2832);

  // Dots lean slightly toward the cursor and get pushed outward by ripples
  vec2 dotPos = c + push + (length(toMouse) > 0.001 ? normalize(toMouse) : vec2(0.0)) * hover * 3.0;
  float size = 0.65 + 0.8 * r2.y;
  float radius = 1.1 * size + hover * 1.3 + ring * 1.3;

  float aa = 1.0 / uDpr;
  float shape = 1.0 - smoothstep(radius - aa, radius + aa, distance(px, dotPos));

  float base = (0.17 + amb * 0.13) * twinkle * (0.6 + 0.6 * r2.x);
  return shape * (base * edgeFade(c) + hover * 0.65 + ring * 0.55);
}

void main() {
  vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
  float shift = uScroll * ${PARALLAX.toFixed(2)};
  vec2 cell = floor((px + vec2(0.0, shift)) / GAP);

  // Dots can sit anywhere in their cell, so check the neighbours too
  float a = 0.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      a = max(a, dotAt(cell + vec2(float(x), float(y)), px, shift));
    }
  }

  vec3 col = mix(uBg, uDot, clamp(a, 0.0, 1.0));

  // Very soft light pooled under the cursor
  col += uDot * uMouseOn * falloff(distance(px, uMouse), 440.0) * 0.035;

  gl_FragColor = vec4(col, 1.0);
}
`

let gl, program, raf, resizeObserver
const uniforms = {}
let start = 0
let dpr = 1
let reducedMotion = false
const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, on: 0, onTarget: 0 }
const ripples = new Float32Array(MAX_RIPPLES * 4)
let nextRipple = 0
// Colours (0..1 RGB) come from the CSS palette so there's a single source of truth
const palette = { bg: [0, 0, 0], dot: [0, 0, 0] }

const readCssRgb = (name) => getComputedStyle(document.documentElement)
  .getPropertyValue(name).split(',').map((v) => Number(v.trim()) / 255)


const now = () => (performance.now() - start) / 1000

const compile = (type, src) => {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('[dot-grid]', gl.getShaderInfoLog(shader))
    return null
  }
  return shader
}

const resize = () => {
  const el = canvas.value
  if (!el || !gl) return
  // Dots need crisp edges, so render at device resolution (capped for 3x phones)
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = Math.max(1, Math.round(el.clientWidth * dpr))
  const h = Math.max(1, Math.round(el.clientHeight * dpr))
  if (el.width !== w || el.height !== h) {
    el.width = w
    el.height = h
    gl.viewport(0, 0, w, h)
  }
  if (reducedMotion) draw()
}

const draw = () => {
  // Ease towards targets: quick enough to feel attached, smooth enough to glide
  if (mouse.x < -999) {
    mouse.x = mouse.tx
    mouse.y = mouse.ty
  }
  mouse.x += (mouse.tx - mouse.x) * 0.25
  mouse.y += (mouse.ty - mouse.y) * 0.25
  mouse.on += (mouse.onTarget - mouse.on) * 0.08

  gl.uniform2f(uniforms.uRes, canvas.value.width, canvas.value.height)
  gl.uniform1f(uniforms.uDpr, dpr)
  gl.uniform1f(uniforms.uTime, reducedMotion ? 0 : now())
  gl.uniform2f(uniforms.uMouse, mouse.x, mouse.y)
  gl.uniform1f(uniforms.uMouseOn, mouse.on)
  gl.uniform1f(uniforms.uScroll, window.scrollY)
  gl.uniform4fv(uniforms.uRipples, ripples)
  gl.uniform3fv(uniforms.uBg, palette.bg)
  gl.uniform3fv(uniforms.uDot, palette.dot)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
}

const loop = () => {
  raf = requestAnimationFrame(loop)
  draw()
}

const onPointerMove = (e) => {
  mouse.tx = e.clientX
  mouse.ty = e.clientY
  mouse.onTarget = 1
}

const onPointerDown = (e) => {
  const i = nextRipple * 4
  ripples[i] = e.clientX
  ripples[i + 1] = e.clientY
  ripples[i + 2] = now()
  ripples[i + 3] = 1
  nextRipple = (nextRipple + 1) % MAX_RIPPLES
  onPointerMove(e)
}

// Touch has no hover: let the glow fade once the finger lifts
const onPointerUp = (e) => {
  if (e.pointerType !== 'mouse') mouse.onTarget = 0
}

const onPointerLeave = () => {
  mouse.onTarget = 0
}

const onScroll = () => draw()

onMounted(async () => {
  // .client components render their template after mount, so wait for the canvas
  await nextTick()
  const el = canvas.value
  if (!el) return
  gl = el.getContext('webgl', { antialias: false, alpha: false, depth: false, powerPreference: 'low-power' })
  if (!gl) return emit('unsupported')

  const vs = compile(gl.VERTEX_SHADER, vertexSrc)
  const fs = compile(gl.FRAGMENT_SHADER, fragmentSrc)
  if (!vs || !fs) return emit('unsupported')

  program = gl.createProgram()
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return emit('unsupported')
  gl.useProgram(program)

  // One oversized triangle covers the whole viewport
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(program, 'aPos')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

  for (const name of ['uRes', 'uDpr', 'uTime', 'uMouse', 'uMouseOn', 'uScroll', 'uRipples', 'uBg', 'uDot']) {
    uniforms[name] = gl.getUniformLocation(program, name)
  }

  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  start = performance.now()

  palette.bg = readCssRgb('--bg-rgb')
  palette.dot = readCssRgb('--dot-rgb')

  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(el)
  resize()

  if (reducedMotion) {
    // Static grid only; redraw when scrolling so the parallax stays in place
    window.addEventListener('scroll', onScroll, { passive: true })
    draw()
  } else {
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('pointerup', onPointerUp, { passive: true })
    document.documentElement.addEventListener('pointerleave', onPointerLeave)
    raf = requestAnimationFrame(loop)
  }

  requestAnimationFrame(() => { ready.value = true })
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  resizeObserver?.disconnect()
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerdown', onPointerDown)
  window.removeEventListener('pointerup', onPointerUp)
  document.documentElement.removeEventListener('pointerleave', onPointerLeave)
  gl?.getExtension('WEBGL_lose_context')?.loseContext()
})
</script>

<style scoped>
.dot-grid {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 1s ease;
}

.dot-grid.is-ready {
  opacity: 1;
}
</style>
