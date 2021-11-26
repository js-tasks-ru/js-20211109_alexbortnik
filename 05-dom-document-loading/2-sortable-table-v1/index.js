export default class SortableTable {
  element;
  subElements = {};

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.render();
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(element);
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
            ${this.buildRows(this.data)}
          </div>
        </div>
      </div>`;
  }

  buildRows(data) {
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

  sort(field, order) {
    const fieldConfig = this.headerConfig.find(x => x.id === field);

    if (!fieldConfig || !fieldConfig.sortable) {
      return;
    }

    const sortedItems = this.sortItems(this.data, field, fieldConfig.sortType, order);
    this.update(sortedItems);
    this.drawHeaderSortArrow(field, order);
  }

  drawHeaderSortArrow(field, order) {
    const existingSortArrow = document.querySelector(`.sortable-table__header > [data-order]`);
    if (existingSortArrow) {
      existingSortArrow.removeAttribute('data-order');
    }

    document.querySelector(`.sortable-table__header > [data-id="${field}"]`)
      .setAttribute('data-order', order);
  }

  update(data) {
    this.subElements.body.innerHTML = this.buildRows(data);
  }

  sortItems(arr, field, type = 'string', order = 'asc') {
    const compares = {
      string: (a, b) => a.localeCompare(b, ['ru', 'en'], { caseFirst: 'upper' }),
      number: (a, b) => a - b
    };
    const compare = compares[type];

    const directions = {
      asc: 1,
      desc: -1
    };
    const direction = directions[order];

    return [...arr].sort((a, b) =>
      direction * compare(a[field], b[field]));
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
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
