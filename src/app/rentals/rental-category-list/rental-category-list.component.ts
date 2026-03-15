import { Component, OnInit } from '@angular/core';
import { CoreService } from '../../services/core.service';

@Component({
    selector: 'app-rental-category-list',
    templateUrl: './rental-category-list.component.html',
    styleUrls: ['./rental-category-list.component.css']
})
export class RentalCategoryListComponent implements OnInit {
    categories: any[] = [];
    pagination: any = {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    };
    showModal = false;
    isEdit = false;
    currentCat: any = { name: '', icon: '', status: 'active' };

    constructor(private core: CoreService) { }

    ngOnInit() {
        this.loadCategories();
    }

    loadCategories(page: number = 1) {
        this.core.getData('rental-categories', page).subscribe(res => {
            this.categories = res.data;
            this.pagination = res.pagination;
        });
    }

    onPageChange(page: number) {
        this.loadCategories(page);
    }

    openAddModal() {
        this.isEdit = false;
        this.currentCat = { name: '', icon: '', status: 'active' };
        this.showModal = true;
    }

    editCategory(cat: any) {
        this.isEdit = true;
        this.currentCat = { ...cat };
        this.showModal = true;
    }

    saveCategory() {
        if (this.isEdit) {
            this.core.updateItem('rental-categories', this.currentCat.id, this.currentCat).subscribe(() => {
                this.loadCategories(this.pagination.page);
                this.showModal = false;
            });
        } else {
            this.core.addItem('rental-categories', this.currentCat).subscribe(() => {
                this.loadCategories();
                this.showModal = false;
            });
        }
    }

    toggleStatus(cat: any) {
        const newStatus = cat.status === 'active' ? 'inactive' : 'active';
        this.core.updateItem('rental-categories', cat.id, { status: newStatus }).subscribe(() => {
            this.loadCategories(this.pagination.page);
        });
    }

    deleteCategory(id: any) {
        if (confirm('Are you sure you want to delete this rental category?')) {
            this.core.deleteItem('rental-categories', id).subscribe(() => {
                this.loadCategories(this.pagination.page);
            });
        }
    }

    getIcon(name: string): string {
        // Simple fallback icon
        return 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10';
    }
}
