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
        { label: 'Revenue', value: 42500, valuePrefix: '$', trend: 22, icon: 'revenue', d: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', delay: 300, displayValue: 0 }
    ];

    constructor(private core: CoreService) { }

    ngOnInit() {
        // Delay counters slightly for impact
        setTimeout(() => this.animateCounters(), 500);
    }

    ngAfterViewInit() {
        // Ensure DOM is fully painted and Chart.js is ready
        setTimeout(() => {
            if (typeof Chart !== 'undefined') {
                this.initCharts();
            } else {
                console.error('Chart.js not found. Retrying in 1s...');
                setTimeout(() => this.initCharts(), 1000);
            }
        }, 800);
    }

    animateCounters() {
        this.stats.forEach(stat => {
            let startValue = 0;
            let duration = 2500; // Slower for premium feel
            let startTime: number | null = null;

            const animate = (currentTime: number) => {
                if (!startTime) startTime = currentTime;
                const progress = Math.min((currentTime - startTime) / duration, 1);

                // Ease out cubic for smoother finish
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
        console.log('Initializing premium charts...');

        // Orders Line Chart - Performance Velocity
        const ordersCtx = document.getElementById('ordersChart') as HTMLCanvasElement;
        if (ordersCtx) {
            new Chart(ordersCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Orders',
                        data: [65, 59, 80, 81, 56, 95],
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
                        pointHoverRadius: 10,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: { duration: 2500, easing: 'easeOutQuart' },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: '#0b2c4d',
                            titleFont: { size: 14, weight: 'bold' },
                            bodyFont: { size: 13 },
                            padding: 12,
                            cornerRadius: 12,
                            displayColors: false
                        }
                    },
                    scales: {
                        y: {
                            grid: { color: 'rgba(0,0,0,0.03)', drawBorder: false },
                            ticks: { font: { weight: 'bold', family: 'Outfit' }, color: '#94a3b8' }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { font: { weight: 'bold', family: 'Outfit' }, color: '#94a3b8' }
                        }
                    }
                }
            });
        }

        // Revenue Bar Chart - Financial Stream
        const revenueCtx = document.getElementById('revenueChart') as HTMLCanvasElement;
        if (revenueCtx) {
            new Chart(revenueCtx, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Revenue',
                        data: [12000, 19000, 3000, 5000, 2000, 30000],
                        backgroundColor: '#0b2c4d',
                        hoverBackgroundColor: '#f7931e',
                        borderRadius: 15,
                        barThickness: 35
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: { duration: 2000, easing: 'easeOutBounce' },
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { grid: { color: 'rgba(0,0,0,0.03)', drawBorder: false }, ticks: { color: '#94a3b8' } },
                        x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                    }
                }
            });
        }

        // Apply similar logic for Pie and Doughnut...
        this.initSecondaryCharts();
    }

    initSecondaryCharts() {
        const pieCtx = document.getElementById('paymentPieChart') as HTMLCanvasElement;
        if (pieCtx) {
            new Chart(pieCtx, {
                type: 'pie',
                data: {
                    labels: ['Online', 'COD', 'Refunded'],
                    datasets: [{
                        data: [300, 50, 100],
                        backgroundColor: ['#f7931e', '#0b2c4d', '#ffc107'],
                        borderWidth: 0,
                        hoverOffset: 20
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: { animateRotate: true, animateScale: true, duration: 2000 },
                    plugins: {
                        legend: { position: 'bottom', labels: { font: { weight: 'bold', family: 'Outfit' }, padding: 25, color: '#0b2c4d' } }
                    }
                }
            });
        }

        const doughnutCtx = document.getElementById('categoryDoughnutChart') as HTMLCanvasElement;
        if (doughnutCtx) {
            new Chart(doughnutCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Excavators', 'Mixers', 'Scaffolding', 'Tools'],
                    datasets: [{
                        data: [10, 20, 30, 40],
                        backgroundColor: ['#0b2c4d', '#f7931e', '#ffc107', '#f1f5f9'],
                        borderWidth: 0,
                        hoverOffset: 20
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '80%',
                    animation: { animateRotate: true, animateScale: true, duration: 2000 },
                    plugins: {
                        legend: { position: 'bottom', labels: { font: { weight: 'bold', family: 'Outfit' }, padding: 25, color: '#0b2c4d' } }
                    }
                }
            });
        }
    }
}
