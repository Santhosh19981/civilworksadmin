import { Component, OnInit } from '@angular/core';
import { CoreService } from '../../services/core.service';

@Component({
  selector: 'app-helper-members-list',
  templateUrl: './helper-members-list.component.html',
  styleUrls: ['./helper-members-list.component.css']
})
export class HelperMembersListComponent implements OnInit {
  members: any[] = [];
  searchTerm = '';
  loading = false;
  pagination: any = {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  };

  constructor(private core: CoreService) { }

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers(page: number = 1) {
    this.loading = true;
    this.core.getData('helper-members', page, this.pagination.limit, { search: this.searchTerm }).subscribe({
      next: (res: any) => {
        this.members = res.data;
        this.pagination = res.pagination;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading helper members', err);
        this.loading = false;
      }
    });
  }

  onSearch() {
    this.pagination.page = 1;
    this.loadMembers();
  }

  onPageChange(page: number) {
    this.pagination.page = page;
    this.loadMembers(page);
  }

  deleteMember(id: any) {
    if (confirm('Are you sure you want to delete this helper?')) {
      this.core.deleteItem('helper-members', id).subscribe({
        next: () => {
          this.loadMembers(this.pagination.page);
        },
        error: (err) => {
          console.error('Error deleting member', err);
        }
      });
    }
  }
}
