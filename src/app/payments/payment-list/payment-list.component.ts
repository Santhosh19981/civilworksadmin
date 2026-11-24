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
    typeFilter = '';

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
        this.core.getData('payments', page, this.pagination?.limit || 10, { search: this.searchTerm.trim(), type: this.typeFilter }).subscribe({
            next: res => {
                this.payments = res.data || [];
                this.pagination = res.pagination || this.pagination;
            },
            error: () => { this.payments = []; }
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

    /** "Plus Membership", "Order ORD-9UBP41", "Rental #12", ... */
    typeLabel(p: any): string {
        switch (p.reference_type) {
            case 'membership': return 'Plus Membership';
            case 'order': return p.order_no ? `Order ${p.order_no}` : `Order #${p.reference_id}`;
            case 'rental': return `Rental #${p.reference_id}`;
            case 'helper': return `Helper #${p.reference_id}`;
            default: return p.reference_type || 'Payment';
        }
    }

    /** razorpay_upi -> "Razorpay · UPI", cod -> "Cash on delivery". */
    methodLabel(method: string): string {
        if (!method) return '';
        if (method === 'cod') return 'Cash on delivery';
        if (method.startsWith('razorpay_')) return 'Razorpay · ' + method.slice(9).toUpperCase();
        return method.replace(/_/g, ' ');
    }

    /** Real Razorpay payment ids can be opened in the Razorpay dashboard (refunds are issued there). */
    isRazorpay(p: any): boolean {
        return /^pay_[A-Za-z0-9]+$/.test(p.transaction_id || '') && String(p.payment_method || '').startsWith('razorpay');
    }
}
