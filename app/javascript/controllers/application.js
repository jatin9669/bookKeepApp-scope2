import { Application } from "@hotwired/stimulus"

const application = Application.start()

// Configure Stimulus development experience
application.debug = false
window.Stimulus   = application

window.borrowQuantity = {};
window.returnQuantity = {};

export { application }
