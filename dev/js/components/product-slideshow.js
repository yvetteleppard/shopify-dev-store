import { bind } from 'decko'
import MagicRoundabout from 'magic-roundabout'

export default class ProductSlideshow {

  productSlideshowContainer = document.querySelector('.product-slideshow-container')

  constructor () {
    this.registerListeners()
  }

  @bind
  registerListeners() {

    if(!this.productSlideshowContainer){
      return
    }

    this.setupProductSlideshow()

  }

  @bind
  setupProductSlideshow(){

    const productSlideshow = this.productSlideshowContainer.querySelector('.slideshow')

    const slideshow = new MagicRoundabout(productSlideshow, {
      auto: false,
      buttons: true,
      click: true,
      keys: true,
      loop: true,
      touch: true,
      onChange: this.updatePagination
    })

    this.slideshow = slideshow

    const thumbs = this.productSlideshowContainer.querySelectorAll('.product-thumbnails__item')

    thumbs.forEach(thumb => {
      thumb.addEventListener('click', e => {
        slideshow.current = thumb.dataset.slide

      })
    });

  }

  @bind
  updatePagination(slideshow) {
    const thumbs = this.productSlideshowContainer.querySelectorAll('.product-thumbnails__item')

    thumbs.forEach(thumb => {
      thumb.classList.remove('product-thumbnails__item--active')
      if (parseInt(thumb.dataset.slide) === slideshow.current) {
        thumb.classList.add('product-thumbnails__item--active')
      }
    })

  }

}
