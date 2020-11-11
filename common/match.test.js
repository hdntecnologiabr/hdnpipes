const match = require('./match')

describe('match function', () => {
  it('deve executar função correspondende ao matching', async () => {
    const a = ctx => ctx + ' fna'
    const b = ctx => ctx + ' fnb'
    const m = match({
      matchings: [
        [ctx => ctx === 'a', a],
        [ctx => ctx === 'b', b]
      ]
    })
    expect(await m('a')).toBe('a fna')
  })

  it('deve executar função default quando não ocorrer matching', async () => {
    const a = ctx => ctx + ' fna'
    const b = ctx => ctx + ' fnb'
    const m = match({
      defaultFn: ctx => 'default',
      matchings: [
        [ctx => ctx === 'a', a],
        [ctx => ctx === 'b', b]
      ]
    })
    expect(await m('c')).toBe('default')
  })

  it('deve passar como parametro o erro e o contexto para função fail quando acontecer erro', async () => {
    const a = ctx => ctx + ' fna'
    const b = ctx => ctx + ' fnb'
    const m = match({
      fail: (err, ctx) => err.message,
      defaultFn: ctx => { throw new Error('error') },
      matchings: [
        [ctx => ctx === 'a', a],
        [ctx => ctx === 'b', b]
      ]
    })
    expect(await m('c')).toBe('error')
  })

  it('deve estourar exceção quando ocorrer erro e a função fail não for definida', async () => {
    const a = ctx => ctx + ' fna'
    const b = ctx => ctx + ' fnb'
    const m = match({
      defaultFn: ctx => { throw new Error('error') },
      matchings: [
        [ctx => ctx === 'a', a],
        [ctx => ctx === 'b', b]
      ]
    })
    try {
      await m('c')
    } catch (err) {
      expect(err.message).toBe('error')
    }
  })

  it('quando a função default não for informada deve retornar o contexto', async () => {
    const a = ctx => ctx + ' fna'
    const b = ctx => ctx + ' fnb'
    const m = match({
      matchings: [
        [ctx => ctx === 'a', a],
        [ctx => ctx === 'b', b]
      ]
    })
    expect(await m('c')).toBe('c')
  })

  it('quando as funções de matching não forem definidas deve retonar o conexto', async () => {
    const m = match({})
    expect(await m('c')).toBe('c')
  })
})
