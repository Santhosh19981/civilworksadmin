import { Component, OnInit } from '@angular/core';
import { CoreService } from '../../services/core.service';

@Component({
    selector: 'app-subcategory-list',
    templateUrl: './subcategory-list.component.html',
    styleUrls: ['./subcategory-list.component.css']
})
export class SubcategoryListComponent implements OnInit {
    subcategories: any[] = [];
    mainCategories: any[] = [];
    pagination: any = {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    };
    showModal = false;
    isEdit = false;
    currentSub: any = { name: '', category_id: '', icon: 'subcategory', status: 'active' };

    constructor(private core: CoreService) {
        this.loadSubcategories();
        this.loadMainCategories();
    }

    loadSubcategories(page: number = 1) {
        this.core.getData('subcategories', page).subscribe(res => {
            this.subcategories = res.data;
            this.pagination = res.pagination;
        });
    }

    loadMainCategories() {
        this.core.getData('categories', 1, 100).subscribe(res => {
            this.mainCategories = res.data;
        });
    }

    onPageChange(page: number) {
        this.loadSubcategories(page);
    }

    ngOnInit() { }

    openAddModal() {
        this.isEdit = false;
        this.currentSub = { name: '', category_id: this.mainCategories[0]?.id || '', icon: 'subcategory', status: 'active' };
        this.showModal = true;
    }

    editSubcategory(sub: any) {
        this.isEdit = true;
        this.currentSub = { ...sub };
        this.showModal = true;
    }

    saveSubcategory() {
        if (this.isEdit) {
            this.core.updateItem('subcategories', this.currentSub.id, this.currentSub).subscribe(() => {
                this.loadSubcategories();
                this.showModal = false;
            });
        } else {
            this.core.addItem('subcategories', this.currentSub).subscribe(() => {
                this.loadSubcategories();
                this.showModal = false;
            });
        }
    }

    toggleStatus(sub: any) {
        const newStatus = sub.status === 'active' ? 'inactive' : 'active';
        this.core.updateItem('subcategories', sub.id, { status: newStatus }).subscribe(() => {
            sub.status = newStatus;
        });
    }

    deleteSubcategory(id: any) {
        if (confirm('Are you sure you want to delete this subcategory?')) {
            this.core.deleteItem('subcategories', id).subscribe(() => {
                this.loadSubcategories();
            });
        }
    }
}
