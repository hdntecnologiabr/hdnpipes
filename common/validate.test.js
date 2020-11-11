const validate = require('./validate')

describe('validate function', () => {
  it('deve retornar o contexto caso a validação seja positiva', async () => {
    const v = validate({
      validation: ctx => ctx === 'contexto'
    })

    expect(await v('contexto')).toBe('contexto')
  })

  it('deve retornar valor da função fail caso validação for negativa', async () => {
    const v = validate({
      validation: ctx => ctx === 'contexo',
      fail: ctx => 'falhou'
    })

    expect(await v('outro contexto')).toBe('falhou')
  })

  it('deve retornar contexto caso função de validação não for informada', async () => {
    const v = validate({
      fail: ctx => 'falhou'
    })

    expect(await v('contexto')).toBe('contexto')
  })

  it('deve retornar contexto caso função fail não for informada', async () => {
    const v = validate({
      validation: ctx => ctx === 'contexo'
    })

    expect(await v('outro contexto')).toBe('outro contexto')
  })
})
