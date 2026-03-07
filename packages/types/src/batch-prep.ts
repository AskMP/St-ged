// Types for Batch Prep feature (F14)

export interface BatchPrepItem {
  name: string
  /** number of recipes that include this ingredient */
  count: number
}

export interface BatchPrepResult {
  items: BatchPrepItem[]
  /** ordering of recipes as provided */
  sequence: string[]
}
