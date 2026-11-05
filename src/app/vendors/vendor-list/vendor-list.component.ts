import { Component, OnInit } from '@angular/core';
import { CoreService } from '../../services/core.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-vendor-list',
    templateUrl: './vendor-list.component.html',
    styleUrls: ['./vendor-list.component.css']
})
export class VendorListComponent implements OnInit {
    vendors: any[] = [];
    subcategories: any[] = [];
    isLoading = false;
    errorMessage = '';

    pagination: any = {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    };

    filterSubcategoryId: string = '';
    searchQuery: string = '';

    isUploading = false;
    showModal = false;
    isEdit = false;
    currentVendor: any = {
        name: '',
        mobile: '',
        email: '',
        image: '',
        status: 'active',
        services: []
    };
    selectedSubcategoryIds: number[] = [];

    constructor(private core: CoreService) { }

    ngOnInit() {
        this.loadSubcategories();
        this.loadVendors();
    }

    loadSubcategories() {
        // Only load subcategories under service type
        this.core.getData('subcategories', 1, 100, { all: true, type: 'services' }).subscribe({
            next: (res) => {
                this.subcategories = (res.data || []).filter((s: any) => 
                    s.type === 'services' || (s.business_type && s.business_type.toLowerCase().includes('service'))
                );
            },
            error: (err) => console.error('Error loading subcategories', err)
        });
    }

    loadVendors(page: number = 1) {
        this.isLoading = true;
        this.errorMessage = '';
        const params: any = { all: true };
        if (this.filterSubcategoryId) {
            params.subcategory_id = this.filterSubcategoryId;
        }
        if (this.searchQuery) {
            params.search = this.searchQuery;
        }

        this.core.getData('vendors', page, 10, params).subscribe({
            next: (res) => {
                this.vendors = (res.data || []).sort((a: any, b: any) => Number(a.id) - Number(b.id));
                this.pagination = res.pagination || { total: this.vendors.length, page: 1, limit: 10, totalPages: 1 };
                this.isLoading = false;
            },
            error: (err) => {
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Failed to load vendors';
            }
        });
    }

    onSearch() {
        this.loadVendors(1);
    }

    onFilterChange() {
        this.loadVendors(1);
    }

    onPageChange(page: number) {
        this.loadVendors(page);
    }

    openAddModal() {
        this.isEdit = false;
        this.currentVendor = {
            name: '',
            mobile: '',
            email: '',
            image: '',
            status: 'active',
            services: []
        };
        this.selectedSubcategoryIds = [];
        this.showModal = true;
    }

    editVendor(vendor: any) {
        this.isEdit = true;
        this.currentVendor = { ...vendor, image: vendor.image || '' };
        this.selectedSubcategoryIds = (vendor.services || []).map((s: any) => s.id);
        this.showModal = true;
    }

    onFileSelected(event: any) {
        const file = event.target.files?.[0];
        if (!file) return;

        this.isUploading = true;
        this.core.uploadImage(file).subscribe({
            next: (res: any) => {
                const url = res.url || res.data?.url || (res.filename ? `/uploads/${res.filename}` : '');
                if (url) {
                    this.currentVendor.image = url;
                }
                this.isUploading = false;
            },
            error: (err) => {
                console.error('Image upload failed', err);
                alert('Failed to upload vendor image. Please try again.');
                this.isUploading = false;
            }
        });
    }

    getImageUrl(img: string): string {
        if (!img) return '';
        if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) {
            return img;
        }
        if (img.startsWith('/uploads') || img.startsWith('uploads')) {
            const base = environment.uploadUrl.replace(/\/uploads$/, '');
            return `${base}${img.startsWith('/') ? '' : '/'}${img}`;
        }
        return `${environment.uploadUrl}/${img.startsWith('/') ? img.slice(1) : img}`;
    }

    isSubcategorySelected(subId: number): boolean {
        return this.selectedSubcategoryIds.includes(subId);
    }

    toggleSubcategory(subId: number) {
        const index = this.selectedSubcategoryIds.indexOf(subId);
        if (index > -1) {
            this.selectedSubcategoryIds.splice(index, 1);
        } else {
            this.selectedSubcategoryIds.push(subId);
        }
    }

    saveVendor() {
        if (!this.currentVendor.name || !this.currentVendor.name.trim()) {
            alert('Vendor name is required');
            return;
        }
        if (!this.currentVendor.mobile || !this.currentVendor.mobile.trim()) {
            alert('Mobile number is required');
            return;
        }

        const payload = {
            name: this.currentVendor.name.trim(),
            mobile: this.currentVendor.mobile.trim(),
            email: this.currentVendor.email ? this.currentVendor.email.trim() : null,
            image: this.currentVendor.image ? this.currentVendor.image.trim() : null,
            status: this.currentVendor.status,
            services: this.selectedSubcategoryIds
        };

        if (this.isEdit) {
            this.core.updateItem('vendors', this.currentVendor.id, payload).subscribe({
                next: () => {
                    this.loadVendors(this.pagination.page);
                    this.showModal = false;
                },
                error: (err) => {
                    const msg = err.error?.message || 'Failed to update vendor';
                    alert(msg);
                }
            });
        } else {
            this.core.addItem('vendors', payload).subscribe({
                next: () => {
                    this.loadVendors(1);
                    this.showModal = false;
                },
                error: (err) => {
                    const msg = err.error?.message || 'Failed to create vendor';
                    alert(msg);
                }
            });
        }
    }

    activeDropdownId: any = null;
    vendorToDelete: any = null;
    showDeleteModal = false;
    isDeleting = false;
    successMessage = '';

    toggleDropdown(vendorId: any, event: Event) {
        event.stopPropagation();
        this.activeDropdownId = this.activeDropdownId === vendorId ? null : vendorId;
    }

    closeDropdowns() {
        this.activeDropdownId = null;
    }

    toggleStatus(vendor: any, event?: Event) {
        if (event) event.stopPropagation();
        const newStatus = vendor.status === 'active' ? 'inactive' : 'active';
        this.core.updateItem('vendors', vendor.id, { status: newStatus }).subscribe({
            next: () => {
                vendor.status = newStatus;
                this.successMessage = `Status updated for ${vendor.name} to ${newStatus}.`;
                setTimeout(() => this.successMessage = '', 3000);
            },
            error: () => alert('Failed to update vendor status')
        });
    }

    promptDeleteVendor(vendor: any, event?: Event) {
        if (event) event.stopPropagation();
        this.closeDropdowns();
        this.vendorToDelete = vendor;
        this.showDeleteModal = true;
    }

    cancelDelete() {
        this.showDeleteModal = false;
        this.vendorToDelete = null;
        this.isDeleting = false;
    }

    confirmDeleteVendor() {
        if (!this.vendorToDelete || !this.vendorToDelete.id) return;
        const vendor = this.vendorToDelete;
        this.isDeleting = true;

        this.core.deleteItem('vendors', vendor.id).subscribe({
            next: () => {
                this.isDeleting = false;
                this.showDeleteModal = false;
                this.vendorToDelete = null;
                this.successMessage = `Vendor "${vendor.name}" deleted successfully.`;
                setTimeout(() => this.successMessage = '', 4000);
                this.loadVendors(this.pagination.page);
            },
            error: (err) => {
                this.isDeleting = false;
                this.showDeleteModal = false;
                this.vendorToDelete = null;
                this.errorMessage = err.error?.message || 'Failed to delete vendor';
            }
        });
    }

    deleteVendor(vendorOrId: any, event?: Event) {
        const vendor = typeof vendorOrId === 'object' ? vendorOrId : this.vendors.find(v => v.id == vendorOrId);
        this.promptDeleteVendor(vendor, event);
    }
}
