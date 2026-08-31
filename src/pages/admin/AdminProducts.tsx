import { useEffect, useState, useCallback, useRef } from 'react';
import { Product } from '../../types';
import { productApi, uploadApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Shared';
import AdminLayout from './AdminLayout';
import { PlusIcon, EditIcon, TrashIcon, CloseIcon } from '../../components/Icons';

interface FormState {
  name: string; description: string; price: string; category: string;
  brand: string; stock: string; featured: boolean; images: string[];
  rating: string; numReviews: string;
}

const empty: FormState = {
  name: '', description: '', price: '', category: '', brand: '',
  stock: '', featured: false, images: [''],
  rating: '', numReviews: '',
};

export default function AdminProducts() {
  const { notify } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  const load = useCallback(() => {
    setLoading(true);
    productApi.list({ pageSize: 100 }).then((r) => setProducts(r.products)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description, price: String(p.price),
      category: p.category, brand: p.brand, stock: String(p.stock),
      featured: p.featured, images: p.images.length ? p.images : [''],
      rating: String(p.rating ?? ''), numReviews: String(p.numReviews ?? ''),
    });
    setModal(true);
  };

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));
  const setImage = (i: number, v: string) =>
    setForm((f) => ({ ...f, images: f.images.map((im, idx) => idx === i ? v : im) }));
  const addImage = () => setForm((f) => ({ ...f, images: [...f.images, ''] }));
  const removeImage = (i: number) =>
    setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

  const handleFileUpload = async (i: number, file: File) => {
    setUploadingIdx(i);
    try {
      const url = await uploadApi.image(file);
      setImage(i, url);
      notify('Image uploaded');
    } catch (err) {
      notify((err as Error).message, 'error');
    } finally {
      setUploadingIdx(null);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const ratingNum = form.rating.trim() === '' ? 0 : Math.min(5, Math.max(0, Number(form.rating)));
    const reviewsNum = form.numReviews.trim() === '' ? 0 : Math.max(0, Math.floor(Number(form.numReviews)));
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      category: form.category,
      brand: form.brand || 'Generic',
      stock: Number(form.stock),
      featured: form.featured,
      images: form.images.map((i) => i.trim()).filter(Boolean),
      rating: ratingNum,
      numReviews: reviewsNum,
    };
    try {
      if (editing) {
        await productApi.update(editing._id, payload);
        notify('Product updated');
      } else {
        await productApi.create(payload);
        notify('Product created');
      }
      setModal(false);
      load();
    } catch (err) {
      notify((err as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    try {
      await productApi.remove(p._id);
      notify('Product deleted');
      load();
    } catch (err) {
      notify((err as Error).message, 'error');
    }
  };

  return (
    <AdminLayout title="Products" action={
      <button className="btn btn-primary" onClick={openNew}><PlusIcon size={17} /> Add product</button>
    }>
      {loading ? <Loader /> : (
        <div className="admin-panel glass admin-table-wrap fade-up">
          <table className="admin-table">
            <thead>
              <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Featured</th><th></th></tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="tbl-prod">
                      <img className="tbl-thumb" src={p.images[0] || `https://picsum.photos/seed/${p._id}/80/80`} alt={p.name} />
                      <span className="tbl-prod-name">{p.name}</span>
                    </div>
                  </td>
                  <td>{p.category}</td>
                  <td>${p.price.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${p.stock === 0 ? 'badge-danger' : p.stock <= 5 ? 'badge-warning' : 'badge-success'}`}>{p.stock}</span>
                  </td>
                  <td>{p.featured ? <span className="badge badge-violet">Yes</span> : <span style={{ color: 'var(--text-faint)' }}>—</span>}</td>
                  <td>
                    <div className="tbl-actions">
                      <button className="icon-action" onClick={() => openEdit(p)} aria-label="Edit"><EditIcon size={15} /></button>
                      <button className="icon-action danger" onClick={() => remove(p)} aria-label="Delete"><TrashIcon size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-faint)', padding: 30 }}>No products yet. Add your first one.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>{editing ? 'Edit product' : 'New product'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}><CloseIcon size={22} /></button>
            </div>
            <form onSubmit={save}>
              <div className="field">
                <label>Name</label>
                <input className="input" required value={form.name} onChange={(e) => setField('name', e.target.value)} />
              </div>
              <div className="field">
                <label>Description</label>
                <textarea className="textarea" required value={form.description} onChange={(e) => setField('description', e.target.value)} />
              </div>
              <div className="form-row">
                <div className="field">
                  <label>Price ($)</label>
                  <input className="input" type="number" step="0.01" min="0" required value={form.price} onChange={(e) => setField('price', e.target.value)} />
                </div>
                <div className="field">
                  <label>Stock</label>
                  <input className="input" type="number" min="0" required value={form.stock} onChange={(e) => setField('stock', e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="field">
                  <label>Category</label>
                  <input className="input" required value={form.category} onChange={(e) => setField('category', e.target.value)} placeholder="e.g. Audio" />
                </div>
                <div className="field">
                  <label>Brand</label>
                  <input className="input" value={form.brand} onChange={(e) => setField('brand', e.target.value)} placeholder="e.g. Aurora" />
                </div>
              </div>

              <div className="form-row">
                <div className="field">
                  <label>Rating (0–5)</label>
                  <input
                    className="input"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={form.rating}
                    onChange={(e) => setField('rating', e.target.value)}
                    placeholder="e.g. 4.7"
                  />
                </div>
                <div className="field">
                  <label>Number of reviews</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="1"
                    value={form.numReviews}
                    onChange={(e) => setField('numReviews', e.target.value)}
                    placeholder="e.g. 128"
                  />
                </div>
              </div>

              <div className="field">
                <label>Images</label>
                <div className="img-inputs">
                  {form.images.map((img, i) => (
                    <div className="img-input-row" key={i}>
                      <input
                        className="input"
                        value={uploadingIdx === i ? 'Uploading...' : img}
                        onChange={(e) => setImage(i, e.target.value)}
                        placeholder="Paste URL or upload a file →"
                        disabled={uploadingIdx === i}
                      />
                      {/* Hidden file input */}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        ref={(el) => { fileRefs.current[i] = el; }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(i, file);
                          e.target.value = '';
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                        disabled={uploadingIdx !== null}
                        onClick={() => fileRefs.current[i]?.click()}
                        title="Upload image file"
                      >
                        {uploadingIdx === i ? '...' : '↑ Upload'}
                      </button>
                      {form.images.length > 1 && (
                        <button type="button" className="icon-action danger" onClick={() => removeImage(i)}><CloseIcon size={16} /></button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={addImage}>
                  <PlusIcon size={15} /> Add image
                </button>
                {form.images.some((i) => i.trim()) && (
                  <div className="img-preview-row">
                    {form.images.filter((i) => i.trim()).map((img, i) => (
                      <img key={i} className="img-preview" src={img} alt="preview" onError={(e) => ((e.target as HTMLImageElement).style.opacity = '0.3')} />
                    ))}
                  </div>
                )}
              </div>

              <label className="checkbox-field">
                <input type="checkbox" checked={form.featured} onChange={(e) => setField('featured', e.target.checked)} />
                Mark as featured
              </label>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button className="btn btn-primary" disabled={saving || uploadingIdx !== null}>
                  {saving ? 'Saving...' : editing ? 'Save changes' : 'Create product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
