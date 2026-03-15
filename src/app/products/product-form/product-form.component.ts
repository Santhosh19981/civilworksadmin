import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CoreService } from '../../services/core.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-product-form',
    templateUrl: './product-form.component.html',
    styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {
    isEdit = false;
    product: any = { name: '', category_id: null, price: 0, stock: 0, description: '', status: 'active', image: '' };
    mainCategoryId: number | null = null;
    allCategories: any[] = [];
    mainCategories: any[] = [];
    subcategories: any[] = [];
    imagePreview: any = '';
    isUploading = false;
    defaultImage = 'assets/images/placeholder-product.png';

    constructor(private route: ActivatedRoute, private router: Router, private core: CoreService) { }

    ngOnInit() {
        this.core.getData('categories', 1, 1000).subscribe(res => {
            this.mainCategories = res.data;
            
            const id = this.route.snapshot.params['id'];
            if (id) {
                this.isEdit = true;
                this.core.getData('products', 1, 1000).subscribe(productsRes => {
                    const found = productsRes.data.find((p: any) => p.id == id);
                    if (found) {
                        this.product = { ...found };
                        this.imagePreview = this.product.image;
                        this.mainCategoryId = this.product.category_id;
                        this.updateSubcategories();
                    }
                });
            }
        });
    }

    onCategoryChange() {
        this.product.category_id = this.mainCategoryId;
        this.product.subcategory_id = null;
        this.updateSubcategories();
    }

    updateSubcategories() {
        if (this.mainCategoryId) {
            this.core.getData('subcategories', 1, 1000, { category_id: this.mainCategoryId }).subscribe(res => {
                this.subcategories = res.data;
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
        
        // Show immediate preview locally
        const reader = new FileReader();
        reader.onload = (e: any) => this.imagePreview = e.target.result;
        reader.readAsDataURL(file);

        // Upload to server
        this.core.uploadImage(file).subscribe({
            next: (res) => {
                this.product.image = res.url;
                this.isUploading = false;
            },
            error: (err) => {
                console.error('Upload failed', err);
                this.isUploading = false;
                alert('Upload failed. Please try again.');
            }
        });
    }

    onSubmit() {
        if (this.isEdit) {
            this.core.updateItem('products', this.product.id, this.product).subscribe({
                next: () => this.router.navigate(['/products']),
                error: (err) => alert('Failed to update product')
            });
        } else {
            this.core.addItem('products', this.product).subscribe({
                next: () => this.router.navigate(['/products']),
                error: (err) => alert('Failed to create product')
            });
        }
    }
}
