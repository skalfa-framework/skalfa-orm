import { Casts } from '../../model'



export function castFromDB(instance: any, row: Record<string, any>): any {
  const ctor = instance.constructor
  const fields = ctor.fields

  for (const [key, value] of Object.entries(row)) {
    if (!fields[key]) continue

    const meta = fields[key]

    instance[key] = meta.cast ? (Casts as any)[meta.cast].fromDB(value) : value
  }

  instance._original = {}

  for (const key of Object.keys(fields)) {
    instance._original[key] = instance[key]
  }

  const attrs = ctor.attributes

  for (const [name, fn] of Object.entries(attrs)) {
    Object.defineProperty(instance, name, {
      get: () => (fn as any).call(instance),
      enumerable: true,
    })
  }

  instance._exists = true

  return instance
}
