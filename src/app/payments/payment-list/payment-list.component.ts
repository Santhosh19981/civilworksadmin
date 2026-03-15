import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CoreService } from '../../services/core.service';
import { Observable } from 'rxjs';
declare var Chart: any;

@Component({
    selector: 'app-payment-list',
    templateUrl: './payment-list.component.html',
    styleUrls: ['./payment-list.component.css']
})
export class PaymentListComponent implements OnInit, AfterViewInit {
    payments: any[] = [];
    totalRevenue = 0;
    onlinePayments = 0;
    codPayments = 0;
    searchTerm = '';

    pagination: any = {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    };

    constructor(private core: CoreService) {
        this.loadPayments();
    }

    loadPayments(page: number = 1) {
        this.core.getData('payments', page, this.pagination.limit, { search: this.searchTerm }).subscribe(res => {
            this.payments = res.data;
            this.pagination = res.pagination;
        });

        this.core.getPaymentStats().subscribe(stats => {
            this.totalRevenue = stats.liquidity;
            this.onlinePayments = stats.settlements;
            this.codPayments = stats.collections;
            this.reversals = stats.reversals;
        });
    }

    reversals = 0;

    calculateStats(payments: any[]) {
        // Obsolete - using server stats
    }

    onSearch() {
        this.pagination.page = 1;
        this.loadPayments();
    }

    onPageChange(page: number) {
        this.loadPayments(page);
    }

    ngOnInit() { }

    ngAfterViewInit() {
        new Chart('revenueTrendChart', {
            type: 'line',
            data: {
                labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                datasets: [{
                    label: 'Revenue',
                    data: [1200, 1900, 3000, 5000, 2000, 3000, 4500],
                    borderColor: '#F7931E',
                    backgroundColor: 'rgba(247, 147, 30, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: { plugins: { legend: { display: false } } }
        });
    }

    issueRefund(payment: any) {
        if (confirm('Issue full refund for Order #' + payment.orderId + '?')) {
            this.core.updateItem('payments', payment.transactionId, { status: 'Refunded' });
        }
    }
}
