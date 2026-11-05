import { Component, OnInit } from '@angular/core';
import { CoreService } from '../../services/core.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-subcategory-list',
    templateUrl: './subcategory-list.component.html',
    styleUrls: ['./subcategory-list.component.css']
})
export class SubcategoryListComponent implements OnInit {
    subcategories: any[] = [];
    categories: any[] = [];
    pagination: any = {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    };
    searchTerm: string = '';
    showModal = false;
    isEdit = false;
    isUploading = false;
    currentSub: any = {
        name: '',
        category_id: null,
        image: '',
        description: '',
        type: 'selling',
        measurement_type: 'weight',
        status: 'active',
        is_editable_order: false
    };

    constructor(private core: CoreService) { }

    ngOnInit() {
        this.loadSubcategories();
        this.loadCategories();
    }

    loadSubcategories(page: number = 1) {
        const filters: any = { all: true };
        if (this.searchTerm && this.searchTerm.trim()) {
            filters.search = this.searchTerm.trim();
        }
        this.core.getData('subcategories', page, 10, filters).subscribe({
            next: (res) => {
                this.subcategories = (res.data || []).sort((a: any, b: any) => Number(a.id) - Number(b.id));
                this.pagination = res.pagination || { total: this.subcategories.length, page: 1, limit: 10, totalPages: 1 };
            },
            error: (err) => console.error('Error loading subcategories', err)
        });
    }

    onSearch() {
        this.loadSubcategories(1);
    }

    clearSearch() {
        this.searchTerm = '';
        this.loadSubcategories(1);
    }

    loadCategories() {
        this.core.getData('categories', 1, 100, { status: 'active' }).subscribe({
            next: (res) => {
                this.categories = res.data || [];
            },
            error: (err) => console.error('Error loading categories', err)
        });
    }

    onPageChange(page: number) {
        this.loadSubcategories(page);
    }

    onTypeChange() {
        if (this.currentSub.type === 'renting' || this.currentSub.type === 'services') {
            this.currentSub.measurement_type = 'duration';
        } else if (this.currentSub.type === 'helpers') {
            this.currentSub.measurement_type = 'quantity';
            this.currentSub.is_editable_order = false;
        } else if (this.currentSub.type === 'selling' && this.currentSub.measurement_type === 'duration') {
            this.currentSub.measurement_type = 'weight';
        }
    }

    openAddModal() {
        this.isEdit = false;
        this.currentSub = {
            name: '',
            category_id: this.categories[0]?.id || null,
            image: '',
            description: '',
            type: 'selling',
            measurement_type: 'weight',
            status: 'active',
            is_editable_order: false
        };
        this.showModal = true;
    }

    editSubcategory(sub: any) {
        this.isEdit = true;
        this.currentSub = { ...sub };
        this.currentSub.is_editable_order = Boolean(sub.is_editable_order);
        if (!this.currentSub.type) this.currentSub.type = 'selling';
        if (!this.currentSub.image) this.currentSub.image = '';
        if (!this.currentSub.measurement_type) {
            this.currentSub.measurement_type = this.currentSub.type === 'renting' ? 'duration' : 'weight';
        }
        this.showModal = true;
    }

    onFileSelected(event: any): void {
        const file = event.target.files?.[0];
        if (!file) return;

        this.isUploading = true;
        this.core.uploadImage(file).subscribe({
            next: (res: any) => {
                const url = res.url || res.data?.url || (res.filename ? `/uploads/${res.filename}` : '');
                if (url) {
                    this.currentSub.image = url;
                }
                this.isUploading = false;
            },
            error: (err) => {
                console.error('Image upload failed', err);
                alert('Failed to upload image. You can also paste an image URL directly.');
                this.isUploading = false;
            }
        });
    }

    removeImage(): void {
        this.currentSub.image = '';
    }

    getImageUrl(path: string): string {
        if (!path) return '';
        if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
            return path;
        }
        if (path.startsWith('/uploads') || path.startsWith('uploads')) {
            const base = environment.uploadUrl.replace(/\/uploads$/, '');
            return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
        }
        return `${environment.uploadUrl}/${path.startsWith('/') ? path.slice(1) : path}`;
    }

    saveSubcategory() {
        if (!this.currentSub.name || !this.currentSub.name.trim()) {
            alert('Subcategory name is required');
            return;
        }
        if (!this.currentSub.category_id) {
            alert('Parent Category is required');
            return;
        }

        if (this.currentSub.type === 'renting') {
            this.currentSub.measurement_type = 'duration';
        } else if (this.currentSub.type === 'helpers') {
            this.currentSub.is_editable_order = false;
        }

        const payload = {
            ...this.currentSub,
            is_editable_order: this.currentSub.is_editable_order ? 1 : 0
        };

        if (this.isEdit) {
            this.core.updateItem('subcategories', this.currentSub.id, payload).subscribe({
                next: () => {
                    this.loadSubcategories(this.pagination.page);
                    this.showModal = false;
                },
                error: (err) => {
                    const msg = err.error?.message || 'Failed to update subcategory';
                    alert(msg);
                }
            });
        } else {
            this.core.addItem('subcategories', payload).subscribe({
                next: () => {
                    this.loadSubcategories(1);
                    this.showModal = false;
                },
                error: (err) => {
                    const msg = err.error?.message || 'Failed to create subcategory';
                    alert(msg);
                }
            });
        }
    }

    toggleStatus(sub: any) {
        const newStatus = sub.status === 'active' ? 'inactive' : 'active';
        this.core.updateItem('subcategories', sub.id, { status: newStatus }).subscribe({
            next: () => {
                sub.status = newStatus;
            },
            error: () => alert('Failed to update subcategory status')
        });
    }

    deleteSubcategory(id: any) {
        if (confirm('Are you sure you want to delete this subcategory? Deleting is only allowed if no products are assigned to it.')) {
            this.core.deleteItem('subcategories', id).subscribe({
                next: () => {
                    this.loadSubcategories(this.pagination.page);
                },
                error: (err) => {
                    const msg = err.error?.message || 'Failed to delete subcategory';
                    alert(msg);
                }
            });
        }
    }
}
