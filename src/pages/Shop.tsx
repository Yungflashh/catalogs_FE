import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product } from '../types';
import { productApi } from '../api/services';
import ProductCard from '../components/ProductCard';
import { Loader, EmptyState } from '../components/Shared';
import { SearchIcon } from '../components/Icons';
import './Shop.css';

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const keyword = params.get('keyword') || '';
  const category = params.get('category') || 'all';
  const sort = params.get('sort') || 'newest';
  const page = Number(params.get('page')) || 1;
  const pageSize = 12;

  const [searchInput, setSearchInput] = useState(keyword);

  useEffect(() => { setSearchInput(keyword); }, [keyword]);

  useEffect(() => {
    productApi.categories().then(setCategories).catch(() => {});
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    productApi
      .list({ keyword, category, sort, page, pageSize })
      .then((res) => {
        setProducts(res.products);
        setPages(res.pages);
        setTotal(res.total);
      })
      .finally(() => setLoading(false));
  }, [keyword, category, sort, page]);

  useEffect(() => { load(); }, [load]);

  const update = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => {
      if (!v || v === 'all' || v === 'newest') next.delete(k);
      else next.set(k, v);
    });
    if (!('page' in patch)) next.delete('page');
    setParams(next);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    update({ keyword: searchInput.trim() });
  };

  const startItem = total > 0 ? (page - 1) * pageSize + 1 : 0;
  const endItem = Math.min(page * pageSize, total);

  return (
    <div className="shop-wrap">
      {/* Banner */}
      <div className="shop-banner">
        <div className="shop-banner-glow" />
        <div className="container shop-banner-inner">
          <div className="shop-banner-text fade-up">
            <h1 className="shop-title">
              Explore our <span className="text-grad">Store</span>
            </h1>
            <p className="shop-subtitle">
              {total} log{total !== 1 ? 's' : ''}
              {category !== 'all' ? ` in ${category}` : ' across all categories'}
            </p>
          </div>
          <form className="shop-search fade-up" onSubmit={submitSearch}>
            <SearchIcon size={16} />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search logs..."
            />
            {searchInput && (
              <button
                type="button"
                className="shop-search-clear"
                onClick={() => { setSearchInput(''); update({ keyword: '' }); }}
              >×</button>
            )}
          </form>
        </div>
      </div>

      <div className="container">
        {/* Toolbar */}
        <div className="shop-toolbar fade-up">
          <div className="chip-row">
            <button
              className={`chip ${category === 'all' ? 'on' : ''}`}
              onClick={() => update({ category: 'all' })}
            >All</button>
            {categories.map((c) => (
              <button
                key={c}
                className={`chip ${category === c ? 'on' : ''}`}
                onClick={() => update({ category: c })}
              >{c}</button>
            ))}
          </div>

          <div className="shop-actions">
            <select
              className="select shop-sort"
              value={sort}
              onChange={(e) => update({ sort: e.target.value })}
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="rating">Top Rated</option>
            </select>

            <div className="view-toggle">
              <button
                className={`view-btn ${view === 'grid' ? 'on' : ''}`}
                onClick={() => setView('grid')}
                aria-label="Grid view"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <rect x="0.5" y="0.5" width="6" height="6" rx="1.5" fill="currentColor"/>
                  <rect x="8.5" y="0.5" width="6" height="6" rx="1.5" fill="currentColor"/>
                  <rect x="0.5" y="8.5" width="6" height="6" rx="1.5" fill="currentColor"/>
                  <rect x="8.5" y="8.5" width="6" height="6" rx="1.5" fill="currentColor"/>
                </svg>
              </button>
              <button
                className={`view-btn ${view === 'list' ? 'on' : ''}`}
                onClick={() => setView('list')}
                aria-label="List view"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <rect x="0.5" y="1" width="14" height="2.5" rx="1.25" fill="currentColor"/>
                  <rect x="0.5" y="6.25" width="14" height="2.5" rx="1.25" fill="currentColor"/>
                  <rect x="0.5" y="11.5" width="14" height="2.5" rx="1.25" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {!loading && total > 0 && (
          <p className="shop-results-info">
            Showing {startItem}–{endItem} of {total} result{total !== 1 ? 's' : ''}
            {keyword && <> for <em>"{keyword}"</em></>}
          </p>
        )}

        {loading ? (
          <Loader />
        ) : products.length === 0 ? (
          <EmptyState
            title="No logs found"
            subtitle="Try a different keyword, country, or category."
            action={{ label: 'Clear filters', to: '/shop' }}
          />
        ) : (
          <>
            <div className={view === 'list' ? 'shop-list' : 'grid-products'}>
              {products.map((p) => (
                <ProductCard key={p._id} product={p} listView={view === 'list'} />
              ))}
            </div>
            {pages > 1 && (
              <div className="pager">
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={page <= 1}
                  onClick={() => update({ page: String(page - 1) })}
                >← Prev</button>
                <div className="pager-pages">
                  {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      className={`pager-num ${n === page ? 'on' : ''}`}
                      onClick={() => update({ page: String(n) })}
                    >{n}</button>
                  ))}
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={page >= pages}
                  onClick={() => update({ page: String(page + 1) })}
                >Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
