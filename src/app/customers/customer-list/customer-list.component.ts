import { Component, OnInit } from '@angular/core';
import { CoreService } from '../../services/core.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-customer-list',
    templateUrl: './customer-list.component.html',
    styleUrls: ['./customer-list.component.css']
})
export class CustomerListComponent implements OnInit {
    customers$: Observable<any[]>;
    selectedCustomer: any = null;
    customerOrders: any[] = [];

    constructor(private core: CoreService) {
        this.customers$ = this.core.getData('customers');
    }

    ngOnInit() { }

    viewHistory(customer: any) {
        this.selectedCustomer = customer;
        this.core.getData('orders').subscribe(orders => {
            this.customerOrders = orders.filter((o: any) => o.customer === customer.name);
        });
    }
}
