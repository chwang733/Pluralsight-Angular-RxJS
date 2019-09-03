import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, throwError, combineLatest, BehaviorSubject, Subject, merge } from 'rxjs';
import { catchError, tap, map, scan, shareReplay } from 'rxjs/operators';

import { Product } from './product';
import { Supplier } from '../suppliers/supplier';
import { SupplierService } from '../suppliers/supplier.service';
import { ProductCategoryService } from '../product-categories/product-category.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';
  private suppliersUrl = this.supplierService.suppliersUrl;

  products$ = this.http.get<Product[]>(this.productsUrl);

  productsWithCategory$ = combineLatest([
    this.products$,
    this.productCategoryService.productCategories$
  ]).pipe(
    map(([products, categories]) => products.map( product => ({
      ...product,
      price : product.price * 1.5,
      searchKey: [product.productName],
      category: categories.find(c => c.id === product.categoryId).name,
    } as Product)
    )),
    shareReplay(1),
    catchError(this.handleError)

  );

  private selectedProductSubject = new BehaviorSubject<number>(0);
  selectedProductAction$ = this.selectedProductSubject.asObservable();

  selectedProduct$ = combineLatest([
    this.productsWithCategory$,
    this.selectedProductAction$
  ]).pipe(
    map(([products, selectedProductId]) => products.find(p => p.id === selectedProductId)),
    tap( p => console.log('selectedProduct', p)),
    shareReplay(1)
  );

  selectedProductSuppliers$ = combineLatest([
    this.selectedProduct$,
    this.supplierService.suppliers$
  ]).pipe(
    map(([selectedProduct, suppliers]) => suppliers.filter(s => selectedProduct.supplierIds.includes(s.id)))
  );

  private productInsertedSubject = new Subject<Product>();
  productInsertedAction$ = this.productInsertedSubject.asObservable();

  productWithAdd$ = merge(
    this.productsWithCategory$,
    this.productInsertedAction$
  ).pipe(
    scan((acc: Product[], value: Product) => [...acc, value])
  );


  constructor(private http: HttpClient,
              private productCategoryService: ProductCategoryService,
              private supplierService: SupplierService) { }

  selectedProductChanged(productId: number){
    this.selectedProductSubject.next(productId);
  }

  addProduct(newProduct? : Product) {
    newProduct = newProduct || this.fakeProduct();
    this.productInsertedSubject.next(newProduct);
  }

  private fakeProduct() {
    return {
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      category: 'Toolbox',
      quantityInStock: 30
    };
  }

  private handleError(err: any) {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }

}
