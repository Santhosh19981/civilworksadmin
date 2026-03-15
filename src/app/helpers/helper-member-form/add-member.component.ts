import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CoreService } from '../../services/core.service';

@Component({
  selector: 'app-add-member',
  templateUrl: './add-member.component.html'
})
export class AddMemberComponent implements OnInit {
  member = {
    name: '',
    service_ids: [] as number[],
    experience: '',
    mobile: '',
    image: '',
    status: 'active'
  };
  services: any[] = [];
  loading = false;

  constructor(private core: CoreService, private router: Router) { }

  ngOnInit(): void {
    this.core.getData('helpers', 1, 100).subscribe(res => {
      this.services = res.data;
    });
  }

  onServiceToggle(id: number, event: any) {
    if (event.target.checked) {
      this.member.service_ids.push(id);
    } else {
      this.member.service_ids = this.member.service_ids.filter(sid => sid !== id);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.core.uploadImage(file).subscribe((res: any) => {
        this.member.image = res.url; // Use url directly from res.data (CoreService map)
      });
    }
  }

  onSubmit() {
    this.loading = true;
    this.core.addItem('helper-members', this.member).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/helpers/workers']);
      },
      error: (err) => {
        console.error('Error adding member', err);
        this.loading = false;
      }
    });
  }
}
