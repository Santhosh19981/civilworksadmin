import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
    sidebarCollapsed = false;

    ngOnInit() {
        if (typeof window !== 'undefined' && window.innerWidth <= 768) {
            this.sidebarCollapsed = true;
        }
    }
}
