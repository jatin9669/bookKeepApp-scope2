import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["message"]
  static values = { delay: Number }

  connect() {
    // Set timeout to auto-dismiss the flash message
    setTimeout(() => {
      this.dismiss()
    }, this.delayValue)
  }

  dismiss() {
    this.messageTarget.remove()
  }
} 