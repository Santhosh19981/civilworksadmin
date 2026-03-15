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
    orders: any[] = [];
    searchTerm = '';
    statusFilter = '';
    
    pagination: any = {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    };

    constructor(private core: CoreService) {
        this.loadOrders();
    }

    loadOrders(page: number = 1) {
        const filters = {
            search: this.searchTerm,
            status: this.statusFilter
        };
        this.core.getData('orders', page, 10, filters).subscribe(res => {
            this.orders = res.data;
            this.pagination = res.pagination;
        });
    }

    onSearch() {
        this.loadOrders(1);
    }

    onStatusChange() {
        this.loadOrders(1);
    }

    onPageChange(page: number) {
        this.loadOrders(page);
    }

    ngOnInit() { }
}
