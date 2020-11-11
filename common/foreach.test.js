const foreach = require('./foreach')

describe('foreach function', () => {
  it('deve iterar sobre a lista de itens retonardos na função collection', async () => {
    const ctx = {
      itens: ['sideeffect 1', 'sideeffect 2', 'sideeffect 3']
    }
    const f = foreach({
      collection: ctx => ctx.itens,
      exec: (item, index) => expect(item).toBe(ctx.itens[index])
    })
    await f(ctx)
  })

  it('sempre deve retonar o contexto caso não ocorrer erro', async () => {
    const ctx = {
      itens: ['sideeffect 1', 'sideeffect 2', 'sideeffect 3']
    }
    const f = foreach({})
    expect(await f(ctx)).toEqual(ctx)
  })

  it('deve iterar a collection com o exec padrão', async () => {
    const ctx = {
      itens: ['sideeffect 1', 'sideeffect 2', 'sideeffect 3']
    }
    const f = foreach({
      collection: ctx => ctx.itens
    })
    expect(await f(ctx)).toEqual(ctx)
  })

  it('deve passar como parametro o erro e o contexto para função fail quando acontecer erro', async () => {
    const f = foreach({
      fail: (err, ctx) => {
        expect(err.message).toBe('error')
        expect(ctx).toBe(ctx)
      },
      collection: ctx => {
        throw new Error('error')
      }
    })
    try {
      await f()
    } catch (err) {
      expect(err.message).toBe('error')
    }
  })

  it('deve estourar exceção quando ocorrer erro e a função fail não for definida', async () => {
    const f = foreach({
      collection: ctx => {
        throw new Error('error')
      }
    })
    try {
      await f()
    } catch (err) {
      expect(err.message).toBe('error')
    }
  })
})
