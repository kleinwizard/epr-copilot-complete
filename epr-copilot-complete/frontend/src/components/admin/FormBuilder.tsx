import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { formBuilderService } from '@/services/formBuilderService';
import { CustomForm, FormField } from '@/types/admin';

export const FormBuilder = () => {
  const [forms, setForms] = useState<CustomForm[]>([]);
  const [selectedForm, setSelectedForm] = useState<CustomForm | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newFieldType, setNewFieldType] = useState<string>('');

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = () => {
    setForms(formBuilderService.getForms());
  };

  const handleSelectForm = (form: CustomForm) => {
    setSelectedForm(form);
    setIsEditing(false);
  };

  const handleCreateForm = async () => {
    const newForm = await formBuilderService.createForm({
      name: 'New Form',
      description: 'A new custom form',
      fields: [],
      settings: {
        allowMultipleSubmissions: false,
        requireAuthentication: true,
        showProgressBar: true,
        emailNotifications: [],
        saveAsDraft: true
      },
      isActive: true,
      createdBy: 'admin@company.com'
    });

    loadForms();
    setSelectedForm(newForm);
    setIsEditing(true);
  };

  const handleAddField = async () => {
    if (!selectedForm || !newFieldType) return;

    const fieldTypes = formBuilderService.getFieldTypes();
    const fieldType = fieldTypes.find(t => t.value === newFieldType);
    
    if (!fieldType) return;

    await formBuilderService.addField(selectedForm.id, {
      name: `field_${Date.now()}`,
      label: `New ${fieldType.label}`,
      type: newFieldType as any,
      isRequired: false,
      validation: [],
      width: 'full'
    });

    const updatedForm = formBuilderService.getForm(selectedForm.id);
    if (updatedForm) {
      setSelectedForm(updatedForm);
    }
    setNewFieldType('');
  };

  const handleUpdateField = async (fieldId: string, updates: Partial<FormField>) => {
    if (!selectedForm) return;

    await formBuilderService.updateField(selectedForm.id, fieldId, updates);
    
    const updatedForm = formBuilderService.getForm(selectedForm.id);
    if (updatedForm) {
      setSelectedForm(updatedForm);
    }
  };

  const handleRemoveField = async (fieldId: string) => {
    if (!selectedForm) return;

    await formBuilderService.removeField(selectedForm.id, fieldId);
    
    const updatedForm = formBuilderService.getForm(selectedForm.id);
    if (updatedForm) {
      setSelectedForm(updatedForm);
    }
  };

  const fieldTypes = formBuilderService.getFieldTypes();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Forms List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Custom Forms</CardTitle>
            <Button onClick={handleCreateForm} size="sm">
              Create Form
            </Button>
          </div>
          <CardDescription>Manage your custom forms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {forms.map(form => (
              <div
                key={form.id}
                className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                  selectedForm?.id === form.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => handleSelectForm(form)}
              >
                <div className="font-medium">{form.name}</div>
                <div className="text-sm text-gray-500">{form.description}</div>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant={form.isActive ? 'default' : 'secondary'}>
                    {form.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <span className="text-xs text-gray-400">
                    {form.fields.length} fields
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Builder */}
      {selectedForm && (
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{selectedForm.name}</CardTitle>
                  <CardDescription>{selectedForm.description}</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Preview' : 'Edit'}
                  </Button>
                  <Button>Save Form</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-6">
                  {/* Add New Field */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Add New Field</h4>
                    <div className="flex space-x-2">
                      <Select value={newFieldType} onValueChange={setNewFieldType}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select field type" />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={handleAddField} disabled={!newFieldType}>
                        Add Field
                      </Button>
                    </div>
                  </div>

                  {/* Existing Fields */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Form Fields</h4>
                    {selectedForm.fields.map(field => (
                      <div key={field.id} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Field Label</Label>
                            <Input
                              value={field.label}
                              onChange={(e) => handleUpdateField(field.id, { label: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Field Name</Label>
                            <Input
                              value={field.name}
                              onChange={(e) => handleUpdateField(field.id, { name: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Placeholder</Label>
                            <Input
                              value={field.placeholder || ''}
                              onChange={(e) => handleUpdateField(field.id, { placeholder: e.target.value })}
                            />
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={field.isRequired}
                                onChange={(e) => handleUpdateField(field.id, { isRequired: e.target.checked })}
                                className="h-4 w-4"
                              />
                              <Label>Required</Label>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveField(field.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Form Preview */
                <div className="space-y-4">
                  <h4 className="font-medium">Form Preview</h4>
                  {selectedForm.fields.map(field => (
                    <div key={field.id} className="space-y-2">
                      <Label>
                        {field.label} {field.isRequired && <span className="text-red-500">*</span>}
                      </Label>
                      {field.type === 'text' && (
                        <Input placeholder={field.placeholder} disabled />
                      )}
                      {field.type === 'textarea' && (
                        <textarea
                          className="w-full p-2 border rounded-md"
                          placeholder={field.placeholder}
                          rows={3}
                          disabled
                        />
                      )}
                      {field.type === 'select' && (
                        <Select disabled>
                          <SelectTrigger>
                            <SelectValue placeholder={field.placeholder || "Select an option"} />
                          </SelectTrigger>
                        </Select>
                      )}
                      {field.type === 'checkbox' && (
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" disabled className="h-4 w-4" />
                          <span className="text-sm">{field.placeholder || field.label}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
