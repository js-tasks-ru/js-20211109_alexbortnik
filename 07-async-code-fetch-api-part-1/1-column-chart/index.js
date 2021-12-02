import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  element;
  subElements = {};
  chartHeight = 50;
  data = {};

  get hasData() {
    return Object.keys(this.data).length > 0;
  }

  constructor({
    label = '',
    link = '',
    formatHeading = data => data,
    url = '',
    range = {}
  } = {}) {
    this.label = label;
    this.link = link;
    this.url = `${BACKEND_URL}/${url}`;
    this.formatHeading = formatHeading;

    this.render();
    this.update(range.from, range.to);
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  getTemplate() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
         Total ${this.label}
         ${this.getLink()}
        </div>
        <div class="column-chart__container">
         <div data-element="header" class="column-chart__header">
           ${this.getHeaderBody()}
         </div>
         <div data-element="body" class="column-chart__chart">
          ${this.getColumnBody()}
         </div>
        </div>
      </div>`;
  }

  getLink() {
    return this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';
  }

  getHeaderBody() {
    if (!this.hasData) return '';

    const total = Object.values(this.data)
      .reduce((accum, current) => accum + current, 0);

    return this.formatHeading(total);
  }

  getColumnBody() {
    if (!this.hasData) return '';

    const maxValue = Math.max(...Object.values(this.data));
    const scale = this.chartHeight / maxValue;

    return Object.values(this.data)
      .map(item => {
        const percent = (item / maxValue * 100).toFixed(0) + '%';
        return `<div style="--value: ${Math.floor(item * scale)}" data-tooltip="${percent}"></div>`;
      })
      .join('');
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  async update(from, to) {
    this.data = await fetchJson(`${this.url}?` +
      new URLSearchParams({
        from: from.toISOString(),
        to: to.toISOString()
      })
    );

    this.subElements.header.innerHTML = this.getHeaderBody();
    this.subElements.body.innerHTML = this.getColumnBody();

    if (this.hasData) {
      this.element.classList.remove('column-chart_loading');
    }

    return this.data;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}

