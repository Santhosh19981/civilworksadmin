import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CoreService } from '../../services/core.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-employee-form',
    templateUrl: './employee-form.component.html',
    styleUrls: ['./employee-form.component.css']
})
export class EmployeeFormComponent implements OnInit {
    employeeForm!: FormGroup;
    employeeImage: string = ''; // For UI Preview
    uploadedImage: string = ''; // For Backend Payload
    employeeStatus: string = 'active';

    pages = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'products', label: 'Products' },
        { id: 'categories', label: 'Categories' },
        { id: 'rentals', label: 'Rentals' },
        { id: 'orders', label: 'Order List' },
        { id: 'payments', label: 'Payments' },
        { id: 'helpers', label: 'Helpers Management' },
        { id: 'members', label: 'Helpers (List)' },
        { id: 'customers', label: 'Customers' },
        { id: 'reports', label: 'Reports' },
        { id: 'settings', label: 'Settings' },
        { id: 'employees', label: 'Employees' }
    ];

    selectedPermissions: Set<string> = new Set();
    isEdit: boolean = false;
    loading: boolean = false;
    uploading: boolean = false;
    showPassword: boolean = false;

    toastMessage: string = '';
    toastType: 'success' | 'error' = 'success';
    showToastMsg: boolean = false;
    toastTimeout: any;

    constructor(
        private core: CoreService,
        private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder
    ) {
        this.initForm();
    }

    initForm(): void {
        this.employeeForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]],
            mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
            password: [''],
            role_id: [3, Validators.required]
        });
    }

    ngOnInit(): void {
        const id = this.route.snapshot.params['id'];
        this.isEdit = !!id;

        if (!this.isEdit) {
            this.employeeForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
        } else {
            this.employeeForm.get('password')?.setValidators([Validators.minLength(6)]);
        }
        this.employeeForm.get('password')?.updateValueAndValidity();

        if (id) {
            this.fetchEmployee(id);
        } else {
            this.applyDefaultPermissions();
        }
    }

    fetchEmployee(id: number): void {
        this.core.getData(`employees/${id}`, 1, 1, {}).subscribe((res: any) => {
            const emp = res.data;
            let imgUrl = emp.image || '';
            this.uploadedImage = imgUrl; // Store the raw backed filename/url for submitting

            if (imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('data:image')) {
                imgUrl = `${environment.uploadUrl}/${imgUrl}`;
            }
            this.employeeImage = imgUrl; // High-res preview
            this.employeeStatus = emp.status || 'active';
            
            this.employeeForm.patchValue({
                name: emp.name,
                email: emp.email,
                mobile: emp.mobile,
                role_id: emp.role_id
            });

            if (emp.permissions) {
                emp.permissions.split(',').forEach((p: string) => this.selectedPermissions.add(p));
            }
        });
    }

    onRoleChange(): void {
        if (!this.isEdit) {
            this.applyDefaultPermissions();
        }
    }

    applyDefaultPermissions(): void {
        this.selectedPermissions.clear();
        const roleId = Number(this.employeeForm.get('role_id')?.value);
        
        if (roleId === 1) { // Super Admin
            this.pages.forEach(p => this.selectedPermissions.add(p.id));
        } else if (roleId === 2) { // Admin
            this.pages.filter(p => p.id !== 'settings' && p.id !== 'employees').forEach(p => this.selectedPermissions.add(p.id));
        } else if (roleId === 3) { // Manager
            ['dashboard', 'products', 'orders', 'customers', 'reports'].forEach(p => this.selectedPermissions.add(p));
        }
    }

    togglePermission(id: string): void {
        if (this.selectedPermissions.has(id)) {
            this.selectedPermissions.delete(id);
        } else {
            this.selectedPermissions.add(id);
        }
    }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            // Local Preview strictly
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.employeeImage = e.target.result;
            };
            reader.readAsDataURL(file);

            // Backend Upload (Store result only to payload variable)
            this.uploadImage(file);
        }
    }

    uploadImage(file: File): void {
        this.uploading = true;
        this.core.uploadImage(file).subscribe({
            next: (res: any) => {
                console.log('Upload Response:', res);
                // Assign backend URL or filename strictly to the property that gets saved
                this.uploadedImage = res?.filename || res?.url || res; 
                this.uploading = false;
            },
            error: () => {
                this.uploading = false;
                this.showToast('Failed to upload image. Using local preview temporarily.', 'error');
            }
        });
    }

    showToast(message: string, type: 'success' | 'error'): void {
        this.toastMessage = message;
        this.toastType = type;
        this.showToastMsg = true;

        if (this.toastTimeout) clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
            this.showToastMsg = false;
        }, 3000);
    }

    save(): void {
        if (this.employeeForm.invalid) {
            this.employeeForm.markAllAsTouched();
            this.showToast('Please correct the errors in the form.', 'error');
            return;
        }

        this.loading = true;
        
        const formValues = this.employeeForm.value;
        const payload: any = {
            name: formValues.name,
            email: formValues.email,
            mobile: formValues.mobile,
            role_id: formValues.role_id,
            image: this.uploadedImage,
            status: this.employeeStatus,
            permissions: Array.from(this.selectedPermissions).join(',')
        };

        // Only send password if the user actually typed a new one
        if (formValues.password) {
            payload.password = formValues.password;
        }
        
        const request = this.isEdit
            ? this.core.updateItem('employees', this.route.snapshot.params['id'], payload)
            : this.core.addItem('employees', payload);

        request.subscribe({
            next: () => {
                this.loading = false;
                this.showToast(`Employee ${this.isEdit ? 'updated' : 'created'} successfully!`, 'success');
                setTimeout(() => this.router.navigate(['/employees']), 1500);
            },
            error: (err) => {
                this.loading = false;
                this.showToast(err.error?.message || 'Failed to save employee data.', 'error');
                console.error('Error saving employee', err);
            }
        });
    }
}
