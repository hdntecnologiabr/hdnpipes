const { pipe } = require('./index.js')

describe('descPipeAsync function', () => {
  it('deve passar o resultado de uma função como parametro para a proxima', async () => {
    const one = ctx => ctx + 1
    const two = ctx => ctx + 2
    const p = pipe()
      .add(one)
      .add(two)
    expect(await p.run(1)).toBe(4)
  })

  it('deve passar o erro e o contexto para a função error quando ocorrer erro', async () => {
    const one = ctx => ctx + 1
    const two = ctx => { throw new Error('error') }
    const p = pipe()
      .error((err, ctx) => err.message)
      .add(one)
      .add(two)
    expect(await p.run(1)).toBe('error')
  })

  it('deve estourar exceção quando a função error não for definida e ocorrer erro', async () => {
    const one = ctx => ctx + 1
    const two = ctx => { throw new Error('error') }
    const p = pipe()
      .add(one)
      .add(two)
    try {
      await p.run(1)
    } catch (err) {
      expect(err.message).toBe('error')
    }
  })

  it('deve retornar o contexto quando as funções não forem informadas', async () => {
    const p = pipe()
    expect(await p.run(1)).toBe(1)
  })
})
