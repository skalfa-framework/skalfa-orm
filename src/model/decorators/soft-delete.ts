import { SOFT_DELETE_META } from '../model'



export function SoftDelete() {
  return function (target: any, propertyKey: string) {
    const ctor = target.constructor

    ctor[SOFT_DELETE_META] = { enabled: true, column: propertyKey }
  }
}
