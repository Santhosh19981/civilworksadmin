import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CoreService } from '../../services/core.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-vendor-form',
    templateUrl: './vendor-form.component.html',
    styleUrls: ['./vendor-form.component.css']
})
export class VendorFormComponent implements OnInit {
    isEdit = false;
    vendorId: any = null;
    isLoading = false;
    isUploading = false;
    errorMessage = '';
    successMessage = '';

    vendor: any = {
        name: '',
        mobile: '',
        email: '',
        image: '',
        status: 'active',
        services: []
    };

    allSubcategories: any[] = [];
    serviceSubcategories: any[] = [];
    selectedSubcategoryIds: number[] = [];
    serviceSearchQuery: string = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private core: CoreService
    ) { }

    ngOnInit() {
        this.loadMasterData();
    }

    loadMasterData() {
        this.isLoading = true;
        // Load all subcategories with full details
        this.core.getData('subcategories', 1, 1000, { all: true }).subscribe({
            next: (res) => {
                this.allSubcategories = res.data || [];
                // Filter subcategories that belong to services or have business_type services
                this.serviceSubcategories = this.allSubcategories.filter((s: any) =>
                    s.type === 'services' || (s.business_type && s.business_type.toLowerCase().includes('service'))
                );

                // If no subcategories marked 'services', fallback to showing all subcategories as options
                if (this.serviceSubcategories.length === 0) {
                    this.serviceSubcategories = this.allSubcategories;
                }

                // Check for edit route param
                const id = this.route.snapshot.params['id'];
                if (id) {
                    this.isEdit = true;
                    this.vendorId = id;
                    this.loadVendorDetails(id);
                } else {
                    this.isLoading = false;
                }
            },
            error: (err) => {
                console.error('Error loading subcategories', err);
                this.isLoading = false;
            }
        });
    }

    loadVendorDetails(id: any) {
        this.core.getData('vendors', 1, 100, { all: true }).subscribe({
            next: (res) => {
                const found = (res.data || []).find((v: any) => v.id == id);
                if (found) {
                    this.vendor = {
                        name: found.name || '',
                        mobile: found.mobile || '',
                        email: found.email || '',
                        image: found.image || '',
                        status: found.status || 'active',
                        services: found.services || []
                    };
                    this.selectedSubcategoryIds = (found.services || []).map((s: any) => s.id);
                } else {
                    this.errorMessage = 'Vendor not found.';
                }
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error fetching vendor', err);
                this.errorMessage = err.error?.message || 'Failed to load vendor details';
                this.isLoading = false;
            }
        });
    }

    get filteredServices() {
        if (!this.serviceSearchQuery || !this.serviceSearchQuery.trim()) {
            return this.serviceSubcategories;
        }
        const q = this.serviceSearchQuery.toLowerCase().trim();
        return this.serviceSubcategories.filter(s =>
            (s.name && s.name.toLowerCase().includes(q)) ||
            (s.category_name && s.category_name.toLowerCase().includes(q))
        );
    }

    isSubcategorySelected(subId: number): boolean {
        return this.selectedSubcategoryIds.includes(Number(subId));
    }

    toggleSubcategory(subId: number) {
        const id = Number(subId);
        const index = this.selectedSubcategoryIds.indexOf(id);
        if (index > -1) {
            this.selectedSubcategoryIds.splice(index, 1);
        } else {
            this.selectedSubcategoryIds.push(id);
        }
    }

    selectAllServices() {
        this.selectedSubcategoryIds = this.filteredServices.map(s => Number(s.id));
    }

    clearAllServices() {
        this.selectedSubcategoryIds = [];
    }

    onFileSelected(event: any) {
        const file = event.target.files?.[0];
        if (!file) return;

        this.isUploading = true;
        this.core.uploadImage(file).subscribe({
            next: (res: any) => {
                const url = res.url || res.data?.url || (res.filename ? `/uploads/${res.filename}` : '');
                if (url) {
                    this.vendor.image = url;
                }
                this.isUploading = false;
            },
            error: (err) => {
                console.error('Image upload failed', err);
                alert('Failed to upload vendor photo. Please try again.');
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

    removeImage() {
        this.vendor.image = '';
    }

    saveVendor() {
        if (!this.vendor.name || !this.vendor.name.trim()) {
            alert('Vendor name is required');
            return;
        }
        if (!this.vendor.mobile || !this.vendor.mobile.trim()) {
            alert('Mobile number is required');
            return;
        }

        const payload = {
            name: this.vendor.name.trim(),
            mobile: this.vendor.mobile.trim(),
            email: this.vendor.email ? this.vendor.email.trim() : null,
            image: this.vendor.image ? this.vendor.image.trim() : null,
            status: this.vendor.status,
            services: this.selectedSubcategoryIds
        };

        this.isLoading = true;
        this.errorMessage = '';

        if (this.isEdit) {
            this.core.updateItem('vendors', this.vendorId, payload).subscribe({
                next: () => {
                    this.isLoading = false;
                    this.router.navigate(['/vendors']);
                },
                error: (err) => {
                    this.isLoading = false;
                    this.errorMessage = err.error?.message || 'Failed to update vendor';
                    alert(this.errorMessage);
                }
            });
        } else {
            this.core.addItem('vendors', payload).subscribe({
                next: () => {
                    this.isLoading = false;
                    this.router.navigate(['/vendors']);
                },
                error: (err) => {
                    this.isLoading = false;
                    this.errorMessage = err.error?.message || 'Failed to create vendor';
                    alert(this.errorMessage);
                }
            });
        }
    }
}
