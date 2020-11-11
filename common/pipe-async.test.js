const pipeAsync = require('./pipe-async')

describe('pipeAsync function', () => {
  it('deve passar o resultado de uma função como parametro para a proxima', async () => {
    const one = ctx => ctx + 1
    const two = ctx => ctx + 2
    const p = pipeAsync({
      functions: [
        one,
        two
      ]
    })
    expect(await p(1)).toBe(4)
  })

  it('deve passar o erro e o contexto para a função fail quando ocorrer erro', async () => {
    const one = ctx => ctx + 1
    const two = ctx => { throw new Error('error') }
    const p = pipeAsync({
      fail: (err, ctx) => err.message,
      functions: [
        one,
        two
      ]
    })
    expect(await p(1)).toBe('error')
  })

  it('deve estourar exceção quando a função fail naõ for definida e ocorrer erro', async () => {
    const one = ctx => ctx + 1
    const two = ctx => { throw new Error('error') }
    const p = pipeAsync({
      functions: [
        one,
        two
      ]
    })
    try {
      await p(1)
    } catch (err) {
      expect(err.message).toBe('error')
    }
  })

  it('deve retornar o contexto quando as funções não forem informadas', async () => {
    const p = pipeAsync({})
    expect(await p(1)).toBe(1)
  })
})
