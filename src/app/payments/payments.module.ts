import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentListComponent } from './payment-list/payment-list.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
    { path: '', component: PaymentListComponent }
];

@NgModule({
    declarations: [PaymentListComponent],
    imports: [CommonModule, FormsModule, RouterModule.forChild(routes)]
})
export class PaymentsModule { }
