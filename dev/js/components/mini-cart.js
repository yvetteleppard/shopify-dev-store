import { bind } from 'decko'
import * as currency from '@shopify/theme-currency'
import Slugify from 'slugify'

export default class MiniCart {

  miniCart = document.querySelector('.mini-cart')

  cartCount = document.querySelector('.main-header-actions__cart-count')

  constructor () {
    document.addEventListener('css:load', e => {
      this.registerListeners()
    })
  }

  @bind
  registerListeners() {
    if(!this.miniCart){
      return
    }

    this.miniCartInner = this.miniCart.querySelector('.mini-cart__inner')
    this.miniCartError = this.miniCart.querySelector('.mini-cart__error')
    this.miniCartClose = this.miniCart.querySelector('.mini-cart__header-close')

    this.miniCart.addEventListener('click', this.closeMiniCart)
    this.miniCartClose.addEventListener('click', e => {
      e.stopPropagation()
      this.closeMiniCart()
    } )

    this.miniCartInner.addEventListener('click', e => {
      e.stopPropagation()
    })

    setTimeout(() => {
      // It may sound silly, but i'm almost certain this specific function has been breaking other JS due to performance issues.
      // Due to that, I've delayed it by 3 seconds with the assumption that no user is maniclly opening the mini cart. And worst case scenario is, it builds out in front of them anyways.
      this.reloadMiniCart(false)
    }, 3000)

    this.setupAddToCartForms()

  }

  @bind
  setupAddToCartForms(){

    this.addToCartForms = document.querySelectorAll('form[action="/cart/add"]')

    if (this.addToCartForms.length > 0) {
      this.addToCartForms.forEach(form => {
        form.addEventListener('submit', this.addToCart)
      })
    }
  }

  @bind
  toggleMiniCart(){
    if(this.miniCart.classList.contains('mini-cart--active')){
      this.closeMiniCart()
    } else {
      this.openMiniCart()
    }
  }

  @bind
  openMiniCart(){
    this.miniCart.classList.add('mini-cart--active')
  }

  @bind
  closeMiniCart(){
    this.miniCart.classList.remove('mini-cart--active')
  }

  @bind
  addToCart(e){
    e.preventDefault()

    const t = e.currentTarget
    const btn = t.querySelector('button[data-submit-button')
    const formData = new FormData(t);
    const showCart = true


    this.loadingButton(btn)

    fetch('/cart/add.js', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      this.reloadMiniCart(showCart)

      setTimeout(e => {
        this.activateButton(btn)
      }, 3000)

      return response.json();
    })
    .catch((error) => {
      this.activateButton(btn)
      this.toggleMiniCartError(true, error)
    });
  }

  @bind
  reloadMiniCart(showCart = false){
    fetch('/cart.js', {
      method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
      const items = data.items
      const itemCount = data.item_count
      const totalPrice = data.total_price

      this.buildCart(items, itemCount, totalPrice)

      if (document.body.classList.contains('template-cart')) {
        window.app.components.cart.reloadCart(items, itemCount, totalPrice)
      }

      if(showCart){
        this.openMiniCart()
      }
    }).catch((error) => {
      this.toggleMiniCartError(true, error)
    });
  }

  @bind
  buildCart(items, itemCount, totalPrice){
    let miniCartItems = ''

    if (items.length > 0) {
      this.miniCart.classList.remove('mini-cart--empty')
      miniCartItems = items.map(this.miniCartProduct)
      miniCartItems = miniCartItems.join('')
      this.cartCount.classList.add('main-header-actions__cart-count--active')
    } else {
      this.miniCart.classList.add('mini-cart--empty')
      this.cartCount.classList.remove('main-header-actions__cart-count--active')
    }

    this.cartCount.querySelector('span').innerHTML = itemCount > 99 ? '99+' : itemCount
    this.miniCart.querySelector('.mini-cart-items').innerHTML = miniCartItems
    const buttonTotalLabels = this.miniCart.querySelectorAll('.mini-cart__footer-checkout .button__label span')
    buttonTotalLabels.forEach(label => {
      label.innerHTML = this.formatPrice(totalPrice)
    })

    this.setupMiniCartRemoves()
    this.toggleMiniCartError(false)
  }

  @bind
  miniCartProduct (item, i) {

    const variantOption = Slugify(item.options_with_values[0].name, { lower: true })
    const variantValue = Slugify(item.variant_options[0], { lower: true })

    return `<div class="mini-cart-items__item mini-cart-item">
              <a href="${item.url}" title="${item.product_title}" class="mini-cart-item__image objFit">
                <figure  class="mini-cart-item__image-wrap">
                  ${item.image ? `<img class="mini-cart-item__image-img" src="${item.image}" sizes="7em" alt="${item.product_title}">` : ''}
                </figure>
              </a>
              <div class="mini-cart-item__info">
                <a href="${item.url}" class="mini-cart-item__info-title">${item.product_title}</a>
                ${item.variant_title ? `<div class="mini-cart-item__info-variant"><span class="${ variantOption } ${ variantOption }--${ variantValue }">${ variantOption }:</span>${item.variant_title}</div>` : ''}
                ${item.selling_plan_allocation ? `<div class="mini-cart-item__info-plan">${item.selling_plan_allocation.selling_plan.name}</div>` : ''}
                <div class="mini-cart-item__info-price">${this.formatPrice(item.price)}</div>
                <div class="quantity-incrementor mini-cart-item__info-quantity" data-variant-id="${item.variant_id}">
                  <label for="Quantity" class="quantity-incrementor__label screenreader-text">${window.theme.strings.quantity}:</label>
                  <button class="quantity-incrementor__minus" type="button"><span class="screenreader-text">${window.theme.strings.incrementorMinus}</span></button>
                  <input class="quantity-incrementor__input" type="number" id="updates_${item.key}" name="updates[]" value="${item.quantity}" min="0" aria-label="${window.theme.strings.itemQuantity}">
                  <button class="quantity-incrementor__plus" type="button"><span class="screenreader-text">${window.theme.strings.incrementorPlus}</span></button>
                </div>
                <a href="/cart/change?line=${i + 1}&amp;quantity=0" class="mini-cart-item__info-clear">
                  <span class="screenreader-text">Remove</span>
                  <div class="mini-cart-item__info-clear-icon"></div>
                  <img src="${window.theme.loadingSvgUrl}" alt="">
                </a>
              </div>
            </div>`
  }

  @bind
  formatPrice (price) {
    return currency.formatMoney(price, window.theme.moneyFormat)
  }

  @bind
  deleteLineItem (e, incrementor) {

    let el
    let postUrl

    if(incrementor){
      if (document.body.classList.contains('template-cart')) {
        el = incrementor.parentNode.parentNode.querySelector('.cart-remove')
      } else {
        el = incrementor.parentNode.querySelector('.mini-cart-item__info-clear')
      }

      postUrl = el.href

    } else {

      e.stopPropagation()
      e.preventDefault()
      const eTarget = e.currentTarget || e.target
      postUrl = e.currentTarget.href
      el = eTarget.parentNode

    }

    fetch(postUrl,{
      method: 'POST',
    })
    .then(response => {
      this.reloadMiniCart()
      return response.json();
    })
    .catch((error) => {
      this.toggleMiniCartError(false, error)
    });

  }

  @bind
  updateCart(variantId, newQuantity){

    if(variantId && newQuantity){

      const data = {
        updates: {}
      }

      data.updates[variantId] = newQuantity

      fetch('/cart/update.js', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })
      .then(response => {
        this.reloadMiniCart()
        return response.json();
      })
      .catch((error) => {
        this.toggleMiniCartError(true, error)
      });

    } else {
      this.toggleMiniCartError(true, error)
    }

  }

  @bind
  setupMiniCartRemoves () {
    const links = this.miniCart.querySelectorAll('.mini-cart-item__info-clear')

    if (links.length > 0) {
      links.forEach(link => {
        link.addEventListener('click', this.deleteLineItem)
      })
    }
  }

  @bind
  toggleMiniCartError (error, errorMessage = '') {

    const message = window.theme.strings.miniCartError

    if (error) {
      console.error('Error:', errorMessage);
      this.miniCartError.classList.add('mini-cart__error--active')
      this.miniCartError.innerHTML = message
    } else {
      this.miniCartError.classList.remove('mini-cart__error--active')
      this.miniCartError.innerHTML = ''
    }
  }

  @bind
  loadingButton (btn) {
    btn.setAttribute('disabled', 'disabled')
    btn.classList.add('loading')
    btn.querySelector('span').innerHTML = window.theme.strings.addingToBasket
  }

  @bind
  activateButton (btn) {
    btn.removeAttribute('disabled')
    btn.classList.remove('loading')
    btn.querySelector('span').innerHTML = window.theme.strings.addToCart
  }

}