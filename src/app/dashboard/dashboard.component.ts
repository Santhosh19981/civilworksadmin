import { Component, AfterViewInit, OnInit } from '@angular/core';
import { CoreService } from '../services/core.service';
declare var Chart: any;

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
    stats = [
        { label: 'Total Products', value: 154, valuePrefix: '', trend: 12, icon: 'products', d: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', delay: 0, displayValue: 0 },
        { label: 'Total Rentals', value: 42, valuePrefix: '', trend: -5, icon: 'rentals', d: 'M13 10V3L4 14h7v7l9-11h-7z', delay: 100, displayValue: 0 },
        { label: 'Total Orders', value: 1250, valuePrefix: '', trend: 18, icon: 'orders', d: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', delay: 200, displayValue: 0 },
        { label: 'Revenue', value: 42500, valuePrefix: '₹', trend: 22, icon: 'revenue', d: 'M15 8.25H9m6 3H9m3 6-3-3h1.5a3 3 0 1 0 0-6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z', delay: 300, displayValue: 0 }
    ];

    currentYear = new Date().getFullYear();

    constructor(private core: CoreService) { }

    dashboardData: any = null;

    ngOnInit() {
        this.loadDashboardData();
    }

    loadDashboardData() {
        this.core.getStats().subscribe({
            next: (data) => {
                this.dashboardData = data;
                this.stats = [
                    { label: 'Total Products', value: data.stats.totalProducts, valuePrefix: '', trend: 12, icon: 'products', d: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', delay: 0, displayValue: 0 },
                    { label: 'Total Rentals', value: data.stats.totalRentals, valuePrefix: '', trend: -5, icon: 'rentals', d: 'M13 10V3L4 14h7v7l9-11h-7z', delay: 100, displayValue: 0 },
                    { label: 'Total Orders', value: data.stats.totalOrders, valuePrefix: '', trend: 18, icon: 'orders', d: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', delay: 200, displayValue: 0 },
                    { label: 'Revenue', value: parseFloat(data.stats.totalRevenue), valuePrefix: '₹', trend: 22, icon: 'revenue', d: 'M15 8.25H9m6 3H9m3 6-3-3h1.5a3 3 0 1 0 0-6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z', delay: 300, displayValue: 0 }
                ];
                this.animateCounters();
                if (typeof Chart !== 'undefined') {
                    this.initCharts();
                }
            }
        });
    }

    ngAfterViewInit() {
        // Charts will be initialized after data load
    }

    animateCounters() {
        this.stats.forEach(stat => {
            let startValue = 0;
            let duration = 2500;
            let startTime: number | null = null;

            const animate = (currentTime: number) => {
                if (!startTime) startTime = currentTime;
                const progress = Math.min((currentTime - startTime) / duration, 1);
                const easeOutCubic = 1 - Math.pow(1 - progress, 3);
                stat.displayValue = Math.floor(easeOutCubic * stat.value);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            requestAnimationFrame(animate);
        });
    }

    initCharts() {
        if (!this.dashboardData) return;
        
        // Performance Velocity (Orders)
        const ordersCtx = document.getElementById('ordersChart') as HTMLCanvasElement;
        if (ordersCtx) {
            new Chart(ordersCtx, {
                type: 'line',
                data: {
                    labels: this.dashboardData.performanceVelocity.map((v: any) => v.month),
                    datasets: [{
                        label: 'Orders',
                        data: this.dashboardData.performanceVelocity.map((v: any) => v.count),
                        borderColor: '#f7931e',
                        backgroundColor: (context: any) => {
                            const chart = context.chart;
                            const { ctx, chartArea } = chart;
                            if (!chartArea) return null;
                            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                            gradient.addColorStop(0, 'rgba(247, 147, 30, 0)');
                            gradient.addColorStop(1, 'rgba(247, 147, 30, 0.2)');
                            return gradient;
                        },
                        borderWidth: 4,
                        pointBackgroundColor: '#fff',
                        pointBorderColor: '#f7931e',
                        pointBorderWidth: 3,
                        pointRadius: 6,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { grid: { color: 'rgba(0,0,0,0.03)', drawBorder: false }, ticks: { color: '#94a3b8' } },
                        x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                    }
                }
            });
        }

        // Financial Stream (Revenue)
        const revenueCtx = document.getElementById('revenueChart') as HTMLCanvasElement;
        if (revenueCtx) {
            new Chart(revenueCtx, {
                type: 'bar',
                data: {
                    labels: this.dashboardData.revenueVelocity.map((v: any) => v.month),
                    datasets: [{
                        label: 'Revenue',
                        data: this.dashboardData.revenueVelocity.map((v: any) => v.total),
                        backgroundColor: '#0b2c4d',
                        hoverBackgroundColor: '#f7931e',
                        borderRadius: 15,
                        barThickness: 35
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (context: any) => ` Revenue: ₹${Number(context.raw || 0).toLocaleString('en-IN')}`
                            }
                        }
                    },
                    scales: {
                        y: {
                            grid: { color: 'rgba(0,0,0,0.03)', drawBorder: false },
                            ticks: {
                                color: '#94a3b8',
                                callback: (value: any) => `₹${value}`
                            }
                        },
                        x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                    }
                }
            });
        }

        this.initSecondaryCharts();
    }

    initSecondaryCharts() {
        // Payment Mix Pie
        const pieCtx = document.getElementById('paymentPieChart') as HTMLCanvasElement;
        if (pieCtx) {
            new Chart(pieCtx, {
                type: 'pie',
                data: {
                    labels: this.dashboardData.paymentDistribution.map((p: any) => p.payment_method.toUpperCase()),
                    datasets: [{
                        data: this.dashboardData.paymentDistribution.map((p: any) => p.count),
                        backgroundColor: ['#f7931e', '#0b2c4d', '#ffc107', '#10b981'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                }
            });
        }

        // Category Dominance Doughnut
        const doughnutCtx = document.getElementById('categoryDoughnutChart') as HTMLCanvasElement;
        if (doughnutCtx) {
            new Chart(doughnutCtx, {
                type: 'doughnut',
                data: {
                    labels: this.dashboardData.categoryDistribution.map((c: any) => c.name),
                    datasets: [{
                        data: this.dashboardData.categoryDistribution.map((c: any) => c.count),
                        backgroundColor: ['#0b2c4d', '#f7931e', '#ffc107', '#6366f1', '#14b8a6'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '80%',
                    plugins: { legend: { position: 'bottom' } }
                }
            });
        }
    }
}
