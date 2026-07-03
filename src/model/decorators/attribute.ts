import { ATTRIBUTE_META } from '../model'



export function Attribute() {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    const ctor = target.constructor

    if (!ctor[ATTRIBUTE_META]) ctor[ATTRIBUTE_META] = {}

    ctor[ATTRIBUTE_META][key] = descriptor.value
  }
}
