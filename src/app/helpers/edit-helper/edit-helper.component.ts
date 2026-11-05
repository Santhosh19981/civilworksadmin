import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CoreService } from '../../services/core.service';

@Component({
    selector: 'app-edit-helper',
    templateUrl: './edit-helper.component.html'
})
export class EditHelperComponent implements OnInit {
    id: any;
    helper: any = null;
    mainCategories: any[] = [];
    allCategories: any[] = [];
    filteredCategories: any[] = [];
    subcategories: any[] = [];
    saving = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private core: CoreService
    ) { }

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.loadMasterData();
    }

    loadMasterData() {
        this.core.getData('main-categories', 1, 100, { all: true }).subscribe({
            next: (mainRes: any) => {
                this.mainCategories = mainRes.data || [];
            }
        });

        this.core.getData('categories', 1, 1000, { all: true }).subscribe({
            next: (catRes: any) => {
                this.allCategories = catRes.data || [];
                this.loadHelper();
            }
        });
    }

    loadHelper() {
        this.core.getData(`helpers/${this.id}`).subscribe({
            next: (res: any) => {
                this.helper = res.data;
                this.helper.service_name = this.helper.service_name || this.helper.serviceName || this.helper.name;
                this.helper.main_category_id = this.helper.main_category_id || this.helper.mainCategoryId || null;
                this.helper.category_id = this.helper.category_id || this.helper.categoryId || null;
                this.helper.subcategory_id = this.helper.subcategory_id || this.helper.subcategoryId || null;
                this.helper.price_per_day = this.helper.price_per_day || this.helper.pricePerDay || 0;

                if (this.helper.main_category_id) {
                    const targetId = Number(this.helper.main_category_id);
                    this.filteredCategories = this.allCategories.filter(c => {
                        if (Array.isArray(c.main_category_ids) && c.main_category_ids.map(Number).includes(targetId)) {
                            return true;
                        }
                        return Number(c.main_category_id) === targetId;
                    });
                }

                if (this.helper.category_id) {
                    this.core.getData('subcategories', 1, 1000, { category_id: this.helper.category_id, all: true }).subscribe({
                        next: (subRes: any) => {
                            this.subcategories = subRes.data || [];
                        }
                    });
                }
            },
            error: (err) => {
                console.error('Error loading helper', err);
            }
        });
    }

    onMainCategoryChange() {
        this.helper.category_id = null;
        this.helper.subcategory_id = null;
        this.subcategories = [];

        if (this.helper.main_category_id) {
            const targetId = Number(this.helper.main_category_id);
            this.filteredCategories = this.allCategories.filter(c => {
                if (Array.isArray(c.main_category_ids) && c.main_category_ids.map(Number).includes(targetId)) {
                    return true;
                }
                return Number(c.main_category_id) === targetId;
            });
        } else {
            this.filteredCategories = [];
        }
    }

    onCategoryChange() {
        this.helper.subcategory_id = null;
        this.subcategories = [];

        if (this.helper.category_id) {
            this.core.getData('subcategories', 1, 1000, { category_id: this.helper.category_id, all: true }).subscribe({
                next: (res: any) => {
                    this.subcategories = res.data || [];
                }
            });
        }
    }

    onSubmit() {
        if (!this.helper.service_name || !this.helper.main_category_id) {
            alert('Please enter service name and select a main category.');
            return;
        }

        this.saving = true;
        this.core.updateItem('helpers', parseInt(this.id), this.helper).subscribe({
            next: () => {
                this.saving = false;
                alert('Helper updated successfully!');
                this.router.navigate(['/helpers/services']);
            },
            error: (err) => {
                this.saving = false;
                console.error('Error updating helper', err);
                alert('Failed to update helper service: ' + (err.error?.message || err.message));
            }
        });
    }
}
