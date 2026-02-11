import { Component, OnInit } from '@angular/core';
import { CoreService } from '../services/core.service';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
    config: any = {
        deliveryCharge: 0,
        taxPercent: 0,
        enableCOD: false,
        themeColor: '#0B2C4D'
    };

    constructor(private core: CoreService) { }

    ngOnInit() {
        this.core.getData('settings').subscribe(settings => {
            this.config = { ...settings };
        });
    }

    saveSettings() {
        this.core.updateSettings(this.config);
        alert('Settings saved successfully and synced with LocalStorage!');
    }
}
