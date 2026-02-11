import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RentalListComponent } from './rental-list/rental-list.component';
import { RentalFormComponent } from './rental-form/rental-form.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const routes: Routes = [
    { path: '', component: RentalListComponent },
    { path: 'add', component: RentalFormComponent },
    { path: 'edit/:id', component: RentalFormComponent }
];

@NgModule({
    declarations: [RentalListComponent, RentalFormComponent],
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule.forChild(routes)]
})
export class RentalsModule { }
