import { Component, OnInit } from '@angular/core';
import { CoreService } from '../../services/core.service';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-helpers-list',
    templateUrl: './helpers-list.component.html',
    styleUrls: ['./helpers-list.component.css']
})
export class HelpersListComponent implements OnInit {
    helpers: any[] = [];
    searchTerm = '';
    loading = false;
    pagination: any = {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    };


    constructor(private core: CoreService) {
        this.loadHelpers();
    }

    loadHelpers(page: number = 1) {
        this.loading = true;
        this.core.getData('helpers', page, this.pagination.limit, { search: this.searchTerm }).subscribe({
            next: (res: any) => {
                this.helpers = res.data;
                this.pagination = res.pagination;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading helpers', err);
                this.loading = false;
            }
        });
    }

    ngOnInit(): void { }

    onSearch() {
        this.pagination.page = 1;
        this.loadHelpers();
    }

    onPageChange(page: number) {
        this.pagination.page = page;
        this.loadHelpers(page);
    }

    deleteHelper(id: any) {
        if (confirm('Are you sure you want to delete this helper service?')) {
            this.core.deleteItem('helpers/admin', id).subscribe(() => {
                this.loadHelpers(this.pagination.page);
            });
        }
    }
}
