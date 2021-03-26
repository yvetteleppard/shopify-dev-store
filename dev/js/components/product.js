import { bind } from 'decko'
import { getUrlWithVariant, ProductForm } from '@shopify/theme-product-form'
import { formatMoney } from '@shopify/theme-currency'

export default class Product {

  productContainer = document.querySelector('.product')

  classes = {
    hide: 'hide'
  };

  selectors = {
    submitButton: '[data-submit-button]',
    submitButtonText: '[data-submit-button-text]',
    comparePrice: '[data-compare-price]',
    comparePriceText: '[data-compare-text]',
    priceWrapper: '[data-price-wrapper]',
    productForm: '[data-product-form]',
    productPrice: '[data-product-price]',
    variantSelector: '[data-product-select]'
  };

  constructor () {
    if (!this.productContainer) {
      return
    }

    this.registerListeners()
  }

  @bind
  async registerListeners () {

    const productFormElement = this.productContainer.querySelector(this.selectors.productForm)

    this.product = await this.getProductJson(productFormElement.dataset.productHandle)

    this.variantSelectorValue = this.productContainer.querySelector(this.selectors.variantSelector).value

    this.productForm = new ProductForm(productFormElement, this.product, {
      onOptionChange: this.onFormOptionChange.bind(this)
    })

    this.product.variants.forEach((variant, i) => {
      if(parseInt(variant.id) === parseInt(this.variantSelectorValue)){
        this.currentVariant = this.product.variants[i]
      }
    })

  }

  @bind
  getProductJson (handle) {
    return fetch(`/products/${handle}.js`).then(response => {
      return response.json()
    })
  }

  @bind
  onFormOptionChange (e) {
    const variant = e.dataset.variant

    this.renderPrice(variant)
    this.renderComparePrice(variant)
    this.renderSubmitButton(variant)

    this.updateSelectedVariant(variant)
    this.updateBrowserHistory(variant)
  }

  @bind
  renderPrice (variant) {
    const priceElement = this.productContainer.querySelector(this.selectors.productPrice)
    const priceWrapperElement = this.productContainer.querySelector(
      this.selectors.priceWrapper
    )

    priceWrapperElement.classList.toggle(this.classes.hide, !variant)

    if (variant) {
      priceElement.innerText = formatMoney(variant.price, window.theme.moneyFormat)
    }
  }

  @bind
  renderComparePrice (variant) {
    if (!variant) {
      return
    }

    const comparePriceElement = this.productContainer.querySelector(
      this.selectors.comparePrice
    )
    const compareTextElement = this.productContainer.querySelector(
      this.selectors.comparePriceText
    )

    if (!comparePriceElement || !compareTextElement) {
      return
    }

    if (variant.compare_at_price > variant.price) {
      comparePriceElement.innerText = formatMoney(
        variant.compare_at_price,
        window.theme.moneyFormat
      )
      compareTextElement.classList.remove(this.classes.hide)
      comparePriceElement.classList.remove(this.classes.hide)
    } else {
      comparePriceElement.innerText = ''
      compareTextElement.classList.add(this.classes.hide)
      comparePriceElement.classList.add(this.classes.hide)
    }
  }

  @bind
  renderSubmitButton (variant) {
    const submitButton = this.productContainer.querySelector(this.selectors.submitButton)
    const submitButtonText = this.productContainer.querySelector(
      this.selectors.submitButtonText
    )

    if (!variant) {
      submitButton.disabled = true
      submitButtonText.innerText = window.theme.strings.unavailable
    } else if (variant.available) {
      submitButton.disabled = false
      submitButtonText.innerText = window.theme.strings.addToCart
    } else {
      submitButton.disabled = true
      submitButtonText.innerText = window.theme.strings.soldOut
    }
  }

  @bind
  updateSelectedVariant (variant) {
    const selector = this.productContainer.querySelector(this.selectors.variantSelector)

    selector.value = variant.id
  }

  @bind
  updateBrowserHistory (variant) {
    const enableHistoryState = this.productForm.element.dataset
      .enableHistoryState

    if (!variant || enableHistoryState !== 'true') {
      return
    }

    const url = getUrlWithVariant(window.location.href, variant.id)
    window.history.replaceState({ path: url }, '', url)
  }


}

