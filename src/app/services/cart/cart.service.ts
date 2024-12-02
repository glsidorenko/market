import { computed, Injectable, signal, WritableSignal, Signal } from '@angular/core';
import { CartItem, Product } from '../../types';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly cart: WritableSignal<CartItem[]> = signal([]);
  private readonly totalCartPrice = computed(() => this.calcTotalCartPrice());

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

  getCart(): Signal<CartItem[]> {
    return computed(() => this.cart());
  } 

  calcTotalCartPrice(): number {
    return this.cart().reduce((sum, {count, price, salePrice}) => {
      return salePrice ? sum + count * salePrice : sum + count * price;
    }, 0)
  }

  getTotalCartPrice() {
    return this.totalCartPrice;
  } 

  calcTotalCartQuantity() {
    return this.cart().reduce((sum, { count }) => {
      return sum + count;
    }, 0)
  }

  getCartCounter() {
    return computed(() => this.calcTotalCartQuantity());
  }
}
