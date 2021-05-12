import { bind } from 'decko'

export default class CurrencySwitcher {

  currencySwitcherForm = document.querySelector('.currency-switcher form')

  /**
   *
   */
  constructor () {

    if(!this.currencySwitcherForm){
      return
    }

    this.registerListeners()
  }

  @bind
  registerListeners () {

    const select = this.currencySwitcherForm.querySelector('select')

    select.addEventListener('change', e => {
      this.currencySwitcherForm.submit()
    })

  }

}


