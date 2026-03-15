import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CoreService } from '../../services/core.service';

@Component({
  selector: 'app-edit-member',
  templateUrl: '../helper-member-form/add-member.component.html' // Reuse template
})
export class EditMemberComponent implements OnInit {
  member: any = {};
  services: any[] = [];
  loading = false;
  id: any;

  constructor(
    private core: CoreService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.loadMember();
    this.loadServices();
  }

  loadMember() {
    this.core.getData(`helper-members/${this.id}`).subscribe(res => {
      this.member = res.data;
    });
  }

  loadServices() {
    this.core.getData('helpers', 1, 100).subscribe(res => {
      this.services = res.data;
      if (this.member.helper_ids) {
        this.member.service_ids = this.member.helper_ids.split(',').map(Number);
      }
    });
  }

  isServiceSelected(id: number): boolean {
    return this.member.service_ids?.includes(id);
  }

  onServiceToggle(id: number, event: any) {
    if (!this.member.service_ids) this.member.service_ids = [];
    if (event.target.checked) {
      if (!this.member.service_ids.includes(id)) {
        this.member.service_ids.push(id);
      }
    } else {
      this.member.service_ids = this.member.service_ids.filter(sid => sid !== id);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.core.uploadImage(file).subscribe((res: any) => {
        this.member.image = res.url;
      });
    }
  }

  onSubmit() {
    this.loading = true;
    this.core.updateItem('helper-members', this.id, this.member).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/helpers/workers']);
      },
      error: (err) => {
        console.error('Error updating member', err);
        this.loading = false;
      }
    });
  }
}
