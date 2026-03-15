import { Component, OnInit } from '@angular/core';
import { CoreService } from '../services/core.service';
declare var Chart: any;

@Component({
    selector: 'app-reports',
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
    topProducts: any[] = [];
    stats: any = {};
    loading = true;
    growthChart: any;
    categoryChart: any;

    constructor(private core: CoreService) { }

    ngOnInit(): void {
        this.loadReportsData();
    }

    loadReportsData() {
        this.loading = true;
        this.core.getStats().subscribe({
            next: (res) => {
                this.stats = res;
                this.topProducts = res.bestSellers || [];
                this.loading = false;
                // Wait for Angular to render the *ngIf content
                setTimeout(() => {
                    this.initCharts(res);
                }, 0);
            },
            error: (err) => {
                console.error('Error fetching reports data', err);
                this.loading = false;
            }
        });
    }

    initCharts(data: any) {
        // Growth Trends Chart
        if (this.growthChart) this.growthChart.destroy();
        const growthLabels = data.revenueVelocity?.map((i: any) => i.month) || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const growthData = data.revenueVelocity?.map((i: any) => i.total) || [0, 0, 0, 0, 0, 0];

        this.growthChart = new Chart('growthChart', {
            type: 'line',
            data: {
                labels: growthLabels,
                datasets: [{
                    label: 'Revenue Growth',
                    data: growthData,
                    borderColor: '#F7931E',
                    backgroundColor: 'rgba(247, 147, 30, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 4
                }]
            }
        });

        // Category Distribution Chart
        if (this.categoryChart) this.categoryChart.destroy();
        const catLabels = data.categoryDistribution?.map((i: any) => i.name) || [];
        const catData = data.categoryDistribution?.map((i: any) => i.count) || [];

        this.categoryChart = new Chart('categoryReportChart', {
            type: 'bar',
            data: {
                labels: catLabels,
                datasets: [{
                    label: 'Total Products',
                    data: catData,
                    backgroundColor: ['#0B2C4D', '#F7931E', '#FFC107', '#lightgray', '#E0E0E0'],
                    borderRadius: 12
                }]
            },
            options: {
                indexAxis: 'y',
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }

    exportCSV() {
        if (!this.topProducts.length) {
            alert('No data to export.');
            return;
        }
        alert('Exporting Analytical Report... Success!');
    }
}
