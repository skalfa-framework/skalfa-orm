import { conversion } from '../../conversion'
import { FIELD_META, Model } from '../model'
import { pushRelation } from '../services'



export function BelongsTo(
  model     :  () => typeof Model,
  options  ?:  {
    foreignKey  ?:  string
    ownerKey    ?:  string
    callback    ?:  (q: any) => void
  }
) {
  return (target: any, key: string) => {
    const ctor        =  target.constructor
    const foreignKey  =  options?.foreignKey ?? `${conversion.strSnake(key)}_id`
    const ownerKey    =  options?.ownerKey ?? 'id'

    pushRelation(target, key, { type: 'belongsTo', model, foreignKey, localKey: ownerKey, callback: options?.callback })

    if (!ctor[FIELD_META]) ctor[FIELD_META] = {}

    if (!ctor[FIELD_META][foreignKey]) {
      ctor[FIELD_META][foreignKey] = {
        cast        :  'number',
        fillable    :  true,
        selectable  :  true,
      }
    }
  }
}
