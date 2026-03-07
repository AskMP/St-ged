import type {
  FulfillmentLink,
  FulfillmentProvider,
  SponsoredItem,
} from '@staged/types'
import { v4 as uuidv4 } from 'uuid'
import * as listService from './list-service'

interface LinkRecord {
  url: string
  listId: string
  householdId: string
  createdAt: number
}

// simple in-memory storage for redirect tokens
const TOKEN_STORE: Record<string, LinkRecord> = {}

// environment helpers (defaults for tests)
const INSTACART_BASE = process.env.INSTACART_BASE_URL ||
  'https://www.instacart.com/store/1234/cart'
const INSTACART_CART_API_BASE = process.env.INSTACART_CART_API_URL || ''
const KROGER_BASE = process.env.KROGER_BASE_URL || ''
const AFFILIATE_ID = process.env.INSTACART_AFFILIATE_ID || 'affiliate-test'

// example sponsored items (Chicory) – could be fetched from an external service
const CHICORY_SPONSORED: SponsoredItem[] = [
  { name: 'Organic Honey', brand: 'ChicoryFarm', price: 6.99 },
]

/**
 * Return the list of available fulfillment providers for the given household.
 * In a real service this could inspect partner contracts, feature flags, etc.
 */
export async function getAvailableProviders(
  householdId: string
): Promise<FulfillmentProvider[]> {
  const providers: FulfillmentProvider[] = []
  // always allow the deep-link fallback
  providers.push('deep-link')
  // instacart deep link always available
  providers.push('instacart')
  // official cart API only if configured
  if (INSTACART_CART_API_BASE) {
    providers.push('instacart-official')
  }
  if (KROGER_BASE) {
    providers.push('kroger')
  }
  return providers
}

export async function generateLink(
  listId: string,
  userId: string,
  provider: FulfillmentProvider = 'instacart'
): Promise<FulfillmentLink> {
  switch (provider) {
    case 'instacart-official':
      if (!INSTACART_CART_API_BASE) {
        // fallback to deep link if not configured
        provider = 'instacart'
      } else {
        return generateInstacartOfficialLink(listId, userId)
      }
      break
    case 'kroger':
      if (!KROGER_BASE) {
        provider = 'instacart'
      } else {
        return generateKrogerLink(listId, userId)
      }
      break
    case 'deep-link':
      return generateDeepLink(listId, userId)
    case 'instacart':
    default:
      return generateDeepLink(listId, userId)
  }
  // if we mutated provider due to missing config, try again
  return generateLink(listId, userId, provider)
}

async function generateDeepLink(
  listId: string,
  userId: string
): Promise<FulfillmentLink> {
  console.log('generateDeepLink called with', listId, userId)
  const items = await listService.getItems(listId, userId)
  const list = await listService.getList(listId)
  if (!list) {
    const err: any = new Error('List not found')
    err.status = 404
    throw err
  }
  const token = uuidv4()
  const url = `${INSTACART_BASE}?affiliate_id=${AFFILIATE_ID}&items=${encodeURIComponent(
    items.map((i) => i.name).join(',')
  )}`
  TOKEN_STORE[token] = {
    url,
    listId,
    householdId: list.householdId,
    createdAt: Date.now(),
  }
  const bundles = await suggestBundles(list.householdId)
  return { provider: 'instacart', url, token, attribution: { affiliate: AFFILIATE_ID }, bundles }
}

async function generateInstacartOfficialLink(
  listId: string,
  userId: string
): Promise<FulfillmentLink> {
  console.log('generateInstacartOfficialLink', listId, userId)
  const items = await listService.getItems(listId, userId)
  const list = await listService.getList(listId)
  if (!list) {
    const err: any = new Error('List not found')
    err.status = 404
    throw err
  }
  const token = uuidv4()
  // pretend to call the official cart API; here just change URL for demonstration
  const url = `${INSTACART_CART_API_BASE}/cart?token=${token}`
  TOKEN_STORE[token] = {
    url,
    listId,
    householdId: list.householdId,
    createdAt: Date.now(),
  }
  return {
    provider: 'instacart-official',
    url,
    token,
    attribution: { affiliate: AFFILIATE_ID },
    bundles: await suggestBundles(list.householdId),
    sponsoredItems: CHICORY_SPONSORED,
  }
}

async function generateKrogerLink(
  listId: string,
  userId: string
): Promise<FulfillmentLink> {
  console.log('generateKrogerLink', listId, userId)
  const items = await listService.getItems(listId, userId)
  const list = await listService.getList(listId)
  if (!list) {
    const err: any = new Error('List not found')
    err.status = 404
    throw err
  }
  const token = uuidv4()
  const url = `${KROGER_BASE}?items=${encodeURIComponent(
    items.map((i) => i.name).join(',')
  )}`
  TOKEN_STORE[token] = {
    url,
    listId,
    householdId: list.householdId,
    createdAt: Date.now(),
  }
  return {
    provider: 'kroger',
    url,
    token,
    attribution: { affiliate: AFFILIATE_ID },
  }
}

export async function resolveToken(token: string) {
  const rec = TOKEN_STORE[token]
  if (!rec) {
    const err: any = new Error('Token not found')
    err.status = 404
    throw err
  }
  return rec
}

// simple bundle suggestion: just return a fixed upsell for MVP
async function suggestBundles(householdId: string) {
  return [
    { name: 'Premium Spices Pack', description: 'Add gourmet spices to your cart for 5% off' },
  ]
}
