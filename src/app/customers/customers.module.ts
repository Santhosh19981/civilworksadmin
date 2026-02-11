import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
    { path: '', component: CustomerListComponent }
];

@NgModule({
    declarations: [CustomerListComponent],
    imports: [CommonModule, FormsModule, RouterModule.forChild(routes)]
})
export class CustomersModule { }
