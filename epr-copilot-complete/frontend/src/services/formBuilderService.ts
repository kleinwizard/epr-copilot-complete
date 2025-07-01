
import { CustomForm, FormField, FormFieldOption } from '../types/admin';

export class FormBuilderService {
  private forms: Map<string, CustomForm> = new Map();

  constructor() {
    this.loadRealData();
  }

  private loadRealData() {
    const storedForms = localStorage.getItem('epr_forms');
    if (storedForms) {
      try {
        const formsData = JSON.parse(storedForms);
        Object.entries(formsData).forEach(([id, form]) => {
          this.forms.set(id, form as CustomForm);
        });
      } catch (error) {
        console.error('Failed to load forms from storage:', error);
      }
    }
  }

  private saveToStorage() {
    const formsData = Object.fromEntries(this.forms.entries());
    localStorage.setItem('epr_forms', JSON.stringify(formsData));
  }

  getForms(): CustomForm[] {
    return Array.from(this.forms.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  getForm(id: string): CustomForm | null {
    return this.forms.get(id) || null;
  }

  async createForm(formData: Omit<CustomForm, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomForm> {
    const id = `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newForm: CustomForm = {
      ...formData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.forms.set(id, newForm);
    this.saveToStorage();
    return newForm;
  }

  async updateForm(id: string, updates: Partial<CustomForm>): Promise<boolean> {
    const form = this.forms.get(id);
    if (!form) return false;

    Object.assign(form, updates, { updatedAt: new Date().toISOString() });
    this.saveToStorage();
    return true;
  }

  async deleteForm(id: string): Promise<boolean> {
    return this.forms.delete(id);
  }

  async addField(formId: string, field: Omit<FormField, 'id' | 'order'>): Promise<boolean> {
    const form = this.forms.get(formId);
    if (!form) return false;

    const newField: FormField = {
      ...field,
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      order: form.fields.length + 1
    };

    form.fields.push(newField);
    form.updatedAt = new Date().toISOString();
    return true;
  }

  async updateField(formId: string, fieldId: string, updates: Partial<FormField>): Promise<boolean> {
    const form = this.forms.get(formId);
    if (!form) return false;

    const fieldIndex = form.fields.findIndex(f => f.id === fieldId);
    if (fieldIndex === -1) return false;

    Object.assign(form.fields[fieldIndex], updates);
    form.updatedAt = new Date().toISOString();
    return true;
  }

  async removeField(formId: string, fieldId: string): Promise<boolean> {
    const form = this.forms.get(formId);
    if (!form) return false;

    const fieldIndex = form.fields.findIndex(f => f.id === fieldId);
    if (fieldIndex === -1) return false;

    form.fields.splice(fieldIndex, 1);
    form.updatedAt = new Date().toISOString();
    return true;
  }

  async reorderFields(formId: string, fieldOrders: { fieldId: string; order: number }[]): Promise<boolean> {
    const form = this.forms.get(formId);
    if (!form) return false;

    fieldOrders.forEach(({ fieldId, order }) => {
      const field = form.fields.find(f => f.id === fieldId);
      if (field) {
        field.order = order;
      }
    });

    form.fields.sort((a, b) => a.order - b.order);
    form.updatedAt = new Date().toISOString();
    return true;
  }

  getFieldTypes(): Array<{ value: string; label: string; description: string }> {
    return [
      { value: 'text', label: 'Text Input', description: 'Single line text input' },
      { value: 'textarea', label: 'Text Area', description: 'Multi-line text input' },
      { value: 'number', label: 'Number', description: 'Numeric input' },
      { value: 'email', label: 'Email', description: 'Email address input' },
      { value: 'password', label: 'Password', description: 'Password input' },
      { value: 'select', label: 'Dropdown', description: 'Single selection dropdown' },
      { value: 'checkbox', label: 'Checkbox', description: 'Multiple selection checkboxes' },
      { value: 'radio', label: 'Radio Button', description: 'Single selection radio buttons' },
      { value: 'date', label: 'Date Picker', description: 'Date selection input' },
      { value: 'file', label: 'File Upload', description: 'File upload input' }
    ];
  }

  exportForm(id: string): string | null {
    const form = this.forms.get(id);
    if (!form) return null;

    return JSON.stringify(form, null, 2);
  }

  async importForm(formData: string, createdBy: string): Promise<CustomForm | null> {
    try {
      const parsedForm = JSON.parse(formData);
      const formToImport: Omit<CustomForm, 'id' | 'createdAt' | 'updatedAt'> = {
        ...parsedForm,
        createdBy
      };

      return await this.createForm(formToImport);
    } catch (error) {
      console.error('Failed to import form:', error);
      return null;
    }
  }
}

export const formBuilderService = new FormBuilderService();
