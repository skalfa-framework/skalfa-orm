import { loadBelongsTo } from './load-belongs-to'
import { loadBelongsToMany } from './load-belongs-to-many'
import { loadHasMany } from './load-has-many'
import { loadHasOne } from './load-has-one'



export async function loadRelations(
  rows   :  any[],
  Model  :  any,
  tree   :  Record<string, any>
) {
  if (!rows.length) return

  for (const [name, node] of Object.entries(tree)) {
    const rel = Model.relations[name]

    if (!rel) continue

    const desc = rel()
    let related: any[] = []

    if (desc.type === 'belongsTo') {
      related = await loadBelongsTo(rows, desc, name, node.__callback)
    }

    if (desc.type === 'belongsToMany') {
      related = await loadBelongsToMany(rows, desc, name, node.__callback)
    }

    if (desc.type === 'hasMany') {
      related = await loadHasMany(rows, desc, name, node.__callback)
    }

    if (desc.type === 'hasOne') {
      related = await loadHasOne(rows, desc, name, node.__callback)
    }

    if (node.__children && Object.keys(node.__children).length && related.length) {
      await loadRelations(related, desc.model(), node.__children)
    }
  }
}