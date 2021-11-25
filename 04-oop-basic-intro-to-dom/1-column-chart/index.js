export default class ColumnChart {
  element;
  subElements = {};
  chartHeight = 50;

  constructor(
    {
      data = [],
      label = '',
      value = 0,
      link = '',
      formatHeading = (v) => v
    } = {}) {
    this.data = data;
    this.label = label ;
    this.value = formatHeading(value);
    this.link = link;

    this.render();
  }

  getTemplate() {
    const title = `Total ${this.label}`;

    return `
      <div class="column-chart" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
         ${title}
        </div>
        <div class="column-chart__container">
         <div data-element="header" class="column-chart__header">
           ${this.value}
         </div>
         <div data-element="body" class="column-chart__chart">
         </div>
        </div>
      </div>`;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();

    if (this.hasChartAnyData()) {
      this.addColumns(element);
    } else {
      this.addChartLoadingClass(element);
    }

    if (this.link) {
      this.addLink(element);
    }

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  update(data) {
    this.data = data; // Keep state synced
    this.subElements.body.innerHTML = this.getColumnChartTemplate();
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

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  addColumns(element) {
    element.querySelector('.column-chart__chart')
      .insertAdjacentHTML('beforeend', this.getColumnChartTemplate());
  }

  addLink(element) {
    element.querySelector('.column-chart__title')
      .insertAdjacentHTML('beforeend', this.getLinkTemplate());
  }

  addChartLoadingClass(element) {
    element.querySelector('.column-chart')
      .classList.add('column-chart_loading');
  }

  hasChartAnyData() {
    return !!this.data && this.data.length > 0;
  }

  getColumnProps() {
    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;

    return this.data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }

  getLinkTemplate() {
    return `<a class="column-chart__link" href="${this.link}">View all</a>`;
  }

  getColumnChartTemplate() {
    const dataColumnProps = this.getColumnProps();
    return dataColumnProps
      .map(prop => `<div style="--value: ${prop.value}" data-tooltip="${prop.percent}"></div>`)
      .join('');
  }
}
