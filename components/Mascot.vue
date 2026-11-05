<template>
  <div v-if="enabled" ref="root" class="mascot" :style="{ bottom: `${bottom}px` }" aria-hidden="true">
    <Transition name="bubble">
      <div v-if="bubble" :key="bubble" class="bubble">{{ bubble }}</div>
    </Transition>

    <div
      class="kiri"
      :class="[`mode-${mode}`, action && `act-${action}`, { annoyed, blink: blinking, poked }]"
      @pointerenter="onEnter"
      @pointerleave="onLeave"
      @click="onPoke"
    >
      <svg viewBox="0 0 120 120" class="layer">
        <ellipse class="shadow" cx="60" cy="113" rx="30" ry="4" />
      </svg>

      <div class="hopper layer">
        <div class="layer" :style="{ transform: `translateX(${look.x * 2}px)` }">
          <svg viewBox="0 0 120 120" class="layer">
            <!-- Tail -->
            <g class="tail">
              <path d="M74 102 C 92 108, 106 100, 104 84" fill="none" stroke="#4a6fe0" stroke-width="9" stroke-linecap="round" />
              <path d="M104 86 L 97 75 Q 105 70 112 77 Z" fill="#b8dbd9" />
            </g>

            <!-- Wings -->
            <g class="wing-l">
              <path d="M46 86 Q 30 68 18 72 Q 23 77 21 82 Q 28 82 28 88 Q 35 86 38 93 Z" fill="#b8dbd9" />
              <path d="M46 86 Q 30 70 18 72 M44 88 L 28 88" fill="none" stroke="#3d5fd1" stroke-width="1.6" stroke-linecap="round" />
            </g>
            <g class="wing-r">
              <path d="M74 86 Q 90 68 102 72 Q 97 77 99 82 Q 92 82 92 88 Q 85 86 82 93 Z" fill="#b8dbd9" />
              <path d="M74 86 Q 90 70 102 72 M76 88 L 92 88" fill="none" stroke="#3d5fd1" stroke-width="1.6" stroke-linecap="round" />
            </g>

            <!-- Body -->
            <g class="breathe">
              <ellipse cx="60" cy="94" rx="22" ry="19" fill="#4a6fe0" />
              <ellipse cx="60" cy="97" rx="13" ry="12" fill="#cfeee9" />
              <path d="M51 92 Q 60 94 69 92 M49 97 Q 60 99 71 97 M51 102 Q 60 104 69 102" fill="none" stroke="#9fcfc8" stroke-width="1.2" />
              <ellipse cx="49" cy="110" rx="7" ry="4" fill="#3d5fd1" />
              <ellipse cx="71" cy="110" rx="7" ry="4" fill="#3d5fd1" />
            </g>
          </svg>

          <!-- Head is its own layer so it can turn in 3D: look.x turns it, look.y tilts it back/down -->
          <svg
            viewBox="0 0 120 120"
            class="layer head"
            :style="{ transform: `perspective(220px) rotateY(${look.x * 28}deg) rotateX(${-look.y * 22}deg) rotateZ(${look.x * 4}deg)` }"
          >
            <g class="head-anim">
              <!-- Back of the head shifts against the turn for a bit of depth -->
              <g :style="{ transform: `translate(${-look.x * 2.5}px, ${-look.y * 2}px)` }">
                <path d="M41 41 Q 30 29 33 15 Q 40 28 51 36 Z" fill="#f4f4f9" />
                <path d="M79 41 Q 90 29 87 15 Q 80 28 69 36 Z" fill="#f4f4f9" />
                <path d="M53 37 L 56.5 27 L 60 36 Z M60 36 L 63.5 27 L 67 37 Z" fill="#b8dbd9" />
                <path d="M32 58 L 21 53 L 26 62 L 20 69 L 33 67 Z" fill="#b8dbd9" />
                <path d="M88 58 L 99 53 L 94 62 L 100 69 L 87 67 Z" fill="#b8dbd9" />
              </g>

              <ellipse cx="60" cy="58" rx="30" ry="25" fill="#4a6fe0" />
              <ellipse cx="60" cy="70" rx="15" ry="9.5" fill="#cfeee9" :style="{ transform: `translate(${look.x * 2.5}px, ${look.y * 2}px)` }" />

              <g :style="{ transform: `translate(${look.x * 3.5}px, ${look.y * 3}px)` }">
                <!-- Eyes -->
                <template v-if="eyes === 'closed'">
                  <path d="M40 57 Q 46 61 52 57" class="line" />
                  <path d="M68 57 Q 74 61 80 57" class="line" />
                </template>
                <template v-else-if="eyes === 'happy'">
                  <path d="M40 59 Q 46 52 52 59" class="line" />
                  <path d="M68 59 Q 74 52 80 59" class="line" />
                </template>
                <template v-else>
                  <g v-for="cx in [46, 74]" :key="cx" class="eye">
                    <g :class="{ squint: eyes === 'angry', wide: eyes === 'wide' }" class="eye-shape">
                      <ellipse :cx="cx" cy="56" rx="6" ry="7.5" fill="#121a3a" />
                      <g :style="{ transform: `translate(${look.x * 2.6}px, ${look.y * 3}px)` }">
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

                <ellipse cx="38" cy="66" :rx="annoyed ? 6 : 5" ry="2.5" :fill="annoyed ? '#ff6b8a' : '#f2a7bd'" :opacity="annoyed ? 0.75 : 0.6" />
                <ellipse cx="82" cy="66" :rx="annoyed ? 6 : 5" ry="2.5" :fill="annoyed ? '#ff6b8a' : '#f2a7bd'" :opacity="annoyed ? 0.75 : 0.6" />

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

              <!-- Tiny fire breath while you hover it -->
              <g v-if="annoyed" class="fire">
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
</template>

<script setup>
// Kiri: a tiny dragon that watches the cursor, entertains itself when you're idle,
// dozes off eventually, and gets grumpy if you hover or poke it.
const IDLE_AFTER = 4000
const SLEEP_AFTER = 30000
const ACTIONS = ['look', 'yawn', 'wag', 'flap', 'stretch', 'look', 'hop']
const DURATION = { look: 3600, yawn: 2000, hop: 1200, wag: 1800, flap: 1400, stretch: 1600 }
const GRUMBLES = ['Hey!', 'Personal space!!!', 'Grr…', 'Rude.']
const POKES = ['Ow!', 'Stop poking!', "I'm warning you…", 'GRRR!!', 'I breathe fire']

const enabled = ref(false)
const root = ref(null)
const mode = ref('awake') // awake | idle | sleep
const action = ref('')
const annoyed = ref(false)
const surprised = ref(false)
const blinking = ref(false)
const poked = ref(false)
const bubble = ref('')
const look = reactive({ x: 0, y: 0 })
const bottom = ref(12)

const target = { x: 0, y: 0 }
let lastMove = Date.now()
let pokes = 0
let frame, liftFrame, heartbeat, actionTimer, blinkTimer, bubbleTimer, leaveTimer

const eyes = computed(() => {
  if (annoyed.value) return 'angry'
  if (surprised.value) return 'wide'
  if (mode.value === 'sleep' || action.value === 'yawn') return 'closed'
  if (action.value === 'hop' || action.value === 'wag') return 'happy'
  return 'open'
})

const mouth = computed(() => {
  if (annoyed.value) return 'pout'
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

const loop = () => {
  look.x += (target.x - look.x) * 0.09
  look.y += (target.y - look.y) * 0.09
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

  actionTimer = setTimeout(() => {
    action.value = ''
    target.x = 0; target.y = 0.1
    actionTimer = setTimeout(runAction, rand(5000, 9000))
  }, DURATION[next])
}

const tick = () => {
  if (annoyed.value) return
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
    if (eyes.value === 'open' || eyes.value === 'angry') {
      blinking.value = true
      setTimeout(() => { blinking.value = false }, 130)
    }
    scheduleBlink()
  }, rand(2000, 5500))
}

const onEnter = () => {
  clearTimeout(leaveTimer)
  if (mode.value === 'sleep') say('Huh?! …hey!', 1600)
  else say(pick(GRUMBLES))
  mode.value = 'awake'
  action.value = ''
  clearTimeout(actionTimer)
  annoyed.value = true
}

const onLeave = () => {
  leaveTimer = setTimeout(() => {
    annoyed.value = false
    pokes = 0
    lastMove = Date.now()
    say('', 1200)
  }, 500)
}

const onPoke = async () => {
  poked.value = false
  await nextTick()
  poked.value = true
  setTimeout(() => { poked.value = false }, 420)
  say(POKES[Math.min(pokes++, POKES.length - 1)], 1400)
}

onMounted(() => {
  // Only for mouse users; on touch screens it would just sit on top of content
  enabled.value = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  if (!enabled.value) return
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
  ;[actionTimer, blinkTimer, bubbleTimer, leaveTimer].forEach(clearTimeout)
})
</script>

<style scoped>
.mascot {
  position: fixed;
  right: 1.25rem;
  z-index: 30;
  width: 88px;
  height: 88px;
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

/* Pivot at the neck */
.head { transform-origin: 50% 70%; }

.shadow { fill: rgba(0, 0, 0, 0.45); transform-origin: 60px 113px; }
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

/* Ambient motion */
.breathe { transform-origin: 60px 112px; animation: breathe 2.6s ease-in-out infinite; }
.tail { transform-origin: 76px 102px; animation: sway 4s ease-in-out infinite alternate; }
.head-anim { transform-origin: 60px 84px; transition: transform 0.5s ease; }
.fire { transform-origin: 58px 75px; animation: breathe-fire 1.3s ease-out infinite; }
.fire path { animation: flicker 0.12s linear infinite alternate; transform-origin: 58px 75px; }
.ember { animation: ember 1.3s ease-out infinite; }
.wing-l { transform-origin: 46px 87px; }
.wing-r { transform-origin: 74px 87px; }
.smoke circle { fill: #a4b4bc; opacity: 0; transform-box: fill-box; transform-origin: center; animation: puff 1.1s ease-out infinite; }
.smoke circle:nth-child(n+3) { animation-delay: 0.55s; }

/* Idle actions */
.act-hop .hopper { animation: hop 0.6s ease-in-out 1; }
.act-hop .shadow { animation: shadow-hop 0.6s ease-in-out 1; }
.act-wag .tail { animation: wag 0.45s ease-in-out 4 alternate; }
.act-flap .wing-l { animation: flap 0.25s ease-in-out 6 alternate; }
.act-flap .wing-r { animation: flap-r 0.25s ease-in-out 6 alternate; }
.act-flap .hopper { animation: hover-up 1.4s ease-in-out; }
.act-stretch .breathe { animation: stretch 1.6s ease; }
.act-yawn .head-anim { transform: rotate(-6deg) translateY(-2px); }

/* Sleeping */
.mode-sleep .breathe { animation-duration: 4s; }
.mode-sleep .head-anim { transform: rotate(7deg) translateY(4px); }
.mode-sleep .tail { animation: none; transform: rotate(-12deg); }
.mode-sleep .wing-l { transform: rotate(-18deg); }
.mode-sleep .wing-r { transform: rotate(18deg); }

/* Irritated */
.annoyed .head-anim { animation: grumble 0.12s linear 4 alternate; }
.annoyed .wing-l { transform: rotate(14deg); }
.annoyed .wing-r { transform: rotate(-14deg); }
.annoyed .tail { animation: wag 0.5s ease-in-out infinite alternate; }
.poked .hopper { animation: jolt 0.4s ease; }

.wing-l, .wing-r, .tail { transition: transform 0.3s ease; }

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

@keyframes breathe { 50% { transform: scale(1.02, 0.98); } }
@keyframes sway { from { transform: rotate(-4deg); } to { transform: rotate(5deg); } }
@keyframes wag { from { transform: rotate(-14deg); } to { transform: rotate(14deg); } }
@keyframes hop { 40% { transform: translateY(-14px); } 70% { transform: translateY(1px); } }
@keyframes shadow-hop { 40% { transform: scale(0.6); opacity: 0.5; } }
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
@keyframes float-z { 0% { opacity: 0; transform: translate(0, 4px); } 30% { opacity: 1; } 100% { opacity: 0; transform: translate(4px, -6px); } }

@media (prefers-reduced-motion: reduce) {
  .kiri *, .kiri { animation: none !important; }
}
</style>
