import { bind } from 'decko'
import { scrollToPosition } from '../../helpers'
import { AddressForm } from '@shopify/theme-addresses'

export default class Addresses {
    addresses = document.querySelectorAll('[data-address]')

    selectors = {
        addressContainer: '[data-address]',
        addressFields: '[data-address-fields]',
        addressToggle: '[data-address-toggle]',
        addressForm: '[data-address-form]',
        addressDeleteForm: '[data-address-delete-form]'
    }

    hideClass = 'hide';

    constructor () {
        if (this.addresses.length === 0) {
            return
        }

        this.registerListeners()
    }

    @bind
    registerListeners () {
        this.addresses.forEach(this.initAddressForm)
    }

    @bind
    initAddressForm (address) {
        const addressFields = address.querySelector(this.selectors.addressFields)
        const addressForm = address.querySelector(this.selectors.addressForm)
        const deleteForm = address.querySelector(this.selectors.addressDeleteForm)

        address.querySelectorAll(this.selectors.addressToggle).forEach(button => {
            button.addEventListener('click', () => {
                addressForm.classList.toggle(this.hideClass)
                if(!addressForm.classList.contains(this.hideClass)){
                    scrollToPosition((addressForm.offsetTop - 170))
                } else {
                    scrollToPosition((address.offsetTop - 170))
                }
            })
        })

        AddressForm(addressForm, 'en')

        if (deleteForm) {
            deleteForm.addEventListener('submit', e => {
                const confirmMessage = deleteForm.getAttribute('data-confirm-message')

                if (!window.confirm(confirmMessage || 'Are you sure you wish to delete this address?')) {
                    e.preventDefault()
                }
            })
        }
    }
}
