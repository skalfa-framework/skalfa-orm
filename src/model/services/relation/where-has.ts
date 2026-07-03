import type { Knex } from 'knex'



export function whereHasSubquery(
  parentQuery   :  any,
  Model         :  any,
  relations     :  string[],
  callback     ?:  (q: any) => void,
  negate        :  boolean = false
) {
  const relation  =  relations[0]
  const relDef    =  Model.relations?.[relation]

  if (!relDef) return

  const desc = relDef()
  const Related = desc.model()

  const parentTable = Model.getTable()
  const relatedTable = Related.getTable()

  const method = negate ? 'whereNotExists' : 'whereExists'

  parentQuery[method](function (this: Knex.QueryBuilder) {
    this.select(1).from(relatedTable)

    if (desc.type === 'hasMany' || desc.type === 'hasOne') {
      this.whereRaw(`${relatedTable}.${desc.foreignKey} = ${parentTable}.${desc.localKey}`)
    }

    if (desc.type === 'belongsTo') {
      this.whereRaw(`${relatedTable}.${desc.localKey} = ${parentTable}.${desc.foreignKey}`)
    }

    if (desc.type === 'belongsToMany') {
      const pivot = desc.pivotTable

      this.join(pivot, `${pivot}.${desc.pivotForeign}`, '=', `${relatedTable}.${Related.primaryKey}`)

      this.whereRaw(`${pivot}.${desc.pivotLocal} = ${parentTable}.${desc.localKey}`)
    }

    if (relations.length > 1) {
      whereHasSubquery(this, Related, relations.slice(1), callback, negate)

      return
    }

    if (callback) {
      const qb = Related.query().from(relatedTable)

      desc.callback?.(qb)

      callback(qb)

      this.whereExists(qb)
    }
  })
}
