import { Component, OnInit } from '@angular/core';
import { CoreService } from '../../services/core.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-category-list',
    templateUrl: './category-list.component.html',
    styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent implements OnInit {
    categories$: Observable<any[]>;
    showModal = false;
    isEdit = false;
    currentCat: any = { name: '', icon: 'categories', status: 'active' };

    iconMap: { [key: string]: string } = {
        'Excavator': 'M13 10V3L4 14h7v7l9-11h-7z',
        'Concrete Mixer': 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
        'Scaffolding': 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
        'Power Tools': 'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.7-3.7a1 1 0 000-1.4l-1.6-1.6a1 1 0 00-1.4 0l-3.7 3.7z M12 12l-5 5M4 16l4 4M20 4l-4 4'
    };

    getIcon(name: string): string {
        return this.iconMap[name] || 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10';
    }

    constructor(private core: CoreService) {
        this.categories$ = this.core.getData('categories');
    }

    ngOnInit() { }

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
            this.core.updateItem('categories', this.currentCat.id, this.currentCat);
        } else {
            this.core.addItem('categories', this.currentCat);
        }
        this.showModal = false;
    }

    toggleStatus(cat: any) {
        const newStatus = cat.status === 'active' ? 'inactive' : 'active';
        this.core.updateItem('categories', cat.id, { status: newStatus });
    }

    deleteCategory(id: any) {
        if (confirm('Are you sure you want to delete this category?')) {
            this.core.deleteItem('categories', id);
        }
    }
}
