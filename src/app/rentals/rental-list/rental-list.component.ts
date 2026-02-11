import { Component, OnInit } from '@angular/core';
import { CoreService } from '../../services/core.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-rental-list',
    templateUrl: './rental-list.component.html',
    styleUrls: ['./rental-list.component.css']
})
export class RentalListComponent implements OnInit {
    rentals$: Observable<any[]>;

    constructor(private core: CoreService) {
        this.rentals$ = this.core.getData('rentals');
    }

    ngOnInit() { }

    deleteRental(id: any) {
        if (confirm('Are you sure you want to delete this rental item?')) {
            this.core.deleteItem('rentals', id);
        }
    }
}
