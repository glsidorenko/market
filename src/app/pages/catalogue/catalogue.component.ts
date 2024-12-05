import {
  Component,
  computed,
  signal,
  WritableSignal,
  effect,
  inject
} from '@angular/core';
import { products } from '../../products';
import { CardComponent } from '../../ui/card/card.component';
import { NumberToArrayPipe } from '../../number-to-array.pipe';
import { Product } from '../../types';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { CartService } from '../../services/cart/cart.service';
import { coerceProductPrice, filterNilValue } from '../../core-operators/operators';
import { PaginationComponent } from '../../ui/pagination/pagination.component';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [CardComponent, NumberToArrayPipe, ReactiveFormsModule, PaginationComponent],
  templateUrl: './catalogue.component.html',
  styleUrl: './catalogue.component.css'
})

export class CatalogueComponent {
  // cartService = inject(CartService);

  products: WritableSignal<Product[]> = signal(products);

  searchProduct = new FormControl<string>('');

  selectedValue = new FormControl<string>({value: 'default', disabled: false}, {
    nonNullable: true,
    validators: [Validators.required]
  }); // сделать enable effect sortingStageChangeEffect

  productsPerPage = new FormControl<number>(10, {nonNullable: true});

  protected readonly sortingStateChangeEffect = effect(() => {
    const totalCount = this.searchedItems().length;

    if(!totalCount) {
      this.selectedValue.disable();

      return;
    }

    this.selectedValue.enable();
  })

  searchValueChangeSignal = toSignal(
    this.searchProduct.valueChanges.pipe(
      filterNilValue(),
      debounceTime(300),
      distinctUntilChanged(),
    )
  );

  sortValueChangeSignal = toSignal(
    this.selectedValue.valueChanges.pipe(
      filterNilValue(),
      debounceTime(300),
      distinctUntilChanged(),
    ), {initialValue: 'default'}
  );

  searchedItems = computed(() => {
    const search = this.searchValueChangeSignal();
    const items = this.products();
    const sort = this.sortValueChangeSignal();

    const filteredItems = items.filter(item => {
      if (!search) {
        return true;
      }

      return item.title.toLowerCase().includes(search.toLowerCase());
    });

    return this.processSortCondition(filteredItems, sort, 'salePrice');
  });

  private processSortCondition<T extends Product>(items: T[], sort: string, saleKey: keyof T): T[] {
    switch (sort) {
      case 'sale' : {
        return items.filter((value) => !!value[saleKey]);
      }
      case 'sortAsc' : {
        return items.sort((a, b) => coerceProductPrice(a) - coerceProductPrice(b));
      }

      case 'sortDecs' : {
        return items.sort((a, b) => coerceProductPrice(b) - coerceProductPrice(a));
      }

      case 'sortNameAsc': {
        return items.sort((a, b) => a.title.localeCompare(b.title));
      }

      case 'sortNameDesc': {
        return items.sort((a, b) => b.title.localeCompare(a.title));
      }

      default: {
        return items;
      }
    }
  }

  constructor() {}
}

