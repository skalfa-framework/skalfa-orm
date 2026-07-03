export function format(query: any, Model: any, formatter: string | ((item: any) => any)) {
  if (typeof formatter === 'string') {
    const fn = Model?.formatters?.[formatter]

    if (!fn) throw new Error(`Formatter "${formatter}" not found on model ${Model?.name}`)

    query._formatter = fn

    return query
  }

  if (typeof formatter === 'function') {
    query._formatter = formatter

    return query
  }

  throw new Error('format() only accepts string or function')
}
