import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CoreService } from '../../services/core.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-product-form',
    templateUrl: './product-form.component.html',
    styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {
    isEdit = false;
    product: any = {
        name: '',
        category_id: null,
        subcategory_id: null,
        unit_id: null,
        price: 0,
        stock: 0,
        description: '',
        status: 'active',
        image: '',
        skills: null
    };

    subcategories: any[] = [];
    allUnits: any[] = [];
    compatibleUnits: any[] = [];
    selectedSubcategory: any = null;
    skillsList: any[] = [];
    selectedSkills: string[] = [];

    imagePreview: any = '';
    isUploading = false;
    defaultImage = 'assets/images/placeholder-product.png';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private core: CoreService
    ) { }

    ngOnInit() {
        this.loadMasterData();
    }

    loadMasterData() {
        // Load All Units
        this.core.getData('units', 1, 1000, { all: true }).subscribe({
            next: (unitsRes) => {
                this.allUnits = unitsRes.data || [];
                if (this.selectedSubcategory) {
                    this.filterUnits();
                }
            }
        });

        // Load Skills (for helpers business type)
        this.core.getData('skills', 1, 1000, { all: true }).subscribe({
            next: (skillsRes) => {
                this.skillsList = skillsRes.data || [];
            }
        });

        // Load Subcategories (direct master list)
        this.core.getData('subcategories', 1, 1000, { all: true }).subscribe({
            next: (subRes) => {
                this.subcategories = (subRes.data || []).sort((a: any, b: any) => 
                    (a.name || '').localeCompare(b.name || '')
                );

                const id = this.route.snapshot.params['id'];
                if (id) {
                    this.isEdit = true;
                    this.core.getData('products', 1, 1000, { all: true }).subscribe({
                        next: (productsRes) => {
                            const found = (productsRes.data || []).find((p: any) => p.id == id);
                            if (found) {
                                this.product = { ...found };
                                this.imagePreview = this.product.image;

                                // Parse selected skills if available
                                if (this.product.skills) {
                                    try {
                                        this.selectedSkills = Array.isArray(this.product.skills)
                                            ? this.product.skills
                                            : JSON.parse(this.product.skills);
                                    } catch (e) {
                                        this.selectedSkills = typeof this.product.skills === 'string'
                                            ? this.product.skills.split(',').map((s: string) => s.trim())
                                            : [];
                                    }
                                }

                                this.onSubcategoryChange(false);
                            }
                        }
                    });
                }
            }
        });
    }

    onSubcategoryChange(resetUnit: boolean = true) {
        if (resetUnit) {
            this.product.unit_id = null;
        }

        this.selectedSubcategory = this.subcategories.find(s => s.id == this.product.subcategory_id) || null;
        if (this.selectedSubcategory) {
            this.product.category_id = this.selectedSubcategory.category_id;
            this.filterUnits();

            if (resetUnit && this.compatibleUnits.length > 0 && !this.product.unit_id) {
                this.product.unit_id = this.compatibleUnits[0].id;
            }
        } else {
            this.compatibleUnits = this.allUnits;
        }
    }

    filterUnits() {
        if (!this.selectedSubcategory) {
            this.compatibleUnits = this.allUnits;
            return;
        }

        const { type, measurement_type } = this.selectedSubcategory;
        if (type === 'selling') {
            if (measurement_type === 'weight') {
                this.compatibleUnits = this.allUnits.filter(u => u.unit_category === 'selling_weight');
            } else if (measurement_type === 'length') {
                this.compatibleUnits = this.allUnits.filter(u => u.unit_category === 'selling_length');
            } else if (measurement_type === 'quantity') {
                this.compatibleUnits = this.allUnits.filter(u => u.unit_category === 'selling_quantity');
            } else if (measurement_type === 'volume') {
                this.compatibleUnits = this.allUnits.filter(u => u.unit_category === 'selling_volume');
            } else {
                this.compatibleUnits = this.allUnits.filter(u => u.unit_category.startsWith('selling'));
            }
        } else if (type === 'renting' || type === 'services') {
            this.compatibleUnits = this.allUnits.filter(u => u.unit_category.startsWith('renting') || u.name.toLowerCase().includes('contract'));
        } else if (type === 'helpers') {
            this.compatibleUnits = this.allUnits.filter(u => 
                u.unit_category.startsWith('selling_quantity') || 
                u.unit_category.startsWith('renting_') ||
                u.name.toLowerCase().includes('worker') ||
                u.name.toLowerCase().includes('person') ||
                u.name.toLowerCase().includes('shift') ||
                u.name.toLowerCase().includes('day') ||
                u.name.toLowerCase().includes('count')
            );
            if (this.compatibleUnits.length === 0) {
                this.compatibleUnits = this.allUnits;
            }
        } else {
            this.compatibleUnits = this.allUnits;
        }

        const contractUnit = this.allUnits.find(u => u.name.toLowerCase().includes('contract'));
        if (contractUnit && !this.compatibleUnits.some(u => u.id === contractUnit.id)) {
            this.compatibleUnits.push(contractUnit);
        }

        if (this.product.unit_id) {
            const currentUnit = this.allUnits.find(u => u.id == this.product.unit_id);
            if (currentUnit && !this.compatibleUnits.some(u => u.id == currentUnit.id)) {
                this.compatibleUnits.push(currentUnit);
            }
        }
    }

    // Quick Unit Creation Modal State
    showQuickUnitModal = false;
    quickUnit: any = { name: '', unit_category: 'selling_quantity', status: 'active' };

    openQuickUnitModal() {
        let defaultCat = 'selling_quantity';
        if (this.selectedSubcategory) {
            if (this.selectedSubcategory.type === 'renting') {
                defaultCat = 'renting_duration';
            } else if (this.selectedSubcategory.measurement_type === 'weight') {
                defaultCat = 'selling_weight';
            } else if (this.selectedSubcategory.measurement_type === 'length') {
                defaultCat = 'selling_length';
            } else if (this.selectedSubcategory.measurement_type === 'quantity') {
                defaultCat = 'selling_quantity';
            } else if (this.selectedSubcategory.measurement_type === 'volume') {
                defaultCat = 'selling_volume';
            }
        }
        this.quickUnit = { name: '', unit_category: defaultCat, status: 'active' };
        this.showQuickUnitModal = true;
    }

    saveQuickUnit() {
        if (!this.quickUnit.name || !this.quickUnit.name.trim()) {
            alert('Unit name is required');
            return;
        }

        this.core.addItem('units', this.quickUnit).subscribe({
            next: (res) => {
                const createdUnit = res.data || res;
                if (createdUnit && createdUnit.id) {
                    const exists = this.allUnits.some(u => u.id == createdUnit.id);
                    if (!exists) {
                        this.allUnits = [createdUnit, ...this.allUnits];
                    }
                    this.onSubcategoryChange(false);
                    if (!this.compatibleUnits.some(u => u.id == createdUnit.id)) {
                        this.compatibleUnits = [createdUnit, ...this.compatibleUnits];
                    }
                    this.product.unit_id = createdUnit.id;
                }
                this.showQuickUnitModal = false;
            },
            error: (err) => {
                const msg = err.error?.message || 'Failed to create unit';
                alert(msg);
            }
        });
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
        const reader = new FileReader();
        reader.onload = (e: any) => this.imagePreview = e.target.result;
        reader.readAsDataURL(file);

        this.core.uploadImage(file).subscribe({
            next: (res) => {
                this.product.image = res?.url || res?.data?.url || (res?.filename ? `/uploads/${res.filename}` : '');
                this.isUploading = false;
            },
            error: (err) => {
                console.error('Upload failed', err);
                this.isUploading = false;
                const msg = err.error?.message || 'Upload failed. Please try again.';
                alert(msg);
            }
        });
    }

    toggleSkill(skillName: string) {
        const index = this.selectedSkills.indexOf(skillName);
        if (index > -1) {
            this.selectedSkills.splice(index, 1);
        } else {
            this.selectedSkills.push(skillName);
        }
        this.product.skills = JSON.stringify(this.selectedSkills);
    }

    isSkillSelected(skillName: string): boolean {
        return this.selectedSkills.includes(skillName);
    }

    selectAllSkills() {
        this.selectedSkills = this.skillsList.map(s => s.name);
        this.product.skills = JSON.stringify(this.selectedSkills);
    }

    clearAllSkills() {
        this.selectedSkills = [];
        this.product.skills = JSON.stringify(this.selectedSkills);
    }

    onSkillImgError(event: any, skill: any) {
        skill._imgError = true;
    }

    getImageUrl(path: string): string {
        if (!path) return 'assets/placeholder.png';
        if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
            return path;
        }
        if (path.startsWith('/uploads') || path.startsWith('uploads')) {
            const base = environment.uploadUrl.replace(/\/uploads$/, '');
            return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
        }
        return `${environment.uploadUrl}/${path.startsWith('/') ? path.slice(1) : path}`;
    }

    onSubmit() {
        if (!this.product.name || !this.product.name.trim()) {
            alert('Product name is required');
            return;
        }
        if (!this.product.subcategory_id) {
            alert('Sub Category is required');
            return;
        }
        if (!this.product.unit_id) {
            alert('Measurement Unit is required');
            return;
        }

        const isHelper = this.selectedSubcategory?.type === 'helpers';
        if (isHelper && this.selectedSkills.length === 0) {
            alert('Please select at least one skill for this helper product');
            return;
        }

        const categoryId = this.selectedSubcategory?.category_id || this.product.category_id || null;

        const payload: any = {
            name: this.product.name.trim(),
            category_id: categoryId,
            subcategory_id: this.product.subcategory_id,
            unit_id: this.product.unit_id,
            price: Number(this.product.price) || 0,
            stock: isHelper ? 99999 : (Number(this.product.stock) || 0),
            skills: isHelper ? JSON.stringify(this.selectedSkills) : null,
            description: this.product.description || '',
            image: this.product.image || '',
            status: typeof this.product.status === 'boolean' 
                ? (this.product.status ? 'active' : 'inactive') 
                : (this.product.status || 'active')
        };

        if (this.isEdit) {
            this.core.updateItem('products', this.product.id, payload).subscribe({
                next: () => this.router.navigate(['/products']),
                error: (err) => {
                    const msg = err.error?.message || 'Failed to update product';
                    alert(msg);
                }
            });
        } else {
            this.core.addItem('products', payload).subscribe({
                next: () => this.router.navigate(['/products']),
                error: (err) => {
                    const msg = err.error?.message || 'Failed to create product';
                    alert(msg);
                }
            });
        }
    }
}
