import { Component, computed, Inject, PLATFORM_ID, Signal, signal, WritableSignal, effect, inject } from '@angular/core';
import { products } from '../../products';
import { CardComponent } from '../../ui/card/card.component';
import { NumberToArrayPipe } from "../../number-to-array.pipe";
import { Product } from '../../types';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { combineLatest, debounceTime, distinctUntilChanged, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CartService } from '../../services/cart/cart.service';
import { coerceProductPrice, filterNilValue } from '../../core-operators/operators';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [CardComponent, NumberToArrayPipe, ReactiveFormsModule],
  templateUrl: "./catalogue.component.html",
  styleUrl: './catalogue.component.css'
})

export class CatalogueComponent {
  cartService = inject(CartService);
  products: WritableSignal<Product[]> = signal(products);
  itemsPerPage: WritableSignal<number> = signal(10);
  currentPage: WritableSignal<number> = signal(1);
  isSearched: WritableSignal<boolean> = signal(false);
  searchedItems: WritableSignal<Product[]> = signal([]);
  searchProduct$  = new FormControl<string>('');
  selectedValue$ = new FormControl<string>({value: 'default', disabled: false}, Validators.required); // сделать enable effect sortingStageChangeEffect
  productsPerPage$ = new FormControl<number>(10);

  srx = combineLatest([this.searchProduct$.valueChanges, this.selectedValue$.valueChanges]).subscribe(console.log)

  totalCount: Signal<number> = computed(() => {
    return this.searchedItems().length > 0 ? this.searchedItems().length : this.products().length;
  })

  visibleItems: Signal<Product[]> = computed(() => {
    const items = this.products();
    const perPage = this.itemsPerPage();
    const page = this.currentPage();
    const searchedItems = this.searchedItems();
    const isSearched = this.isSearched();

    function transformArray(array: Product[]) {
      return array.slice((page - 1) * perPage, perPage * page);
    }

    while (searchedItems.length > 0) {
      return transformArray(searchedItems);
    }

    if (searchedItems.length === 0 && isSearched) {
      return [];
    }

    return transformArray(items);
  })

  constructor(@Inject(PLATFORM_ID) public platformId: string) {
    this.searchProduct$.valueChanges.pipe(
        filterNilValue(),
        debounceTime(300),
        distinctUntilChanged(),
        tap(search => {

          const arr = this.searchedItems().length > 0 ? this.searchedItems() : this.products();
          const x  = this.products();

          this.selectedValue$.enable();
          this.isSearched.set(true);
          this.searchedItems.set(x.filter(item => item.title.toLowerCase().includes(search.toLowerCase())))

          if (!search) { // пустой поиск
            this.isSearched.set(false);
            this.searchedItems.set([]);
          } 
          // if (search && !this.searchedItems().length) { // если не нашло
          //   this.selectedValue$.disable();
          // }
        }),
        takeUntilDestroyed(),
    ).subscribe();

    this.selectedValue$.valueChanges.pipe(
      filterNilValue(),
      debounceTime(300),
      distinctUntilChanged(),
      tap((value) => {
        const arr = this.searchedItems().length > 0 ? this.searchedItems() : this.products();
        
        switch(value) {
          case 'sale' : {
            return this.searchedItems.set(arr.filter((value) => value.salePrice))
          }
          case 'sortAsc' : {
            return this.searchedItems.set([...arr].sort((a, b) => coerceProductPrice(a) - coerceProductPrice(b)))
          }
          case 'sortDecs' : {
            return this.searchedItems.set([...arr].sort((a, b) => coerceProductPrice(b) - coerceProductPrice(a)))
          }
        }
      }),
      takeUntilDestroyed()
    ).subscribe()

    this.productsPerPage$.valueChanges.pipe(
      filterNilValue(),
      tap(value => {
        this.itemsPerPage.set(value)
      }),
      takeUntilDestroyed()
    ).subscribe()

    // effect(() => console.log({
    //   visibleItems: this.visibleItems(),
    //   searchedItems: this.searchedItems(),
    //   isSearched: this.isSearched(),
    // }));
  }

  pageCount: Signal<number> = computed(() => {
    const count = this.itemsPerPage();
    const total = this.totalCount();
    return Math.ceil(total / count);
  })

  nextPage(): void {
    const isLastPage = this.isLastPage();
    if (isLastPage) {
      return
    }
    this.currentPage.update((val: number) => val + 1);
  }

  previousPage(): void {
    const isFirstPage = this.isFirstPage();

    if (isFirstPage) {
      return
    }

    this.currentPage.update((val: number) => val - 1);
  }

  isFirstPage: Signal<boolean> = computed(() => {
    const currentPage = this.currentPage();
    return currentPage === 1;
  })

  isLastPage: Signal<boolean> = computed(() => {
    const pageCount = this.pageCount();
    const currentPage = this.currentPage();

    return pageCount === currentPage;
  })

  updateCurrentPage(page: number): void {
    this.currentPage.set(page);
  }
}

