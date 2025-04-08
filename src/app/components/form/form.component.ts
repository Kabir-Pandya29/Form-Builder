import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormService } from '../../services/form/form.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ResizeEvent } from 'angular-resizable-element';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  standalone: false
})
export class FormComponent implements OnInit {
  fields: {
    name: string;
    type: string;
    label: string;
    placeholder?: string;
    validations?: any;
    options?: string[];
    width?: string;
    isEditing?: boolean;
  }[] = [];

  checkboxModel: { [fieldName: string]: { [option: string]: boolean } } = {};

  constructor(
    private formService: FormService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.formService.formData$.subscribe((fields) => {
      this.fields = fields;
      this.initializeCheckboxModel();
    });
  }

  ngOnInit() {
    this.fields = this.formService.getFormData();

    // Initialize checkboxModel structure
    this.fields.forEach((field) => {
      if (field.type === 'checkbox' && field.options) {
        this.checkboxModel[field.name] = {};
        field.options.forEach((option) => {
          this.checkboxModel[field.name][option] = false;
        });
      }
    });
  }




  private initializeCheckboxModel() {
    this.fields.forEach((field) => {
      if (field.type === 'checkbox' && field.options) {
        if (!this.checkboxModel[field.name]) {
          this.checkboxModel[field.name] = {};
        }
        field.options.forEach((option) => {
          if (!(option in this.checkboxModel[field.name])) {
            this.checkboxModel[field.name][option] = false;
          }
        });
      }
    });
  }
  
  onSubmit(form: any) {
    // Extract checked options from checkboxModel
    const selectedCheckboxValues: { [key: string]: string[] } = {};
  
    for (const fieldName in this.checkboxModel) {
      selectedCheckboxValues[fieldName] = Object.entries(this.checkboxModel[fieldName])
        .filter(([_, checked]) => checked)
        .map(([option]) => option);
    }
  
    // Validation flags
    let hasInvalidFields = false;
  
    // Regex patterns
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const numberRegex = /^\d+$/;
  
    this.fields.forEach((field) => {
      const value = form.value[field.name];
  
      if (field.type === 'text' && field.validations?.dataType) {
        const dataType = field.validations.dataType;
  
        if (dataType === 'email' && value && !emailRegex.test(value)) {
          this.showToast(`${field.label} must be a valid email address.`, 'snackbar-error');
          hasInvalidFields = true;
        }
  
        if (dataType === 'number' && value && !numberRegex.test(value)) {
          this.showToast(`${field.label} must contain only numbers.`, 'snackbar-error');
          hasInvalidFields = true;
        }
  
        if (dataType === 'text' && (value == null || value.trim() === '')) {
          this.showToast(`${field.label} cannot be empty.`, 'snackbar-error');
          hasInvalidFields = true;
        }
      }
    });
  
    if (form.valid && !hasInvalidFields) {
      const formOutput = {
        ...form.value,
        ...selectedCheckboxValues,
      };
  
      console.log('Form submitted:', formOutput);
      this.showToast('Form submitted successfully!');
      form.reset();
  
      // Reset checkboxModel
      for (const field in this.checkboxModel) {
        for (const option in this.checkboxModel[field]) {
          this.checkboxModel[field][option] = false;
        }
      }
    } else {
      Object.keys(form.controls).forEach((key) => {
        const control = form.controls[key];
        control.markAsTouched();
      });
  
      if (!hasInvalidFields) {
        this.showToast('Please fix the errors in the form.', 'snackbar-error');
      }
    }
  }


  onDragDrop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.fields, event.previousIndex, event.currentIndex);
    this.formService.updateFormData(this.fields);
  }

  resizeField(field: any, event: ResizeEvent) {
    if (event.rectangle?.width) {
      const container = document.querySelector('.drop-list') as HTMLElement;
      const containerWidth = container?.offsetWidth || 1;
      const widthPercent = (event.rectangle.width / containerWidth) * 100;
      field.width = `${widthPercent.toFixed(2)}%`;
      this.formService.updateFormData(this.fields);
    }
  }

  toggleEditField(field: any) {
    field.isEditing = !field.isEditing;
    if (!field.isEditing) {
      this.formService.updateFormData(this.fields);
    }
  }

  clearFormData() {
    this.formService.clearFormData();
    this.fields = [];
    this.checkboxModel = {};
    this.showToast('Form data cleared successfully!');
    this.initializeCheckboxModel(); // Reinitialize checkbox model after clearing
  }



// Private variables for toast notifications
// These variables are used to manage the queue of toast messages and their display status

  private toastQueue: string[] = [];
private isToastShowing = false;


// Method to show toast notifications
// This method adds a message to the toast queue and triggers the display of the next toast
private showToast(message: string, colorClass: string = 'snackbar-success') {
  this.toastQueue.push(JSON.stringify({ message, colorClass }));
  this.displayNextToast();
}

private displayNextToast() {
  if (this.isToastShowing || this.toastQueue.length === 0) return;

  const { message, colorClass } = JSON.parse(this.toastQueue.shift()!);
  this.isToastShowing = true;

  this.snackBar.open(message, 'Close', {
    duration: 2000,
    horizontalPosition: 'end',
    verticalPosition: 'top',
    panelClass: [colorClass],
  });

  setTimeout(() => {
    this.isToastShowing = false;
    this.displayNextToast(); // show next in queue
  }, 2500); // delay to show next one with margin
}

  

}
