
import { CustomForm, FormField, FormFieldOption } from '../types/admin';

export class FormBuilderService {
  private forms: Map<string, CustomForm> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    const mockForm: CustomForm = {
      id: 'form-1',
      name: 'Product Registration Form',
      description: 'Form for registering new products in the system',
      fields: [
        {
          id: 'field-1',
          name: 'productName',
          label: 'Product Name',
          type: 'text',
          placeholder: 'Enter product name',
          isRequired: true,
          validation: [
            { type: 'required', message: 'Product name is required' },
            { type: 'min', value: 3, message: 'Minimum 3 characters' }
          ],
          order: 1,
          width: 'full'
        },
        {
          id: 'field-2',
          name: 'category',
          label: 'Product Category',
          type: 'select',
          isRequired: true,
          validation: [{ type: 'required', message: 'Category is required' }],
          options: [
            { label: 'Electronics', value: 'electronics' },
            { label: 'Clothing', value: 'clothing' },
            { label: 'Food & Beverage', value: 'food-beverage' }
          ],
          order: 2,
          width: 'half'
        }
      ],
      settings: {
        allowMultipleSubmissions: false,
        requireAuthentication: true,
        showProgressBar: true,
        emailNotifications: ['admin@company.com'],
        saveAsDraft: true
      },
      isActive: true,
      createdBy: 'admin@company.com',
      createdAt: '2024-06-01T00:00:00Z',
      updatedAt: '2024-06-01T00:00:00Z'
    };

    this.forms.set(mockForm.id, mockForm);
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
    return newForm;
  }

  async updateForm(id: string, updates: Partial<CustomForm>): Promise<boolean> {
    const form = this.forms.get(id);
    if (!form) return false;

    Object.assign(form, updates, { updatedAt: new Date().toISOString() });
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
