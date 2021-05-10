import { bind } from 'decko'
import * as currency from '@shopify/theme-currency'

export default class Cart {

  cart = document.querySelector('.cart')

  /**
   *
   */
  constructor () {
    this.registerListeners()
  }

  @bind
  registerListeners () {
    if (!this.cart) {
      return
    }

    this.cartError = this.cart.querySelector('.cart__error')
    this.cartTotal = this.cart.querySelector('.cart-summary__total-price')
    this.cartRows = this.cart.querySelectorAll('.cart-table__product-row')

  }

  @bind
  reloadCart (items, itemCount, totalPrice) {

    items.forEach(item => {
      this.cartRows.forEach(cartRow => {
        if(parseInt(cartRow.dataset.product) === item.id){
          const rowTotal = cartRow.querySelector('span[data-cart-item-regular-price]')
          const finalPrice = cartRow.querySelector('span[data-cart-item-final-price]')
          const originalPrice = cartRow.querySelector('s[data-cart-item-original-price]')
          rowTotal.innerHTML = this.formatPrice(item.final_line_price)
          finalPrice.innerHTML = this.formatPrice(item.final_line_price)
          originalPrice.innerHTML = this.formatPrice(item.original_line_price)

        }
      })
    })

    this.cartTotal.innerHTML = this.formatPrice(totalPrice)

  }

  @bind
  formatPrice (price) {
    return currency.formatMoney(price, window.theme.moneyFormat)
  }

}
