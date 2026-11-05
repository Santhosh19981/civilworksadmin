import { Component, OnInit } from '@angular/core';
import { CoreService } from '../../services/core.service';

@Component({
    selector: 'app-unit-list',
    templateUrl: './unit-list.component.html',
    styleUrls: ['./unit-list.component.css']
})
export class UnitListComponent implements OnInit {
    units: any[] = [];
    filteredUnits: any[] = [];
    selectedCategoryFilter: string = 'all';
    searchQuery: string = '';

    pagination: any = {
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 1
    };
    showModal = false;
    isEdit = false;
    currentUnit: any = { name: '', unit_category: 'selling_weight', status: 'active' };

    categoryLabels: { [key: string]: string } = {
        'selling_weight': 'Weight (Grams, KG, Ton)',
        'selling_length': 'Length & Area (Meters, Sq Ft)',
        'selling_quantity': 'Quantity & Pieces (Pieces, Box, Bundle)',
        'selling_volume': 'Volume & Liquid (Liter, Drum)',
        'renting_duration': 'Rental Duration (Hours, Days, Weeks)'
    };

    categoryOptions = [
        {
            id: 'selling_weight',
            name: 'Weight / Mass',
            hint: 'Grams, KG, Ton, Quintal',
            tag: 'SELLING',
            bgActive: 'bg-emerald-50 border-emerald-500 text-emerald-900',
            badgeBg: 'bg-emerald-100 text-emerald-700'
        },
        {
            id: 'selling_length',
            name: 'Length & Area',
            hint: 'Meters, Sq Feet, Feet, Sq Yard',
            tag: 'SELLING',
            bgActive: 'bg-blue-50 border-blue-500 text-blue-900',
            badgeBg: 'bg-blue-100 text-blue-700'
        },
        {
            id: 'selling_quantity',
            name: 'Quantity / Count',
            hint: 'Pieces, Nos, Box, Pack, Bundle, Carton',
            tag: 'SELLING',
            bgActive: 'bg-indigo-50 border-indigo-500 text-indigo-900',
            badgeBg: 'bg-indigo-100 text-indigo-700'
        },
        {
            id: 'selling_volume',
            name: 'Volume / Liquid',
            hint: 'Liters, Milliliters, Gallons, Drums',
            tag: 'SELLING',
            bgActive: 'bg-teal-50 border-teal-500 text-teal-900',
            badgeBg: 'bg-teal-100 text-teal-700'
        },
        {
            id: 'renting_duration',
            name: 'Rental / Contract Duration',
            hint: 'Hours, Days, Weeks, Months, Shifts, Till the contract completion',
            tag: 'RENTING & CONTRACT',
            bgActive: 'bg-amber-50 border-amber-500 text-amber-900',
            badgeBg: 'bg-amber-100 text-amber-700'
        }
    ];

    quickPresets = [
        { name: 'Till the contract completion', category: 'renting_duration' },
        { name: 'Piece', category: 'selling_quantity' },
        { name: 'Box', category: 'selling_quantity' },
        { name: 'Bundle', category: 'selling_quantity' },
        { name: 'Nos', category: 'selling_quantity' },
        { name: 'Liter', category: 'selling_volume' },
        { name: 'Drum', category: 'selling_volume' },
        { name: 'KG', category: 'selling_weight' },
        { name: 'Ton', category: 'selling_weight' },
        { name: 'Meters', category: 'selling_length' },
        { name: 'Sq Feet', category: 'selling_length' },
        { name: 'Days', category: 'renting_duration' },
        { name: 'Hours', category: 'renting_duration' }
    ];

    getCategoryBadgeClass(cat: string): string {
        switch (cat) {
            case 'selling_weight': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'selling_length': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'selling_quantity': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case 'selling_volume': return 'bg-teal-50 text-teal-700 border-teal-200';
            case 'renting_duration': return 'bg-amber-50 text-amber-700 border-amber-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    }

    constructor(private core: CoreService) { }

    ngOnInit() {
        this.loadUnits();
    }

    loadUnits(page: number = 1) {
        this.core.getData('units', page, 100, { all: true }).subscribe({
            next: (res) => {
                this.units = (res.data || []).sort((a: any, b: any) => Number(a.id) - Number(b.id));
                this.pagination = res.pagination || { total: this.units.length, page: 1, limit: 100, totalPages: 1 };
                this.applyFilters();
            },
            error: (err) => console.error('Error loading units', err)
        });
    }

    applyFilters() {
        let result = [...this.units];
        if (this.selectedCategoryFilter !== 'all') {
            result = result.filter(u => u.unit_category === this.selectedCategoryFilter);
        }
        if (this.searchQuery.trim()) {
            const query = this.searchQuery.toLowerCase();
            result = result.filter(u => u.name.toLowerCase().includes(query) || (u.unit_category && u.unit_category.toLowerCase().includes(query)));
        }
        this.filteredUnits = result;
    }

    setCategoryFilter(category: string) {
        this.selectedCategoryFilter = category;
        this.applyFilters();
    }

    onSearch(event: any) {
        this.searchQuery = event.target.value || '';
        this.applyFilters();
    }

    onPageChange(page: number) {
        this.loadUnits(page);
    }

    openAddModal() {
        this.isEdit = false;
        this.currentUnit = { name: '', unit_category: 'selling_weight', status: 'active' };
        this.showModal = true;
    }

    editUnit(unit: any) {
        this.isEdit = true;
        this.currentUnit = { ...unit };
        this.showModal = true;
    }

    selectCategory(catId: string) {
        this.currentUnit.unit_category = catId;
    }

    applyPreset(preset: { name: string, category: string }) {
        this.currentUnit.name = preset.name;
        this.currentUnit.unit_category = preset.category;
    }

    saveUnit() {
        if (!this.currentUnit.name || !this.currentUnit.name.trim()) {
            alert('Unit name is required');
            return;
        }

        if (this.isEdit) {
            this.core.updateItem('units', this.currentUnit.id, this.currentUnit).subscribe({
                next: () => {
                    this.loadUnits(this.pagination.page);
                    this.showModal = false;
                },
                error: (err) => {
                    const msg = err.error?.message || 'Failed to update unit';
                    alert(msg);
                }
            });
        } else {
            this.core.addItem('units', this.currentUnit).subscribe({
                next: () => {
                    this.loadUnits(1);
                    this.showModal = false;
                },
                error: (err) => {
                    const msg = err.error?.message || 'Failed to create unit';
                    alert(msg);
                }
            });
        }
    }

    toggleStatus(unit: any) {
        const newStatus = unit.status === 'active' ? 'inactive' : 'active';
        this.core.updateItem('units', unit.id, { status: newStatus }).subscribe({
            next: () => {
                unit.status = newStatus;
            },
            error: () => alert('Failed to update unit status')
        });
    }

    deleteUnit(id: any) {
        if (confirm('Are you sure you want to delete this unit? Deleting is only allowed if no products use this unit.')) {
            this.core.deleteItem('units', id).subscribe({
                next: () => {
                    this.loadUnits(this.pagination.page);
                },
                error: (err) => {
                    const msg = err.error?.message || 'Failed to delete unit';
                    alert(msg);
                }
            });
        }
    }
}
