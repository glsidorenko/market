import { Component, inject, Signal } from '@angular/core';
import { CartService } from '../../services/cart/cart.service';
import { CartItem } from '../../types';


@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {
  cartService = inject(CartService);
  cart: Signal<CartItem[]> = this.cartService.getCart();
  cartTotalPrice = this.cartService.getTotalCartPrice(); 

  addItem(cartItem: CartItem): void {
    // console.log(cartItem);
    this.cartService.addItemToCart(cartItem)
  }

  deleteItem(cartItem: CartItem): void {
    if(cartItem.count === 1) {
      this.cartService.deleteItemFromCart(cartItem);
    } 
    this.cartService.decreaseCartItemQuantity(cartItem);
  }
}
