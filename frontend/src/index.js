import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import './bootstrap.min.css';
import './index.css';
import App from './App';
import store from './store';
import { ContextProvider } from './contexts/ContextProvider';

import { AuthContextProvider } from './contexts/AuthContext';

import { SuppliersContextProvider } from './contexts/SuppliersContext';
import { BuyersContextProvider } from './contexts/BuyersContext';
import { ArticlesContextProvider } from './contexts/ArticlesContext';

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthContextProvider>
        <ContextProvider>
          <SuppliersContextProvider>
            <BuyersContextProvider>
              <ArticlesContextProvider>
              
                    
                      <App />
                    
                  
              </ArticlesContextProvider>
            </BuyersContextProvider>
          </SuppliersContextProvider>
        </ContextProvider>
      </AuthContextProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root'),
);
