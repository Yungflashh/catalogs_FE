import { useShop } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';
import { EmptyState } from '../components/Shared';
import './Landing.css';

export default function Wishlist() {
  const { wishlist } = useShop();
  const products = wishlist?.products || [];

  return (
    <div className="container" style={{ padding: '40px 0 20px' }}>
      <h1 className="page-title" style={{ marginBottom: 24 }}>Your wishlist</h1>
      {products.length === 0 ? (
        <EmptyState title="No saved items yet" subtitle="Tap the heart on any product to save it here."
          action={{ label: 'Explore products', to: '/shop' }} />
      ) : (
        <div className="grid-products">
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
