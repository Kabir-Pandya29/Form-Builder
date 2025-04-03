import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilderComponent } from '../form-builder/form-builder.component';
import { FormService } from '../../services/form/form.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss',
  standalone: false,
})
export class FormComponent implements OnInit {
  fields: { name: string; type: string }[] = [];

  constructor(
    private formService: FormService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.formService.formData$.subscribe((fields) => {
      this.fields = fields;
    });
  }

  ngOnInit() {
    // Initialize fields with the latest data from the service
    this.fields = this.formService.getFormData();
  }

  onSubmit(form: any) {
    if (form.valid) {
      console.log('Form submitted:', form.value);
      this.showToast('Form submitted successfully!');
      form.reset();
    } else {
      console.error('Form is invalid. Please correct the errors and try again.');
      Object.keys(form.controls).forEach((key) => {
        const control = form.controls[key];
        control.markAsTouched();
      });
    }
  }

  openFormBuilder() {
    this.dialog.open(FormBuilderComponent, {
      width: '500px',
    });
  }

  onDragDrop(event: CdkDragDrop<{ name: string; type: string }[]>) {
    moveItemInArray(this.fields, event.previousIndex, event.currentIndex);
    this.formService.updateFormData(this.fields);
  }

  clearFormData() {
    this.formService.clearFormData();
    this.fields = [];
    this.showToast('Form data cleared successfully!');
    console.log('Form data cleared.');
  }

  private showToast(message: string, colorClass: string = 'snackbar-success') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'start',
      verticalPosition: 'top',
      panelClass: [colorClass], 
    });
  }
}
