import LiveNodeList from 'live-node-list'
import { bind } from 'decko'
import { isInViewport } from '../helpers'

/**
 * Creates an Intersection observer to lazy load videos
 * matching a specific selector. Videos matching selector
 * must have either an `data-src` or `data-srcset` attribute.
 * After the video is successfully loaded, both `data-src` and
 * `data-srcset` attributes are removed, allowing before and
 * after states to be styled in CSS
 *
 * @type {VideoLazyLoader}
 */
export default class VideoLazyLoader {
  /**
   * The default config for lazy loader instances
   *
   * @type {object}
   */
  config = {
    // If the video gets within 50px in the Y axis, start the download.
    rootMargin: '100px 0px',
    threshold: [0, 0.25, 0.5, 0.75, 1],
    trackVisibility: true,
    delay: 100
  }

  /**
   * @type {string}
   */
  containerSelector = '.lazy-load-container'

  /**
   * The selector used to gather videos
   *
   * @type {String}
   */
  selector = null

  /**
   * The node list in which we'll store all the videos
   * to be lazy loaded
   *
   * @type {NodeList}
   */
  videos = null

  /**
   * A node list containing lazy load containers
   *
   * @type {NodeList}
   */
  containers = null

  /**
   * The IntersectionObserver instance powering this lazy loader
   *
   * @type {IntersectionObserver}
   */
  observer = null

  /**
   * @type {boolean}
   */
  paused = false

  /**
   * Create the lazy loader instance
   *
   * @param {string} selector
   * @param {object} config
   */
  constructor(selector, config = {}) {
    this.selector = selector

    // Merge optional config with the default
    this.config = {
      ...this.config,
      ...config
    }

    this.collect()

    this.videos.forEach(video => {
      if (isInViewport(video)) {
        this.load(video)
      }
    })

    // Create the IntersectionObserver instance and observe each
    // of the videos and containers matching our selector
    this.observer = new IntersectionObserver(this.intersect, this.config)
    this.observe()
  }

  /**
   * Collect videos and containers on the page to be lazy loaded
   */
  @bind
  collect() {
    // Select all the videos to be lazy loaded
    this.videos = new LiveNodeList(this.selector)
    this.containers = new LiveNodeList(this.containerSelector)

    this.videos.on('update', (newItems, oldItems) => {
      oldItems.forEach(item => this.observer.unobserve(item))
      newItems.forEach(item => this.observer.observe(item))
    })

    this.containers.on('update', (newItems, oldItems) => {
      oldItems.forEach(item => this.observer.unobserve(item))
      newItems.forEach(item => this.observer.observe(item))
    })
  }

  /**
   * Begin observation for each of the collected elements
   */
  @bind
  observe() {
    this.videos.forEach(video => this.observer.observe(video))
    this.containers.forEach(container => this.observer.observe(container))
  }

  /**
   * Begin observation for each of the collected elements
   */
  @bind
  unobserve() {
    this.videos.forEach(video => this.observer.unobserve(video))
    this.containers.forEach(container => this.observer.unobserve(container))
  }

  /**
   * Handle a list of entries when an intersection occurs
   *
   * @param {Array} entries
   */
  @bind
  intersect(entries) {
    if (this.paused) {
      return
    }

    // Loop through the entries
    entries.forEach(entry => {
      // Are we in viewport?
      if (entry.isIntersecting && entry.intersectionRatio > 0) {
        // If the entry is a container, load all the videos within it
        if (entry.target.matches(this.containerSelector)) {
          Promise.all(Array.prototype.map.call(entry.target.querySelectorAll(this.selector), this.load)).then(() => {
            this.observer.unobserve(entry.target)
          })

          return
        }

        this.load(entry.target).then(() => {
          // Stop watching and load the video
          this.observer.unobserve(entry.target)
        }).catch(_ => {
          this.observer.unobserve(entry.target)
        })
      }
    })
  }

  /**
   * Load an video
   *
   * @param {HTMLVideoElement} video
   */
  @bind
  load(video) {
    return new Promise((resolve, reject) => {
      // Remove the data-src and data-srcset attributes when
      // the video has successfully loaded
      video.addEventListener('play', () => {
        requestAnimationFrame(() => {
          video.classList.add('playing')
          video.removeAttribute('data-lazy-load-src')

        })

        // If video is within a slideshow, trigger a transition to ensure that
        // the slide is in the correct position. This is necessary because until
        // the video is loaded the slide may be of an incorrect size
        const slideshow = video.closest('.slideshow')
        if (slideshow && slideshow.magicRoundabout) {
          slideshow.magicRoundabout.transition()
        }

        resolve(true)
      })

      video.addEventListener('canplay', () => {
        if (video.autoplay) {
          video.play().catch(_ => {
            video.dispatchEvent(new ErrorEvent('error'))
          })
        }
      })

      video.addEventListener('error', e => {
        reject(e)
      })

      // Set the srcset or src attribute on the video.
      // We prefer srcset if it is defined
      if ('srcset' in video && 'lazyLoadSrcset' in video.dataset) {
        video.srcset = video.dataset.lazyLoadSrcset
      } else if ('lazyLoadSrc' in video.dataset) {
        video.src = video.dataset.lazyLoadSrc
      }

      video.load()

      const videoParent = video.parentNode

      if(videoParent.classList.contains('autoplay-video')){
        var p = video.play()
        if(p !== undefined){
          p.then(_ => {
            // Autoplay started!
            videoParent.classList.remove('autoplay-video--off')
          }).catch(error => {
            // Autoplay not allowed!
            // Mute video and try to play again
            videoParent.classList.add('autoplay-video--off')

            // Show something in the UI that the video is muted
          });
        }

        const button = videoParent.querySelector('.autoplay-video__button')
        button.addEventListener('click', e => {
          video.play()
          videoParent.classList.remove('autoplay-video--off')
        })
      }

    })
  }

  /**
   * Unobserve the current list of videos and reselect all videos on the page
   *
   * @return {void}
   */
  @bind
  refreshVideos() {
    this.unobserve()
    this.collect()
    this.observe()
  }

  /**
   * @return {void}
   */
  @bind
  pause() {
    this.paused = true
  }

  /**
   * @return {void}
   */
  @bind
  unpause() {
    this.paused = false
  }
}
