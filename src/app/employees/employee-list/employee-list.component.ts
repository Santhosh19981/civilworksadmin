import { Component, OnInit } from '@angular/core';
import { CoreService } from '../../services/core.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-employee-list',
    templateUrl: './employee-list.component.html',
    styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit {
    employees: any[] = [];
    searchTerm: string = '';
    loading: boolean = false;
    currentUserRole: string = '';
    pagination: any = {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    };

    constructor(private core: CoreService, private auth: AuthService) { }

    ngOnInit(): void {
        const user = this.auth.currentUserValue;
        if(user) {
            this.currentUserRole = user.role;
        }
        this.fetchEmployees();
    }

    fetchEmployees(page: number = 1): void {
        this.loading = true;
        this.core.getData('employees', page, this.pagination.limit, { search: this.searchTerm }).subscribe({
            next: (res: any) => {
                this.employees = res.data.map((emp: any) => {
                    if (emp.image && !emp.image.startsWith('http') && !emp.image.startsWith('data:image')) {
                        emp.image = `${environment.uploadUrl}/${emp.image}`;
                    }
                    return emp;
                });
                this.pagination = res.pagination;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error fetching employees', err);
                this.loading = false;
            }
        });
    }

    onSearch(): void {
        this.pagination.page = 1;
        this.fetchEmployees();
    }

    onPageChange(page: number): void {
        this.fetchEmployees(page);
    }

    toggleStatus(employee: any): void {
        const newStatus = employee.status === 'active' ? 'inactive' : 'active';
        this.core.updateItem('employees', employee.id, { status: newStatus }).subscribe(() => {
            this.fetchEmployees();
        });
    }

    deleteEmployee(id: number): void {
        if (confirm('Are you sure you want to remove this employee?')) {
            this.core.deleteItem('employees', id).subscribe(() => {
                this.fetchEmployees();
            });
        }
    }
}
