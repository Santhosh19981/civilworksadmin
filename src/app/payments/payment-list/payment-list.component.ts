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
    payments$: Observable<any[]>;
    totalRevenue = 0;
    onlinePayments = 0;
    codPayments = 0;

    constructor(private core: CoreService) {
        this.payments$ = this.core.getData('payments');
    }

    ngOnInit() {
        this.payments$.subscribe(payments => {
            this.totalRevenue = payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
            this.onlinePayments = payments.filter(p => p.method === 'Online' && p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
            this.codPayments = payments.filter(p => p.method === 'COD').reduce((sum, p) => sum + p.amount, 0);
        });
    }

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
