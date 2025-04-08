import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormService } from '../../services/form/form.service';

@Component({
  selector: 'app-form-builder',
  templateUrl: './form-builder.component.html',
  styleUrl: './form-builder.component.scss',
  standalone: false,
})
export class FormBuilderComponent {
  fields: { 
    name: string; 
    type: string; 
    label: string; 
    placeholder?: string; 
    validations: { 
      required: boolean; 
      minLength?: number; 
      maxLength?: number; 
      dataType?: string; 
    }; 
    options?: string[]; 
    isEditing?: boolean; 
    optionsString?: string; 
  }[] = [];
  selectedFieldType: string = ''; // Track the selected field type

  constructor(
    @Optional() public dialogRef: MatDialogRef<FormBuilderComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private formService: FormService
  ) {
    this.formService.formData$.subscribe((fields) => {
      this.fields = fields.map(field => ({
        ...field,
        validations: field.validations || { required: false }, // Ensure validations is initialized
        options: field.options || [], // Ensure options is initialized
        optionsString: field.options?.join(', ') || '' // Initialize optionsString
      }));
    });
  }

  onFieldTypeChange(fieldType: string) {
    this.selectedFieldType = fieldType; // Update the selected field type
  }

  onSubmit(form: any) {
    if (form.valid) {
      const newField = {
        name: form.value.fieldName,
        type: form.value.fieldType,
        label: form.value.fieldLabel,
        placeholder: form.value.fieldPlaceholder,
        validations: {
          required: form.value.required || false,
          minLength: form.value.minLength || null,
          maxLength: form.value.maxLength || null,
          dataType: form.value.fieldType === 'text' ? form.value.dataType || 'text' : undefined, // Only set dataType for text fields
        },
        options: form.value.fieldOptions ? form.value.fieldOptions.split(',').map((opt: string) => opt.trim()) : [],
        optionsString: form.value.fieldOptions || '' // Initialize optionsString
      };
      this.formService.saveFormData(newField);
      form.reset();
      this.selectedFieldType = ''; // Reset the selected field type
    }
  }

  toggleEditField(field: any) {
    field.isEditing = !field.isEditing;
    if (field.isEditing) {
      field.optionsString = field.options?.join(', ') || ''; // Ensure optionsString is always initialized
      field.validations = field.validations || { required: false }; // Ensure validations is initialized
    }
  }

  updateFieldOptions(field: any) {
    field.options = (field.optionsString || '').split(',').map((opt: string) => opt.trim()); // Handle undefined safely
    this.formService.updateFormData(this.fields); // Reflect changes instantly
  }

  saveFieldChanges(field: any) {
    field.isEditing = false;
    this.formService.updateFormData(this.fields); // Save changes instantly
  }

  closeDialog() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}
