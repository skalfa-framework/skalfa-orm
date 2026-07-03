import { Casts } from '../../model'



export function castToDB(instance: any): Record<string, any> {
  const fields = instance.constructor.fields
  const data: Record<string, any> = {}

  for (const [key, meta] of Object.entries(fields) as [string, any][]) {
    if (!meta.fillable) continue

    const val   =  instance[key]

    if (val === undefined) continue

    data [key]  =  meta.cast ? (Casts as any)[meta.cast].toDB(val): val
  }

  return data
}
