<template>
  <div v-if="enabled" ref="root" class="mascot" :style="{ bottom: `${bottom}px` }" aria-hidden="true">
    <Transition name="bubble">
      <div v-if="bubble" :key="bubble" class="bubble">{{ bubble }}</div>
    </Transition>

    <div
      class="kiri"
      :class="[`mode-${mode}`, action && `act-${action}`, { annoyed, adored, blink: blinking, poked }]"
      @pointerenter="onEnter"
      @pointerleave="onLeave"
      @click="onPoke"
    >
      <MascotDragon3D
        v-if="use3d"
        v-show="ready3d"
        :target="target"
        :mode="mode"
        :action="action"
        :annoyed="annoyed"
        :fiery="fiery"
        :adored="adored"
        :poked="poked"
        :blinking="blinking"
        :eyes="eyes"
        :mouth="mouth"
        @ready="ready3d = true"
        @failed="use3d = false; ready3d = false"
      />
      <!-- Floating hearts while you hover (shared by the 2D and 3D dragon) -->
      <div class="hearts">
        <span v-for="h in hearts" :key="h.id" :style="{ left: `${h.x}%`, fontSize: `${h.size}px`, '--drift': `${h.drift}px` }">♥</span>
      </div>

      <div v-if="ready3d && mode === 'sleep' && !annoyed" class="zzz-3d">
        <span>z</span><span>z</span><span>Z</span>
      </div>

      <!-- 2D fallback: shown until the 3D version is ready, and for reduced motion / no WebGL -->
      <div v-show="!ready3d" class="layer">
      <svg viewBox="0 0 120 120" class="layer">
        <ellipse class="shadow" cx="60" cy="113" rx="30" ry="4" />
      </svg>

      <div class="hopper layer">
        <div class="layer shift">
          <svg viewBox="0 0 120 120" class="layer">
            <!-- Everything below the head leans around the feet, lagging behind the head -->
            <g class="lean">
            <!-- Tail: path is rebuilt every frame so a wave can travel down it -->
            <g class="tail">
              <path ref="tailEl" :d="TAIL_REST" fill="none" stroke="#4a6fe0" stroke-width="9" stroke-linecap="round" />
              <path ref="tipEl" d="M0 2 L -7 -9 Q 1 -14 8 -7 Z" transform="translate(104 84)" fill="#b8dbd9" />
            </g>

            <!-- Wings: outer group = per-frame breathing/flutter, inner group = state poses + flap action -->
            <g class="wing-l-js">
              <g class="wing-l">
                <path d="M46 86 Q 30 68 18 72 Q 23 77 21 82 Q 28 82 28 88 Q 35 86 38 93 Z" fill="#b8dbd9" />
                <path d="M46 86 Q 30 70 18 72 M44 88 L 28 88" fill="none" stroke="#3d5fd1" stroke-width="1.6" stroke-linecap="round" />
              </g>
            </g>
            <g class="wing-r-js">
              <g class="wing-r">
                <path d="M74 86 Q 90 68 102 72 Q 97 77 99 82 Q 92 82 92 88 Q 85 86 82 93 Z" fill="#b8dbd9" />
                <path d="M74 86 Q 90 70 102 72 M76 88 L 92 88" fill="none" stroke="#3d5fd1" stroke-width="1.6" stroke-linecap="round" />
              </g>
            </g>

            <!-- Body -->
            <g class="breathe">
              <ellipse cx="60" cy="94" rx="22" ry="19" fill="#4a6fe0" />
              <ellipse cx="60" cy="97" rx="13" ry="12" fill="#cfeee9" />
              <path d="M51 92 Q 60 94 69 92 M49 97 Q 60 99 71 97 M51 102 Q 60 104 69 102" fill="none" stroke="#9fcfc8" stroke-width="1.2" />
              <ellipse cx="49" cy="110" rx="7" ry="4" fill="#3d5fd1" />
              <ellipse cx="71" cy="110" rx="7" ry="4" fill="#3d5fd1" />
            </g>
            </g>
          </svg>

          <!-- Head is its own layer so it can turn in 3D: --lx turns it, --ly tilts it back/down -->
          <svg viewBox="0 0 120 120" class="layer head">
            <g class="head-anim">
              <!-- Back of the head shifts against the turn for a bit of depth -->
              <g class="p-back">
                <path d="M41 41 Q 30 29 33 15 Q 40 28 51 36 Z" fill="#f4f4f9" />
                <path d="M79 41 Q 90 29 87 15 Q 80 28 69 36 Z" fill="#f4f4f9" />
                <path d="M53 37 L 56.5 27 L 60 36 Z M60 36 L 63.5 27 L 67 37 Z" fill="#b8dbd9" />
                <path d="M32 58 L 21 53 L 26 62 L 20 69 L 33 67 Z" fill="#b8dbd9" />
                <path d="M88 58 L 99 53 L 94 62 L 100 69 L 87 67 Z" fill="#b8dbd9" />
              </g>

              <ellipse cx="60" cy="58" rx="30" ry="25" fill="#4a6fe0" />
              <ellipse cx="60" cy="70" rx="15" ry="9.5" fill="#cfeee9" class="p-muzzle" />

              <g class="p-face">
                <!-- Eyes -->
                <template v-if="eyes === 'closed'">
                  <path d="M40 57 Q 46 61 52 57" class="line" />
                  <path d="M68 57 Q 74 61 80 57" class="line" />
                </template>
                <template v-else-if="eyes === 'happy'">
                  <path d="M40 59 Q 46 52 52 59" class="line" />
                  <path d="M68 59 Q 74 52 80 59" class="line" />
                </template>
                <template v-else-if="eyes === 'sparkle'">
                  <defs>
                    <linearGradient id="kiri-iris" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stop-color="#2b1153" />
                      <stop offset="0.55" stop-color="#7a45d8" />
                      <stop offset="1" stop-color="#d9bfff" />
                    </linearGradient>
                  </defs>
                  <g v-for="(cx, i) in [46, 74]" :key="cx" class="eye sparkle-eye">
                    <ellipse :cx="cx" cy="57" rx="6.4" ry="7.6" fill="url(#kiri-iris)" stroke="#1d0d3a" stroke-width="0.8" />
                    <ellipse :cx="cx" cy="56.5" rx="2.6" ry="3.4" fill="#1a0b33" opacity="0.85" />
                    <g class="pupil">
                      <ellipse :cx="cx - 2.2" cy="53.4" rx="2.3" ry="2.7" fill="#fff" />
                      <circle :cx="cx + 2.4" cy="60.3" r="1.1" fill="#fff" />
                      <path :d="`M${cx + 2.6} 51.2 l0.6 1.5 1.5 0.6 -1.5 0.6 -0.6 1.5 -0.6 -1.5 -1.5 -0.6 1.5 -0.6 z`" fill="#fff" class="twinkle" />
                    </g>
                    <!-- thick upper lash line with a flick at the outer corner -->
                    <path :d="i === 0
                      ? `M${cx + 6.5} 51.5 Q ${cx} 47.4 ${cx - 6.8} 50.6 L ${cx - 8.6} 49.2 L ${cx - 7.2} 52.2 Q ${cx} 49.4 ${cx + 6.5} 51.5 Z`
                      : `M${cx - 6.5} 51.5 Q ${cx} 47.4 ${cx + 6.8} 50.6 L ${cx + 8.6} 49.2 L ${cx + 7.2} 52.2 Q ${cx} 49.4 ${cx - 6.5} 51.5 Z`" fill="#121a3a" stroke="#121a3a" stroke-width="1.2" stroke-linejoin="round" />
                  </g>
                </template>
                <template v-else>
                  <g v-for="cx in [46, 74]" :key="cx" class="eye">
                    <g :class="{ squint: eyes === 'angry', wide: eyes === 'wide' }" class="eye-shape">
                      <ellipse :cx="cx" cy="56" rx="6" ry="7.5" fill="#121a3a" />
                      <g class="pupil">
                        <ellipse :cx="cx" cy="59" rx="4.2" ry="3.2" fill="#ffc857" opacity="0.9" />
                        <circle :cx="cx - 2" cy="53" r="2.2" fill="#fff" />
                        <circle :cx="cx + 2" cy="59" r="1" fill="#fff" />
                      </g>
                    </g>
                  </g>
                </template>

                <template v-if="eyes === 'angry'">
                  <path d="M38 44 L52 49" class="line brow" />
                  <path d="M82 44 L68 49" class="line brow" />
                </template>

                <ellipse v-for="cx in [38, 82]" :key="cx" :cx="cx" cy="66" :rx="annoyed || adored ? 6.5 : 5" :ry="adored ? 3.2 : 2.5" :fill="annoyed ? '#ff6b8a' : adored ? '#ff8fb1' : '#f2a7bd'" :opacity="annoyed || adored ? 0.8 : 0.6" />

                <!-- Nostrils + mouth -->
                <ellipse cx="55.5" cy="66.5" rx="1.3" ry="1" fill="#121a3a" />
                <ellipse cx="64.5" cy="66.5" rx="1.3" ry="1" fill="#121a3a" />
                <template v-if="mouth === 'smile'">
                  <path d="M53 71 Q 56.5 74 60 71 Q 63.5 74 67 71" class="line thin" />
                  <path d="M62.6 72.3 L 64 75.3 L 65.4 72.3 Z" fill="#fff" />
                </template>
                <template v-else-if="mouth === 'pout'">
                  <ellipse cx="60" cy="74" rx="3.6" ry="3" fill="#121a3a" />
                  <path d="M61.2 71.2 L 62.4 73.6 L 63.6 71.4 Z" fill="#fff" />
                </template>
                <template v-else-if="mouth === 'grin'">
                  <path d="M52 70.5 Q 60 80 68 70.5 Z" fill="#121a3a" />
                  <ellipse cx="60" cy="75.3" rx="3.4" ry="1.8" fill="#ff7a9c" />
                </template>
                <ellipse v-else-if="mouth === 'yawn'" cx="60" cy="74" rx="4" ry="4.5" fill="#121a3a" />
                <circle v-else-if="mouth === 'o'" cx="60" cy="73" r="2.4" fill="#121a3a" />
                <path v-else d="M57 73 Q 60 74.5 63 73" class="line thin" />

                <!-- Smoke from the nostrils when grumpy -->
                <g v-if="annoyed || action === 'yawn'" class="smoke">
                  <circle cx="55" cy="63" r="2.6" />
                  <circle cx="65" cy="63" r="2.6" />
                  <circle cx="55" cy="63" r="2" />
                  <circle cx="65" cy="63" r="2" />
                </g>
              </g>

              <!-- Fire breath once you've poked it one too many times -->
              <g v-if="fiery" class="fire">
                <path d="M58 74 C 48 69, 36 71, 24 64 C 30 72, 28 77, 19 80 C 32 85, 47 82, 58 76 Z" fill="#ff6a3d" />
                <path d="M58 74.5 C 50 71.5, 41 73, 32 70 C 36 75, 34 78, 28 80 C 38 82, 49 80, 58 75.5 Z" fill="#ffb347" />
                <path d="M58 74.8 C 52 73.5, 46 74, 40 73.5 C 43 76, 42 77.5, 39 78.5 C 45 79, 52 78, 58 75.2 Z" fill="#fff2a8" />
                <circle cx="20" cy="70" r="1.3" fill="#ffb347" class="ember" />
                <circle cx="24" cy="84" r="1" fill="#ff6a3d" class="ember" />
              </g>

              <!-- 💢 -->
              <g v-if="annoyed" class="vein">
                <path d="M90 38 q4 0 4 -4 M102 38 q-4 0 -4 -4 M90 46 q4 0 4 4 M102 46 q-4 0 -4 4" />
              </g>
            </g>

            <g v-if="mode === 'sleep' && !annoyed" class="zzz">
              <text x="88" y="36" font-size="9">z</text>
              <text x="96" y="26" font-size="11">z</text>
              <text x="105" y="15" font-size="13">Z</text>
            </g>
          </svg>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Kiri: a tiny dragon that watches the cursor, entertains itself when you're idle,
// dozes off eventually, and gets grumpy if you hover or poke it.
const IDLE_AFTER = 4000
const SLEEP_AFTER = 30000
const ACTIONS = ['look', 'yawn', 'wag', 'flap', 'stretch', 'look', 'hop', 'tilt']
const DURATION = { look: 3600, yawn: 2000, hop: 1200, wag: 1800, flap: 1400, stretch: 1600, tilt: 2400 }

// Tail rest shape, as a chain of three segments from the base (a cubic curve's control legs).
// Each frame every segment is rotated a little, with a phase delay, so a wave runs to the tip.
const TAIL_BASE = [74, 102]
const TAIL_SEGMENTS = [[18, 6], [14, -8], [-2, -16]]
const TAIL_WEIGHTS = [0.5, 0.8, 1]
const TAIL_REST = 'M74 102 C 92 108, 106 100, 104 84'
const POKES = ['Ow!', "Hey! I'm warning you…", 'GRRR!!', 'I breathe fire!', 'RUDE!!']
const FIRE_AFTER = 3 // pokes in a row before it breathes fire

const enabled = ref(false)
const root = ref(null)
const mode = ref('awake') // awake | idle | sleep
const action = ref('')
const hovering = ref(false)
const anger = ref(0) // 0 calm · 1 grumpy (poked) · 2 breathing fire (kept poking)
const annoyed = computed(() => anger.value > 0)
const fiery = computed(() => anger.value > 1)
const adored = computed(() => hovering.value && !annoyed.value)
const hearts = ref([])
const surprised = ref(false)
const blinking = ref(false)
const poked = ref(false)
const bubble = ref('')
const bottom = ref(12)
const tailEl = ref(null)
const tipEl = ref(null)
const use3d = ref(false) // start loading the 3D dragon
const ready3d = ref(false) // 3D dragon rendered its first frame; hide the 2D one

const target = { x: 0, y: 0, tilt: 0 } // shared with the 3D renderer, which reads it every frame
// Per-frame physics state. Kept out of Vue's reactivity on purpose: the loop writes CSS
// variables straight onto the root element, so nothing re-renders at 60fps.
const sim = {
  lx: 0, ly: 0, vx: 0, vy: 0, // head look (springy, slight overshoot)
  lean: 0, vlean: 0, // body lean (softer spring = lags behind the head)
  tilt: 0, vtilt: 0, tiltTarget: 0, // curious head tilt, degrees
  sx: 0, sy: 0, sxTarget: 0, syTarget: 0, nextSaccade: 0, // tiny eye darts
  tailAmp: 0.1, tailPhase: 0, curl: 0, // tail wave
  flutterAt: -10, nextFlutter: 4, // occasional wing flutter
  last: 0,
}
let calm = false // prefers-reduced-motion: keep cursor tracking, drop ambient motion
let lastMove = Date.now()
let pokes = 0
let heartId = 0
let loveTimer, calmTimer, pokeResetTimer
let frame, liftFrame, heartbeat, actionTimer, blinkTimer, bubbleTimer, leaveTimer

const eyes = computed(() => {
  if (annoyed.value) return 'angry'
  if (adored.value) return 'sparkle'
  if (surprised.value) return 'wide'
  if (mode.value === 'sleep' || action.value === 'yawn') return 'closed'
  if (action.value === 'hop' || action.value === 'wag') return 'happy'
  return 'open'
})

const mouth = computed(() => {
  if (annoyed.value) return 'pout'
  if (adored.value) return 'grin'
  if (surprised.value) return 'o'
  if (action.value === 'yawn') return 'yawn'
  if (mode.value === 'sleep') return 'sleep'
  return 'smile'
})

const rand = (min, max) => min + Math.random() * (max - min)
const pick = (list) => list[Math.floor(Math.random() * list.length)]

const say = (text, ms = 1600) => {
  bubble.value = text
  clearTimeout(bubbleTimer)
  bubbleTimer = setTimeout(() => { bubble.value = '' }, ms)
}

// Damped spring step: returns [position, velocity]
const spring = (pos, vel, goal, stiffness, damping, dt) => {
  vel += (stiffness * (goal - pos) - damping * vel) * dt
  return [pos + vel * dt, vel]
}

const rotate = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)]
const f = (n) => n.toFixed(2)

const drawTail = (angles) => {
  let heading = 0
  let point = TAIL_BASE
  const points = []
  TAIL_SEGMENTS.forEach((segment, i) => {
    heading += angles[i]
    const [dx, dy] = rotate(segment, heading)
    point = [point[0] + dx, point[1] + dy]
    points.push(point)
  })
  const [c1, c2, end] = points
  tailEl.value?.setAttribute('d', `M${TAIL_BASE[0]} ${TAIL_BASE[1]} C ${f(c1[0])} ${f(c1[1])}, ${f(c2[0])} ${f(c2[1])}, ${f(end[0])} ${f(end[1])}`)
  tipEl.value?.setAttribute('transform', `translate(${f(end[0])} ${f(end[1])}) rotate(${f(heading * 180 / Math.PI)})`)
}

const loop = (now) => {
  // The 3D dragon has its own loop; keep this one idle while it's showing
  if (ready3d.value) {
    frame = requestAnimationFrame(loop)
    return
  }
  const t = now / 1000
  const dt = Math.min(0.05, sim.last ? t - sim.last : 1 / 60)
  sim.last = t

  const sleeping = mode.value === 'sleep' && !annoyed.value
  const wagging = annoyed.value || adored.value || action.value === 'wag'
  const motion = calm ? 0 : 1

  // Head chases the cursor with a little overshoot; body follows later and softer
  ;[sim.lx, sim.vx] = spring(sim.lx, sim.vx, target.x, 90, 13, dt)
  ;[sim.ly, sim.vy] = spring(sim.ly, sim.vy, target.y, 90, 13, dt)
  ;[sim.lean, sim.vlean] = spring(sim.lean, sim.vlean, sim.lx * 0.6, 22, 5, dt)
  ;[sim.tilt, sim.vtilt] = spring(sim.tilt, sim.vtilt, sim.tiltTarget, 40, 7, dt)

  // Breathing: slower and deeper when asleep
  const breath = motion * Math.sin(t * 2 * Math.PI / (sleeping ? 4.6 : 3)) * (sleeping ? 1.3 : 1)
  // Slow, irregular weight shift so it never stands perfectly still
  const sway = motion * (Math.sin(t * 0.53) + Math.sin(t * 0.29 + 1.7)) * 0.5 * (sleeping ? 0.2 : 1)

  // Every few seconds, a quick wing flutter (like settling its wings)
  if (motion && !sleeping && !annoyed.value && t > sim.nextFlutter) {
    sim.flutterAt = t
    sim.nextFlutter = t + rand(5, 11)
  }
  const ft = t - sim.flutterAt
  const flutter = ft < 0.55 ? Math.sin(ft * 34) * 7 * Math.sin(Math.PI * ft / 0.55) : 0

  // Eyes dart to a new spot now and then (fast, no spring)
  if (motion && !sleeping && t > sim.nextSaccade) {
    sim.sxTarget = rand(-0.9, 0.9)
    sim.syTarget = rand(-0.6, 0.6)
    sim.nextSaccade = t + rand(0.7, 2.6)
  }
  sim.sx += (sim.sxTarget - sim.sx) * 0.45
  sim.sy += (sim.syTarget - sim.sy) * 0.45

  // Tail: lazy wave normally, fast whip when wagging/annoyed, curled up when asleep
  sim.tailAmp += (motion * (wagging ? 0.32 : sleeping ? 0.03 : 0.1) - sim.tailAmp) * 0.06
  sim.curl += ((sleeping ? -0.28 : 0) - sim.curl) * 0.04
  sim.tailPhase += (wagging ? (annoyed.value ? 11 : 9) : sleeping ? 1.2 : 2) * dt
  const angles = TAIL_WEIGHTS.map((w, i) => sim.tailAmp * w * Math.sin(sim.tailPhase - i * 0.9) + sim.curl * w * 0.6)
  angles[0] -= sim.lean * 0.3 // tail counterbalances the lean
  drawTail(angles)

  const style = root.value?.style
  if (style) {
    style.setProperty('--lx', f(sim.lx))
    style.setProperty('--ly', f(sim.ly))
    style.setProperty('--lean', f(sim.lean))
    style.setProperty('--tilt', f(sim.tilt))
    style.setProperty('--br', f(breath))
    style.setProperty('--sway', f(sway))
    style.setProperty('--wing', f(breath * 2.5 + flutter))
    style.setProperty('--sx', f(sim.sx))
    style.setProperty('--sy', f(sim.sy))
  }
  frame = requestAnimationFrame(loop)
}

const onPointerMove = (e) => {
  const rect = root.value?.getBoundingClientRect()
  if (!rect) return
  // Look by direction, so it still turns fully toward a cursor across the page
  const dx = e.clientX - (rect.left + rect.width / 2)
  const dy = e.clientY - (rect.top + rect.height / 2)
  const reach = Math.min(1, Math.hypot(dx, dy) / 120)
  const angle = Math.atan2(dy, dx)
  target.x = Math.cos(angle) * reach
  target.y = Math.sin(angle) * reach
  lastMove = Date.now()

  if (mode.value === 'sleep' && !annoyed.value) {
    surprised.value = true
    say('!', 900)
    setTimeout(() => { surprised.value = false }, 700)
  }
  if (mode.value !== 'awake') {
    mode.value = 'awake'
    action.value = ''
    clearTimeout(actionTimer)
  }
}

// Rise above the footer heartbeat instead of covering it when it scrolls under the dragon
const lift = () => {
  cancelAnimationFrame(liftFrame)
  liftFrame = requestAnimationFrame(() => {
    const pulse = document.querySelector('.heartbeat-container')
    const self = root.value?.getBoundingClientRect()
    if (!pulse || !self) return
    const rect = pulse.getBoundingClientRect()
    const overlapsX = rect.right > self.left && rect.left < self.right
    bottom.value = overlapsX ? Math.max(12, window.innerHeight - rect.top + 4) : 12
  })
}

const runAction = () => {
  if (mode.value !== 'idle' || annoyed.value) return
  const next = pick(ACTIONS.filter((a) => a !== action.value))
  action.value = next

  if (next === 'look') {
    target.x = -0.9; target.y = 0
    setTimeout(() => { if (action.value === 'look') target.x = 0.9 }, 1300)
    setTimeout(() => { if (action.value === 'look') target.x = 0 }, 2700)
  }
  if (next === 'yawn') say('*yawn*', 1800)
  if (next === 'tilt') {
    sim.tiltTarget = target.tilt = pick([-1, 1]) * rand(9, 14)
    say('?', 1200)
  }

  actionTimer = setTimeout(() => {
    action.value = ''
    sim.tiltTarget = target.tilt = 0
    target.x = 0; target.y = 0.1
    actionTimer = setTimeout(runAction, rand(5000, 9000))
  }, DURATION[next])
}

const tick = () => {
  if (annoyed.value || hovering.value) return
  const idleFor = Date.now() - lastMove
  if (mode.value === 'awake' && idleFor > IDLE_AFTER) {
    mode.value = 'idle'
    actionTimer = setTimeout(runAction, 800)
  } else if (mode.value === 'idle' && idleFor > SLEEP_AFTER && !action.value) {
    clearTimeout(actionTimer)
    mode.value = 'sleep'
    target.x = 0; target.y = 0.35
  }
}

const scheduleBlink = () => {
  blinkTimer = setTimeout(() => {
    if (eyes.value === 'open' || eyes.value === 'angry' || eyes.value === 'sparkle') {
      blinking.value = true
      setTimeout(() => { blinking.value = false }, 130)
      // Sometimes a quick double blink
      if (Math.random() < 0.2) {
        setTimeout(() => { blinking.value = true }, 260)
        setTimeout(() => { blinking.value = false }, 390)
      }
    }
    scheduleBlink()
  }, rand(2000, 5500))
}

const floatHeart = () => {
  const id = ++heartId
  hearts.value.push({ id, x: rand(15, 75), size: rand(13, 19), drift: rand(-16, 16) })
  setTimeout(() => { hearts.value = hearts.value.filter((h) => h.id !== id) }, 1600)
}

// While hovered (and not grumpy): sparkly eyes and a steady trickle of floating hearts
const startLove = () => {
  clearInterval(loveTimer)
  floatHeart()
  loveTimer = setInterval(() => {
    if (!adored.value) return
    floatHeart()
    setTimeout(floatHeart, 450)
  }, 1300)
}

const stopLove = () => clearInterval(loveTimer)

const onEnter = () => {
  clearTimeout(leaveTimer)
  hovering.value = true
  mode.value = 'awake'
  action.value = ''
  sim.tiltTarget = target.tilt = 0
  clearTimeout(actionTimer)
  if (annoyed.value) return
  bubble.value = ''
  startLove()
}

const onLeave = () => {
  leaveTimer = setTimeout(() => {
    hovering.value = false
    stopLove()
    lastMove = Date.now()
  }, 300)
}

// Pokes: grumpy right away, fire if you keep going. Forgives you after a moment.
const onPoke = async () => {
  poked.value = false
  await nextTick()
  poked.value = true
  setTimeout(() => { poked.value = false }, 420)

  pokes++
  anger.value = pokes >= FIRE_AFTER ? 2 : 1
  stopLove()
  say(POKES[Math.min(pokes - 1, POKES.length - 1)], 1400)

  clearTimeout(calmTimer)
  calmTimer = setTimeout(() => {
    anger.value = 0
    if (hovering.value) {
      say(pokes >= FIRE_AFTER ? '…okay, I forgive you ♥' : 'Hmph… fine ♥', 1600)
      startLove()
    }
  }, anger.value > 1 ? 2600 : 1600)
  clearTimeout(pokeResetTimer)
  pokeResetTimer = setTimeout(() => { pokes = 0 }, 5000)
}

onMounted(() => {
  // Only for mouse users; on touch screens it would just sit on top of content
  enabled.value = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  if (!enabled.value) return
  calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  // Upgrade to 3D only after the page has fully loaded and the browser is idle,
  // so Three.js never competes with the real content (or PageSpeed)
  if (!calm) {
    const start3d = () => {
      const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1500))
      idle(() => { use3d.value = true }, { timeout: 4000 })
    }
    if (document.readyState === 'complete') start3d()
    else window.addEventListener('load', start3d, { once: true })
  }
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('scroll', lift, { passive: true })
  window.addEventListener('resize', lift)
  nextTick(lift)
  heartbeat = setInterval(tick, 500)
  frame = requestAnimationFrame(loop)
  scheduleBlink()
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('scroll', lift)
  window.removeEventListener('resize', lift)
  cancelAnimationFrame(frame)
  cancelAnimationFrame(liftFrame)
  clearInterval(heartbeat)
  ;[actionTimer, blinkTimer, bubbleTimer, leaveTimer, calmTimer, pokeResetTimer].forEach(clearTimeout)
  clearInterval(loveTimer)
})
</script>

<style scoped>
.mascot {
  position: fixed;
  right: 1.25rem;
  z-index: 30;
  width: 88px;
  height: 88px;
  /* Written every frame by the animation loop */
  --lx: 0; --ly: 0; --lean: 0; --tilt: 0; --br: 0; --sway: 0; --wing: 0; --sx: 0; --sy: 0;
}

.kiri {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

/* Pivot at the neck. Rides along with the body's lean/sway and bobs with each breath. */
.head {
  transform-origin: 50% 70%;
  transform:
    translate(calc(var(--lean) * 2.5px + var(--sway) * 1px), calc(var(--br) * -1.2px))
    perspective(220px)
    rotateY(calc(var(--lx) * 28deg))
    rotateX(calc(var(--ly) * -22deg))
    rotateZ(calc(var(--lx) * 4deg + var(--tilt) * 1deg));
}
.p-back { transform: translate(calc(var(--lx) * -2.5px), calc(var(--ly) * -2px)); }
.p-muzzle { transform: translate(calc(var(--lx) * 2.5px), calc(var(--ly) * 2px)); }
.p-face { transform: translate(calc(var(--lx) * 3.5px), calc(var(--ly) * 3px)); }
.pupil { transform: translate(calc(var(--lx) * 2.6px + var(--sx) * 1px), calc(var(--ly) * 3px + var(--sy) * 1px)); }

.shift { transform: translateX(calc(var(--lx) * 2px + var(--lean) * 1.5px)); }
.lean { transform-origin: 60px 112px; transform: rotate(calc(var(--lean) * 5deg + var(--sway) * 1.5deg)); }
.wing-l-js { transform-origin: 46px 87px; transform: rotate(calc(var(--wing) * 1deg)); }
.wing-r-js { transform-origin: 74px 87px; transform: rotate(calc(var(--wing) * -1deg)); }

.shadow {
  fill: rgba(0, 0, 0, 0.45);
  transform-origin: 60px 113px;
  transform: translateX(calc(var(--lean) * 2px)) scaleX(calc(1 + var(--br) * 0.03));
}
.line { fill: none; stroke: #121a3a; stroke-width: 2.4; stroke-linecap: round; }
.line.thin { stroke-width: 1.6; }
.brow { stroke-width: 2.8; }

.eye, .eye-shape { transform-box: fill-box; transform-origin: center; transition: transform 0.08s ease; }
.blink .eye { transform: scaleY(0.1); }
.eye-shape.squint { transform: scaleY(0.72); }
.eye-shape.wide { transform: scale(1.15); }

.vein { fill: none; stroke: #ff5c7a; stroke-width: 2.6; stroke-linecap: round; transform-origin: 96px 42px; animation: throb 0.45s ease-in-out infinite alternate; }

.zzz text { fill: var(--mint); font-family: ui-monospace, monospace; font-weight: 600; animation: float-z 2.4s ease-in-out infinite; opacity: 0; }
.zzz text:nth-child(2) { animation-delay: 0.6s; }
.zzz text:nth-child(3) { animation-delay: 1.2s; }

/* Adoring (hover) */
.adored .head-anim { animation: nuzzle 1.2s ease-in-out infinite alternate; }
.adored .wing-l { animation: flap 0.35s ease-in-out infinite alternate; }
.adored .wing-r { animation: flap-r 0.35s ease-in-out infinite alternate; }
.twinkle { transform-box: fill-box; transform-origin: center; animation: twinkle 1.6s ease-in-out infinite; }

.hearts { position: absolute; inset: -18px 0 45% 0; pointer-events: none; z-index: 1; }
.hearts span { position: absolute; bottom: 0; color: #ff4d7e; text-shadow: 0 0 6px rgba(255, 77, 126, 0.45); animation: heart-float 1.6s ease-out forwards; }

/* Sleep z's for the 3D dragon (it has no SVG layer to draw them in) */
.zzz-3d { position: absolute; top: -6px; right: -4px; display: flex; align-items: flex-end; gap: 2px; pointer-events: none; font-family: ui-monospace, monospace; font-weight: 600; color: var(--mint); }
.zzz-3d span { opacity: 0; animation: float-z 2.4s ease-in-out infinite; }
.zzz-3d span:nth-child(1) { font-size: 9px; }
.zzz-3d span:nth-child(2) { font-size: 11px; animation-delay: 0.6s; }
.zzz-3d span:nth-child(3) { font-size: 13px; animation-delay: 1.2s; }

/* Ambient motion (breathing, tail wave, flutter are driven by the JS loop) */
.breathe { transform-origin: 60px 112px; transform: scale(calc(1 + var(--br) * 0.018), calc(1 + var(--br) * 0.03)); }
.hopper { transform-origin: 50% 100%; }
.head-anim { transform-origin: 60px 84px; transition: transform 0.5s ease; }
.fire { transform-origin: 58px 75px; animation: breathe-fire 1.3s ease-out infinite; }
.fire path { animation: flicker 0.12s linear infinite alternate; transform-origin: 58px 75px; }
.ember { animation: ember 1.3s ease-out infinite; }
.wing-l { transform-origin: 46px 87px; }
.wing-r { transform-origin: 74px 87px; }
.smoke circle { fill: #a4b4bc; opacity: 0; transform-box: fill-box; transform-origin: center; animation: puff 1.1s ease-out infinite; }
.smoke circle:nth-child(n+3) { animation-delay: 0.55s; }

/* Idle actions */
.act-hop .hopper { animation: hop 0.85s ease-in-out 1; }
.act-hop .shadow { animation: shadow-hop 0.85s ease-in-out 1; }
.act-flap .wing-l { animation: flap 0.25s ease-in-out 6 alternate; }
.act-flap .wing-r { animation: flap-r 0.25s ease-in-out 6 alternate; }
.act-flap .hopper { animation: hover-up 1.4s ease-in-out; }
.act-stretch .breathe { animation: stretch 1.6s ease; }
.act-yawn .head-anim { transform: rotate(-6deg) translateY(-2px); }

/* Sleeping */
.mode-sleep .head-anim { transform: rotate(7deg) translateY(4px); }
.mode-sleep .wing-l { transform: rotate(-18deg); }
.mode-sleep .wing-r { transform: rotate(18deg); }

/* Irritated */
.annoyed .head-anim { animation: grumble 0.12s linear 4 alternate; }
.annoyed .wing-l { transform: rotate(14deg); }
.annoyed .wing-r { transform: rotate(-14deg); }
.poked .hopper { animation: jolt 0.4s ease; }

.wing-l, .wing-r { transition: transform 0.3s ease; }

.bubble {
  position: absolute;
  bottom: calc(100% + 4px);
  right: 30%;
  white-space: nowrap;
  padding: 0.3rem 0.6rem;
  border-radius: 0.6rem;
  font-family: ui-monospace, monospace;
  font-size: 11px;
  font-weight: 600;
  color: var(--black);
  background: var(--ghost);
  box-shadow: 0 8px 20px -10px var(--imperial);
}

.bubble::after {
  content: '';
  position: absolute;
  top: 100%;
  right: 14px;
  border: 5px solid transparent;
  border-top-color: var(--ghost);
}

.bubble-enter-active, .bubble-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.bubble-enter-from, .bubble-leave-to { opacity: 0; transform: translateY(4px) scale(0.9); }

/* Hop with anticipation (crouch), stretch on the way up, squash on landing */
@keyframes hop {
  0% { transform: none; }
  18% { transform: translateY(2px) scale(1.08, 0.9); }
  38% { transform: translateY(-13px) scale(0.93, 1.09); }
  55% { transform: translateY(-16px) scale(1, 1); }
  78% { transform: translateY(0) scale(1.1, 0.88); }
  90% { transform: translateY(0) scale(0.97, 1.03); }
  100% { transform: none; }
}
@keyframes shadow-hop { 18% { transform: scale(1.1); } 55% { transform: scale(0.6); opacity: 0.5; } 78% { transform: scale(1.1); } }
@keyframes breathe-fire { 0% { transform: scale(0, 0.4); opacity: 0; } 15% { transform: scale(1.05, 1); opacity: 1; } 55% { transform: scale(1, 1); opacity: 1; } 75%, 100% { transform: scale(0.3, 0.5); opacity: 0; } }
@keyframes flicker { from { transform: scale(1, 0.92); } to { transform: scale(0.96, 1.08); } }
@keyframes ember { 0%, 20% { opacity: 0; transform: translate(0, 0); } 40% { opacity: 1; } 80%, 100% { opacity: 0; transform: translate(-6px, -4px); } }
@keyframes flap { from { transform: rotate(-8deg); } to { transform: rotate(22deg); } }
@keyframes flap-r { from { transform: rotate(8deg); } to { transform: rotate(-22deg); } }
@keyframes hover-up { 30%, 70% { transform: translateY(-8px); } }
@keyframes puff { 0% { opacity: 0.8; transform: translate(0, 0) scale(0.6); } 100% { opacity: 0; transform: translate(0, -12px) scale(1.6); } }
@keyframes stretch { 40%, 60% { transform: scale(1.1, 0.88); } }
@keyframes grumble { from { transform: translateX(-0.8px); } to { transform: translateX(0.8px); } }
@keyframes jolt { 20% { transform: translate(-4px, -6px) rotate(-6deg); } 50% { transform: translate(4px, 0) rotate(5deg); } }
@keyframes throb { to { transform: scale(1.25); } }
@keyframes nuzzle { from { transform: rotate(-5deg) translateY(1px); } to { transform: rotate(5deg) translateY(-1px); } }
@keyframes twinkle { 0%, 100% { transform: scale(0.6) rotate(0deg); opacity: 0.6; } 50% { transform: scale(1.15) rotate(45deg); opacity: 1; } }
@keyframes heart-float {
  0% { opacity: 0; transform: translate(0, 6px) scale(0.5); }
  20% { opacity: 1; transform: translate(calc(var(--drift) * 0.3), -6px) scale(1); }
  100% { opacity: 0; transform: translate(var(--drift), -46px) scale(0.8); }
}
@keyframes float-z { 0% { opacity: 0; transform: translate(0, 4px); } 30% { opacity: 1; } 100% { opacity: 0; transform: translate(4px, -6px); } }

@media (prefers-reduced-motion: reduce) {
  .kiri *, .kiri { animation: none !important; }
}
</style>
