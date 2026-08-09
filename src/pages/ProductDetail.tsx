import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Product } from '../types';
import { productApi } from '../api/services';
import { useShop } from '../context/ShopContext';
import { Loader, EmptyState } from '../components/Shared';
import ProductCard from '../components/ProductCard';
import { CartIcon, HeartIcon, StarIcon, ArrowRight } from '../components/Icons';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, updateCart, removeFromCart, cartQuantity, toggleWishlist, isWishlisted } = useShop();
  const [product, setProduct] = useState<Product | null>(null);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setNotFound(false);
    setSimilar([]);
    productApi.get(id)
      .then((p) => {
        setProduct(p);
        setActive(0);
        productApi.similar(id).then(setSimilar).catch(() => {});
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (notFound || !product)
    return <div className="container"><EmptyState title="Product not found" subtitle="This item may have been removed." action={{ label: 'Back to shop', to: '/shop' }} /></div>;

  const saved = isWishlisted(product._id);
  const out = product.stock <= 0;
  const images = product.images.length ? product.images : [`https://picsum.photos/seed/${product._id}/700/700`];
  const qty = cartQuantity(product._id);

  return (
    <div className="container pd-wrap">
      <div className="pd-crumbs">
        <Link to="/shop">Shop</Link> <ArrowRight size={13} /> <span>{product.category}</span>
      </div>

      <div className="pd-grid fade-up">
        <div className="pd-gallery">
          <div className="pd-main glass">
            <img src={images[active]} alt={product.name} />
            {product.featured && <span className="badge badge-violet pd-feat">Featured</span>}
          </div>
          {images.length > 1 && (
            <div className="pd-thumbs">
              {images.map((img, i) => (
                <button key={i} className={`pd-thumb ${i === active ? 'on' : ''}`} onClick={() => setActive(i)}>
                  <img src={img} alt={`${product.name} view ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pd-info">
          <span className="pd-cat">{product.category} · {product.brand}</span>
          <h1>{product.name}</h1>
          <div className="pd-rating">
            {[1, 2, 3, 4, 5].map((n) => (
              <StarIcon key={n} size={16} filled={n <= Math.round(product.rating)} />
            ))}
            <span>{product.rating > 0 ? `${product.rating.toFixed(1)} (${product.numReviews})` : 'No reviews yet'}</span>
          </div>

          <div className="pd-price">${product.price.toFixed(2)}</div>

          <p className="pd-desc">{product.description}</p>

          <div className="pd-stock">
            {out ? <span className="badge badge-danger">Out of stock</span>
              : product.stock <= 5 ? <span className="badge badge-warning">Only {product.stock} left</span>
              : <span className="badge badge-success">In stock</span>}
          </div>

          <div className="pd-actions">
            {!out && (
              qty > 0 ? (
                <div className="pd-qty-ctrl">
                  <button className="pd-qty-btn" onClick={() => qty === 1 ? removeFromCart(product._id) : updateCart(product._id, qty - 1)}>−</button>
                  <span className="pd-qty-val">{qty}</span>
                  <button className="pd-qty-btn" onClick={() => updateCart(product._id, qty + 1)}>+</button>
                </div>
              ) : (
                <button className="btn btn-primary" onClick={() => addToCart(product._id)}>
                  <CartIcon size={18} /> Add to cart
                </button>
              )
            )}
            <button className={`btn btn-ghost ${saved ? 'pd-saved' : ''}`}
              onClick={() => toggleWishlist(product._id)}>
              <HeartIcon size={18} filled={saved} /> {saved ? 'Saved' : 'Save'}
            </button>
            <button className="btn btn-ghost" disabled={out}
              onClick={() => { if (qty === 0) addToCart(product._id); navigate('/cart'); }}>
              Buy now
            </button>
          </div>
        </div>
      </div>
      {similar.length > 0 && (
        <div className="pd-similar">
          <h2 className="pd-similar-title">Similar logs</h2>
          <div className="grid-products">
            {similar.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
