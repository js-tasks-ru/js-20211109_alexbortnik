const CHART_HEIGHT = 50;

export default class ColumnChart {
  constructor(
    {
      data = [],
      label = '',
      value = 0,
      link = '',
      formatHeading = (v) => v
    } = {} // never did it before... it looks weird and ugly. there is a strange unit test which calls constructor without any param
    ) {
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

    if (!!this.data && this.data.length > 0) {
      element.querySelector('.column-chart__chart')
        .insertAdjacentHTML('beforeend', getColumnChartTemplate(this.data, this.chartHeight));
    } else {
      element.querySelector('.column-chart')
        .classList.add('column-chart_loading');
    }

    if (this.link) {
      element.querySelector('.column-chart__title')
        .insertAdjacentHTML('beforeend', getLinkTemplate(this.link));
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
}

const getColumnProps = (data, chartHeight) => {
  const maxValue = Math.max(...data);
  const scale = chartHeight / maxValue;

  return data.map(item => {
    return {
      percent: (item / maxValue * 100).toFixed(0) + '%',
      value: String(Math.floor(item * scale))
    };
  });
};

const getLinkTemplate = (link) =>
  `<a class="column-chart__link" href="${link}">View all</a>`;

const getColumnChartTemplate = (data, chartHeight) => {
  const dataColumnProps = getColumnProps(data, chartHeight);
  return dataColumnProps.reduce((template, prop) =>
    template + `<div style="--value: ${prop.value}" data-tooltip="${prop.percent}"></div>`, '');
};
