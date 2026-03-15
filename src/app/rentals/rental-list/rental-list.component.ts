import { Component, OnInit } from '@angular/core';
import { CoreService } from '../../services/core.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-rental-list',
    templateUrl: './rental-list.component.html',
    styleUrls: ['./rental-list.component.css']
})
export class RentalListComponent implements OnInit {
    rentals: any[] = [];
    pagination: any = {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    };

    constructor(private core: CoreService) {
        this.loadRentals();
    }

    loadRentals(page: number = 1) {
        this.core.getData('rentals', page).subscribe(res => {
            this.rentals = res.data;
            this.pagination = res.pagination;
        });
    }

    onPageChange(page: number) {
        this.loadRentals(page);
    }

    ngOnInit() { }

    deleteRental(id: any) {
        if (confirm('Are you sure you want to delete this rental item?')) {
            this.core.deleteItem('rentals', id).subscribe(() => {
                this.loadRentals(this.pagination.page);
            });
        }
    }
}
