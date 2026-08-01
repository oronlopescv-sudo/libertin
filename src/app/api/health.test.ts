import { POST } from './route'
import { NextRequest } from 'next/server'

describe('API Route Tests', () => {
  it('should handle requests', async () => {
    const request = new NextRequest('http://localhost/api/test', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    
    const response = await POST(request)
    expect(response.status).toBeLessThan(500)
  })
})
