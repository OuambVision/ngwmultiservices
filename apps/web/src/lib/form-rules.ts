export const emailPattern = {
  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  messageKey: 'form.email',
} as const

export const phonePattern = {
  value: /^(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}$/,
  messageKey: 'form.phone',
} as const

/** Valide le téléphone seulement s’il est renseigné. */
export function optionalPhoneValidate(message: string) {
  return (value: string | undefined) => {
    const phone = String(value ?? '').trim()
    if (!phone) return true
    return phonePattern.value.test(phone) || message
  }
}

export const namePattern = {
  value: /^[\p{L}][\p{L}\s'.-]{0,78}$/u,
  messageKey: 'form.name',
} as const

export const fieldClass =
  'w-full rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-sm font-normal text-navy outline-none focus:border-action'

export const fieldClassWithIcon =
  'w-full rounded-xl border border-navy/10 bg-white py-3 pr-3 pl-10 text-sm font-normal text-navy outline-none focus:border-action'

export function fieldErrorClass(invalid?: boolean) {
  return invalid ? 'border-accent focus:border-accent' : ''
}
