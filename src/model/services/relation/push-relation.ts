import { RELATION_META } from '../../model'
import type { ModelRelationDescriptor } from '../../types'



export function pushRelation(
  target  :  any,
  key     :  string,
  desc    :  ModelRelationDescriptor
) {
  const ctor = target.constructor

  if (!ctor[RELATION_META]) ctor[RELATION_META] = {}

  ctor[RELATION_META][key] = () => desc
}
