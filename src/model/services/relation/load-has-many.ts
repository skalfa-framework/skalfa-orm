export async function loadHasMany(rows: any[], rel: any, name: string, callback?: (q: any) => void) {
  const ids = rows.map(r => r[rel.localKey])

  if (!ids.length) {
    rows.forEach(r => (r[name] = []))

    return []
  }

  const q = rel.model().query().whereIn(rel.foreignKey, ids)

  rel.callback?.(q)

  callback?.(q)

  const related = rel.model().hydrate(await q)
  const grouped: Record<string, any[]> = {}

  for (const r of related) {
    ;(grouped[String(r[rel.foreignKey])] ??= []).push(r)
  }

  rows.forEach(r => (r[name] = grouped[String(r[rel.localKey])] ?? []))

  return related
}
