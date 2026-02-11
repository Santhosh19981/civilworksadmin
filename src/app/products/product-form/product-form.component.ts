import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CoreService } from '../../services/core.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-product-form',
    templateUrl: './product-form.component.html',
    styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {
    isEdit = false;
    product: any = { name: '', category: '', price: 0, stock: 0, description: '', status: 'active', image: '' };
    categories$: Observable<any[]>;
    imagePreview: any = '';

    constructor(private route: ActivatedRoute, private router: Router, private core: CoreService) {
        this.categories$ = this.core.getData('categories');
    }

    ngOnInit() {
        const id = this.route.snapshot.params['id'];
        if (id) {
            this.isEdit = true;
            this.core.getData('products').subscribe(products => {
                const found = products.find((p: any) => p.id == id);
                if (found) {
                    this.product = { ...found };
                    this.imagePreview = this.product.image;
                }
            });
        }
    }

    onFileChange(event: any) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.imagePreview = e.target.result;
                this.product.image = this.imagePreview; // In real app, we'd upload this
            };
            reader.readAsDataURL(file);
        }
    }

    onSubmit() {
        if (this.isEdit) {
            this.core.updateItem('products', this.product.id, this.product);
        } else {
            this.core.addItem('products', this.product);
        }
        this.router.navigate(['/products']);
    }
}
