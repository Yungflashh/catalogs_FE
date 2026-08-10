import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { EmptyState } from '../components/Shared';
import { TrashIcon, ArrowRight } from '../components/Icons';
import './Cart.css';

export default function Cart() {
  const { cart, updateCart, removeFromCart, clearCart } = useShop();
  const navigate = useNavigate();

  const items = cart?.items || [];
  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  if (items.length === 0)
    return (
      <div className="container">
        <div className="cart-empty-wrap">
          <h1 className="page-title">Your cart</h1>
          <EmptyState title="Your cart is empty" subtitle="Browse the shop and add something you love."
            action={{ label: 'Start shopping', to: '/shop' }} />
        </div>
      </div>
    );

  return (
    <div className="container">
      <div className="cart-wrap">
        <div className="cart-head">
          <div>
            <h1 className="page-title">Your cart</h1>
            <p className="cart-count">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={clearCart}>Clear cart</button>
        </div>

        <div className="cart-grid">
          {/* Items */}
          <div className="cart-items">
            {items.map((item) => {
              const img = item.product.images[0] || `https://picsum.photos/seed/${item.product._id}/300/300`;
              return (
                <div key={item.product._id} className="cart-item glass fade-up">
                  <Link to={`/product/${item.product._id}`} className="cart-thumb">
                    <img src={img} alt={item.product.name} />
                  </Link>

                  <div className="cart-item-body">
                    <div className="cart-item-top">
                      <div className="cart-item-info">
                        <span className="cart-item-cat">{item.product.category} · {item.product.brand}</span>
                        <Link to={`/product/${item.product._id}`} className="cart-item-name">
                          {item.product.name}
                        </Link>
                        <span className="cart-item-unit">${item.product.price.toFixed(2)} each</span>
                      </div>
                      <button className="cart-remove" onClick={() => removeFromCart(item.product._id)} aria-label="Remove">
                        <TrashIcon size={16} />
                      </button>
                    </div>

                    <div className="cart-item-foot">
                      <div className="qty-ctrl">
                        <button
                          className="qty-btn"
                          onClick={() => item.quantity <= 1 ? removeFromCart(item.product._id) : updateCart(item.product._id, item.quantity - 1)}
                        >−</button>
                        <span className="qty-val">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          disabled={item.quantity >= item.product.stock}
                          onClick={() => updateCart(item.product._id, item.quantity + 1)}
                        >+</button>
                      </div>
                      <span className="cart-item-price">${(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <aside className="cart-summary glass fade-up">
            <h3 className="cart-summary-title">Order summary</h3>

            <div className="sum-rows">
              <div className="sum-row">
                <span>Items ({itemCount})</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="sum-row">
                <span>Delivery</span>
                <span className="badge badge-green">Digital — instant</span>
              </div>
            </div>

            <div className="sum-divider" />

            <div className="sum-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button className="btn btn-primary btn-block sum-cta" onClick={() => navigate('/checkout')}>
              Checkout <ArrowRight size={17} />
            </button>
            <Link to="/shop" className="cart-continue">Continue shopping</Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
