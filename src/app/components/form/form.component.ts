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

  onSubmit(form: any) {
    // Extract checked options from checkboxModel
    const selectedCheckboxValues: { [key: string]: string[] } = {};

    for (const fieldName in this.checkboxModel) {
      selectedCheckboxValues[fieldName] = Object.entries(this.checkboxModel[fieldName])
        .filter(([_, checked]) => checked)
        .map(([option]) => option);
    }

    if (form.valid) {
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
      this.showToast('Please fix the errors in the form.', 'snackbar-error');
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
