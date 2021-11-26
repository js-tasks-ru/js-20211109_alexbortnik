export default class NotificationMessage {
  static lastShownMessage = null;

  constructor(message = '', { duration = 1000, type = 'success' } = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;

    this.render();
  }

  getTemplate() {
    return `
      <div class="notification ${this.type}" style="--value: ${this.duration / 1000}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>`;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
  }

  show(targetElement = document.body) {
    if (NotificationMessage.lastShownMessage) {
      NotificationMessage.lastShownMessage.destroy();
    }

    targetElement.append(this.element);
    NotificationMessage.lastShownMessage = this;
    this.timeoutId = setTimeout(() => this.destroy(), this.duration);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    clearTimeout(this.timeoutId);
  }
}
