import { bind } from 'decko';

export default class Login {

  templateLogin = document.querySelector('.template-customers-login')

  constructor() {
    if(!this.templateLogin){
      return
    }

    this.recoverPasswordForm = document.getElementById('RecoverPasswordForm')
    this.recoverPasswordFormLink = document.getElementById('RecoverPassword')
    this.customerLoginForm = document.getElementById('CustomerLoginForm')
    this.hideRecoverPasswordLink = document.getElementById('HideRecoverPasswordLink')
    this.resetSuccess = document.getElementById('ResetSuccess')

    this.registerListeners()
  }

  @bind
  registerListeners(){
    this.recoverPasswordFormLink.addEventListener('click', this.toggleRecoverPasswordForm)
    this.hideRecoverPasswordLink.addEventListener('click', e => {
      const hash = window.location.hash;
      if (hash === '#recover') {
        window.location.href.split('#')[0]
      }
      this.toggleRecoverPasswordForm()
    })

    const hash = window.location.hash;
    if (hash === '#recover') {
      this.toggleRecoverPasswordForm()
    }

    this.resetPasswordSuccess()
  }

  showHidePasswordForm(e){
    e.preventDefault()
    this.toggleRecoverPasswordForm()
  }

  /**
   * Show/Hide recover password form
   */
  @bind
  toggleRecoverPasswordForm() {
    this.recoverPasswordForm.classList.toggle('hide')
    this.customerLoginForm.classList.toggle('hide')
  }

  @bind
  resetPasswordSuccess() {
    this.formState = this.templateLogin.querySelector('.reset-password-success');

    if(!this.formState){
      return
    }

    this.resetSuccess.classList.remove('hide')
  }

}
