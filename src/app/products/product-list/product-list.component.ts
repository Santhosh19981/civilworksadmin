import { Component, OnInit } from '@angular/core';
import { CoreService } from '../../services/core.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-product-list',
    templateUrl: './product-list.component.html',
    styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
    products: any[] = [];
    allCategories: any[] = [];
    filteredCategories: any[] = [];
    mainCategories: any[] = [];
    selectedMainCategory: string = '';
    selectedCategory: string = '';
    selectedType: string = '';
    searchTerm: string = '';
    hasRentalProducts: boolean = true;
    
    pagination: any = {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    };

    constructor(
        private core: CoreService,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            if (params['mainCategoryId'] || params['main_category_id']) {
                this.selectedMainCategory = String(params['mainCategoryId'] || params['main_category_id']);
            }
            if (params['categoryId'] || params['category_id']) {
                this.selectedCategory = String(params['categoryId'] || params['category_id']);
            }
            if (params['type']) {
                this.selectedType = String(params['type']);
            }
            this.loadInitialData();
        });
    }

    loadInitialData() {
        // Load main categories
        this.core.getData('main-categories', 1, 100, { all: true }).subscribe({
            next: res => {
                this.mainCategories = (res.data || []).sort((a: any, b: any) => Number(a.id) - Number(b.id));
            }
        });

        // Load all categories
        this.core.getData('categories', 1, 100, { all: true }).subscribe({
            next: res => {
                this.allCategories = res.data || [];
                this.updateFilteredCategories();
            }
        });

        this.checkRentalAvailability();
        this.loadProducts(1);
    }

    updateFilteredCategories() {
        if (this.selectedMainCategory) {
            const targetId = Number(this.selectedMainCategory);
            this.filteredCategories = this.allCategories.filter(cat => {
                if (Array.isArray(cat.main_category_ids) && cat.main_category_ids.map(Number).includes(targetId)) {
                    return true;
                }
                return Number(cat.main_category_id) === targetId;
            });
        } else {
            this.filteredCategories = this.allCategories;
        }

        // If currently selected category does not belong to new main category, reset it
        if (this.selectedCategory && !this.filteredCategories.some(c => String(c.id) === String(this.selectedCategory))) {
            this.selectedCategory = '';
        }
    }

    checkRentalAvailability() {
        const filters: any = { type: 'renting', limit: 1 };
        if (this.selectedMainCategory) {
            filters.main_category_id = this.selectedMainCategory;
        }
        if (this.selectedCategory) {
            filters.category_id = this.selectedCategory;
        }

        this.core.getData('products', 1, 1, filters).subscribe({
            next: res => {
                const total = res.pagination?.total !== undefined ? res.pagination.total : (res.data || []).length;
                this.hasRentalProducts = total > 0;

                // If rentals don't exist for this sector/category and rental tab was active, reset to all assets
                if (!this.hasRentalProducts && this.selectedType === 'renting') {
                    this.selectedType = '';
                    this.loadProducts(1);
                }
            },
            error: () => {
                this.hasRentalProducts = false;
                if (this.selectedType === 'renting') {
                    this.selectedType = '';
                    this.loadProducts(1);
                }
            }
        });
    }

    loadProducts(page: number = 1) {
        const filters: any = {
            search: this.searchTerm,
            category_id: this.selectedCategory
        };
        if (this.selectedMainCategory) {
            filters.main_category_id = this.selectedMainCategory;
        }
        if (this.selectedType) {
            filters.type = this.selectedType;
        }
        this.core.getData('products', page, 10, filters).subscribe({
            next: res => {
                this.products = (res.data || []).sort((a: any, b: any) => Number(a.id) - Number(b.id));
                this.pagination = res.pagination || { total: this.products.length, page, limit: 10, totalPages: 1 };
            },
            error: err => {
                console.error('Failed to load products:', err);
                this.products = [];
            }
        });
    }

    onMainCategoryChange() {
        this.updateFilteredCategories();
        this.checkRentalAvailability();
        this.loadProducts(1);
    }

    setTypeFilter(type: string) {
        this.selectedType = type;
        this.loadProducts(1);
    }

    onSearch() {
        this.loadProducts(1);
    }

    onCategoryChange() {
        this.checkRentalAvailability();
        this.loadProducts(1);
    }

    onPageChange(page: number) {
        this.loadProducts(page);
    }

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
