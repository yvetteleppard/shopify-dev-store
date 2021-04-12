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
  }

}

window.app = new Theme();
