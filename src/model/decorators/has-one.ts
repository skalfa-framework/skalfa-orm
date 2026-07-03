import { conversion } from '../../conversion'
import { Model } from '../model'
import { pushRelation } from '../services'



export function HasOne(
  model     :  () => typeof Model,
  options  ?:  {
    foreignKey  ?:  string
    localKey    ?:  string
    callback    ?:  (q: any) => void
  }
) {
  return (target: any, key: string) => {
    const parent      =  target.constructor
    const parentKey   =  options?.localKey ?? 'id'
    const foreignKey  =  options?.foreignKey ?? `${conversion.strSnake(parent.name)}_id`

    pushRelation(target, key, { type: 'hasOne', model, foreignKey, localKey: parentKey, callback: options?.callback })
  }
}
