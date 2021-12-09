import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  element;
  subElements;

  formData;
  categories;

  formConfig = [
    {
      field: 'title',
      type: 'string',
      default: ''
    },
    {
      field: 'description',
      type: 'string',
      default: ''
    },
    {
      field: 'quantity',
      type: 'number',
      default: 1
    },
    {
      field: 'subcategory',
      type: 'string',
      default: ''
    },
    {
      field: 'status',
      type: 'number',
      default: 1
    },
    {
      field: 'price',
      type: 'number',
      default: 100
    },
    {
      field: 'discount',
      type: 'number',
      default: 0
    }
  ];

  get isEditMode() {
    return !!this.productId;
  }

  onSubmit = (event) => {
    event.preventDefault();
    this.save();
  }

  uploadImage = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.hidden = true; // must be in body for IE

    fileInput.addEventListener('change', async () => {
      const [file] = fileInput.files;

      if (file) {
        const formData = new FormData();
        const { uploadImage, imageListContainer } = this.subElements;

        formData.append('image', file);

        uploadImage.classList.add('is-loading');
        uploadImage.disabled = true;

        const result = await fetchJson('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
          },
          body: formData,
          referrer: ''
        });

        imageListContainer.append(this.getImageItem(result.data.link, file.name));

        uploadImage.classList.remove('is-loading');
        uploadImage.disabled = false;

        // Remove input from body
        fileInput.remove();
      }
    });

    document.body.append(fileInput);
    fileInput.click();
  }

  constructor(productId) {
    this.productId = productId;
  }

  async render() {
    const categoriesPromise = this.loadCategories();
    const productPromise = this.productId ? this.loadProduct()
      : Promise.resolve(this.getFieldsDefault());

    const [categories, productResponse] = await Promise.all([categoriesPromise, productPromise]);
    this.categories = categories;
    this.formData = productResponse[0]; // always array of 1 object

    this.renderForm();

    if (this.formData) {
      this.setFormData();
      this.initEventListeners();
    }

    return this.element;
  }

  renderForm() {
    const element = document.createElement('div');
    element.innerHTML = this.formData ? this.getTemplate() : this.getEmptyTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(element);
  }

  getFieldsDefault() {
    const result = {};

    for (const { field, default: value } of this.formConfig) {
      result[field] = value;
    }

    return [result];
  }

  getImagesListTemplate() {
    if (!this.formData.images) {
      return '';
    }

    return this.formData.images
      .map(image => this.getImageItem(image.url, image.source).outerHTML)
      .join('');
  }

  getImageItem(url, source) {
    const element = document.createElement('div');
    element.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item">
        <input type="hidden" name="url" value="${escapeHtml(url)}">
        <input type="hidden" name="source" value="${source}">
        <span>
          <img src="icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="${escapeHtml(source)}" src="${escapeHtml(url)}">
          <span>${escapeHtml(source)}</span>
        </span>
        <button type="button">
          <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>`;

    return element.firstElementChild;
  }

  initEventListeners() {
    const { productForm, uploadImage, imageListContainer} = this.subElements;
    productForm.addEventListener('submit', this.onSubmit);
    uploadImage.addEventListener('click', this.uploadImage);

    /* TODO: will be removed in the next iteration of realization.
       this logic will be implemented inside "SortableList" component
    */
    imageListContainer.addEventListener('click', event => {
      if ('deleteHandle' in event.target.dataset) {
        event.target.closest('li').remove();
      }
    });
  }

  getSubCategoriesTemplate() {
    const options = [];

    // can work through Option object instead
    this.categories.forEach(c => {
      options.push(...c.subcategories.map(sc =>
        `<option value="${sc.id}">${c.title} &gt; ${sc.title}</option>`
      ));
    });

    return options.join('');
  }

  async save() {
    const product = this.getFormData();

    try {
      const { id: productId } = await fetchJson(
        `${BACKEND_URL}/api/rest/products`, {
          method: this.isEditMode ? 'PATCH' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product)
        }
      );
      // Probably we don't need it because of potential instant redirect after add/update action
      if (!this.isEditMode) {
        this.productId = productId;
      }

      this.raiseProductEvent(productId);
    } catch (err) {
      console.error('Faced an issue', err);
    }
  }

  getFormData() {
    const { productForm, imageListContainer } = this.subElements;

    const formData = {
      id: this.productId,
      images: []
    };

    for (const { field, type } of this.formConfig) {
      const value = productForm.querySelector(`[name="${field}"]`).value;
      formData[field] = type === 'number' ? Number(value) : value;
    }

    const htmlImages = imageListContainer.querySelectorAll('.sortable-table__cell-img');

    formData.images.push(...Array.from(htmlImages).map(image => ({
      url: image.src,
      source: image.alt
    })));

    return formData;
  }

  setFormData() {
    for (const { field } of this.formConfig) {
      this.subElements.productForm
        .querySelector(`#${field}`).value = this.formData[field];
    }
  }

  raiseProductEvent(productId) {
    const eventType = this.isEditMode ? 'product-updated' : 'product-saved';
    const event = new CustomEvent(eventType, { detail: productId });
    this.element.dispatchEvent(event);
  }

  getTemplate() {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset name="header">
              <label class="form-label">Название товара</label>
              <input id="title" value="" required type="text" name="title" class="form-control" placeholder="Название товара">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea id="description" required class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
          </div>
          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer">
              <ul class="sortable-list">
                ${this.getImagesListTemplate()}
              </ul>
             </div>
            <button type="button" data-element="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select id="subcategory" class="form-control" name="subcategory">
              ${this.getSubCategoriesTemplate()}
            </select>
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input id="price" required type="number" name="price" class="form-control" placeholder="${this.formConfig.find(f => f.field === 'price').default}">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input id="discount" required type="number" name="discount" class="form-control" placeholder="${this.formConfig.find(f => f.field === 'discount').default}">
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input id="quantity" required type="number" class="form-control" name="quantity" placeholder="${this.formConfig.find(f => f.field === 'quantity').default}">
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select id="status" class="form-control" name="status">
              <option value="1">Активен</option>
              <option value="0">Неактивен</option>
            </select>
          </div>
          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              ${this.productId ? 'Сохранить' : 'Добавить'} товар
            </button>
          </div>
        </form>
      </div>
    `;
  }

  getEmptyTemplate () {
    return `
      <div>
        <h1 class="page-title">Страница не найдена</h1>
        <p>Товар не существует</p>
      </div>`;
  }

  async loadProduct() {
    const productUrl = new URL('/api/rest/products', BACKEND_URL);
    productUrl.searchParams.set('id', this.productId);
    return fetchJson(productUrl);
  }

  async loadCategories() {
    const categoryUrl = new URL('/api/rest/categories', BACKEND_URL);
    categoryUrl.searchParams.set('_sort', 'weight');
    categoryUrl.searchParams.set('_refs', 'subcategory');
    return fetchJson(categoryUrl);
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
    this.subElements = null;
  }
}
