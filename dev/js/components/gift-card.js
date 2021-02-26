import { bind } from 'decko'
import QRCode from 'qrcode'

export default class GiftCard {
  selectors = {
    qrCodeCanvas: '[data-gift-card-qr]',
    printButton: '[data-gift-card-print]',
    giftCardCode: '[data-gift-card-digits]',
  }

  constructor () {
    this.registerListeners()
  }

  @bind
  registerListeners() {
    // This is the QR code that allows customers to use at a POS
    document.querySelectorAll(this.selectors.qrCodeCanvas).forEach((element) => {
      QRCode.toCanvas(element, element.dataset.identifier)
    })

    document.querySelectorAll(this.selectors.printButton).forEach((element) => {
      element.addEventListener('click', () => {
        window.print()
      })
    })

    // Auto-select gift card code on click, based on ID passed to the function
    document.querySelectorAll(this.selectors.giftCardCode).forEach((element) => {
      element.addEventListener('click', (evt) => {
        const selection = window.getSelection()
        const range = document.createRange()
        range.selectNodeContents(evt.target)
        selection.removeAllRanges()
        selection.addRange(range)
      })
    })
  }
}