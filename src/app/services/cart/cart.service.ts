import { computed, Injectable, signal, WritableSignal, Signal } from '@angular/core';
import { CartItem, Product } from '../../types';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly cartCounter: WritableSignal<number> = signal(0);
  private readonly cart: WritableSignal<CartItem[]> = signal([]);
  private readonly cartTotalPrice: WritableSignal<number> = signal(0);

  // public logCart: EffectRef = effect(() => console.log("counter", this.cartCounter()));
  // public logCart1: EffectRef = effect(() => console.log("cart", this.cart()));

  private isItemExists(product: Product): boolean {
    return this.cart().some(item => item.id === product.id);
  }

  addItemToCart(product: Product): void {
    if (this.isItemExists(product)) {
      this.cart.update((cart) => {
        return cart.map((item) => {
          if(item.id === product.id) {
            return {...item, count: item.count + 1 }
          }
          return item;
        })
      })
      return
    }
    this.cart.update((cart) => [...cart, {...product, count: 1}]);
  }

  decreaseCartItemQuantity(product: CartItem): void {
    this.cart.update((cart) => {
      return cart.map((item) => {
        if (item.id === product.id) {
          return { ...item, count: item.count - 1 }
        }
        return item;
      });
    });
  }

  deleteItemFromCart(product: CartItem): void {
    this.cart.update((cart) => {
      return cart.filter((item) => {
        if (item.id === product.id) {
          return;
        }
        return item;
      });
    })
  }

  getCart(): Signal<CartItem[]> {
    return computed(() => this.cart());
  } 

  calcTotalCartPrice(): number {
    return this.cart().reduce((sum, {count, price, salePrice}) => {
      return salePrice ? sum + count * salePrice : sum + count * price;
    }, 0)
  }

  clearCart() {
    this.cart.update(() => []);

    this.cartCounter.set(0);
  }

  getTotalCartPrice() {
    return computed(() => this.calcTotalCartPrice());
  } 

  calcTotalCartQuantity() {
    return this.cart().reduce((sum, { count }) => {
      return sum + count;
    }, 0)
  }

  getCartCounter() {
    return computed(() => this.calcTotalCartQuantity());
  }

  updateCartTotalPrice(totalPrice: number): void {
    this.cartTotalPrice.set(totalPrice);
  }

}
