import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CoreService } from '../../services/core.service';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-rental-form',
    templateUrl: './rental-form.component.html',
    styleUrls: ['./rental-form.component.css']
})
export class RentalFormComponent implements OnInit {
    isEdit = false;
    rental: any = {
        name: '',
        mobile: '',
        description: '',
        image: '',
        price_per_day: 0,
        available: true,
        status: 'active',
        featured: false,
        main_category_id: null,
        category_id: null,
        subcategory_id: null,
        unit_id: null,
        rental_category_id: null
    };
    isUploading = false;

    mainCategories: any[] = [];
    allCategories: any[] = [];
    filteredCategories: any[] = [];
    subcategories: any[] = [];
    durationUnits: any[] = [];

    constructor(private route: ActivatedRoute, private router: Router, private core: CoreService) { }

    ngOnInit() {
        this.loadHierarchy();
    }

    loadHierarchy() {
        // 1. Load Main Categories
        this.core.getData('main-categories', 1, 100, { all: true }).subscribe({
            next: (res) => this.mainCategories = res.data || []
        });

        // 2. Load Categories
        this.core.getData('categories', 1, 100, { all: true }).subscribe({
            next: (res) => {
                this.allCategories = res.data || [];
                if (this.rental.main_category_id) {
                    this.onMainCategoryChange(false);
                }
            }
        });

        // 3. Load Duration Units
        this.core.getData('units', 1, 100, { all: true }).subscribe({
            next: (res) => {
                const units = res.data || [];
                this.durationUnits = units.filter((u: any) => u.unit_category === 'renting_duration');
                if (!this.rental.unit_id && this.durationUnits.length > 0) {
                    const days = this.durationUnits.find((u: any) => u.name.toLowerCase() === 'days') || this.durationUnits[0];
                    this.rental.unit_id = days.id;
                }
            }
        });

        // 4. Load Rental Data if Editing
        const id = this.route.snapshot.params['id'];
        if (id) {
            this.isEdit = true;
            this.core.getData('rentals').pipe(map(res => res.data)).subscribe(rentals => {
                const found = rentals.find((r: any) => r.id == id);
                if (found) {
                    this.rental = { ...found };
                    if (this.rental.main_category_id) {
                        this.onMainCategoryChange(false);
                    }
                    if (this.rental.category_id) {
                        this.updateSubcategories(false);
                    }
                }
            });
        }
    }

    onMainCategoryChange(resetChildren: boolean = true) {
        if (resetChildren) {
            this.rental.category_id = null;
            this.rental.subcategory_id = null;
            this.subcategories = [];
        }

        if (this.rental.main_category_id) {
            this.filteredCategories = this.allCategories.filter(
                c => c.main_category_id == this.rental.main_category_id
            );
        } else {
            this.filteredCategories = this.allCategories;
        }
    }

    onCategoryChange() {
        this.rental.subcategory_id = null;
        this.updateSubcategories(true);
    }

    updateSubcategories(resetSub: boolean = true) {
        if (this.rental.category_id) {
            this.core.getData('subcategories', 1, 100, { category_id: this.rental.category_id, all: true }).subscribe({
                next: (res) => {
                    const subs = res.data || [];
                    // Prefer renting subcategories, or show all if none specifically renting
                    this.subcategories = subs;
                }
            });
        } else {
            this.subcategories = [];
        }
    }

    onFileChange(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.uploadFile(file);
        }
    }

    onPaste(event: ClipboardEvent) {
        const items = event.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                if (blob) {
                    this.uploadFile(blob);
                    break;
                }
            }
        }
    }

    uploadFile(file: File | Blob) {
        this.isUploading = true;
        
        // Local preview
        const reader = new FileReader();
        reader.onload = (e: any) => this.rental.image = e.target.result;
        reader.readAsDataURL(file);

        // Server upload
        this.core.uploadImage(file).subscribe({
            next: (res) => {
                this.rental.image = res?.url || res?.data?.url || (res?.filename ? `/uploads/${res.filename}` : '');
                this.isUploading = false;
            },
            error: (err) => {
                console.error('Rental upload failed', err);
                this.isUploading = false;
                const msg = err.error?.message || 'Upload failed. Please try again.';
                alert(msg);
            }
        });
    }

    onSubmit() {
        if (!this.rental.name || !this.rental.name.trim()) {
            alert('Rental name is required');
            return;
        }
        if (!this.rental.main_category_id) {
            alert('Main Category is required');
            return;
        }
        if (!this.rental.category_id) {
            alert('Category is required');
            return;
        }
        if (!this.rental.subcategory_id) {
            alert('Sub Category is required');
            return;
        }

        const payload = {
            ...this.rental,
            price_per_day: Number(this.rental.price_per_day) || 0
        };

        if (this.isEdit) {
            this.core.updateItem('rentals', this.rental.id, payload).subscribe({
                next: () => this.router.navigate(['/rentals']),
                error: (err) => alert(err.error?.message || 'Failed to update rental')
            });
        } else {
            this.core.addItem('rentals', payload).subscribe({
                next: () => this.router.navigate(['/rentals']),
                error: (err) => alert(err.error?.message || 'Failed to create rental')
            });
        }
    }
}
