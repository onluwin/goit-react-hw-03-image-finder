import { Component } from 'react';

import toast, { Toaster } from 'react-hot-toast';
import { RotatingLines } from 'react-loader-spinner';

import { Searchbar } from './Searchbar';
import { ImageGallery } from './ImageGallery';
import { LoadMoreBtn } from './Button';
import { Modal } from './Modal';

import { PixabayAPI } from 'API/fetchQuery';

// STYLED COMPONENTS
import { LoadingContainer } from './ImgFinder.styled';
import { Error } from './Error';

export class App extends Component {
  state = {
    query: '',
    images: null,
    largeImageURL: '',
    shouldShowModal: false,
    isLoading: false,
    error: false,
  };
  FetchAPI = new PixabayAPI();
  onInput = e => {
    this.setState({ query: e.currentTarget.value });
  };
  onSubmit = e => {
    e.preventDefault();
    if (!this.state.query) {
      return toast.error(
        'Sorry, there are no images matching your search query. Please try again.',
        { position: 'top-right' }
      );
    }

    this.FetchAPI.resetPage();
    try {
      this.FetchAPI.fetchQuery(this.state.query)
        .then(response => {
          console.log(response.ok);
          if (!response.ok) {
            return this.setState({ error: true, isLoading: false });
          }

          const { hits, total } = response;
          this.setState(prevState => {
            return { isLoading: !prevState.isLoading };
          });
          if (!hits.length) {
            return toast.error(
              `Ooops, there are no images with that query: ${this.state.query}`,
              { position: 'top-right' }
            );
          }
          this.FetchAPI.calculateTotalPages(total);
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
  handleLoadMoreClick = e => {
    const { query } = this.state;
    this.FetchAPI.incrementPage();
    try {
      this.FetchAPI.fetchQuery(query)
        .then(response => {
          if (!response.ok) {
            return this.setState({ error: true });
          }
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
        <Searchbar onInput={this.onInput} onSubmit={this.onSubmit} />
        {isLoading && (
          <LoadingContainer>
            <RotatingLines
              strokeColor="#3f51b5"
              strokeWidth="5"
              animationDuration="0.75"
              width="96"
              visible={true}
            />
          </LoadingContainer>
        )}
        {error && <Error message={`We're sorry but something went wrong`} />}
        {images && (
          <ImageGallery images={images} toggleModal={this.toggleModal} />
        )}
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
