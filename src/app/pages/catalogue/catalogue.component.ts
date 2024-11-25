import { Component, computed, Inject, PLATFORM_ID, Signal, signal, WritableSignal, effect } from '@angular/core';
import { products } from '../../products';
import { CardComponent } from '../../ui/card/card.component';
import { NumberToArrayPipe } from "../../number-to-array.pipe";
// import { PaginationComponent } from '../../ui/pagination/pagination.component';
import { Product } from '../../types';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, Observable, of, OperatorFunction, switchMap, tap } from 'rxjs';
// import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [CardComponent, NumberToArrayPipe, ReactiveFormsModule],
  templateUrl: "./catalogue.component.html",
  styleUrl: './catalogue.component.css'
})

export class CatalogueComponent {
  products: WritableSignal<Product[]> = signal(products);
  itemsPerPage: WritableSignal<number> = signal(10);
  currentPage: WritableSignal<number> = signal(1);
  totalCount: Signal<number> = computed(() => this.products.length);
  searchStatus: WritableSignal<string | undefined> = signal('')
  public searchProduct  = new FormControl<string>("");
  searchedItems: WritableSignal<Product[]> = signal([]);

  

  constructor(@Inject(PLATFORM_ID) public platformId: string) {
    this.searchProduct.valueChanges.pipe(
        filterNilValue(),
        debounceTime(300),
        distinctUntilChanged(),
        tap(search => {
          this.searchStatus.set('');
          this.searchedItems.set(this.products().filter(item => item.title.toLowerCase().includes(search)))
        }),
        tap(search => {
          if (search && !this.searchedItems().length) {
            this.searchStatus.set(undefined);
          }
          if (!search) {
            console.log("show visibleItemsArray")
            this.searchedItems.set([]);
          } 
        }),
        takeUntilDestroyed(),
    ).subscribe()

    effect(() => console.log(`Visible`, this.visibleItems()));
    effect(() => console.log(`Searched`, this.searchedItems()));
  }

  visibleItems: Signal<Product[]> = computed(() => {
    const items = this.products();
    const perPage = this.itemsPerPage();
    const page = this.currentPage();
    return items.slice((page - 1) * perPage, perPage * page);
  })

  itemsToShow() {
    if (this.searchStatus() === undefined) {
      return undefined;
    }
    while (this.searchedItems().length === 0) {
      return this.visibleItems();
    }
    return this.searchedItems();
  }


  pageCount: Signal<number> = computed(() => {
    const items = this.products();
    const count = this.itemsPerPage();
    return Math.ceil(items.length / count);
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
