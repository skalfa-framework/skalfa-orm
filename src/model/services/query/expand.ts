export function expand(query: any, entries: Array<string | Record<string, (q: any) => void>> = []) {
  if (!Array.isArray(entries) || !entries.length) return query

  if (!query._withTree) query._withTree = {}

  const applyPath = (path: string, callback?: (q: any) => void) => {
    let node: any

    const parts  =  path.split('.')
    let   cur    =  query._withTree

    for (const part of parts) {
      cur[part] ??= { __children: {} }

      node  =  cur[part]
      cur   =  node.__children
    }

    if (callback && node) node.__callback = callback
  }

  for (const entry of entries) {
    if (typeof entry === 'string') {
      applyPath(entry)

      continue
    }

    if (typeof entry === 'object') {
      for (const [path, cb] of Object.entries(entry)) {
        applyPath(path, cb)
      }
    }
  }

  return query
}
