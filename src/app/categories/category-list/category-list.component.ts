import { Component, OnInit } from '@angular/core';
import { CoreService } from '../../services/core.service';

@Component({
    selector: 'app-category-list',
    templateUrl: './category-list.component.html',
    styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent implements OnInit {
    categories: any[] = [];
    mainCategories: any[] = [];
    pagination: any = {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    };
    searchTerm: string = '';
    showModal = false;
    isEdit = false;
    currentCat: any = { name: '', main_category_id: null, main_category_ids: [], description: '', icon: 'categories', status: 'active' };

    iconMap: { [key: string]: string } = {
        'Excavator': 'M13 10V3L4 14h7v7l9-11h-7z',
        'Concrete Mixer': 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
        'Scaffolding': 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
        'Power Tools': 'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.7-3.7a1 1 0 000-1.4l-1.6-1.6a1 1 0 00-1.4 0l-3.7 3.7z M12 12l-5 5M4 16l4 4M20 4l-4 4'
    };

    getIcon(name: string): string {
        return this.iconMap[name] || 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10';
    }

    constructor(private core: CoreService) { }

    ngOnInit() {
        this.loadCategories();
        this.loadMainCategories();
    }

    loadCategories(page: number = 1) {
        const filters: any = { all: true };
        if (this.searchTerm && this.searchTerm.trim()) {
            filters.search = this.searchTerm.trim();
        }
        this.core.getData('categories', page, 10, filters).subscribe({
            next: (res) => {
                this.categories = (res.data || []).sort((a: any, b: any) => Number(a.id) - Number(b.id));
                this.pagination = res.pagination || { total: this.categories.length, page: 1, limit: 10, totalPages: 1 };
            },
            error: (err) => console.error('Error loading categories', err)
        });
    }

    onSearch() {
        this.loadCategories(1);
    }

    clearSearch() {
        this.searchTerm = '';
        this.loadCategories(1);
    }

    loadMainCategories() {
        this.core.getData('main-categories', 1, 100, { status: 'active' }).subscribe({
            next: (res) => {
                this.mainCategories = res.data || [];
            },
            error: (err) => console.error('Error loading main categories', err)
        });
    }

    onPageChange(page: number) {
        this.loadCategories(page);
    }

    openAddModal() {
        this.isEdit = false;
        const defaultId = this.mainCategories[0]?.id || null;
        this.currentCat = {
            name: '',
            main_category_id: defaultId,
            main_category_ids: defaultId ? [defaultId] : [],
            description: '',
            icon: 'categories',
            status: 'active'
        };
        this.showModal = true;
    }

    editCategory(cat: any) {
        this.isEdit = true;
        let ids: number[] = [];
        if (Array.isArray(cat.main_category_ids) && cat.main_category_ids.length > 0) {
            ids = cat.main_category_ids.map((id: any) => Number(id));
        } else if (cat.main_category_id) {
            ids = [Number(cat.main_category_id)];
        }
        this.currentCat = {
            ...cat,
            main_category_ids: ids,
            main_category_id: ids[0] || null
        };
        this.showModal = true;
    }

    toggleMainCategory(mainCatId: number) {
        if (!this.currentCat.main_category_ids) {
            this.currentCat.main_category_ids = [];
        }
        const numericId = Number(mainCatId);
        const index = this.currentCat.main_category_ids.indexOf(numericId);
        if (index > -1) {
            this.currentCat.main_category_ids.splice(index, 1);
        } else {
            this.currentCat.main_category_ids.push(numericId);
        }
        this.currentCat.main_category_id = this.currentCat.main_category_ids[0] || null;
    }

    isMainCategorySelected(mainCatId: number): boolean {
        if (!this.currentCat.main_category_ids) return false;
        return this.currentCat.main_category_ids.includes(Number(mainCatId));
    }

    getSelectedMainCategoryNames(): string {
        if (!this.currentCat.main_category_ids || this.currentCat.main_category_ids.length === 0) {
            return 'None selected';
        }
        return this.mainCategories
            .filter(m => this.currentCat.main_category_ids.includes(Number(m.id)))
            .map(m => m.name)
            .join(', ');
    }

    saveCategory() {
        if (!this.currentCat.name || !this.currentCat.name.trim()) {
            alert('Category name is required');
            return;
        }

        const ids = (this.currentCat.main_category_ids || []).map(Number).filter(Boolean);
        if (ids.length === 0) {
            alert('Please select at least one Main Category');
            return;
        }

        this.currentCat.main_category_ids = ids;
        this.currentCat.main_category_id = ids[0];

        if (this.isEdit) {
            this.core.updateItem('categories', this.currentCat.id, this.currentCat).subscribe({
                next: () => {
                    this.loadCategories(this.pagination.page);
                    this.showModal = false;
                },
                error: (err) => {
                    const msg = err.error?.message || 'Failed to update category';
                    alert(msg);
                }
            });
        } else {
            this.core.addItem('categories', this.currentCat).subscribe({
                next: () => {
                    this.loadCategories(1);
                    this.showModal = false;
                },
                error: (err) => {
                    const msg = err.error?.message || 'Failed to create category';
                    alert(msg);
                }
            });
        }
    }

    toggleStatus(cat: any) {
        const newStatus = cat.status === 'active' ? 'inactive' : 'active';
        this.core.updateItem('categories', cat.id, { status: newStatus }).subscribe({
            next: () => {
                cat.status = newStatus;
            },
            error: () => alert('Failed to update category status')
        });
    }

    deleteCategory(id: any) {
        if (confirm('Are you sure you want to delete this category? Remaining categories will be automatically renumbered.')) {
            this.core.deleteItem('categories', id).subscribe({
                next: () => {
                    this.loadCategories(this.pagination.page);
                },
                error: (err) => {
                    const msg = err.error?.message || 'Failed to delete category';
                    alert(msg);
                }
            });
        }
    }
}
