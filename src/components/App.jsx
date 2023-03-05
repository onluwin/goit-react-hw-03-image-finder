import { Component } from 'react';

import toast, { Toaster } from 'react-hot-toast';

import { Searchbar } from './Searchbar';
import { ImageGallery } from './ImageGallery';
import { LoadMoreBtn } from './Button';
import { Modal } from './Modal';

import { PixabayAPI } from 'API/fetchQuery';

// STYLED COMPONENTS
import { Error } from './Error';
import { Loader } from './Loader';

export class App extends Component {
  state = {
    query: '',
    images: null,
    largeImageURL: '',
    shouldShowModal: false,
    isLoading: false,
    error: false,
    page: 1,
  };
  componentDidUpdate(_, prevState) {
    if (this.state.query !== prevState.query) {
      this.getImage(this.state.query);
    }
  }
  getImage = query => {
    const FetchAPI = new PixabayAPI();
    FetchAPI.resetPage();
    try {
      FetchAPI.fetchQuery(query)
        .then(response => {
          const { hits, total } = response;
          this.setState(prevState => {
            return { isLoading: !prevState.isLoading };
          });
          if (!hits.length) {
            toast.error(
              `Ooops, there are no images with that query: ${query}`,
              { position: 'top-right' }
            );
            return this.setState({ images: [] });
          }
          FetchAPI.calculateTotalPages(total);
          this.setState({ images: hits });
        })
        .catch(() => this.setState({ error: true }));
    } catch {
      this.setState({ error: true });
    } finally {
      this.setState(prevState => {
        return { isLoading: !prevState.isLoading };
      });
    }
  };
  FetchAPI = new PixabayAPI();
  onSubmit = e => {
    e.preventDefault();
    this.setState({ query: e.target.elements.query.value.trim() });
    if (!this.state.query) {
      return;
    }
  };
  handleLoadMoreClick = e => {
    const { query } = this.state;
    this.FetchAPI.incrementPage();
    try {
      this.FetchAPI.fetchQuery(query)
        .then(response => {
          // if (!response.ok) {
          //   return this.setState({ error: true });
          // }
          this.setState(prevState => {
            return { isLoading: !prevState.isLoading };
          });
          const { hits, total } = response;
          !this.FetchAPI.isShowLoadMore &&
            toast.success(
              'We are ssory, but you have reached the end of search results',
              { position: 'top-right' }
            );
          this.FetchAPI.calculateTotalPages(total);
          this.setState(prevState => {
            return { images: [...prevState.images, ...hits] };
          });
        })
        .catch(() => this.setState({ error: true }));
    } catch {
      this.setState({ error: true });
    } finally {
      this.setState(prevState => ({
        isLoading: !prevState.isLoading,
      }));
    }
  };

  toggleModal = largeImageURL => {
    this.setState(({ shouldShowModal }) => ({
      shouldShowModal: !shouldShowModal,
      largeImageURL,
    }));
  };

  render() {
    const { images, shouldShowModal, largeImageURL, isLoading, error } =
      this.state;
    return (
      <>
        <Searchbar onSubmit={this.onSubmit} />

        {error && <Error message={`We're sorry but something went wrong`} />}
        {images && (
          <ImageGallery images={images} toggleModal={this.toggleModal} />
        )}
        {isLoading && <Loader />}
        {this.FetchAPI.isShowLoadMore && (
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
