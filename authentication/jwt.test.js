const { encode, decode } = require('./jwt')

describe('jwt functions', () => {
  it('quando codificado um payload ao decodificar o mesmo deve ser retornado', async () => {
    const mockCtx = { a: 'a', b: 'b' }

    const jwtEncode = encode({
      payload: ctx => ({ a: ctx.a, b: ctx.b }),
      hoursToExpire: () => 4,
      secret: () => 'abc',
      success: (token, ctx) => ({ token, ctx }),
      fail: err => ({ jwtEncodeError: err.message })
    })

    const { token, jwtEncodeError } = await jwtEncode(mockCtx)
    expect(jwtEncodeError).toBe(undefined)

    const jwtDecode = decode({
      token: () => token,
      secret: () => 'abc',
      success: (payload, ctx) => ({ payload, ctx }),
      fail: err => ({ jwtDecodeError: err.message })
    })

    const { payload, jwtDecodeError } = await jwtDecode(mockCtx)
    expect(jwtDecodeError).toBe(undefined)

    expect(payload).toEqual({ a: 'a', b: 'b', expirationTimestamp: payload.expirationTimestamp })
  })

  it('quando não especificado nenhum parametro deve codificar com os parametros default', async () => {
    const mockCtx = {}

    const jwtEncode = encode({
      fail: err => ({ jwtEncodeError: err.message })
    })

    const { token, jwtEncodeError } = await jwtEncode(mockCtx)
    expect(jwtEncodeError).toBe(undefined)

    const jwtDecode = decode({
      token: () => token,
      fail: err => ({ jwtDecodeError: err.message })
    })

    const { payload, jwtDecodeError } = await jwtDecode(mockCtx)
    expect(jwtDecodeError).toBe(undefined)

    expect(payload).toEqual({ expirationTimestamp: payload.expirationTimestamp })
  })

  it('quando ocorrer uma exception a função encode deve retornar o erro', async () => {
    const jwtEncode = encode({
      success: () => {
        throw new Error('error')
      }
    })

    try {
      await jwtEncode()
    } catch (err) {
      expect(err.message).toBe('error')
    }
  })

  it('quando ocorrer uma exception a função decode deve retornar o erro', async () => {
    const jwtEncode = encode({
      fail: err => ({ jwtEncodeError: err.message })
    })

    const { token, jwtEncodeError } = await jwtEncode({})
    expect(jwtEncodeError).toBe(undefined)

    const jwtDecode = decode({
      token: () => token,
      success: () => {
        throw new Error('error')
      }
    })

    try {
      await jwtDecode()
    } catch (err) {
      expect(err.message).toBe('error')
    }
  })

  it('quando o token não for providenciado a função decode deve retornar o erro "No token supplied"', async () => {
    const jwtDecode = decode({})

    try {
      await jwtDecode()
    } catch (err) {
      expect(err.message).toBe('No token supplied')
    }
  })

  it('quando o token tiver expirado a função decode deve retornar o erro "EXPIRED_TOKEN"', async () => {
    const jwtEncode = encode({
      hoursToExpire: () => 8 / 60 / 60 / 1000
    })

    const { token } = await jwtEncode({})

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const jwtDecode = decode({
      token: () => token
    })

    try {
      await jwtDecode()
    } catch (err) {
      expect(err.message).toBe('EXPIRED_TOKEN')
    }
  })
})
