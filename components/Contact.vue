<template>
  <section id="contact" class="contact reveal px-6 py-14 sm:px-12">
    <p class="eyebrow flex items-center gap-3">
      <span>04</span>
      <span class="h-px w-10" style="background: linear-gradient(90deg, var(--imperial), var(--mint))"></span>
      <span style="color: var(--muted)">Contact</span>
    </p>
    <h2 class="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Get In <span style="color: var(--mint)">Touch!</span></h2>
    <p class="prose-muted mt-5 max-w-xl text-lg">
        Want to grab a virtual coffee and talk about life, work, or the latest trends? Hit me up! My <a :href="`mailto:${email}`" class="link">inbox</a> is always open.
    </p>

    <form class="mt-8 grid max-w-xl gap-3" @submit.prevent="send">
      <div class="grid gap-3 sm:grid-cols-2">
        <input v-model="form.name" name="name" type="text" required placeholder="Your name" autocomplete="name" class="field">
        <input v-model="form.email" name="email" type="email" required placeholder="Your email" autocomplete="email" class="field">
      </div>
      <textarea v-model="form.message" name="message" required rows="4" placeholder="Say hello…" class="field resize-y"></textarea>
      <!-- Honeypot: bots fill it, people never see it -->
      <input v-model="form.botcheck" type="checkbox" name="botcheck" class="hidden" tabindex="-1" autocomplete="off">

      <div class="mt-1 flex flex-wrap items-center gap-3">
        <button type="submit" class="btn btn-primary" :disabled="status === 'sending'">
          {{ status === 'sending' ? 'Sending…' : 'Say hello' }}
        </button>
        <button type="button" class="btn btn-ghost font-mono text-xs" @click="copyEmail">{{ email }}</button>
      </div>
      <p v-if="status === 'sent'" class="text-sm" style="color: var(--mint)">Thanks! Your message is on its way. I'll get back to you soon.</p>
      <p v-else-if="status === 'error'" class="text-sm" style="color: #f2a7a7">
        Something went wrong. Please try again or email me at <a :href="`mailto:${email}`" class="link">{{ email }}</a>.
      </p>
    </form>
  </section>
</template>

<script setup>
const { email, copyEmail } = useCopyEmail()
const { public: { web3formsKey } } = useRuntimeConfig()

const form = reactive({ name: '', email: '', message: '', botcheck: false })
const status = ref('idle')

const send = async () => {
  status.value = 'sending'
  try {
    const res = await $fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: {
        access_key: web3formsKey,
        subject: `New message from ${form.name} via portfolio`,
        from_name: 'Portfolio contact form',
        ...form,
      },
    })
    if (!res.success) throw new Error(res.message)
    status.value = 'sent'
    Object.assign(form, { name: '', email: '', message: '' })
  } catch (err) {
    console.error('Failed to send message: ', err)
    status.value = 'error'
  }
}
</script>

<style scoped>
.contact {
  position: relative;
  overflow: hidden;
  border-radius: 1.25rem;
  border: 1px solid var(--line);
  background:
    radial-gradient(70% 90% at 0% 0%, rgba(0, 35, 149, 0.55), transparent 70%),
    radial-gradient(60% 80% at 100% 100%, rgba(88, 111, 124, 0.3), transparent 70%),
    #05080a;
}

.field {
  width: 100%;
  border-radius: 0.5rem;
  border: 1px solid var(--line);
  background: rgba(3, 4, 5, 0.55);
  padding: 0.6rem 0.85rem;
  font-size: 0.875rem;
  color: var(--text);
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.field::placeholder {
  color: var(--faint);
}

.field:focus {
  outline: none;
  border-color: var(--line-strong);
  background: rgba(3, 4, 5, 0.8);
}

.btn:disabled {
  opacity: 0.6;
  pointer-events: none;
}
</style>
