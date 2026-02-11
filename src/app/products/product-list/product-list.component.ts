import { Component, OnInit } from '@angular/core';
import { CoreService } from '../../services/core.service';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-product-list',
    templateUrl: './product-list.component.html',
    styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
    products$: Observable<any[]>;
    categories$: Observable<any[]>;
    searchTerm = '';
    selectedCategory = '';
    filteredProducts$: Observable<any[]>;

    constructor(private core: CoreService) {
        this.products$ = this.core.getData('products');
        this.categories$ = this.core.getData('categories');

        // Logic for filtering
        this.filteredProducts$ = combineLatest([this.products$, this.categories$]).pipe(
            map(([products]) => {
                return products.filter(p => {
                    const matchesSearch = p.name.toLowerCase().includes(this.searchTerm.toLowerCase());
                    const matchesCategory = !this.selectedCategory || p.category === this.selectedCategory;
                    return matchesSearch && matchesCategory;
                });
            })
        );
    }

    ngOnInit() { }

    toggleStatus(product: any) {
        const newStatus = product.status === 'active' ? 'inactive' : 'active';
        this.core.updateItem('products', product.id, { status: newStatus });
    }

    deleteProduct(id: any) {
        if (confirm('Are you sure you want to delete this product?')) {
            this.core.deleteItem('products', id);
        }
    }
}
