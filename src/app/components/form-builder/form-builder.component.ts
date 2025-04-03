import { Component } from '@angular/core';

@Component({
  selector: 'app-form-builder',
  templateUrl: './form-builder.component.html',
  styleUrl: './form-builder.component.scss',
  standalone: false,
})
export class FormBuilderComponent {
  fields: { name: string; type: string }[] = [];

  onSubmit(form: any) {
    if (form.valid) {
      this.fields.push({
        name: form.value.fieldName,
        type: form.value.fieldType,
      });
      form.reset();
    }
  }
}
