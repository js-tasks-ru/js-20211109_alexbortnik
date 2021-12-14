import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

export default class Page {
  element;
  subElements;

  ordersColumnChart;
  salesColumnChart;
  customersColumnChart;
  bestSellersTable;

  onDateSelect = async (event) => {
    this.from = event.detail.from;
    this.to = event.detail.to;

    this.bestSellersTable.url.searchParams.set('from', this.from.toISOString());
    this.bestSellersTable.url.searchParams.set('to', this.to.toISOString());

    const sortBy = header.find(item => item.sortable).id;

    const [bestSellers] = await Promise.all([
      this.bestSellersTable.loadData(sortBy, 'asc'),
      this.ordersColumnChart.update(this.from, this.to),
      this.salesColumnChart.update(this.from, this.to),
      this.customersColumnChart.update(this.from, this.to)
    ]);

    this.bestSellersTable.addRows(bestSellers);
  }

  constructor() {
    this.from = new Date();
    this.from.setMonth(this.from.getMonth() - 1);
    this.to = new Date();
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    const rangePicker = new RangePicker({ from: this.from, to: this.to });
    rangePicker.element.setAttribute('data-element', 'rangePicker');
    this.element.querySelector('[data-element="rangePicker"]').replaceWith(rangePicker.element);

    const ordersColumnChart = new ColumnChart({
      label: 'orders',
      link: '/sales',
      url: 'api/dashboard/orders',
      range: {
        from: this.from,
        to: this.to
      }
    });

    const salesColumnChart = new ColumnChart({
      label: 'sales',
      url: 'api/dashboard/sales',
      range: {
        from: this.from,
        to: this.to
      },
      formatHeading: (data) => `$${data}`
    });

    const customersColumnChart = new ColumnChart({
      label: 'customers',
      url: 'api/dashboard/customers',
      range: {
        from: this.from,
        to: this.to
      },
    });

    ordersColumnChart.element.classList.add('dashboard__chart_orders');
    ordersColumnChart.element.setAttribute('data-element', 'ordersChart');
    this.element.querySelector('[data-element="ordersChart"]').replaceWith(ordersColumnChart.element);

    salesColumnChart.element.classList.add('dashboard__chart_sales');
    salesColumnChart.element.setAttribute('data-element', 'salesChart');
    this.element.querySelector('[data-element="salesChart"]').replaceWith(salesColumnChart.element);

    customersColumnChart.element.classList.add('dashboard__chart_customers');
    customersColumnChart.element.setAttribute('data-element', 'customersChart');
    this.element.querySelector('[data-element="customersChart"]').replaceWith(customersColumnChart.element);

    const url = this.getBestsellersURL();
    const table = new SortableTable(header, { url });
    table.element.setAttribute('data-element', 'sortableTable');
    this.element.querySelector('[data-element="sortableTable"]').replaceWith(table.element);

    this.bestSellersTable = table;
    this.ordersColumnChart = ordersColumnChart;
    this.salesColumnChart = salesColumnChart;
    this.customersColumnChart = customersColumnChart;

    this.initEventListeners();

    this.subElements = this.getSubElements(this.element);
    return this.element;
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
          <div data-element="ordersChart"></div>
          <div data-element="salesChart"></div>
          <div data-element="customersChart"></div>
        </div>

        <h3 class="block-title">Лидеры продаж</h3>
        <div data-element="sortableTable"></div>
      </div>
    `;
  }

  getBestsellersURL() {
    return `api/dashboard/bestsellers?from=${this.from.toISOString()}&to=${this.to.toISOString()}`;
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
    this.element = null;
    this.subElements = null;
  }
}
