const map = require('./map')

describe('map function', () => {
  it('deve passar contexto como parametro para a função mapfn', async () => {
    const m = map(ctx => ctx + 2)
    expect(await m(2)).toBe(4)
  })
})
