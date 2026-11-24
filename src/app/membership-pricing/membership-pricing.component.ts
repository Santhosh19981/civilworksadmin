import { Component, OnInit } from '@angular/core';
import { CoreService } from '../services/core.service';

interface Feature { title: string; description: string; }

/**
 * Admin > Membership Pricing: edits the Plus Membership plan shown on the customer home hero and the
 * membership checkout page. The price saved here is also what Razorpay charges for new payments.
 */
@Component({
    selector: 'app-membership-pricing',
    templateUrl: './membership-pricing.component.html',
    styleUrls: ['./membership-pricing.component.css']
})
export class MembershipPricingComponent implements OnInit {
    plan: any = null;
    private saved = '';
    loading = true;
    saving = false;
    errorMessage = '';
    successMessage = '';
    readonly maxFeatures = 10;

    constructor(private core: CoreService) { }

    ngOnInit(): void {
        this.load();
    }

    load(): void {
        this.loading = true;
        this.errorMessage = '';
        this.core.getMembershipPlan().subscribe({
            next: plan => { this.setPlan(plan); this.loading = false; },
            error: err => { this.errorMessage = err?.error?.message || 'Could not load the membership plan.'; this.loading = false; }
        });
    }

    private setPlan(plan: any): void {
        this.plan = JSON.parse(JSON.stringify(plan));
        this.saved = JSON.stringify(this.payload());
    }

    get hasChanges(): boolean {
        return !!this.plan && JSON.stringify(this.payload()) !== this.saved;
    }

    /** GST contained in the GST-inclusive price (same formula as the customer checkout). */
    get gstAmount(): number {
        const p = Number(this.plan?.price) || 0, g = Number(this.plan?.summary?.gst_percent) || 0;
        return Math.round((p - p / (1 + g / 100)) * 100) / 100;
    }

    get priceValid(): boolean {
        const p = Number(this.plan?.price);
        return Number.isFinite(p) && p >= 1 && p <= 1000000;
    }

    addFeature(): void {
        if (this.plan.card.features.length < this.maxFeatures) this.plan.card.features.push({ title: '', description: '' });
    }

    removeFeature(i: number): void {
        this.plan.card.features.splice(i, 1);
    }

    moveFeature(i: number, dir: -1 | 1): void {
        const list: Feature[] = this.plan.card.features;
        const j = i + dir;
        if (j < 0 || j >= list.length) return;
        [list[i], list[j]] = [list[j], list[i]];
    }

    reset(): void {
        this.setPlan(JSON.parse(this.saved));
        this.successMessage = '';
        this.errorMessage = '';
    }

    save(): void {
        if (!this.priceValid) { this.errorMessage = 'Enter a price between ₹1 and ₹10,00,000.'; return; }
        const priceChanged = Number(JSON.parse(this.saved).price) !== Number(this.plan.price);
        if (priceChanged && !confirm(`Change the Plus Membership price to ₹${Number(this.plan.price).toLocaleString('en-IN')}?\n\nNew payments (Razorpay) will charge this amount immediately. Payments already in progress keep their old price.`)) return;

        this.saving = true;
        this.errorMessage = '';
        this.successMessage = '';
        this.core.updateMembershipPlan(this.payload()).subscribe({
            next: plan => {
                this.setPlan(plan);
                this.saving = false;
                this.successMessage = 'Saved. The customer app and Razorpay now use this plan.';
                setTimeout(() => this.successMessage = '', 5000);
            },
            error: err => {
                this.saving = false;
                this.errorMessage = err?.error?.message || 'Could not save the plan. Please try again.';
            }
        });
    }

    trackByIndex(i: number): number { return i; }

    private payload(): any {
        const { price, duration_months, hero, header, card, summary } = this.plan;
        return {
            price: Number(price),
            duration_months: Number(duration_months),
            hero, header, summary: { ...summary, gst_percent: Number(summary.gst_percent) },
            card: { ...card, features: (card.features || []).filter((f: Feature) => (f.title || '').trim() || (f.description || '').trim()) }
        };
    }
}
