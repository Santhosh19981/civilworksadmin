import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CoreService } from '../../services/core.service';

@Component({
    selector: 'app-edit-helper',
    templateUrl: './edit-helper.component.html'
})
export class EditHelperComponent implements OnInit {
    id: any;
    helper: any = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private core: CoreService
    ) { }

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.core.getData(`helpers/${this.id}`).subscribe(res => {
            this.helper = res.data;
        });
    }

    onSubmit() {
        if (this.helper.serviceName || this.helper.name) {
            this.core.updateItem('helpers', parseInt(this.id), this.helper).subscribe({
                next: () => {
                    alert('Helper updated successfully!');
                    this.router.navigate(['/helpers/services']);
                },
                error: (err) => {
                    console.error('Error updating helper', err);
                }
            });
        }
    }
}
