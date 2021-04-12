import LiveNodeList from 'live-node-list'
import { bind } from 'decko'

export default class Form {
  /**
   * @type {string}
   */
  errorMessageClass = 'form-group__message'

  /**
   * @type {LiveNodeList}
   */
  forms = new LiveNodeList('form')

  /**
   * @type {LiveNodeList}
   */
  inputs = new LiveNodeList('input, textarea, select')

  constructor() {
    this.registerListeners()
  }

  @bind
  registerListeners() {
    this.inputs.forEach(this.setState)

    this.inputs.addEventListener('change', e => {
      this.setState(e.target)
    })
  }

  @bind
  setState(input) {
    const fn = input.value ? 'add' : 'remove'
    input.classList[fn]('field--filled')

    if (input.value) {
      input.parentNode.classList.remove('form-row--error')
    }
  }

}