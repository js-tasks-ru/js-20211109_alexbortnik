class Tooltip {
  static instance;
  element;

  onPointerMove = (event) => this.moveTo(event.clientX, event.clientY);
  onPointerOut = () => this.remove();

  onPointerOver = (event) => {
    const tooltipMessage = event.target.dataset.tooltip;
    this.render(tooltipMessage);

    this.moveTo(event.clientX, event.clientY);
    this.tooltipArea.addEventListener('pointermove', this.onPointerMove);
    this.tooltipArea.addEventListener('pointerout', this.onPointerOut);
  }

  get tooltipArea() {
    return document.querySelector('[data-tooltip]');
  }

  constructor() {
    if (!Tooltip.instance) {
      Tooltip.instance = this;
    }
    return Tooltip.instance;
  }

  initialize() {
    this.tooltipArea.addEventListener('pointerover', this.onPointerOver);
  }

  render(content = '') {
    const element = document.createElement('div');
    element.classList.add('tooltip');
    element.textContent = content;
    this.element = element;
    document.body.prepend(this.element);
  }

  moveTo(x, y) {
    this.element.style.left = Math.ceil(x) + 'px';
    this.element.style.top = Math.ceil(y) + 'px';
  }

  removeEventListeners() {
    this.tooltipArea.removeEventListener('pointermove', this.onPointerMove);
    this.tooltipArea.removeEventListener('pointerover', this.onPointerOver);
    this.tooltipArea.removeEventListener('pointerout', this.onPointerOut);
  }

  remove() {
    if (this.element) {
      this.removeEventListeners();
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}

export default Tooltip;
