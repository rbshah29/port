const email = 'rbshah0029@gmail.com'
let timer: ReturnType<typeof setTimeout> | undefined

export const useCopyEmail = () => {
  const toast = useState('toast', () => '')

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email)
      toast.value = 'Email copied to clipboard'
    } catch (err) {
      console.error('Failed to copy email: ', err)
      toast.value = email
    }
    clearTimeout(timer)
    timer = setTimeout(() => { toast.value = '' }, 2600)
  }

  return { email, toast, copyEmail }
}
