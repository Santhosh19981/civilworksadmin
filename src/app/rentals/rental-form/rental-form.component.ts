import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CoreService } from '../../services/core.service';

@Component({
    selector: 'app-rental-form',
    templateUrl: './rental-form.component.html',
    styleUrls: ['./rental-form.component.css']
})
export class RentalFormComponent implements OnInit {
    isEdit = false;
    rental: any = { name: '', mobile: '', description: '', image: '', available: true };

    constructor(private route: ActivatedRoute, private router: Router, private core: CoreService) { }

    ngOnInit() {
        const id = this.route.snapshot.params['id'];
        if (id) {
            this.isEdit = true;
            this.core.getData('rentals').subscribe(rentals => {
                const found = rentals.find((r: any) => r.id == id);
                if (found) this.rental = { ...found };
            });
        }
    }

    onFileChange(event: any) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.rental.image = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    onSubmit() {
        if (this.isEdit) {
            this.core.updateItem('rentals', this.rental.id, this.rental);
        } else {
            this.core.addItem('rentals', this.rental);
        }
        this.router.navigate(['/rentals']);
    }
}
