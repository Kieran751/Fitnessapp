import { useSetAtom } from 'jotai'
import { toastAtom, type ToastState } from '../store/atoms'

export function useToast() {
  const setToast = useSetAtom(toastAtom)

  function show(message: string, variant: ToastState['variant'] = 'info') {
    setToast({ id: crypto.randomUUID(), message, variant })
  }

  return { show }
}
