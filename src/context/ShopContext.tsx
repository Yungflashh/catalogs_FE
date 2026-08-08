import {
  createContext, useContext, useState, useCallback, useEffect, ReactNode,
} from 'react';
import { Cart, Wishlist } from '../types';
import { cartApi, wishlistApi } from '../api/services';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface ShopCtx {
  cart: Cart | null;
  wishlist: Wishlist | null;
  cartCount: number;
  wishlistCount: number;
  refresh: () => Promise<void>;
  addToCart: (productId: string, qty?: number) => Promise<void>;
  updateCart: (productId: string, qty: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  cartQuantity: (productId: string) => number;
}

const Ctx = createContext<ShopCtx | undefined>(undefined);

export const useShop = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useShop must be used within ShopProvider');
  return ctx;
};

export const ShopProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { notify } = useToast();
  const [cart, setCart] = useState<Cart | null>(null);
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setCart(null);
      setWishlist(null);
      return;
    }
    try {
      const [c, w] = await Promise.all([cartApi.get(), wishlistApi.get()]);
      setCart(c);
      setWishlist(w);
    } catch {
      /* ignore */
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addToCart = useCallback(
    async (productId: string, qty = 1) => {
      if (!user) {
        notify('Please sign in to add items', 'error');
        return;
      }
      try {
        const c = await cartApi.add(productId, qty);
        setCart(c);
        notify('Added to cart');
      } catch (e) {
        notify((e as Error).message, 'error');
      }
    },
    [user, notify]
  );

  const updateCart = useCallback(async (productId: string, qty: number) => {
    try {
      const c = await cartApi.update(productId, qty);
      setCart(c);
    } catch (e) {
      notify((e as Error).message, 'error');
    }
  }, [notify]);

  const removeFromCart = useCallback(async (productId: string) => {
    try {
      const c = await cartApi.remove(productId);
      setCart(c);
      notify('Removed from cart');
    } catch (e) {
      notify((e as Error).message, 'error');
    }
  }, [notify]);

  const clearCart = useCallback(async () => {
    try {
      await cartApi.clear();
      setCart((prev) => (prev ? { ...prev, items: [] } : prev));
    } catch (e) {
      notify((e as Error).message, 'error');
    }
  }, [notify]);

  const isWishlisted = useCallback(
    (productId: string) => !!wishlist?.products.some((p) => p._id === productId),
    [wishlist]
  );

  const cartQuantity = useCallback(
    (productId: string) => cart?.items.find((i) => i.product._id === productId)?.quantity || 0,
    [cart]
  );

  const toggleWishlist = useCallback(
    async (productId: string) => {
      if (!user) {
        notify('Please sign in to save items', 'error');
        return;
      }
      try {
        if (isWishlisted(productId)) {
          const w = await wishlistApi.remove(productId);
          setWishlist(w);
          notify('Removed from wishlist');
        } else {
          const w = await wishlistApi.add(productId);
          setWishlist(w);
          notify('Saved to wishlist');
        }
      } catch (e) {
        notify((e as Error).message, 'error');
      }
    },
    [user, isWishlisted, notify]
  );

  const cartCount = cart?.items.reduce((s, i) => s + i.quantity, 0) || 0;
  const wishlistCount = wishlist?.products.length || 0;

  return (
    <Ctx.Provider
      value={{
        cart, wishlist, cartCount, wishlistCount, refresh,
        addToCart, updateCart, removeFromCart, clearCart,
        toggleWishlist, isWishlisted, cartQuantity,
      }}
    >
      {children}
    </Ctx.Provider>
  );
};
