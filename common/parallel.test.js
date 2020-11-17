const parallel = require('./parallel')

describe('parallel function', () => {
  it('deve executar as funções paralelamente e retornar o resultado', async () => {
    const parallelFunction = parallel({
      functions: _ => [
        async () => await new Promise(resolve => resolve('a')),
        async () => await new Promise(resolve => resolve('b'))
      ],
      success: (result, ctx) => result
    })
    expect(await parallelFunction()).toEqual(['a', 'b'])
  })

  it('deve executar com os parâmetros default', async () => {
    const parallelFunction = parallel({})
    expect(await parallelFunction()).toEqual({ ctx: undefined, result: [] })
  })

  it('deve lançar uma exception caso venha a ocorrer um erro', async () => {
    const parallelFunction = parallel({
      functions: _ => [
        () => new Promise((resolve, reject) => reject(new Error('error')))
      ]
    })

    try {
      await parallelFunction()
    } catch (err) {
      expect(err.message).toBe('error')
    }
  })
})
