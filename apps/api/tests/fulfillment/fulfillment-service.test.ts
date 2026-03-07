import * as service from '../../src/services/fulfillment-service'

// mock list-service so we don't hit the DB
vi.mock('../../src/services/list-service', () => ({
  getItems: vi.fn(),
  getList: vi.fn(),
}))
import { getItems, getList } from '../../src/services/list-service'

describe('fulfillment service', () => {
  const origInstacart = process.env.INSTACART_CART_API_URL
  const origKroger = process.env.KROGER_BASE_URL

  beforeEach(() => {
    // reset configs
    delete process.env.INSTACART_CART_API_URL
    delete process.env.KROGER_BASE_URL
    vi.resetAllMocks()
  })
  afterAll(() => {
    process.env.INSTACART_CART_API_URL = origInstacart
    process.env.KROGER_BASE_URL = origKroger
  })

  it('returns available providers with defaults', async () => {
    const providers = await service.getAvailableProviders('house1')
    expect(providers).toEqual(expect.arrayContaining(['deep-link', 'instacart']))
    expect(providers).not.toContain('instacart-official')
    expect(providers).not.toContain('kroger')
  })

  it('includes official and kroger when configured', async () => {
    process.env.INSTACART_CART_API_URL = 'https://api.instacart.test'
    process.env.KROGER_BASE_URL = 'https://kroger.test'
    const providers = await service.getAvailableProviders('house2')
    expect(providers).toEqual(
      expect.arrayContaining(['deep-link', 'instacart', 'instacart-official', 'kroger'])
    )
  })

  describe('generateLink behavior', () => {
    beforeEach(() => {
      vi.mocked(getItems).mockResolvedValue([{ name: 'Eggs' }])
      vi.mocked(getList).mockResolvedValue({ householdId: 'hid' })
    })

    it('returns deep link by default', async () => {
      const link = await service.generateLink('list1', 'user1')
      expect(link.provider).toBe('instacart')
      expect(link.url).toContain('instacart.com')
    })

    it('falls back when unsupported provider requested', async () => {
      const link = await service.generateLink('list1', 'user1', 'kroger')
      expect(link.provider).toBe('instacart')
    })

    it('returns sponsored items when using official instacart link', async () => {
      process.env.INSTACART_CART_API_URL = 'https://api.instacart.test'
      const link = await service.generateLink('list1', 'user1', 'instacart-official')
      expect(link.provider).toBe('instacart-official')
      expect(link.sponsoredItems).toBeInstanceOf(Array)
      expect(link.url).toContain('api.instacart.test')
    })
  })
})
