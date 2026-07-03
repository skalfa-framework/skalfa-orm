export function toJSON(instance: any): Record<string, any> {
  const data: Record<string, any>  =  {}

  const ctor                 =  instance.constructor
  const fields               =  ctor.fields ?? {}
  const relations            =  ctor.relations ?? {}
  const attributes           =  ctor.attributes ?? {}

  for (const key of Object.keys(fields)) {
    if (fields[key]?.hidden) continue

    data[key] = instance[key]
  }

  const expanded = instance.__expandedAttributes ?? []

  for (const key of expanded) {
    if (attributes[key]) data[key] = instance[key]
  }

  for (const key of Object.keys(relations)) {
    if (instance[key] !== undefined) data[key] = instance[key]
  }

  return data
}
