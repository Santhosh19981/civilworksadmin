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
    rental: any = { name: '', mobile: '', description: '', image: '', available: true, rental_category_id: null };
    isUploading = false;
    categories: any[] = [];

    constructor(private route: ActivatedRoute, private router: Router, private core: CoreService) { }

    ngOnInit() {
        this.loadCategories();
        const id = this.route.snapshot.params['id'];
        if (id) {
            this.isEdit = true;
            this.core.getData('rentals').pipe(map(res => res.data)).subscribe(rentals => {
                const found = rentals.find((r: any) => r.id == id);
                if (found) {
                    this.rental = { ...found };
                }
            });
        }
    }

    loadCategories() {
        this.core.getData('rental-categories', 1, 100).subscribe(res => {
            this.categories = res.data;
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
        
        // Local preview
        const reader = new FileReader();
        reader.onload = (e: any) => this.rental.image = e.target.result;
        reader.readAsDataURL(file);

        // Server upload
        this.core.uploadImage(file).subscribe({
            next: (res) => {
                this.rental.image = res.url;
                this.isUploading = false;
            },
            error: (err) => {
                console.error('Rental upload failed', err);
                this.isUploading = false;
                alert('Upload failed. Please try again.');
            }
        });
    }

    onSubmit() {
        if (this.isEdit) {
            this.core.updateItem('rentals', this.rental.id, this.rental).subscribe(() => {
                this.router.navigate(['/rentals']);
            });
        } else {
            this.core.addItem('rentals', this.rental).subscribe(() => {
                this.router.navigate(['/rentals']);
            });
        }
    }
}
