import { Component, OnInit } from '@angular/core';
import { CoreService } from '../../services/core.service';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-order-list',
    templateUrl: './order-list.component.html',
    styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {
    orders$: Observable<any[]>;
    searchTerm = '';
    statusFilter = '';
    filteredOrders$: Observable<any[]>;

    constructor(private core: CoreService) {
        this.orders$ = this.core.getData('orders');
        this.filteredOrders$ = this.orders$.pipe(
            map(orders => orders.filter(o => {
                const matchesSearch = o.id.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                    o.customer.toLowerCase().includes(this.searchTerm.toLowerCase());
                const matchesStatus = !this.statusFilter || o.orderStatus === this.statusFilter;
                return matchesSearch && matchesStatus;
            }))
        );
    }

    ngOnInit() { }
}
