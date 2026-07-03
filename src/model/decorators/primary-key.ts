import { PRIMARY_KEY_META, FIELD_META } from '../model'



export function PrimaryKey() {
  return function (target: any, key: string) {
    const ctor = target.constructor

    ctor.primaryKey = key

    if (!ctor[FIELD_META]) ctor[FIELD_META] = {}

    ctor[FIELD_META][key] = {
      cast        :  'number',
      selectable  :  true,
    }

    ctor[PRIMARY_KEY_META] = key
  }
}
