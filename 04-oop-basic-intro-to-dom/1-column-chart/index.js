const CHART_HEIGHT = 50;

export default class ColumnChart {
  constructor(
    {
      data = [],
      label = '',
      value = 0,
      link = '',
      formatHeading = (v) => v
    } = {}) {
    this.chartHeight = CHART_HEIGHT;
    this.data = data;
    this.label = label ;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;

    this.render();
  }

  getTemplate() {
    const title = `Total ${this.label}`;
    const header = `${this.formatHeading(this.value)}`;

    return `
      <div class="column-chart" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
         ${title}
        </div>
        <div class="column-chart__container">
         <div data-element="header" class="column-chart__header">
           ${header}
         </div>
         <div data-element="body" class="column-chart__chart">
         </div>
        </div>
      </div>`;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();

    if (this.hasChartAnyData(this.data)) {
      this.addColumnsToElement(element, this.data, this.chartHeight);
    } else {
      this.addChartLoadingClassToElement(element);
    }

    if (this.link) {
      this.addLinkToElement(element, this.link);
    }

    this.element = element.firstElementChild;
  }

  update(data) {
    this.data = data;
    this.render();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }

  addColumnsToElement(element) {
    element.querySelector('.column-chart__chart')
      .insertAdjacentHTML('beforeend', this.getColumnChartTemplate(this.data, this.chartHeight));
  }

  addLinkToElement(element) {
    element.querySelector('.column-chart__title')
      .insertAdjacentHTML('beforeend', this.getLinkTemplate(this.link));
  }

  addChartLoadingClassToElement(element) {
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
    const dataColumnProps = this.getColumnProps(this.data, this.chartHeight);
    return dataColumnProps.reduce((template, prop) =>
      template + `<div style="--value: ${prop.value}" data-tooltip="${prop.percent}"></div>`, '');
  }
}
