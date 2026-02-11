import { Component, AfterViewInit } from '@angular/core';
declare var Chart: any;

@Component({
    selector: 'app-reports',
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements AfterViewInit {
    topProducts = [
        { name: 'Heavy Duty Excavator', qty: 45, revenue: 112500 },
        { name: 'Electric Concrete Mixer', qty: 120, revenue: 54000 },
        { name: 'Steel Scaffolding Set', qty: 85, revenue: 10200 },
        { name: 'Rotary Hammer Drill', qty: 250, revenue: 21250 }
    ];

    ngAfterViewInit() {
        new Chart('growthChart', {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Revenue Growth',
                    data: [5000, 15000, 25000, 22000, 35000, 48000],
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

        new Chart('categoryReportChart', {
            type: 'bar',
            data: {
                labels: ['Excavators', 'Mixers', 'Scaffolding', 'Tools'],
                datasets: [{
                    label: 'Orders',
                    data: [350, 420, 180, 560],
                    backgroundColor: ['#0B2C4D', '#F7931E', '#FFC107', '#lightgray'],
                    borderRadius: 12
                }]
            },
            options: {
                indexAxis: 'y',
                plugins: { legend: { display: false } }
            }
        });
    }

    exportCSV() {
        alert('Exporting Report-2024-Q2.csv ... Success!');
    }
}
