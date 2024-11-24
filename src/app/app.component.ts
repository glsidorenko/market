import { ChangeDetectionStrategy, Component, Inject, inject, PLATFORM_ID, Signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CartService } from './services/cart/cart.service';
import {
  combineLatest, debounceTime,
  distinct,
  distinctUntilChanged,
  filter,
  from,
  interval,
  map, merge,
  Observable,
  of, OperatorFunction,
  skip, switchMap,
  take,
  tap,
  throwError,
  timer
} from 'rxjs';
import { unsubscribe } from 'node:diagnostics_channel';
import { isPlatformBrowser } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [CartService],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AppComponent {
  cartService = inject(CartService);
  cartQuantity: Signal<number> = this.cartService.getCartCounter();

  public searchControl = new FormControl<string>('');



  constructor(@Inject(PLATFORM_ID) public platformId: string) {
    // const a = of(1);
    const b = from([1,2,3,4])


    b.subscribe(console.log)
    b.subscribe(console.log)
    b.subscribe(console.log)
    b.subscribe(console.log)
    b.subscribe(console.log)
    b.subscribe(console.log)
    b.subscribe(console.log)
    b.subscribe(console.log)
    b.subscribe(console.log)
    b.subscribe(console.log)
    b.subscribe(console.log)
    b.subscribe(console.log)
    b.subscribe(console.log)
    b.subscribe(console.log)

  // const c = new Observable(subscriber => {
  //   subscriber.next(1);
  //   subscriber.next(2);
  //
  //   setTimeout(() => {
  //     subscriber.next(3);
  //     subscriber.complete();
  //   }, 0)
  //
  //   return () => {
  //     console.log('unsubscribed')
  //     return subscriber.unsubscribe();
  //   };
  // });

 if(isPlatformBrowser(platformId)) {
   // const d = from([...Array.from({length: 120}, (item, index) => 1), 2]).pipe(
   //   // filter(v => v > 15),
   //   distinctUntilChanged((a,b ) => {
   //     return a === b;
   //   }),
   //   map(v => v * 2),
   //   map(v => v * v),
   //   // distinct
   // );


   const streamA$ = timer(0, 1500).pipe(take(4));
   const streamB$ = timer(800, 1000).pipe(
     take(6),
     map((i) => 'abcdef'[i])
   );
   combineLatest([streamA$, streamB$])
     .subscribe(console.log);
   // const observer = d.subscribe({
   //   next: (v) => console.log("VALUE" , v),
   //   error: (e) => console.log("ERROR", e),
   //   complete: () => console.log("COMPLETED")
   // });

   this.searchControl.valueChanges.pipe(
     filterNilValue(),
     debounceTime(300),
     distinctUntilChanged(),
     switchMap(value => this.sendRequest(value)),
   ).subscribe(console.log);
 }
    // observer.unsubscribe();
  }


  public sendRequest(value: string): Observable<string> {
    return of(value);
  }
}


export function filterNilValue<T>(): OperatorFunction<T, NonNullable<T>> {
  return filter((value: T): value is NonNullable<T> => value !== null && value !== undefined);
}

