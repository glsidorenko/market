import { Component, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { CardComponent } from '../../ui/card/card.component';
import { products} from '../../products';
import { CartService } from '../../services/cart/cart.service';
import { Product } from '../../types';
import { SliderComponent } from '../../ui/slider/slider.component';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [CardComponent, SliderComponent],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css'
})
export class MainPageComponent {
  products: WritableSignal<Product[]> = signal(products);
  itemsPerPage: WritableSignal<number> = signal(10);
  currentPage: WritableSignal<number> = signal(1);
  totalCount: Signal<number> = computed(() => this.products.length);

  cartService = inject(CartService);

  visibleItems: Signal<Product[]> = computed(() => {
    const items = this.products();
    const count = this.itemsPerPage();
    const page = this.currentPage();

    return items.slice( (page - 1) * count, count);
  })
}

