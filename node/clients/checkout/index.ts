import type {
  IOContext,
  InstanceOptions,
  Serializable,
  GraphQLResponse,
} from '@vtex/api'
import { AppGraphQLClient } from '@vtex/api'
import { ItemInput } from 'vtex.checkout-graphql'

import {
  GET_ORDERFORM_ITEMS_QUERY,
  GET_ORDERFORM_QUERY,
  UPDATE_CART_MUTATION,
} from './queries'

class CustomGraphQLError extends Error {
  public graphQLErrors: any

  constructor(message: string, graphQLErrors: any[]) {
    super(message)
    this.graphQLErrors = graphQLErrors
  }
}

function throwOnGraphQLErrors<T extends Serializable>(message: string) {
  return function maybeGraphQLResponse(response: GraphQLResponse<T>) {
    if (response && response.errors && response.errors.length > 0) {
      throw new CustomGraphQLError(message, response.errors)
    }

    return response
  }
}

export default class CheckoutIO extends AppGraphQLClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('vtex.checkout-graphql@0.x', context, {
      ...options,
      headers: {
        ...options?.headers,
      },
    })
  }

  /**
   * Gets only the Items associated to a given shopping cart
   *
   * @func getOrderFormItems
   * @public
   * @param {string} orderFormId OrderForm ID
   * @return {PartialItem[]} List of partial Items
   */
  public getOrderFormItems = async (
    orderFormId: string
  ): Promise<PartialItem[]> => {
    const partialItems = await this.graphql
      .query<PartialOrderFormItems, { orderFormId: string }>(
        {
          query: GET_ORDERFORM_ITEMS_QUERY,
          variables: {
            orderFormId,
          },
        },
        {
          metric: 'checkout-orderform',
        }
      )
      .then(
        throwOnGraphQLErrors(
          'Error getting items data from vtex.checkout-graphql'
        )
      )
      .then((query) => {
        return query.data!.orderForm.items
      })

    return partialItems
  }

  /**
   * Gets all Items plus extra data associated to a given shopping cart
   *
   * @func getOrderForm
   * @public
   * @param {string} orderFormId OrderForm ID
   * @return {PartialOrderForm} New partial OrderForm
   */
  public getOrderForm = async (
    orderFormId: string
  ): Promise<PartialOrderForm> => {
    const partialOrderForm = await this.graphql
      .query<any, { orderFormId: string }>(
        {
          query: GET_ORDERFORM_QUERY,
          variables: {
            orderFormId,
          },
        },
        {
          metric: 'checkout-orderform',
        }
      )
      .then(
        throwOnGraphQLErrors('Error getting data from vtex.checkout-graphql')
      )
      .then((query) => {
        return query.data!.orderForm
      })

    return partialOrderForm
  }

  /**
   * @func updateCart
   * @public
   * @param {string} orderFormId OrderForm ID
   * @param {ItemInput[]} items Input list of Items
   * @return {PartialOrderForm} New partial OrderForm
   */
  public updateCart = async (
    orderFormId: string,
    items: ItemInput[]
  ): Promise<PartialOrderForm> => {
    const partialOrderForm = await this.graphql
      .mutate<any, { orderFormId: string; items: ItemInput[] }>(
        {
          mutate: UPDATE_CART_MUTATION,
          variables: {
            orderFormId,
            items,
          },
        },
        {
          metric: 'checkout-update-items',
        }
      )
      .then(
        throwOnGraphQLErrors('Error updating items with vtex.checkout-graphql')
      )
      .then((query) => {
        return query.data!.orderForm
      })

    return partialOrderForm
  }
}