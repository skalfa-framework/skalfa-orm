export function selects(
  query                               :  any,
  Model                               :  any,
  { includes = [], selectable = [] }  :  { includes?: string[], selectable?: string[] } = {}
) {
  const model = query.$model

  if (!model) return query

  const defaultSelectable = Model.selectable || ["*"]

  query.select(selectable?.length ? selectable : [...defaultSelectable, ...includes])

  return query
}
