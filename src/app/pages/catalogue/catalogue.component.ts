import { Component, computed, Inject, PLATFORM_ID, Signal, signal, WritableSignal, effect } from '@angular/core';
import { products } from '../../products';
import { CardComponent } from '../../ui/card/card.component';
import { NumberToArrayPipe } from "../../number-to-array.pipe";
import { Product } from '../../types';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, OperatorFunction, tap, from, of, map } from 'rxjs';
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
  totalCount: Signal<number> = computed(() => {
    if(this.searchedItems().length > 0) {
      console.log("есть")
      return this.searchedItems().length;
    }

    return this.products().length;
  })
  isProductFound: WritableSignal<boolean> = signal(true)
  searchedItems: WritableSignal<Product[]> = signal([]);

  visibleItems: Signal<Product[] | undefined> = computed(() => {
    const items = this.products();
    const perPage = this.itemsPerPage();
    const page = this.currentPage();
    const isProductFound = this.isProductFound();
    const searched = this.searchedItems();


    function modifyArray(array: Product[]) {
      return array.slice((page - 1) * perPage, perPage * page);
    }

    if (!isProductFound) {
      return undefined;
    }
    while (searched.length === 0) {
      return modifyArray(items);
    }
    return modifyArray(searched);

    
  })

  searchProduct$  = new FormControl<string>("");
  selectedValue$ = new FormControl<string>("");
  sort: string = ''


  constructor(@Inject(PLATFORM_ID) public platformId: string) {
    this.searchProduct$.valueChanges.pipe(
        filterNilValue(),
        debounceTime(300),
        distinctUntilChanged(),
        tap(search => {
          this.isProductFound.set(true); // чтобы не ломался при изменении текста поиска
          this.searchedItems.set(this.products().filter(item => item.title.toLowerCase().includes(search.toLowerCase())))
        }),
        tap(search => {
          if (!search) {
            this.searchedItems.set([]);
          } 
          if (search && !this.searchedItems().length) { //если не нашло
            this.isProductFound.set(false);
          }
        }),
        takeUntilDestroyed(),
    ).subscribe();

    this.selectedValue$.valueChanges.pipe(
      filterNilValue(),
      debounceTime(300),
      distinctUntilChanged(),
      tap((value) => {
        switch(value) {
          case 'sale' : {
            return this.products.set(this.products().filter((value) => value.salePrice))
          }
          case 'sortAsc' : {
            return this.products.set([...this.products()].sort((a, b) => a.price - b.price))
          }
          case 'sortDecs' : {
            return this.products.set([...this.products()].sort((a, b) => b.price - a.price))
          }
        }
      }),
      takeUntilDestroyed()
    ).subscribe(console.log)

    effect(() => console.log(`Visible`, this.visibleItems()));
    effect(() => console.log(`Searched`, this.searchedItems()));
    effect(() => console.log(`length`, this.totalCount()));

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
