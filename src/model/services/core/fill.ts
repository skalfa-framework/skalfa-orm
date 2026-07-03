export function fill(instance: any, payload: Record<string, any>): any {
  const ctor    =  instance.constructor
  const fields  =  ctor.fields

  for (const [key, value] of Object.entries(payload)) {
    const meta = fields[key]

    if (!meta || !meta.fillable) continue

    instance[key] = value
  }

  return instance
}
