import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements = {};
  sortBy;
  sortOrder;
  data = [];

  page = 1;
  pageSize = 30;

  onHeaderCellClick = async (event) => {
    const sortableCell = event.target.closest('[data-sortable="true"]');
    this.sortBy = sortableCell.dataset.id;
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    await this.sort();
  }

  constructor(headersConfig, {
      sorted = {},
      isSortLocally = true,
      url = '',
    } = {}
  ) {
    this.headerConfig = headersConfig;
    this.url = `${BACKEND_URL}/${url}`;

    this.sortBy = sorted.id || this.headerConfig.find(item => item.sortable).id;
    this.sortOrder = sorted.order || 'asc';
    this.isSortLocally = isSortLocally;

    this.render();
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(element);

    await this.loadInitialData();
    this.addEventListeners();
  }

  getTemplate() {
    const headerRow = this.headerConfig.map(cell => {
      return `
        <div class="sortable-table__cell" data-id="${cell.id}" data-sortable="${cell.sortable}">
          <span>${cell.title}</span>
          <span data-element="arrow" class="sortable-table__sort-arrow">
            <span class="sort-arrow"></span>
          </span>
        </div>`;
    }).join('');

    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row">
            ${headerRow}
          </div>
          <div data-element="body" class="sortable-table__body">
            ${this.getTableBody(this.data)}
          </div>
        </div>
      </div>`;
  }

  getTableBody(data) {
    return data.map(rowData =>
      `<a href="/products/${rowData.id}" class="sortable-table__row">
         ${this.buildRow(rowData)}
       </a>`
    ).join('');
  }

  buildRow(rowData) {
    return this.headerConfig.map(cell => {
      if (!cell.template) {
        cell.template = (value) => `<div class="sortable-table__cell">${value}</div>`;
      }

      return cell.template(rowData[cell.id]);
    }).join('');
  }

  async sort() {
    if (this.isSortLocally) {
      this.sortOnClient(this.sortBy, this.sortOrder);
    } else {
      await this.sortOnServer(this.sortBy, this.sortOrder);
    }
  }

  sortOnClient(field, order) {
    const fieldConfig = this.headerConfig.find(x => x.id === field);

    const compares = {
      string: (a, b) => a.localeCompare(b, ['ru', 'en'], {caseFirst: 'upper'}),
      number: (a, b) => a - b
    };
    const compare = compares[fieldConfig.sortType];

    const directions = {
      asc: 1,
      desc: -1
    };
    const direction = directions[order];

    const sortedItems = [...this.data].sort((a, b) =>
      direction * compare(a[field], b[field]));

    this.update(sortedItems);
    this.drawHeaderSortArrow(field, order);
  }

  async sortOnServer(field, order) {
    const { start, end } = this.getStartEndOfPage();
    await this.load(field, order, start, end);
  }

  async loadInitialData() {
    await this.load(this.sortBy, this.sortOrder, 0, this.pageSize);
  }

  async load(field, order, pageStart, pageEnd) {
    const url = new URL(this.url);
    url.searchParams.set('_sort', field);
    url.searchParams.set('_order', order);
    url.searchParams.set('_start', pageStart.toString());
    url.searchParams.set('_end', pageEnd.toString());

    const data = await fetchJson(url);
    this.update(data);
    this.drawHeaderSortArrow(this.sortBy, this.sortOrder);
  }

  update(data) {
    this.data = data;
    this.subElements.body.innerHTML = this.getTableBody(data);
  }

  drawHeaderSortArrow(field, order) {
    const headerCellWithArrow = this.element.querySelector(`.sortable-table__cell[data-order]`);
    if (headerCellWithArrow) {
      headerCellWithArrow.removeAttribute('data-order');
    }

    const currentHeaderCell = this.element.querySelector(`.sortable-table__cell[data-id="${field}"]`);
    currentHeaderCell.setAttribute('data-order', order);
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

  fillData = async () => {
    const {
      scrollTop,
      scrollHeight,
      clientHeight
    } = document.documentElement;

    if (scrollTop + clientHeight === scrollHeight) {
      this.page++; // take next portion. the first is already render
      const url = new URL(this.url);
      url.searchParams.set('_sort', this.sortBy);
      url.searchParams.set('_order', this.sortOrder);

      const { start, end } = this.getStartEndOfPage();
      url.searchParams.set('_start', start.toString());
      url.searchParams.set('_end', end.toString());

      const newPortion = await fetchJson(url);
      this.data = [...this.data, ...newPortion];
      this.update(this.data);
      this.subElements.body.innerHTML = this.getTableBody(this.data);
    }
  }

  getStartEndOfPage() {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    return { start, end };
  }

  addEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onHeaderCellClick);
    window.addEventListener('scroll', this.fillData);
  }

  removeEventListeners() {
    this.subElements.header.removeEventListener('pointerdown', this.onHeaderCellClick);
    window.removeEventListener('scroll', this.fillData);
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
    this.subElements = {};
  }
}
