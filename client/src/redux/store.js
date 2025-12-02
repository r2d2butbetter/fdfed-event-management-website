import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage
import { combineReducers } from '@reduxjs/toolkit';
import organizerReducer from './slices/organizerSlice';
import eventReducer from './slices/eventSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['organizer', 'events'], // Only persist these reducers
};

// Combine reducers
const rootReducer = combineReducers({
  organizer: organizerReducer,
  events: eventReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types from redux-persist
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);
