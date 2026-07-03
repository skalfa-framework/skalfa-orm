import type { ModelHookEventType, ModelHookContextType } from '../types'



export function On(event: ModelHookEventType) {
  return function (
    target        :  any,
    _propertyKey  :  string,
    descriptor    :  PropertyDescriptor
  ) {
    const ctor = target.constructor

    if (!ctor._hooks) ctor._hooks = {}

    if (!ctor._hooks[event]) ctor._hooks[event] = []

    ctor._hooks[event].push(
      async ({ model, trx }: ModelHookContextType) => descriptor.value.call(model, { trx })
    )
  }
}
