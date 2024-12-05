import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input, InputSignal,
  output,
  signal,
  Signal,
  TemplateRef
} from '@angular/core';
import { NumberToArrayPipe } from '../../number-to-array.pipe';
import { JsonPipe, NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [
    NumberToArrayPipe,
    NgTemplateOutlet,
    JsonPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css'
})
export class PaginationComponent<T = unknown> {
  public readonly items: InputSignal<T[]> = input<T[]>([]);

  public readonly itemsPerPage: InputSignal<number> = input.required();

  public readonly itemTemplate: InputSignal<TemplateRef<T> | undefined> = input();

  public readonly pageChanged = output<number>();

  public readonly currentPage = signal(1);

  public readonly totalCount: Signal<number> = computed(() => this.items().length)

  public readonly pageCount = computed(() => {
    const count = this.itemsPerPage();
    const total = this.totalCount();
    return Math.ceil(total / count);
  });

  public readonly visibleItems = computed(() => {
    const items = this.items();
    const perPage = this.itemsPerPage();
    const page = this.currentPage();

    return items.slice((page - 1) * perPage, perPage * page);
  });

  public readonly isFirstPage: Signal<boolean> = computed(() => {
    const currentPage = this.currentPage();
    return currentPage === 1;
  })

  public readonly isLastPage: Signal<boolean> = computed(() => {
    const pageCount = this.pageCount();
    const currentPage = this.currentPage();

    return pageCount === currentPage;
  })

  public nextPage(): void {
    const isLastPage = this.isLastPage();
    if (isLastPage) {
      return
    }
    this.currentPage.update((val: number) => val + 1);

    this.pageChanged.emit(this.currentPage());
  }

  public previousPage(): void {
    const isFirstPage = this.isFirstPage();

    if (isFirstPage) {
      return
    }

    this.currentPage.update((val: number) => val - 1);

    this.pageChanged.emit(this.currentPage());
  }

  public updateCurrentPage(page: number): void {
    this.currentPage.set(page);

    this.pageChanged.emit(page);
  }
}
