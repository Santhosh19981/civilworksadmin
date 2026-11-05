import { Component, OnInit } from '@angular/core';
import { CoreService } from '../../services/core.service';

@Component({
    selector: 'app-advertisement-list',
    templateUrl: './advertisement-list.component.html',
    styleUrls: ['./advertisement-list.component.css']
})
export class AdvertisementListComponent implements OnInit {
    advertisements: any[] = [];
    filteredAds: any[] = [];
    mainCategories: any[] = [];
    selectedSectorFilter: string = '';
    searchQuery: string = '';
    isLoading: boolean = false;
    isUploading: boolean = false;
    errorMessage: string = '';
    successMessage: string = '';

    showModal: boolean = false;
    isEdit: boolean = false;
    showPreviewModal: boolean = false;
    previewMode: 'desktop' | 'tablet' | 'mobile' = 'desktop';
    previewAd: any = null;
    deleteConfirmAd: any = null;
    isDeleting: boolean = false;

    currentAd: any = {
        main_category_id: null,
        tag: '',
        title: '',
        subtitle: '',
        cta: '',
        cta_link: '',
        assurance_badge: '',
        image: '',
        status: 'active',
        sort_order: null
    };

    presetRoutes = [
        { label: 'Products Catalog (All)', value: '/tabs/products' },
        { label: 'Heavy Machinery Rentals', value: '/tabs/rentals' },
        { label: 'Skilled Helpers & Labor', value: '/helpers' },
        { label: 'Cart Page', value: '/cart' }
    ];

    constructor(private core: CoreService) { }

    ngOnInit(): void {
        this.loadMainCategories();
        this.loadAdvertisements();
    }

    loadMainCategories(): void {
        this.core.getData('main-categories', 1, 100, { all: true }).subscribe({
            next: (res) => {
                this.mainCategories = res.data || [];
            },
            error: (err) => {
                console.error('Error loading main categories', err);
            }
        });
    }

    loadAdvertisements(): void {
        this.isLoading = true;
        this.errorMessage = '';
        const filters: any = { all: true };
        if (this.selectedSectorFilter) {
            filters.main_category_id = this.selectedSectorFilter;
        }

        this.core.getData('banners', 1, 100, filters).subscribe({
            next: (res) => {
                this.advertisements = res.data || [];
                this.applySearchFilter();
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading advertisements', err);
                this.errorMessage = 'Failed to load advertisements. Please try again.';
                this.isLoading = false;
            }
        });
    }

    onSectorFilterChange(): void {
        this.loadAdvertisements();
    }

    applySearchFilter(): void {
        if (!this.searchQuery.trim()) {
            this.filteredAds = [...this.advertisements];
            return;
        }
        const q = this.searchQuery.toLowerCase();
        this.filteredAds = this.advertisements.filter(ad =>
            (ad.title && ad.title.toLowerCase().includes(q)) ||
            (ad.tag && ad.tag.toLowerCase().includes(q)) ||
            (ad.subtitle && ad.subtitle.toLowerCase().includes(q)) ||
            (ad.main_category_name && ad.main_category_name.toLowerCase().includes(q))
        );
    }

    openAddModal(): void {
        this.isEdit = false;
        this.errorMessage = '';
        this.successMessage = '';
        this.currentAd = {
            main_category_id: null,
            tag: '',
            title: '',
            subtitle: '',
            cta: '',
            cta_link: '',
            assurance_badge: '',
            image: '',
            status: 'active',
            sort_order: null
        };
        this.showModal = true;
    }

    editAdvertisement(ad: any): void {
        this.isEdit = true;
        this.errorMessage = '';
        this.successMessage = '';
        this.currentAd = { ...ad };
        this.showModal = true;
    }

    onMainCategorySelect(): void {
        // Intentionally left clear so user can define target URL themselves
    }

    onFileSelected(event: any): void {
        const file = event.target.files?.[0];
        if (!file) return;

        this.isUploading = true;
        this.core.uploadImage(file).subscribe({
            next: (res: any) => {
                const url = res.url || res.data?.url || (res.filename ? `/uploads/${res.filename}` : '');
                if (url) {
                    this.currentAd.image = url;
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

    saveAdvertisement(): void {
        if (!this.currentAd.main_category_id) {
            alert('Please select the Main Category this advertisement belongs to.');
            return;
        }
        if (!this.currentAd.title || !this.currentAd.title.trim()) {
            alert('Advertisement Title is required.');
            return;
        }
        if (!this.currentAd.image || !this.currentAd.image.trim()) {
            alert('Banner Image URL or upload is required.');
            return;
        }

        const payload = {
            main_category_id: Number(this.currentAd.main_category_id),
            tag: this.currentAd.tag ? this.currentAd.tag.trim() : null,
            title: this.currentAd.title.trim(),
            subtitle: this.currentAd.subtitle ? this.currentAd.subtitle.trim() : null,
            cta: this.currentAd.cta ? this.currentAd.cta.trim() : null,
            cta_link: this.currentAd.cta_link ? this.currentAd.cta_link.trim() : null,
            assurance_badge: this.currentAd.assurance_badge ? this.currentAd.assurance_badge.trim() : null,
            image: this.currentAd.image.trim(),
            type: 'category',
            status: this.currentAd.status || 'active',
            sort_order: Number(this.currentAd.sort_order) || 1
        };

        if (this.isEdit) {
            this.core.updateItem('banners', this.currentAd.id, payload).subscribe({
                next: () => {
                    this.showModal = false;
                    this.loadAdvertisements();
                },
                error: (err) => {
                    const msg = err.error?.message || 'Failed to update advertisement';
                    alert(msg);
                }
            });
        } else {
            this.core.addItem('banners', payload).subscribe({
                next: () => {
                    this.showModal = false;
                    this.loadAdvertisements();
                },
                error: (err) => {
                    const msg = err.error?.message || 'Failed to create advertisement';
                    alert(msg);
                }
            });
        }
    }

    toggleStatus(ad: any): void {
        const newStatus = ad.status === 'active' ? 'inactive' : 'active';
        this.core.updateItem('banners', ad.id, { status: newStatus }).subscribe({
            next: () => {
                ad.status = newStatus;
            },
            error: (err) => {
                console.error('Status toggle failed', err);
                alert('Failed to update status');
            }
        });
    }

    openDeleteConfirm(ad: any): void {
        this.deleteConfirmAd = ad;
    }

    closeDeleteConfirm(): void {
        this.deleteConfirmAd = null;
    }

    confirmDelete(): void {
        if (!this.deleteConfirmAd) return;
        this.isDeleting = true;
        this.core.deleteItem('banners', this.deleteConfirmAd.id).subscribe({
            next: () => {
                this.isDeleting = false;
                this.deleteConfirmAd = null;
                this.loadAdvertisements();
            },
            error: (err) => {
                this.isDeleting = false;
                const msg = err.error?.message || 'Failed to delete advertisement';
                alert(msg);
            }
        });
    }

    deleteAdvertisement(adOrId: any): void {
        if (adOrId && typeof adOrId === 'object') {
            this.openDeleteConfirm(adOrId);
        } else {
            const ad = this.advertisements.find(a => a.id === adOrId);
            if (ad) {
                this.openDeleteConfirm(ad);
            } else if (confirm('Are you sure you want to delete this Hero Advertisement?')) {
                this.core.deleteItem('banners', adOrId).subscribe({
                    next: () => this.loadAdvertisements(),
                    error: (err) => alert(err.error?.message || 'Failed to delete advertisement')
                });
            }
        }
    }

    getMainCategoryName(id: number): string {
        const cat = this.mainCategories.find(m => m.id == id);
        return cat ? cat.name : `Sector #${id}`;
    }

    getMainCategoryThemeClass(id: number): string {
        const num = Number(id);
        if (num === 1) return 'bg-amber-50 text-amber-700 border-amber-200';
        if (num === 2) return 'bg-purple-50 text-purple-700 border-purple-200';
        if (num === 3) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }

    openPreviewModal(ad?: any): void {
        if (ad) {
            this.previewAd = { ...ad };
        } else {
            this.previewAd = { ...this.currentAd };
        }
        this.showPreviewModal = true;
    }

    closePreviewModal(): void {
        this.showPreviewModal = false;
    }

    setPreviewMode(mode: 'desktop' | 'tablet' | 'mobile'): void {
        this.previewMode = mode;
    }

    saveFromPreview(): void {
        this.showPreviewModal = false;
        this.saveAdvertisement();
    }
}
