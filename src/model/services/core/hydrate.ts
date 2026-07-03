export function hydrate(ctor: any, rows: any[] | null | undefined): any[] {
  if (!rows || !Array.isArray(rows)) return []

  return rows.map(row => {
    if (row instanceof ctor) return row

    const instance = ctor.newInstance()

    return instance.castFromDB(row)
  })
}
