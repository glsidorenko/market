import { Component, computed, Inject, PLATFORM_ID, Signal, signal, WritableSignal, effect, inject } from '@angular/core';
import { products } from '../../products';
import { CardComponent } from '../../ui/card/card.component';
import { NumberToArrayPipe } from "../../number-to-array.pipe";
import { Product } from '../../types';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, OperatorFunction, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CartService } from '../../services/cart/cart.service';

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
  isProductFound: WritableSignal<boolean> = signal(false);
  isSearched: WritableSignal<boolean> = signal(false);
  isSorted: WritableSignal<boolean> = signal(false);
  searchedItems: WritableSignal<Product[]> = signal([]);

  searchProduct$  = new FormControl<string>('');
  selectedValue$ = new FormControl<string>({value: '', disabled: false}, Validators.required);
  productsPerPage$ = new FormControl<number>(10);

  totalCount: Signal<number> = computed(() => {
    return this.searchedItems().length > 0 ? this.searchedItems().length : this.products().length;
  })

  visibleItems: Signal<Product[] | undefined> = computed(() => {
    const items = this.products();
    const perPage = this.itemsPerPage();
    const page = this.currentPage();
    const isFound = this.isProductFound();
    const searchedItems = this.searchedItems();
    const isSearched = this.isSearched();

    function transformArray(array: Product[]) {
      return array.slice((page - 1) * perPage, perPage * page);
    }

    while (searchedItems.length !== 0) {
      return transformArray(searchedItems);
    }

    if(!isFound && isSearched) {
      return undefined;
    }

    return transformArray(items);
  })

  itemsArrayToShow() {
    return this.isSearched() ? this.searchedItems() : this.products();
  }

  constructor(@Inject(PLATFORM_ID) public platformId: string) {
    this.searchProduct$.valueChanges.pipe(
        filterNilValue(),
        debounceTime(300),
        distinctUntilChanged(),
        tap(search => {
          this.selectedValue$.enable();
          this.isSearched.set(true);
          this.isProductFound.set(true);
          this.searchedItems.set(this.products().filter(item => item.title.toLowerCase().includes(search.toLowerCase())))
        }),
        tap(search => {
          if (!search) { // пустой поиск
            this.isSearched.set(false);
            this.searchedItems.set([]);
            this.isProductFound.set(false);
          } 
          if (search && !this.searchedItems().length) { // если не нашло
            this.isProductFound.set(false);
            this.selectedValue$.disable();
          }
        }),
        takeUntilDestroyed(),
    ).subscribe();

    this.selectedValue$.valueChanges.pipe(
      filterNilValue(),
      debounceTime(300),
      distinctUntilChanged(),
      tap((value) => {
        this.isSorted.set(true);
        switch(value) {
          case 'sale' : {
            return this.searchedItems.set((this.itemsArrayToShow() as Product[]).filter((value) => value.salePrice))
          }
          case 'sortAsc' : {
            return this.searchedItems.set([...(this.itemsArrayToShow() as Product[])].sort((a, b) => {
              const firstPrice = Object.hasOwn(a, 'salePrice') && a.salePrice !== null ? a.salePrice : a.price 
              const secondPrice = Object.hasOwn(b, 'salePrice') && b.salePrice !== null ? b.salePrice : b.price 
              return (firstPrice as number) - (secondPrice as number);
            }))
          }
          case 'sortDecs' : {
            return this.searchedItems.set([...(this.itemsArrayToShow() as Product[])].sort((a, b) => {
              const firstPrice = Object.hasOwn(a, 'salePrice') && a.salePrice !== null ? a.salePrice : a.price 
              const secondPrice = Object.hasOwn(b, 'salePrice') && b.salePrice !== null ? b.salePrice : b.price
              return (secondPrice as number) - (firstPrice as number)
            }))
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

    effect(() => console.log({
      visibleItems: this.visibleItems(),
      searchedItems: this.searchedItems(),
      isProductFound: this.isProductFound(),
      isSearched: this.isSearched(),
      isSorted: this.isSorted()
    }));
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

export function filterNilValue<T>(): OperatorFunction<T, NonNullable<T>> {
  return filter((value: T): value is NonNullable<T> => value !== null && value !== undefined);
}
