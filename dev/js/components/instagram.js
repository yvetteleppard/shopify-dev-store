import { bind } from 'decko'

export default class Instagram {
  containers = document.querySelectorAll('.juicer-feed')

  /**
   *
   */
  constructor () {
    if (this.containers.length === 0) {
      return
    }

    this.registerListeners()
  }

  @bind
  registerListeners () {
    this.containers.forEach(this.getPosts)
  }
  /**
   *
   */
  @bind
  async getPosts (container) {
    const FEED_ID = container.dataset.feedId
    const FEED_LIMIT = container.dataset.feedLimit
    const FEED_URL = 'https://www.juicer.io/api/feeds/' + FEED_ID + '?page=1&per=' + FEED_LIMIT

    const response = await fetch(FEED_URL)
    const data = await response.json()
    data.posts.items.forEach(postData => {
      container.append(this.template(postData))
    })
  }

  /**
   * @param {object} postData
   *
   * @returns {HTMLElement}
   */
  template (postData) {
    const item = document.createElement('li')
    item.classList.add('juicer-feed__post', 'juicer-post')
    item.innerHTML = `
      <a href="${postData.full_url}" class="juicer-post__link" target="_blank" rel="noopener">
        <div class="juicer-post__image">
          <img data-lazy-load-src="${postData.image}" />
        </div>
      </a>
    `
    return item
  }
}
