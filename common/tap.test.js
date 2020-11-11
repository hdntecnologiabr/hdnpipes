const tap = require('./tap')

describe('tap function', () => {
  it('sempre deve retornar contexto', async () => {
    const t = tap(ctx => ctx)
    expect(await t('contexto')).toBe('contexto')
  })
})
