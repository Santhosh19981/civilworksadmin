import { Component, OnInit } from '@angular/core';
declare var AOS: any;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    ngOnInit() {
        AOS.init({
            duration: 800,
            once: true
        });
    }
}
