import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FiSettings } from 'react-icons/fi';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';

import { Navbar, Footer, Sidebar, ThemeSettings } from './components';
import { Ecommerce, Articles, Calendar, Buyers, Suppliers, Kanban, Bar } from './pages';
import './App.css';
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import EmailConfirmation from './pages/auth/EmailConfirmation';
import ResetPassword from './pages/auth/ResetPassword'
import VerifyOTP from './pages/auth/VerifyOTP'
import UpdateSupplier from './pages/UpdateSupplier'
import AddArticle from './pages/AddArticle'
import ArticlesList from './pages/ArticlesList';
import ArticlesHome from './pages/ArticlesHome';

import { useStateContext } from './contexts/ContextProvider';
import { useAuthContext } from './hooks/useAuthContext'


const App = () => {
  const { setCurrentColor, setCurrentMode, currentMode, activeMenu, currentColor, themeSettings, setThemeSettings } = useStateContext();
  const { user, dispatch, foundUser } = useAuthContext();

  useEffect(() => {
    const currentThemeColor = localStorage.getItem('colorMode');
    const currentThemeMode = localStorage.getItem('themeMode');
    const userFromLocalStorage = localStorage.getItem('rememberMe');
    if (currentThemeColor && currentThemeMode) {
      setCurrentColor(currentThemeColor);
      setCurrentMode(currentThemeMode);
    }
    if (userFromLocalStorage) {
      // Parse and dispatch the user data to restore authentication state
      const userData = JSON.parse(userFromLocalStorage);
      dispatch({ type: 'LOGIN', payload: userData });
    }
  }, [dispatch]);
  
  


  return (
    <div className={currentMode === 'Dark' ? 'dark' : ''}>
      <BrowserRouter>
        <div className="flex relative dark:bg-main-dark-bg">
          <div className="fixed right-4 bottom-4" style={{ zIndex: '1000' }}>
            <TooltipComponent
              content="Settings"
              position="Top"
            >
              <button
                type="button"
                onClick={() => setThemeSettings(true)}
                style={{ background: currentColor, borderRadius: '50%' }}
                className="text-3xl text-white p-3 hover:drop-shadow-xl hover:bg-light-gray"
              >
                <FiSettings />
              </button>

            </TooltipComponent>
          </div>
          
          {user && activeMenu ? (
            <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white ">
              <Sidebar />
            </div>
          ) : (
            <div className="w-0 dark:bg-secondary-dark-bg">
              <Sidebar />
            </div>
          )}
          <div
            className={
              activeMenu
                ? 'dark:bg-main-dark-bg  bg-main-bg min-h-screen md:ml-72 w-full  '
                : 'bg-main-bg dark:bg-main-dark-bg  w-full min-h-screen flex-2 '
            }
          >
            {user && (
            <div className="fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full ">
              <Navbar />
            </div>
             )}
            <div>
             
              {themeSettings && (<ThemeSettings />)}

              <Routes>
                {/* Authentication  */}
                <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
                <Route path="/register" element={!user ? <Register /> : <Navigate to="/login" />} />
                <Route path="/email-confirmation" element={<EmailConfirmation /> } />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-otp" element={<VerifyOTP />} />
                <Route path="/article-home" element={<ArticlesHome />} />
                <Route path="/article/:id" element={<ArticlesList />} />
                <Route
                  path="*"
                  element={
                    user ? (
                      <>
                        <Routes>
                          {/* dashboard  */}
                          
                          
                          
                          
                          {/* pages  */}
                          {/* Supplier Routes */}
                          { foundUser.roles.includes('Supplier')  && (
                            <>
                              <Route path="/" element={<Ecommerce />} />
                              <Route path="/dashboard" element={<Ecommerce />} />
                              <Route path="/fournisseurs" element={<Suppliers />} />
                              <Route path="/articles" element={<Articles />} />
                              <Route path="/update-supplier/:supplierId" element={<UpdateSupplier />} />
                              <Route path="/create-article" element={<AddArticle />} />
                             
                              
                             
                              <Route path="/kanban" element={<Kanban />} />
                              <Route path="/calendar" element={<Calendar />} />
                              <Route path="/bar" element={<Bar />} />
                              
                              
                            </>
                          )}

                          {/* Buyer Routes */}
                          { foundUser.roles.includes('Buyer')  && (
                            <>
                              <Route path="/" element={<Ecommerce />} />
                              <Route path="/dashboard" element={<Ecommerce />} />
                              <Route path="/acheteurs" element={<Buyers />} />
                              <Route path="/articles" element={<Articles />} />
                              <Route path="/kanban" element={<Kanban />} />
                              
                              <Route path="/calendar" element={<Calendar />} />
                  
                              <Route path="/bar" element={<Bar />} />
                             
                              
                            </>
                          )}
                      
                          
                        </Routes>
                      </>
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />

              </Routes>
            </div>
            <Footer />
          </div>
        </div>
      </BrowserRouter>
    </div>
  );
};

export default App;
