class Tooltip {
  static instance;
  element;

  onPointerMove = (event) => this.moveTo(event.clientX, event.clientY);
  onPointerOut = () => this.remove();
  onPointerOver = (event) => {
    const tooltipMessage = event.target.dataset.tooltip;
    this.render(tooltipMessage);
    this.moveTo(event.clientX, event.clientY);
  }

  constructor() {
    if (!Tooltip.instance) {
      Tooltip.instance = this;
    }
    return Tooltip.instance;
  }

  initialize() {
    this.addEventListeners();
  }

  getTooltipArea() {
    return document.querySelector('[data-tooltip]');
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

  addEventListeners() {
    const tooltipArea = this.getTooltipArea();
    tooltipArea.addEventListener('pointerover', this.onPointerOver);
    tooltipArea.addEventListener('pointermove', this.onPointerMove);
    tooltipArea.addEventListener('pointerout', this.onPointerOut);
  }

  removeEventListeners() {
    const tooltipArea = this.getTooltipArea();
    tooltipArea.removeEventListener('pointermove', this.onPointerMove);
    tooltipArea.removeEventListener('pointerover', this.onPointerOver);
    tooltipArea.removeEventListener('pointerout', this.onPointerOut);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.removeEventListeners();
    this.remove();
    this.element = null;
  }
}

export default Tooltip;
