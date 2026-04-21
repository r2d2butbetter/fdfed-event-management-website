import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore, combineReducers } from '@reduxjs/toolkit';

// Import all reducers
import organizerReducer from './redux/slices/organizerSlice';
import eventReducer from './redux/slices/eventSlice';

export function renderWithProviders(
  ui,
  {
    preloadedState = {},
    // Create a new store instance if no store was passed in
    store = configureStore({
      reducer: combineReducers({
        organizer: organizerReducer,
        events: eventReducer,
      }),
      preloadedState,
    }),
    route = '/',
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>
          {children}
        </MemoryRouter>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
