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
  fields: { name: string; type: string }[] = [];

  constructor(
    @Optional() public dialogRef: MatDialogRef<FormBuilderComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private formService: FormService
  ) {
    this.formService.formData$.subscribe((fields) => {
      this.fields = fields;
    });
  }

  onSubmit(form: any) {
    if (form.valid) {
      const newField = {
        name: form.value.fieldName,
        type: form.value.fieldType,
      };
      this.formService.saveFormData(newField);
      form.reset();
    }
  }

  closeDialog() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}
