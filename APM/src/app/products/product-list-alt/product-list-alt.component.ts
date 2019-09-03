import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription, EMPTY } from 'rxjs';

import { Product } from '../product';
import { ProductService } from '../product.service';
import { catchError } from 'rxjs/operators';
import { ChangeDetectionStrategy } from '@angular/compiler/src/core';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list-alt.component.html'
})
export class ProductListAltComponent {
  pageTitle = 'Products';
  errorMessage = '';
  selectedProductId;
  products$ = this.productService.productsWithCategory$.pipe(
    catchError( err => {
      this.errorMessage = err;
      return EMPTY;
    })
  );

  constructor(private productService: ProductService) { }


  onSelected(productId: number): void {
    this.selectedProductId= productId;
    this.productService.selectedProductChanged(productId);
  }
}
