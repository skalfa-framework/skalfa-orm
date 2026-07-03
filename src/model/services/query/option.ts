import { applyGlobalScopes } from '../scope/apply-global-scopes'



export async function option(query: any, model: any, selectableOption?: string[]) {
  applyGlobalScopes(query)

  const q = query.clone()
  let defaultSelectable: string[] = []

  if (model) defaultSelectable = model.selectable || []

  let processedCols: string[] = []

  if (!Array.isArray(selectableOption) || selectableOption.length === 0) {
    const valueCol = defaultSelectable.length > 0 ? defaultSelectable[0] : model.primaryKey
    const labelCol = defaultSelectable.length > 0 ? defaultSelectable[1] : defaultSelectable[0] ?? model.primaryKey

    processedCols = [`${valueCol} as value`, `${labelCol} as label`]
  } else {
    processedCols = selectableOption.map((col, index) => {
      const hasAlias = /\s+as\s+/i.test(col)

      if (!hasAlias) {
        if (index === 0) return `${col} as value`
        if (index === 1) return `${col} as label`
      }

      return col
    })
  }

  q.clearSelect().select(processedCols)

  return await q
}
