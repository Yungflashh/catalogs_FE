import { Link } from 'react-router-dom';
import { BadgeCheck } from 'lucide-react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { CartIcon, HeartIcon, StarIcon } from './Icons';
import './ProductCard.css';

interface Props {
  product: Product;
  listView?: boolean;
}

export default function ProductCard({ product, listView = false }: Props) {
  const { addToCart, updateCart, removeFromCart, cartQuantity, toggleWishlist, isWishlisted } = useShop();
  const saved = isWishlisted(product._id);
  const out = product.stock <= 0;
  const qty = cartQuantity(product._id);

  if (listView) {
    return (
      <div className="pcard-list glass fade-up">
        <Link to={`/product/${product._id}`} className="pcard-list-media">
          <img
            src={product.images[0] || `https://picsum.photos/seed/${product._id}/400/400`}
            alt={product.name}
            loading="lazy"
          />
          {out && <span className="pcard-out">Out of stock</span>}
        </Link>

        <div className="pcard-list-body">
          <div className="pcard-list-top">
            <span className="pcard-cat">{product.category}</span>
            <span className="pcard-verified"><BadgeCheck size={11} /> Verified</span>
            {product.featured && <span className="badge badge-violet">Featured</span>}
          </div>
          <Link to={`/product/${product._id}`} className="pcard-name pcard-list-name">{product.name}</Link>
          <div className="pcard-rating">
            <StarIcon size={13} filled />
            <span>{product.rating > 0 ? product.rating.toFixed(1) : 'New'}</span>
            <span className="pcard-brand">· {product.brand}</span>
          </div>
        </div>

        <div className="pcard-list-foot">
          <span className="pcard-price">${product.price.toFixed(2)}</span>
          <div className="pcard-list-actions">
            <button
              className={`pcard-heart pcard-heart-static ${saved ? 'on' : ''}`}
              onClick={() => toggleWishlist(product._id)}
              aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <HeartIcon size={15} filled={saved} />
            </button>
            {qty > 0 ? (
              <div className="qty-ctrl">
                <button className="qty-btn" onClick={() => qty === 1 ? removeFromCart(product._id) : updateCart(product._id, qty - 1)}>−</button>
                <span className="qty-val">{qty}</span>
                <button className="qty-btn" onClick={() => updateCart(product._id, qty + 1)}>+</button>
              </div>
            ) : (
              <button
                className="btn btn-primary btn-sm"
                disabled={out}
                onClick={() => addToCart(product._id)}
              >
                <CartIcon size={15} /> Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pcard glass fade-up">
      <Link to={`/product/${product._id}`} className="pcard-media">
        <img
          src={product.images[0] || `https://picsum.photos/seed/${product._id}/600/600`}
          alt={product.name}
          loading="lazy"
        />
        {product.featured && <span className="badge badge-violet pcard-feat">Featured</span>}
        <span className="pcard-verified pcard-verified-media"><BadgeCheck size={11} /> Verified</span>
        {out && <span className="pcard-out">Out of stock</span>}

        <button
          className={`pcard-heart ${saved ? 'on' : ''}`}
          onClick={(e) => { e.preventDefault(); toggleWishlist(product._id); }}
          aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <HeartIcon size={17} filled={saved} />
        </button>
      </Link>

      <div className="pcard-body">
        <span className="pcard-cat">{product.category}</span>
        <Link to={`/product/${product._id}`} className="pcard-name">{product.name}</Link>
        <div className="pcard-rating">
          <StarIcon size={13} filled />
          <span>{product.rating > 0 ? product.rating.toFixed(1) : 'New'}</span>
          <span className="pcard-brand">· {product.brand}</span>
        </div>
        <div className="pcard-foot">
          <span className="pcard-price">${product.price.toFixed(2)}</span>
          {qty > 0 ? (
            <div className="qty-ctrl">
              <button className="qty-btn" onClick={() => qty === 1 ? removeFromCart(product._id) : updateCart(product._id, qty - 1)}>−</button>
              <span className="qty-val">{qty}</span>
              <button className="qty-btn" onClick={() => updateCart(product._id, qty + 1)}>+</button>
            </div>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              disabled={out}
              onClick={() => addToCart(product._id)}
            >
              <CartIcon size={16} /> Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
