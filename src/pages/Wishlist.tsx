import { useShop } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';
import { EmptyState } from '../components/Shared';

export default function Wishlist() {
  const { wishlist } = useShop();
  const products = wishlist?.products || [];

  return (
    <div className="page-wrap">
      <div className="container">
        <h1 className="page-title" style={{ marginBottom: 8 }}>Your wishlist</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.92rem', marginBottom: 28 }}>
          {products.length} {products.length === 1 ? 'item' : 'items'} saved
        </p>
        {products.length === 0 ? (
          <EmptyState
            title="No saved items yet"
            subtitle="Tap the heart on any product to save it here."
            action={{ label: 'Explore products', to: '/shop' }}
          />
        ) : (
          <div className="grid-products">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
