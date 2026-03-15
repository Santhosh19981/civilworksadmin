import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';

import { RentalListComponent } from './rental-list/rental-list.component';
import { RentalFormComponent } from './rental-form/rental-form.component';
import { RentalCategoryListComponent } from './rental-category-list/rental-category-list.component';

const routes: Routes = [
    { path: '', component: RentalListComponent },
    { path: 'categories', component: RentalCategoryListComponent },
    { path: 'add', component: RentalFormComponent },
    { path: 'edit/:id', component: RentalFormComponent }
];

@NgModule({
    declarations: [RentalListComponent, RentalFormComponent, RentalCategoryListComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        RouterModule.forChild(routes)
    ]
})
export class RentalsModule { }
