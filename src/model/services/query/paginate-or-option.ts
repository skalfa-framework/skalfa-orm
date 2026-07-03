export async function paginateOrOption(
  query              :  any,
  page               :  number              =  1,
  limit              :  number              =  10,
  optionOption      ?:  string | boolean,
  selectableOption  ?:  string[]
) {
  const isOption = ["true", "1", "yes"].includes(String(optionOption).toLowerCase())

  if (isOption) {
    const data = await query.option(selectableOption)

    return { data, total: data.length }
  }

  const result = await query.paginate(page, limit)

  return result
}
