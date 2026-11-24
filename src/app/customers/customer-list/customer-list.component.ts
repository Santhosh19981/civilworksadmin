import { Component, OnInit } from '@angular/core';
import { CoreService } from '../../services/core.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-customer-list',
    templateUrl: './customer-list.component.html',
    styleUrls: ['./customer-list.component.css']
})
export class CustomerListComponent implements OnInit {
    customers: any[] = [];
    selectedCustomer: any = null;
    customerOrders: any[] = [];
    customerMembershipPayments: any[] = [];
    historyLoading = false;
    searchTerm: string = '';
    membershipFilter: '' | 'active' | 'expired' | 'none' = '';
    loading: boolean = true;
    
    pagination: any = {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    };

    constructor(private core: CoreService) {
        this.loadCustomers();
    }

    loadCustomers(page: number = 1) {
        this.loading = true;
        this.core.getData('customers', page, 10, { search: this.searchTerm, membership: this.membershipFilter }).subscribe({
            next: (res) => {
                const baseUrl = environment.apiUrl.replace('/api/v1', '');
                this.customers = res.data.map((c: any) => {
                    if (c.image && !c.image.startsWith('http') && !c.image.startsWith('data:image')) {
                        c.image = `${baseUrl}/uploads/${c.image}`;
                    }
                    return c;
                });
                this.pagination = res.pagination;
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
            }
        });
    }

    onSearch() {
        this.pagination.page = 1;
        this.loadCustomers();
    }

    onPageChange(page: number) {
        this.loadCustomers(page);
    }

    ngOnInit() { }

    /** 'active' | 'expired' | 'none' for the Plus badge. */
    membershipState(c: any): 'active' | 'expired' | 'none' {
        if (Number(c.membershipActive) === 1) return 'active';
        if (c.plus_membership_expiry) return 'expired';
        return 'none';
    }

    viewHistory(customer: any) {
        this.selectedCustomer = customer;
        this.customerOrders = [];
        this.customerMembershipPayments = [];
        this.historyLoading = true;
        let pending = 2;
        const done = () => { if (--pending === 0) this.historyLoading = false; };

        this.core.getData('orders', 1, 100, { user_id: customer.id }).subscribe({
            next: res => { this.customerOrders = res.data || []; done(); },
            error: () => done()
        });
        this.core.getData('payments', 1, 50, { user_id: customer.id, type: 'membership' }).subscribe({
            next: res => { this.customerMembershipPayments = res.data || []; done(); },
            error: () => done()
        });
    }
}
