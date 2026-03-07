export type FulfillmentProvider = 'instacart' | 'instacart-official' | 'kroger' | 'deep-link'

export interface SponsoredItem {
  name: string
  brand: string
  price: number
  description?: string
}

export interface FulfillmentLink {
  provider: FulfillmentProvider
  url: string
  token: string
  attribution: {
    affiliate: string
  }
  bundles?: Array<{ name: string; description: string }>
  // chicory-style sponsorship or paid placement
  sponsoredItems?: SponsoredItem[]
}
