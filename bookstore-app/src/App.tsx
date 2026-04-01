/** App shell: cart provider, routes for catalog, admin CRUD, and cart. */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import Layout from './components/Layout';
import BookList from './components/BookList';
import AdminBooks from './components/AdminBooks';
import ShoppingCart from './components/ShoppingCart';
import './App.css';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<BookList />} />
            <Route path="adminbooks" element={<AdminBooks />} />
            <Route path="cart" element={<ShoppingCart />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
