export async function resolve(query: any, input: any = {}) {
  const gq        =  input?.getQuery ? input.getQuery : input
  const isOption  =  input?.headers?.["x-option"] || gq?.isOption || false

  query.
    expand?.(gq.expand).
    search?.(gq.search, {
      includes    :  [],
      searchable  :  gq.searchable
    }).
    filter?.(gq.filter).
    selects?.({
      includes    :  [],
      selectable  :  gq.selectable
    }).
    sorts?.(gq.sort)

  if (isOption || gq.paginate) return await query.paginateOrOption?.(gq.page, gq.paginate, isOption, gq.selectableOption)

  const data = await query.query().get()

  return { data, total: data.length }
}
