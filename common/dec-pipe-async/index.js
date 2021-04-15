module.exports = {
  pipe: () => {
    let _onError = (err, ctx) => { throw err }
    let _context = {}
    const _actions = []
    const self = {}

    self.add = (action) => {
      _actions.push(action)
      return self
    }

    self.error = (onError) => {
      _onError = onError
      return self
    }

    self.run = async (ctx) => {
      try {
        _context = ctx
        for (const i in _actions) {
          _context = await _actions[i](_context)
        }
        return _context
      } catch (err) {
        return await _onError(err, ctx)
      }
    }

    return self
  }
}
