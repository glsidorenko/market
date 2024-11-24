import { Component, computed, Signal, signal, WritableSignal } from '@angular/core';
import { products } from '../../products';
import { CardComponent } from '../../ui/card/card.component';
import { NumberToArrayPipe } from "../../number-to-array.pipe";
import { PaginationComponent } from '../../ui/pagination/pagination.component';
import { Product } from '../../types';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [CardComponent, NumberToArrayPipe],
  templateUrl: "./catalogue.component.html",
  styleUrl: './catalogue.component.css'
})
export class CatalogueComponent {
  products: WritableSignal<Product[]> = signal(products);
  itemsPerPage: WritableSignal<number> = signal(10);
  currentPage: WritableSignal<number> = signal(1);
  totalCount: Signal<number> = computed(() => this.products.length);

  visibleItems: Signal<Product[]> = computed(() => {
    const items = this.products();
    const perPage = this.itemsPerPage();
    const page = this.currentPage();
    return items.slice((page - 1) * perPage, perPage * page);
  })

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
    this.currentPage.update((val) => val + 1);
  }

  previousPage(): void {
    const isFirstPage = this.isFirstPage();

    if (isFirstPage) {
      return
    }

    this.currentPage.update((val) => val - 1);
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

  updateCurrentPage(page: number) {
    this.currentPage.set(page);
  }
}
