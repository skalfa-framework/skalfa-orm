export function scope(query: any, Model: any, name: string, ...args: any[]) {
  if (!Model) return query

  const meta = Model.scopes?.[name]

  if (!meta) throw new Error(`Scope "${name}" not found`)

  if (meta.mode !== 'internal') throw new Error(`Scope "${name}" is global and cannot be called manually`)

  meta.fn.apply(query, args)

  return query
}
