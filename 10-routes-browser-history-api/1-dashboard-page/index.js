import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

export default class Page {
  element;
  subElements;
  components;

  onDateSelect = async (event) => {
    const { from, to } = event.detail;

    await Promise.all([
      this.components.customersChart.update(from, to),
      this.components.ordersChart.update(from, to),
      this.components.salesChart.update(from, to),
      this.components.sortableTable.update(from, to)
    ]);
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.buildComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  buildComponents() {
    const now = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));
    const to = now;

    const rangePicker = new RangePicker({ from, to });

    const customersChart = new ColumnChart({
      label: 'customers',
      url: 'api/dashboard/customers',
      range: { from, to },
    });

    const salesChart = new ColumnChart({
      label: 'sales',
      url: 'api/dashboard/sales',
      range: { from, to },
      formatHeading: (data) => `$${data}`
    });

    const ordersChart = new ColumnChart({
      label: 'orders',
      link: '/sales',
      url: 'api/dashboard/orders',
      range: { from, to },
    });

    const sortableTable = new SortableTable(header, {
      url: `api/dashboard/bestsellers?from=${from.toISOString()}&to=${to.toISOString()}`,
      isSortLocally: true
    });

    this.components = {
      rangePicker,
      customersChart,
      salesChart,
      ordersChart,
      sortableTable
    };
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const parentNode = this.subElements[component];
      parentNode.append(this.components[component].element);
    });
  }

  initEventListeners() {
    document.addEventListener('date-select', this.onDateSelect);
  }

  removeEventListeners() {
    document.removeEventListener('date-select', this.onDateSelect);
  }

  getTemplate() {
    return `
      <div class="dashboard full-height flex-column">
        <div class="content__top-panel">
          <h2 class="page-title">Панель управления</h2>
          <div data-element="rangePicker"></div>
        </div>

        <div class="dashboard__charts">
          <div data-element="ordersChart" class="dashboard__chart_orders"></div>
          <div data-element="salesChart" class="dashboard__chart_sales"></div>
          <div data-element="customersChart" class="dashboard__chart_customers"></div>
        </div>

        <h3 class="block-title">Лидеры продаж</h3>
        <div data-element="sortableTable"></div>
      </div>
    `;
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

  remove() {
    if (this.element) {
      this.element.remove();
      this.removeEventListeners();
    }
  }

  destroy() {
    this.remove();

    for (const component of Object.values(this.components)) {
      component.remove();
    }

    this.element = null;
    this.subElements = null;
  }
}
