import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CoreService } from '../../services/core.service';

@Component({
    selector: 'app-helper-member-form',
    templateUrl: './helper-member-form.component.html',
    styleUrls: ['./helper-member-form.component.css']
})
export class HelperMemberFormComponent implements OnInit {
    member: any = {
        name: '',
        helper_id: '',
        experience: '',
        mobile: '',
        image: '',
        status: 'active'
    };
    services: any[] = [];
    isEdit: boolean = false;
    loading: boolean = false;
    uploading: boolean = false;

    constructor(
        private core: CoreService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.fetchServices();
        const id = this.route.snapshot.params['id'];
        if (id) {
            this.isEdit = true;
            this.fetchMember(id);
        }
    }

    fetchServices(): void {
        this.core.getData('helpers').subscribe((res: any) => {
            this.services = res.data;
        });
    }

    fetchMember(id: number): void {
        this.core.getData(`helper-members/${id}`, 1, 1, {}).subscribe((res: any) => {
            this.member = res.data;
        });
    }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.uploadImage(file);
        }
    }

    uploadImage(file: File): void {
        this.uploading = true;
        this.core.uploadImage(file).subscribe({
            next: (url: string) => {
                this.member.image = url;
                this.uploading = false;
            },
            error: () => {
                this.uploading = false;
            }
        });
    }

    save(): void {
        if (!this.member.name || !this.member.helper_id || !this.member.mobile) {
            alert('Please fill all required fields');
            return;
        }

        this.loading = true;
        const request = this.isEdit
            ? this.core.updateItem('helper-members', this.member.id, this.member)
            : this.core.addItem('helper-members', this.member);

        request.subscribe({
            next: () => {
                this.loading = false;
                this.router.navigate(['/helper-members']);
            },
            error: (err) => {
                this.loading = false;
                console.error('Error saving member', err);
            }
        });
    }
}
