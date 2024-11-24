import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberToArray',
  standalone: true
})
export class NumberToArrayPipe implements PipeTransform {

  transform(value: number): number[] {
    return Array.from(
      { length: value },
      (_, i) => i + 1,
    );
  }

}
