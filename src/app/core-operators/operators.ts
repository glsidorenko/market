import { filter, OperatorFunction } from "rxjs";
import { Product } from "../types";

export function filterNilValue<T>(): OperatorFunction<T, NonNullable<T>> {
  return filter((value: T): value is NonNullable<T> => value !== null && value !== undefined);
}

export function coerceProductPrice(product: Product): number {
  return product.salePrice ?? product.price;
}
