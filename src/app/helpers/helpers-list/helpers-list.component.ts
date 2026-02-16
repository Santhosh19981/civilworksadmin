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
    helpers$: Observable<any[]>;
    searchTerm = '';
    filteredHelpers$: Observable<any[]>;


    private searchSubject = new BehaviorSubject<string>('');

    constructor(private core: CoreService) {
        this.helpers$ = this.core.getData('helpers');
        this.filteredHelpers$ = combineLatest([
            this.helpers$,
            this.searchSubject.asObservable()
        ]).pipe(
            map(([helpers, search]) => {
                return helpers.filter(h => {
                    const name = h.serviceName || h.name || '';
                    const desc = h.description || '';
                    const matchesSearch = !search ||
                        name.toLowerCase().includes(search.toLowerCase()) ||
                        desc.toLowerCase().includes(search.toLowerCase());
                    return matchesSearch;
                });
            })
        );

        // Ensure subjects emit initial values
        this.searchSubject.next('');
    }

    ngOnInit(): void { }

    onSearch() {
        this.searchSubject.next(this.searchTerm);
    }

    deleteHelper(id: any) {
        if (confirm('Are you sure you want to delete this helper?')) {
            this.core.deleteItem('helpers', id);
            alert('Helper deleted successfully!');
        }
    }
}
