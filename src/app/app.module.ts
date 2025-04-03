import { NgModule } from "@angular/core";
import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app.routes";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule } from "@angular/forms";
import { MaterialModule } from "./shared/material/material.module";
import { FormComponent } from "./components/form/form.component";
import { FormBuilderComponent } from "./components/form-builder/form-builder.component";
import { DragDropModule } from "@angular/cdk/drag-drop";

@NgModule({
    declarations: [
        AppComponent,
        FormComponent,
        FormBuilderComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        FormsModule,
        MaterialModule, // Consolidated Angular Material imports
        DragDropModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule { }