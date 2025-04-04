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
  fields: { 
    name: string; 
    type: string; 
    label: string; 
    placeholder?: string; 
    validations?: any; 
    options?: string[]; 
    width?: string; // Add width for resizing
    isEditing?: boolean; // Add isEditing for toggling edit mode
  }[] = [];

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

  renderField(field: { name: string; type: string; label: string; placeholder?: string; validations?: any }) {
    switch (field.type) {
      case 'text':
      case 'textarea':
        return `<label>${field.label}</label>
                <input type="${field.validations?.dataType || 'text'}" name="${field.name}" placeholder="${field.placeholder || ''}" 
                ${field.validations?.required ? 'required' : ''} 
                minlength="${field.validations?.minLength || ''}" 
                maxlength="${field.validations?.maxLength || ''}" />`;
      case 'select':
        return `<label>${field.label}</label>
                <select name="${field.name}">
                  <!-- Options to be dynamically added -->
                </select>`;
      case 'checkbox':
      case 'radio':
        return `<label>${field.label}</label>
                <input type="${field.type}" name="${field.name}" />`;
      default:
        return '';
    }
  }

  openFormBuilder() {
    this.dialog.open(FormBuilderComponent, {
      width: '500px',
    });
  }

  onDragDrop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.fields, event.previousIndex, event.currentIndex);
    this.formService.updateFormData(this.fields);
  }

  resizeField(field: any, event: Event) {
    const inputElement = event.target as HTMLInputElement; // Cast event target to HTMLInputElement
    const newWidth = parseInt(inputElement.value, 10) + '%'; // Use parseInt here
    field.width = newWidth;
    this.formService.updateFormData(this.fields);
  }

  toggleEditField(field: any) {
    field.isEditing = !field.isEditing;
    if (!field.isEditing) {
      this.formService.updateFormData(this.fields); // Save changes instantly
    }
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
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [colorClass], 
    });
  }
}
