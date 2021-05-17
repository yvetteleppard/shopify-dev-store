import { bind } from 'decko'
import LiveNodeList from 'live-node-list'

export default class QuantityIncrementor {
  incrementors = new LiveNodeList('.quantity-incrementor')

  constructor() {
    this.registerListeners()
  }

  @bind
  registerListeners() {

    this.incrementors.forEach(this.initIncrementor)

    this.incrementors.on('update', (newItems, oldItems) => {
      newItems.forEach(this.initIncrementor)
    })
  }

  @bind
  initIncrementor(incrementor) {

    const plus = incrementor.querySelector('.quantity-incrementor__plus')
    const minus = incrementor.querySelector('.quantity-incrementor__minus')
    const input = incrementor.querySelector('.quantity-incrementor__input')

    plus.addEventListener('click', e => {
      e.preventDefault()
      clearTimeout(this.timer)

      let value = parseInt(input.value, 10)
      value = isNaN(value) ? 1 : value
      value++
      input.value = value

      this.updateSiteCart(incrementor, value)
    })

    minus.addEventListener('click', e => {
      e.preventDefault()
      clearTimeout(this.timer)

      let value = parseInt(input.value, 10)
      if (value > 0) {
        value = isNaN(value) ? 1 : value
        value--
        input.value = value
      }

      this.updateSiteCart(incrementor, value)
    })

    input.addEventListener('keyup', e => {
      e.preventDefault()
      clearTimeout(this.timer)

      let value = parseInt(input.value, 10)

      if (value <= 1) {
        input.value = 0
      } else if (value > 999) {
        value = 999
        input.value = 999
      }

      this.updateSiteCart(incrementor, value)
    })
  }

  @bind
  updateSiteCart(incrementor, value) {
    if (incrementor.dataset.variantId) {
      this.timer = setTimeout(e => {
        if (value === 0) {
          window.app.components.miniCart.deleteLineItem(null, incrementor)
        } else {
          window.app.components.miniCart.updateCart(incrementor.dataset.variantId, value)
        }
      }, 500)
    }
  }
}
