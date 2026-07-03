export function sorts(query: any, sortsList?: string[]) {
  if (!Array.isArray(sortsList) || sortsList.length === 0) return query

  sortsList.forEach((sortExpr) => {
    if (typeof sortExpr !== "string") return

    const parts      =  sortExpr.trim().split(/\s+/)
    const column     =  parts[0]
    const direction  =  (parts[1] || "asc").toLowerCase()

    if (!["asc", "desc"].includes(direction)) {
      query.orderBy(column, "asc")
    } else {
      query.orderBy(column, direction)
    }
  })

  return query
}
