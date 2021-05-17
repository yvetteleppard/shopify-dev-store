// Import dependencies
import { bind } from 'decko'

import ImageLazyLoader from './components/image-lazy-loader'
import VideoLazyLoader from './components/video-lazy-loader'
import Animator from './components/animator'
import GiftCard from './components/gift-card'
import ProductRecommendations from './components/product-recommendations'
import Form from './components/form'
import Login from './templates/customers/login'
import Addresses from './templates/customers/addresses'
import Product from './components/product'
import QuantityIncrementor from './components/quantity-incrementor'
import MiniCart from './components/mini-cart'
import ProductSlideshow from './components/product-slideshow'
import Cart from './components/cart'
import Instagram from './components/instagram'
import CurrencySwitcher from './components/currency-switcher'

class Theme {

  /**
   * An object for storing application components
   *
   * @type {object}
   */
   components = {}

   /**
    * Create the application instance
    */
   constructor() {

     this.registerComponents()
     this.registerCSSOnLoadEvent()

   }

   /**
    * Register an onload event for CSS stylesheets (both sync and async)
    */
    registerCSSOnLoadEvent() {
     const stylesheets = document.styleSheets
     const promises = Array.from(stylesheets).map(stylesheet => {
       return new Promise((resolve, reject) => {
         // Stylesheets embedded in style tags will not have a href, and will never
         // fire the load event
         if (stylesheet.href === null) {
           return resolve(stylesheet)
         }

         // Stylesheets from third-party domains cannot be parsed due to CORS restrictions
         const url = new URL(stylesheet.href)
         if (url.host !== window.location.host) {
           return resolve(stylesheet)
         }

         // Add an event listener for the load of event on the stylesheet's link
         if (stylesheet.ownerNode) {
           stylesheet.ownerNode.addEventListener('load', e => {
             resolve(stylesheet)
           })
         }

         try {
           // See if CSS Rules already exist within the stylesheet.
           // If they do, the stylesheet is already loaded and parsed, and we don't
           // need to rely on the load event
           if (stylesheet.cssRules && stylesheet.cssRules.length > 0) {
             return resolve(stylesheet)
           }
         } catch (err) {
           // InvalidAccessError is thrown if CSS has not yet finished parsing
           // If this is the case, we let the error slide and add the event listener,
           // but rethrow any other errors to catch legitimate bugs
           if (err.name !== 'InvalidAccessError') {
             throw err
           }
         }
       })
     })

     Promise.all(promises)
       .then(() => {
         let evt

         if (typeof Event === 'function') {
           evt = new Event('css:load')
         } else {
           evt = document.createEvent('Event')
           evt.initEvent('css:load', true, true)
         }

         document.dispatchEvent(evt)
       })
   }

  /**
   * Register individual application components here
   */
  registerComponents() {
    this.components.imageLazyLoader = new ImageLazyLoader('img[data-lazy-load-src], img[data-lazy-load-srcset], picture source[data-lazy-load-srcset]')
    this.components.videoLazyLoader = new VideoLazyLoader('video[data-lazy-load-src]')
    this.components.animator = new Animator('.animate-on-scroll')
    this.components.giftCard = new GiftCard()
    this.components.productRecommendations = new ProductRecommendations()
    this.components.form = new Form()
    this.components.login = new Login()
    this.components.addresses = new Addresses()
    this.components.product = new Product()
    this.components.quantityIncrementor = new QuantityIncrementor()
    this.components.miniCart = new MiniCart()
    this.components.productSlideshow = new ProductSlideshow()
    this.components.cart = new Cart()
    this.components.instagram = new Instagram()
    this.components.currencySwitcher = new CurrencySwitcher()

  }

}

window.app = new Theme();
