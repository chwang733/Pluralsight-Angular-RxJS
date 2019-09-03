import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EMPTY, Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Product } from './product';
import { ProductService } from './product.service';
import { ProductCategoryService } from '../product-categories/product-category.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  pageTitle = 'Product List';
  errorMessage = '';
  categories;
  private categorySelectedSubject = new BehaviorSubject<number>(0);
  categorySelectedAction$ = this.categorySelectedSubject.asObservable();

  categories$ = this.productCategoryService.productCategories$
    .pipe(
      catchError(err => {
        this.errorMessage = err;
        return EMPTY;
      })
    );

  products$ = combineLatest([
    this.productService.productWithAdd$,
    this.categorySelectedAction$
  ]).pipe(
      map(([products, categoryId]) => products.filter( p =>
        categoryId ? p.categoryId === categoryId : true
      )),
      catchError(err => {
        this.errorMessage = err;
        return EMPTY;
      })
    );

  constructor(
    private productService: ProductService,
    private productCategoryService: ProductCategoryService) { }


  onAdd(): void {
    this.productService.addProduct();
  }

  onSelected(categoryId: string): void {
    this.categorySelectedSubject.next(+categoryId);
  }
}
