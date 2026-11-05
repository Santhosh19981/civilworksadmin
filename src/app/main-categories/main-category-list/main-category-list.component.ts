import { Component, OnInit } from '@angular/core';
import { CoreService } from '../../services/core.service';

@Component({
    selector: 'app-main-category-list',
    templateUrl: './main-category-list.component.html',
    styleUrls: ['./main-category-list.component.css']
})
export class MainCategoryListComponent implements OnInit {
    mainCategories: any[] = [];
    pagination: any = {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    };
    showModal = false;
    isEdit = false;
    currentMainCat: any = { name: '', description: '', status: 'active' };
    errorMessage = '';
    isLoading = false;

    constructor(private core: CoreService) { }

    ngOnInit() {
        this.loadMainCategories();
    }

    loadMainCategories(page: number = 1) {
        this.isLoading = true;
        this.errorMessage = '';
        this.core.getData('main-categories', page, 10, { all: true }).subscribe({
            next: (res) => {
                this.mainCategories = (res.data || []).sort((a: any, b: any) => Number(a.id) - Number(b.id));
                this.pagination = res.pagination || { total: this.mainCategories.length, page: 1, limit: 10, totalPages: 1 };
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading main categories', err);
                this.errorMessage = 'Failed to load main categories. Please try again.';
                this.isLoading = false;
            }
        });
    }

    onPageChange(page: number) {
        this.loadMainCategories(page);
    }

    openAddModal() {
        this.isEdit = false;
        this.errorMessage = '';
        this.currentMainCat = { name: '', description: '', status: 'active' };
        this.showModal = true;
    }

    editMainCategory(cat: any) {
        this.isEdit = true;
        this.errorMessage = '';
        this.currentMainCat = { ...cat };
        this.showModal = true;
    }

    saveMainCategory() {
        if (!this.currentMainCat.name || !this.currentMainCat.name.trim()) {
            alert('Main Category name is required');
            return;
        }

        if (this.isEdit) {
            this.core.updateItem('main-categories', this.currentMainCat.id, this.currentMainCat).subscribe({
                next: () => {
                    this.loadMainCategories(this.pagination.page);
                    this.showModal = false;
                },
                error: (err) => {
                    const msg = err.error?.message || 'Failed to update main category';
                    alert(msg);
                }
            });
        } else {
            this.core.addItem('main-categories', this.currentMainCat).subscribe({
                next: () => {
                    this.loadMainCategories(1);
                    this.showModal = false;
                },
                error: (err) => {
                    const msg = err.error?.message || 'Failed to create main category';
                    alert(msg);
                }
            });
        }
    }

    toggleStatus(cat: any) {
        const newStatus = cat.status === 'active' ? 'inactive' : 'active';
        this.core.updateItem('main-categories', cat.id, { status: newStatus }).subscribe({
            next: () => {
                cat.status = newStatus;
            },
            error: (err) => {
                alert('Failed to update status');
            }
        });
    }

    deleteMainCategory(id: any) {
        if (confirm('Are you sure you want to delete this main category? Deleting is only allowed if no categories are assigned to it.')) {
            this.core.deleteItem('main-categories', id).subscribe({
                next: () => {
                    this.loadMainCategories(this.pagination.page);
                },
                error: (err) => {
                    const msg = err.error?.message || 'Failed to delete main category';
                    alert(msg);
                }
            });
        }
    }
}
