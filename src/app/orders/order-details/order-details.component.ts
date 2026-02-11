import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CoreService } from '../../services/core.service';

@Component({
    selector: 'app-order-details',
    templateUrl: './order-details.component.html',
    styleUrls: ['./order-details.component.css']
})
export class OrderDetailsComponent implements OnInit {
    order: any;
    timelineSteps = [
        { label: 'Pending', index: 0 },
        { label: 'Packing', index: 1 },
        { label: 'Shipping', index: 2 },
        { label: 'Delivered', index: 3 }
    ];

    constructor(private route: ActivatedRoute, private core: CoreService) { }

    ngOnInit() {
        const id = this.route.snapshot.params['id'];
        this.core.getData('orders').subscribe(orders => {
            this.order = orders.find((o: any) => o.id === id);
        });
    }

    get orderStepIndex(): number {
        if (!this.order) return 0;
        switch (this.order.orderStatus) {
            case 'Packing': return 1;
            case 'Shipping': return 2;
            case 'Delivered': return 3;
            case 'Cancelled': return -1;
            default: return 0;
        }
    }

    get timelineProgress(): number {
        if (this.orderStepIndex === -1) return 0;
        return (this.orderStepIndex / (this.timelineSteps.length - 1)) * 100;
    }

    updateStatus(status: string) {
        this.core.updateItem('orders', this.order.id, { orderStatus: status });

        // Auto pay if delivered (as per requirements)
        if (status === 'Delivered') {
            this.core.updateItem('orders', this.order.id, { paymentStatus: 'Paid' });
            // Update linked payment status
            this.core.updateItem('payments', this.order.id, { status: 'Paid' });
        }
    }

    printInvoice() {
        alert('Generating PDF Invoice: INV-' + this.order.id + '-' + Math.floor(Math.random() * 9000));
    }
}
