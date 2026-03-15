import { Component, OnInit } from '@angular/core';
import { CoreService } from '../../services/core.service';

@Component({
    selector: 'app-helper-member-list',
    templateUrl: './helper-member-list.component.html',
    styleUrls: ['./helper-member-list.component.css']
})
export class HelperMemberListComponent implements OnInit {
    members: any[] = [];
    searchTerm: string = '';
    loading: boolean = false;
    pagination: any = {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    };

    constructor(private core: CoreService) { }

    ngOnInit(): void {
        this.fetchMembers();
    }

    fetchMembers(page: number = 1): void {
        this.loading = true;
        this.core.getData('helper-members', page, this.pagination.limit, { search: this.searchTerm }).subscribe({
            next: (res: any) => {
                this.members = res.data;
                this.pagination = res.pagination;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error fetching members', err);
                this.loading = false;
            }
        });
    }

    onSearch(): void {
        this.pagination.page = 1;
        this.fetchMembers();
    }

    onPageChange(page: number): void {
        this.fetchMembers(page);
    }

    deleteMember(id: number): void {
        if (confirm('Are you sure you want to remove this helper?')) {
            this.core.deleteItem('helper-members', id).subscribe(() => {
                this.fetchMembers();
            });
        }
    }
}
