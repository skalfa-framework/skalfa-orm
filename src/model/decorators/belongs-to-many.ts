import { Model } from '../model'
import { pushRelation } from '../services'



export function BelongsToMany(
  model     : () => typeof Model,
  options  ?: {
    pivotTable    ?: string
    pivotLocal    ?: string
    pivotForeign  ?: string
    localKey      ?: string
    callback      ?: (q: any) => void
  }
) {
  return (target: any, key: string) => {
    const localKey = options?.localKey ?? 'id'

    pushRelation(target, key, {
      type          :  'belongsToMany',
      model         :  model,
      localKey      :  localKey,
      foreignKey    :  localKey,
      pivotTable    :  options?.pivotTable,
      pivotLocal    :  options?.pivotLocal,
      pivotForeign  :  options?.pivotForeign,
      callback      :  options?.callback,
    })
  }
}
