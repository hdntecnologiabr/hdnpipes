const condition = require('./condition')

describe('condition function', () => {
  it('quando a condição for verdadeira deve retonar a execução da função isTrue', async () => {
    const cond = condition({
      condition: ctx => ctx.a + ctx.b === 3,
      isTrue: ctx => 'Verdadeiro',
      isFalse: ctx => 'Falso'
    })
    expect(await cond({ a: 1, b: 2 })).toBe('Verdadeiro')
  })

  it('quando a condição for falsa deve retonar a execução da função isFalse', async () => {
    const cond = condition({
      condition: ctx => ctx.a + ctx.b === 3,
      isTrue: ctx => 'Verdadeiro',
      isFalse: ctx => 'Falso'
    })
    expect(await cond({ a: 2, b: 2 })).toBe('Falso')
  })

  it('quando a condição não for informada deve retonar a execução da função isTrue', async () => {
    const cond = condition({
      isTrue: ctx => 'Verdadeiro',
      isFalse: ctx => 'Falso'
    })
    expect(await cond({ a: 2, b: 2 })).toBe('Verdadeiro')
  })

  it('quando a função isTrue não for informada deve retonar o contexto informado no input', async () => {
    const cond = condition({
      isFalse: ctx => 'Falso'
    })
    expect(await cond({ a: 2, b: 2 })).toEqual({ a: 2, b: 2 })
  })

  it('quando a função isFalse não for informada e a condição for falsa deve retonar o contexto informado no input', async () => {
    const cond = condition({
      condition: ctx => false
    })
    expect(await cond({ a: 2, b: 2 })).toEqual({ a: 2, b: 2 })
  })
})
