export const getXCart = async (
  _: unknown,
  { userId }: { userId: string },
  ctx: Context
) => {
  let orderformId

  try {
    // eslint-disable-next-line no-console
    console.log('-----------------NODE DEBUG-----------------------')

    orderformId = await ctx.clients.vbase.getJSON<{
      orderformId: string | null
    }>('vtex.cross-device-cart', userId, true)

    // eslint-disable-next-line no-console
    console.log(orderformId)

    return orderformId
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('----------------------------------------', err)

    const status = (err as any)?.response?.status

    if (status === 404) {
      return null
    }

    throw err
  }
}
