import { FORMATTER_META } from '../model'



export function Formatter() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const ctor = target

    if (!ctor[FORMATTER_META]) ctor[FORMATTER_META] = {}

    ctor[FORMATTER_META][propertyKey] = descriptor.value
  }
}
