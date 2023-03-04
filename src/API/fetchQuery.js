import axios from 'axios';

axios.defaults.baseURL = 'https://pixabay.com/api/';

export class PixabayAPI {
  #page = 1;
  #totalPages = 0;
  #per_page = 12;
  query = '';

  async fetchQuery(query) {
    this.query = query;
    const options = `q=${query}&key=17568064-fe285d9450a7ecb893916a0ce&image_type=photo&orientation=horizontal&per_page=${
      this.#per_page
    }&page=${this.#page}`;
    const { data } = await axios.get(`?${options}`);
    return data;
  }
  incrementPage() {
    this.#page += 1;
  }
  calculateTotalPages(total) {
    this.#totalPages = Math.ceil(total / this.#per_page);
  }
  get isShowLoadMore() {
    return this.#page < this.#totalPages;
  }
  resetPage() {
    this.#page = 1;
  }
}
