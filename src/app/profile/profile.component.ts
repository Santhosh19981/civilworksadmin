import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CoreService } from '../services/core.service';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  profileImage: string = ''; // Local Preview
  uploadedImage: string = ''; // For Backend Payload
  
  loading: boolean = false;
  uploading: boolean = false;
  
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';
  showToastMsg: boolean = false;
  toastTimeout: any;

  constructor(
    private fb: FormBuilder,
    private core: CoreService,
    private auth: AuthService
  ) {
    this.initForm();
  }

  initForm(): void {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
      password: ['']
    });
  }

  ngOnInit(): void {
    const user = this.auth.currentUserValue;
    if (user) {
      this.profileForm.patchValue({
        name: user.name,
        email: user.email,
        mobile: user.mobile
      });

      let imgUrl = user.image || '';
      this.uploadedImage = imgUrl;

      if (imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('data:image')) {
          imgUrl = `${environment.uploadUrl}/${imgUrl}`;
      }
      this.profileImage = imgUrl;
    }
  }

  onFileSelected(event: any): void {
      const file = event.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
              this.profileImage = e.target.result;
          };
          reader.readAsDataURL(file);

          this.uploadImage(file);
      }
  }

  uploadImage(file: File): void {
      this.uploading = true;
      this.core.uploadImage(file).subscribe({
          next: (res: any) => {
              this.uploadedImage = res?.filename || res?.url || res; 
              this.uploading = false;
          },
          error: () => {
              this.uploading = false;
              this.showToast('Failed to upload image.', 'error');
          }
      });
  }

  showToast(message: string, type: 'success' | 'error'): void {
      this.toastMessage = message;
      this.toastType = type;
      this.showToastMsg = true;

      if (this.toastTimeout) clearTimeout(this.toastTimeout);
      this.toastTimeout = setTimeout(() => {
          this.showToastMsg = false;
      }, 3000);
  }

  save(): void {
      if (this.profileForm.invalid) {
          this.profileForm.markAllAsTouched();
          this.showToast('Please correct the errors in the form.', 'error');
          return;
      }

      this.loading = true;
      const formValues = this.profileForm.value;
      
      const payload: any = {
          name: formValues.name,
          email: formValues.email,
          mobile: formValues.mobile,
          image: this.uploadedImage
      };

      if (formValues.password) {
          payload.password = formValues.password;
      }

      this.core.updateProfile(payload).subscribe({
          next: (res: any) => {
              this.loading = false;
              this.showToast('Profile updated successfully!', 'success');
              
              // Update local auth storage to reflect new details immediately
              const currentUser = this.auth.currentUserValue;
              if (currentUser && res.data) {
                 const updatedUser = { ...currentUser, ...res.data };
                 localStorage.setItem('civilworks_admin_user', JSON.stringify(updatedUser));
                 
                 // Force a reload to let header pick up new avatar immediately (safe fallback)
                 setTimeout(() => window.location.reload(), 1500);
              }
              this.profileForm.get('password')?.setValue(''); // Clear password box
          },
          error: (err) => {
              this.loading = false;
              this.showToast(err.error?.message || 'Failed to update profile.', 'error');
          }
      });
  }
}
