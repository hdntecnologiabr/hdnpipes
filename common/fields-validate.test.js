const fieldsValidate = require('./fields-validate')

describe('fields-validate function', () => {
  it('deve retornar o contexto caso a validação seja positiva', async () => {
    const ctx = {
      name: 'Teste'
    }
    const validate = fieldsValidate({
      schema: ctx => ({ name: { type: 'string' } }),
      data: ctx => ctx
    })
    expect(await validate(ctx)).toEqual(ctx)
  })

  it('deve chamar função validationFail passando erros e contexto caso a validação seja negativa', async () => {
    const mockCtx = {
      name: 'Teste'
    }
    const validate = fieldsValidate({
      schema: ctx => ({ name: { type: 'number' } }),
      data: ctx => ctx,
      validationFail: (errors, ctx) => {
        expect(errors).toEqual([{ actual: 'Teste', field: 'name', message: "The 'name' field must be a number.", type: 'number' }])
        expect(ctx).toEqual(mockCtx)
      }
    })
    await validate(mockCtx)
  })

  it('deve chamar função fail passando erro e contexto caso ocorrer algum erro', async () => {
    const mockCtx = {
      name: 'Teste'
    }
    const validate = fieldsValidate({
      schema: ctx => ({ name: { type: 'number' } }),
      data: ctx => {
        throw new Error('test error')
      },
      fail: (err, ctx) => {
        expect(ctx).toEqual(mockCtx)
        throw err
      }
    })
    try {
      await validate(mockCtx)
    } catch (err) {
      expect(err.message).toBe('test error')
    }
  })

  it('deve lançar exceção quando função fail não for informada e ocorrer erro', async () => {
    const validate = fieldsValidate({
      schema: ctx => ({ name: { type: 'number' } }),
      data: ctx => {
        throw new Error('test error')
      }
    })
    try {
      await validate({})
    } catch (err) {
      expect(err.message).toBe('test error')
    }
  })

  it('função validationFail quando não informada deve retornar contexto contendo erros de validação', async () => {
    const mockCtx = {
      name: 'Teste'
    }
    const validate = fieldsValidate({
      schema: ctx => ({ name: { type: 'number' } }),
      data: ctx => ctx
    })
    expect(await validate(mockCtx)).toEqual({
      ctx: {
        name: 'Teste'
      },
      errors: [
        {
          actual: 'Teste',
          field: 'name',
          message: "The 'name' field must be a number.",
          type: 'number'
        }
      ]
    })
  })

  it('parametros default', async () => {
    const validate = fieldsValidate({})
    expect(await validate({})).toEqual({})
  })
})
