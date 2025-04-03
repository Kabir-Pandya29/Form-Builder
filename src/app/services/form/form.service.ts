import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  private readonly storageKey = 'formData';
  private formDataSubject = new BehaviorSubject<{ name: string; type: string }[]>(this.loadFromStorage());
  formData$ = this.formDataSubject.asObservable();

  constructor() {
    // Synchronize BehaviorSubject with localStorage on initialization
    this.syncWithStorage();
  }

  saveFormData(field: { name: string; type: string }) {
    const currentData = this.formDataSubject.getValue();
    const updatedData = [...currentData, field];
    this.formDataSubject.next(updatedData);
    this.saveToStorage(updatedData);
  }

  getFormData() {
    return this.formDataSubject.getValue();
  }

  updateFormData(fields: { name: string; type: string }[]) {
    this.formDataSubject.next(fields);
    this.saveToStorage(fields);
  }

  clearFormData() {
    localStorage.removeItem(this.storageKey);
    this.formDataSubject.next([]);
  }

  private saveToStorage(fields: { name: string; type: string }[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(fields));
  }

  private loadFromStorage(): { name: string; type: string }[] {
    const storedData = localStorage.getItem(this.storageKey);
    return storedData ? JSON.parse(storedData) : [];
  }

  private syncWithStorage() {
    const storedData = this.loadFromStorage();
    this.formDataSubject.next(storedData);
  }
}
