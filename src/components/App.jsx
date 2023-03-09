import { Component } from 'react';

import toast, { Toaster } from 'react-hot-toast';

import { Searchbar } from './Searchbar';
import { ImageGallery } from './ImageGallery';
import { LoadMoreBtn } from './Button';
import { Modal } from './Modal';

import { isShowLoadMore, calculateTotalPages, fetchQuery } from 'API/fetchAPI';

// STYLED COMPONENTS
import { Error } from './Error';
import { Loader } from './Loader';

export class App extends Component {
  state = {
    query: '',
    images: [],
    largeImageURL: '',
    shouldShowModal: false,
    isLoading: false,
    error: false,
    page: 1,
  };

  componentDidUpdate(_, prevState) {
    if (
      prevState.query !== this.state.query ||
      prevState.page !== this.state.page
    ) {
      this.getImage(this.state.query);
    }
  }

  resetPage = () => this.setState({ page: 1 });
  incrementPage = () => {
    this.setState(prevState => {
      return { page: prevState.page + 1 };
    });
  };
  resetImages = () => this.setState({ images: [] });
  getImage = query => {
    const { page } = this.state;
    let shouldChangeState = false;
    try {
      fetchQuery(query, page)
        .then(response => {
          const { hits, total } = response;
          if (!hits.length) {
            toast.error(
              `Ooops, there are no images with that query: ${query}`,
              { position: 'top-right' }
            );

            return this.resetImages();
          }

          if (shouldChangeState) {
            this.setState(prevState => {
              return { isLoading: !prevState.isLoading };
            });
          }

          calculateTotalPages(total);
          this.setState(prevState => {
            return { images: [...prevState.images, ...hits] };
          });
        })
        .catch(() => this.setState({ error: true }));
    } catch {
      this.setState({ error: true });
    } finally {
      if (shouldChangeState) {
        this.setState(prevState => {
          return { isLoading: !prevState.isLoading };
        });
      }
    }
  };

  onSubmit = e => {
    e.preventDefault();

    this.resetImages();
    this.resetPage();

    const value = e.target.elements.query.value.trim();
    if (!value) {
      return;
    }
    this.setState({ query: value });
  };
  handleLoadMoreClick = e => {
    const { page } = this.state;
    this.incrementPage();
    console.log(page);

    // if (isShowLoadMore(page)) {
    //   return this.incrementPage();
    // }
    if (!isShowLoadMore(page)) {
      toast.success(
        'We are ssory, but you have reached the end of search results',
        { position: 'top-right' }
      );
    }
  };

  toggleModal = largeImageURL => {
    this.setState(({ shouldShowModal }) => ({
      shouldShowModal: !shouldShowModal,
      largeImageURL,
    }));
  };

  render() {
    const { images, shouldShowModal, largeImageURL, isLoading, error, page } =
      this.state;
    return (
      <>
        <Searchbar onSubmit={this.onSubmit} />

        {error && <Error message={`We're sorry but something went wrong`} />}
        {images && (
          <ImageGallery images={images} toggleModal={this.toggleModal} />
        )}
        {isLoading && <Loader />}
        {isShowLoadMore(page) && (
          <LoadMoreBtn handleLoadMoreClick={this.handleLoadMoreClick} />
        )}
        {shouldShowModal && (
          <Modal largeImageURL={largeImageURL} toggleModal={this.toggleModal} />
        )}
        <Toaster />
      </>
    );
  }
}
