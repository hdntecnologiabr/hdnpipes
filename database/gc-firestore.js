const { Firestore, FieldPath, FieldValue, Timestamp } = require('@google-cloud/firestore')

let firestoreClient

/**
 * @returns {Firestore}
 */

const getFirestore = () => {
  if (!firestoreClient) {
    firestoreClient = new Firestore({ host: process.env.DATABASE_GCFIRESTORE_HOST })
  }
  return firestoreClient
}

const defaultCollectionFn = ctx => ''

const defaultFailFn = (err, ctx) => {
  throw err
}

const defaultDataFn = ctx => ({})

const defaultSuccessFn = (result, ctx) => ({ result, ctx })

const defaultTransactionFn = ctx => null

const defaultDocFn = ctx => ''

const defaultOffset = ctx => undefined

const defaultLimit = ctx => undefined

const defaultOrderBy = ctx => undefined

const convertFirestoreTimestampToJavascriptDate = FirestoreTimestamp =>
  new Timestamp(FirestoreTimestamp.seconds, FirestoreTimestamp.nanoseconds).toDate()

module.exports.convertFirestoreTimestampToJavascriptDate = convertFirestoreTimestampToJavascriptDate

module.exports.clearFirestoreClient = () => {
  firestoreClient = undefined
}

module.exports.FieldPath = FieldPath

module.exports.FieldValue = FieldValue

module.exports.add = ({
  collection = defaultCollectionFn,
  data = defaultDataFn,
  success = defaultSuccessFn,
  fail = defaultFailFn,
  transaction = defaultTransactionFn
}) => async ctx => {
  try {
    const firestore = getFirestore()
    const _collection = await collection(ctx)
    const _data = { ...(await data(ctx)), createdAt: Timestamp.now(), updatedAt: Timestamp.now() }
    const _transaction = await transaction(ctx)
    const docRef = firestore.collection(_collection).doc()
    const result = _transaction ? await _transaction.set(docRef, _data) : await docRef.set(_data)
    return success(result, ctx)
  } catch (err) {
    return fail(err, ctx)
  }
}

module.exports.set = ({
  collection = defaultCollectionFn,
  doc = defaultDocFn,
  data = defaultDataFn,
  success = defaultSuccessFn,
  fail = defaultFailFn,
  transaction = defaultTransactionFn
}) => async ctx => {
  try {
    const firestore = getFirestore()
    const _collection = await collection(ctx)
    const _doc = await doc(ctx)
    const _data = { ...(await data(ctx)), updatedAt: Timestamp.now() }
    const _transaction = await transaction(ctx)
    const docRef = firestore.collection(_collection).doc(_doc)
    const result = _transaction ? await _transaction.set(docRef, _data, { merge: true }) : await docRef.set(_data, { merge: true })
    return success(result, ctx)
  } catch (err) {
    return fail(err, ctx)
  }
}

module.exports.get = ({
  collection = defaultCollectionFn,
  doc = defaultDocFn,
  success = defaultSuccessFn,
  fail = defaultFailFn,
  transaction = defaultTransactionFn
}) => async ctx => {
  try {
    const firestore = getFirestore()
    const _collection = await collection(ctx)
    const _doc = await doc(ctx)
    const _transaction = await transaction(ctx)
    const docRef = firestore.doc(`${_collection}/${_doc}`)
    const result = _transaction ? (await _transaction.get(docRef)).data() : (await docRef.get()).data()
    return success(result, ctx)
  } catch (err) {
    return fail(err, ctx)
  }
}

module.exports.find = ({
  collection = defaultCollectionFn,
  where = ctx => [],
  success = defaultSuccessFn,
  fail = defaultFailFn,
  transaction = defaultTransactionFn,
  offset = defaultOffset,
  limit = defaultLimit,
  orderBy = defaultOrderBy
}) => async ctx => {
  try {
    const firestore = getFirestore()

    const _collection = await collection(ctx)
    const _where = await where(ctx)
    const _offset = await offset(ctx)
    const _limit = await limit(ctx)
    const _orderBy = await orderBy(ctx)

    let query = firestore.collection(_collection)

    _where.forEach(w => {
      query = query.where(w[0], w[1], w[2])
    })

    if (_orderBy) query = query.orderBy(_orderBy)
    if (_offset) query = query.offset(_offset)
    if (_limit) query = query.limit(_limit)

    const _transaction = await transaction(ctx)

    const result = _transaction ? (await _transaction.get(query)).docs : (await query.get()).docs

    const treatedResult = result.map(item => ({
      ...item.data(),
      id: item.id,
      createdAt: convertFirestoreTimestampToJavascriptDate(item.data().createdAt),
      updatedAt: convertFirestoreTimestampToJavascriptDate(item.data().updatedAt)
    }))

    return success(treatedResult, ctx)
  } catch (err) {
    return fail(err, ctx)
  }
}

module.exports.delete = ({
  collection = defaultCollectionFn,
  doc = defaultDocFn,
  success = defaultSuccessFn,
  fail = defaultFailFn,
  transaction = defaultTransactionFn
}) => async ctx => {
  try {
    const firestore = getFirestore()
    const _collection = await collection(ctx)
    const _document = await doc(ctx)
    const _transaction = await transaction(ctx)
    const docRef = firestore.doc(`${_collection}/${_document}`)
    const result = _transaction ? await _transaction.delete(docRef) : await docRef.delete()
    return success(result, ctx)
  } catch (err) {
    return fail(err, ctx)
  }
}

module.exports.transaction = ({ functions = [], fail = defaultFailFn }) => async ctx => {
  try {
    const firestore = getFirestore()
    const resultCtx = await firestore.runTransaction(async transaction => {
      ctx.transaction = transaction
      let current = ctx
      for (const i in functions) {
        current = await functions[i](current)
      }
      return current
    })
    return resultCtx
  } catch (err) {
    return await fail(err, ctx)
  }
}
