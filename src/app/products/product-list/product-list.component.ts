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
    products: any[] = [];
    categories: any[] = [];
    searchTerm = '';
    selectedCategory = '';
    
    pagination: any = {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    };

    constructor(private core: CoreService) {
        this.loadProducts();
        this.core.getData('categories', 1, 100).subscribe(res => {
            this.categories = res.data.filter((cat: any) => cat.parent_id === null);
        });
    }

    loadProducts(page: number = 1) {
        const filters = {
            search: this.searchTerm,
            category_id: this.selectedCategory
        };
        this.core.getData('products', page, 10, filters).subscribe(res => {
            this.products = res.data;
            this.pagination = res.pagination;
        });
    }

    onSearch() {
        this.loadProducts(1);
    }

    onCategoryChange() {
        this.loadProducts(1);
    }

    onPageChange(page: number) {
        this.loadProducts(page);
    }

    ngOnInit() { }

    toggleStatus(product: any) {
        const newStatus = product.status === 'active' ? 'inactive' : 'active';
        this.core.updateItem('products', product.id, { status: newStatus }).subscribe({
            next: () => this.loadProducts(this.pagination.page),
            error: (err) => alert('Failed to update status')
        });
    }

    deleteProduct(id: any) {
        if (confirm('Are you sure you want to delete this product?')) {
            this.core.deleteItem('products', id).subscribe({
                next: () => this.loadProducts(this.pagination.page),
                error: (err) => alert('Failed to delete product')
            });
        }
    }
}
