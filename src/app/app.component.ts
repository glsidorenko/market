import { ChangeDetectionStrategy, Component, inject, Signal} from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CartService } from './services/cart/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [CartService],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AppComponent {
  cartService = inject(CartService);
  cartQuantity: Signal<number> = this.cartService.getCartCounter();  
}
