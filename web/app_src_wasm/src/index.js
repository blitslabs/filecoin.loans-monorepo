import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

// Redux
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import reducer from './reducers'
import middleware from './middleware'

// redux-persist
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import { PersistGate } from 'redux-persist/integration/react'

const persistConfig = { key: 'root', storage, }
const persistedReducer = persistReducer(persistConfig, reducer)
const store = createStore(persistedReducer, middleware)
const persistor = persistStore(store)


ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>, document.getElementById('root')
)
