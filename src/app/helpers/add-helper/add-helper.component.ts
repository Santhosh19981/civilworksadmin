import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CoreService } from '../../services/core.service';

@Component({
    selector: 'app-add-helper',
    templateUrl: './add-helper.component.html'
})
export class AddHelperComponent implements OnInit {
    helper: any = {
        service_name: '',
        main_category_id: null,
        category_id: null,
        subcategory_id: null,
        price_per_day: 0,
        mobile: '',
        image: '',
        description: '',
        status: 'Active'
    };

    mainCategories: any[] = [];
    allCategories: any[] = [];
    filteredCategories: any[] = [];
    subcategories: any[] = [];
    saving = false;

    constructor(private core: CoreService, private router: Router) { }

    ngOnInit() {
        this.loadMasterData();
    }

    loadMasterData() {
        // Load Main Categories
        this.core.getData('main-categories', 1, 100, { all: true }).subscribe({
            next: (res: any) => {
                this.mainCategories = res.data || [];
            }
        });

        // Load Categories
        this.core.getData('categories', 1, 1000, { all: true }).subscribe({
            next: (res: any) => {
                this.allCategories = res.data || [];
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
        this.core.addItem('helpers', this.helper).subscribe({
            next: () => {
                this.saving = false;
                alert('Helper service added successfully!');
                this.router.navigate(['/helpers/services']);
            },
            error: (err) => {
                this.saving = false;
                console.error('Error adding helper', err);
                alert('Failed to add helper service: ' + (err.error?.message || err.message));
            }
        });
    }
}
