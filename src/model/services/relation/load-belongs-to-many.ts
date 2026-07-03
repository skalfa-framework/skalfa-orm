import { conversion } from '../../../conversion'



export async function loadBelongsToMany(
  rows       :  any[],
  rel        :  any,
  name       :  string,
  callback  ?:  (q: any) => void
) {
  const ids = rows.map(r => r[rel.localKey])

  if (!ids.length) {
    rows.forEach(r => (r[name] = []))

    return []
  }

  const Parent       =  rows[0].constructor
  const Related      =  rel.model()
  const parentName   =  conversion.strSnake(Parent.name)
  const relatedName  =  conversion.strSnake(Related.name)

  const pivotTable    =  rel.pivotTable ?? conversion.strPlural(`${parentName}_has_${relatedName}`)
  const pivotLocal    =  rel.pivotLocal ?? `${parentName}_id`
  const pivotForeign  =  rel.pivotForeign ?? `${relatedName}_id`
  const relatedTable  =  Related.getTable()

  const q = Related.query().join(pivotTable, `${relatedTable}.${Related.primaryKey}`, '=', `${pivotTable}.${pivotForeign}`).whereIn(`${pivotTable}.${pivotLocal}`, ids)

  rel.callback?.(q)

  callback?.(q)

  q.select(`${relatedTable}.*`, `${pivotTable}.${pivotLocal} as __pivot_${pivotLocal}`)

  const rawRows  =  await q
  const related  =  Related.hydrate(rawRows)

  const grouped: Record<string, any[]> = {}

  for (let i = 0; i < related.length; i++) {
    const pivotValue = rawRows[i][`__pivot_${pivotLocal}`]

    ;(grouped[pivotValue] ??= []).push(related[i])
  }

  rows.forEach(r => { r[name] = grouped[r[rel.localKey]] ?? [] })

  return related
}
