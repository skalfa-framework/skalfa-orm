export function withoutScope(query: any, ...names: string[]) {
  for (const name of names) {
    query._disabledScopes.add(name)
  }

  return query
}
