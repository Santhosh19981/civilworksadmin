import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CoreService } from '../../services/core.service';

@Component({
    selector: 'app-add-helper',
    templateUrl: './add-helper.component.html'
})
export class AddHelperComponent {
    helper = {
        serviceName: '',
        description: '',
        status: 'Active'
    };

    constructor(private core: CoreService, private router: Router) { }

    onSubmit() {
        if (this.helper.serviceName && this.helper.description) {
            this.core.addItem('helpers', this.helper);
            alert('Helper added successfully!');
            this.router.navigate(['/helpers']);
        }
    }
}
