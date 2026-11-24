import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MembershipPricingComponent } from './membership-pricing.component';

const routes: Routes = [
    { path: '', component: MembershipPricingComponent }
];

@NgModule({
    declarations: [MembershipPricingComponent],
    imports: [CommonModule, FormsModule, RouterModule.forChild(routes)]
})
export class MembershipPricingModule { }
