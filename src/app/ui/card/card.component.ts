import { ChangeDetectionStrategy, Component, Signal, inject, input  } from '@angular/core';
import { Product } from '../../types';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../../services/cart/cart.service';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {
  card: Signal<Product> = input.required();
  cartService = inject(CartService);

  addProduct(product: Product): void {
    this.cartService.addItemToCart(product);
    // this.cartService.updateCartTotalPrice(product.price);
  }
}
