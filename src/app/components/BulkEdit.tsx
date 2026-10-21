import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { 
  Upload, 
  Download, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  FileText,
  List
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';

interface BulkEditProps {
  onClose?: () => void;
}

const BULK_ACTIONS = [
  { value: 'update', label: 'Update Fields', icon: Edit },
  { value: 'delete', label: 'Delete Records', icon: Trash2 },
  { value: 'export', label: 'Export Records', icon: Download },
];

const EDITABLE_FIELDS = [
  { value: 'language', label: 'Language' },
  { value: 'classification', label: 'Classification' },
  { value: 'subject', label: 'Subject Headings' },
  { value: 'genreForm', label: 'Genre/Form' },
  { value: 'note', label: 'Notes' },
  { value: 'intendedAudience', label: 'Intended Audience' },
  { value: 'contentType', label: 'Content Type' },
];

export function BulkEdit({ onClose }: BulkEditProps) {
  const { t } = useTranslation();
  const [selectedAction, setSelectedAction] = useState('update');
  const [selectedField, setSelectedField] = useState('');
  const [newValue, setNewValue] = useState('');
  const [identifiers, setIdentifiers] = useState('');
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setIdentifiers(text);
      };
      reader.readAsText(file);
    }
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    setProgress(0);

    // Simulate bulk processing
    const ids = identifiers.split('\n').filter(id => id.trim());
    const total = ids.length;

    for (let i = 0; i < total; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setProgress(((i + 1) / total) * 100);
    }

    setResults(ids.map(id => ({
      id: id.trim(),
      status: Math.random() > 0.1 ? 'success' : 'error',
      message: Math.random() > 0.1 ? 'Updated successfully' : 'Record not found'
    })));

    setIsProcessing(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Edit className="h-6 w-6 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Bulk Edit
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Edit multiple BIBFRAME records at once
              </p>
            </div>
          </div>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Action Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Action</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {BULK_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.value}
                      onClick={() => setSelectedAction(action.value)}
                      className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-colors ${
                        selectedAction === action.value
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`h-8 w-8 ${
                        selectedAction === action.value ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <span className="font-medium text-sm">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Identifier Input */}
          <Card>
            <CardHeader>
              <CardTitle>Record Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="manual">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manual">
                    <List className="h-4 w-4 mr-2" />
                    Manual Entry
                  </TabsTrigger>
                  <TabsTrigger value="file">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="manual" className="space-y-2">
                  <Label>Enter Record IDs (one per line)</Label>
                  <Textarea
                    value={identifiers}
                    onChange={(e) => setIdentifiers(e.target.value)}
                    placeholder="12618072&#10;12345678&#10;98765432"
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    {identifiers.split('\n').filter(id => id.trim()).length} records
                  </p>
                </TabsContent>

                <TabsContent value="file" className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <input
                      type="file"
                      accept=".txt,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Button variant="outline" asChild>
                        <span>Choose File</span>
                      </Button>
                    </label>
                    <p className="text-sm text-gray-500 mt-2">
                      Upload a TXT or CSV file with record IDs
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Edit Configuration */}
          {selectedAction === 'update' && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Field to Update</Label>
                  <Select value={selectedField} onValueChange={setSelectedField}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a field..." />
                    </SelectTrigger>
                    <SelectContent>
                      {EDITABLE_FIELDS.map((field) => (
                        <SelectItem key={field.value} value={field.value}>
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>New Value</Label>
                  <Input
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="Enter new value..."
                  />
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2">
                    Preview
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {selectedField && newValue
                      ? `${EDITABLE_FIELDS.find(f => f.value === selectedField)?.label} will be set to "${newValue}" for all selected records`
                      : 'Select a field and enter a value to see preview'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Process Button */}
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={handleProcess}
                disabled={isProcessing || !identifiers.trim() || (selectedAction === 'update' && (!selectedField || !newValue))}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <AlertCircle className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Process {identifiers.split('\n').filter(id => id.trim()).length} Records
                  </>
                )}
              </Button>

              {isProcessing && (
                <div className="mt-4 space-y-2">
                  <Progress value={progress} />
                  <p className="text-sm text-center text-gray-600">
                    {Math.round(progress)}% complete
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-auto">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border dark:border-gray-700 rounded"
                    >
                      <div className="flex items-center gap-3">
                        {result.status === 'success' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <p className="font-mono text-sm">{result.id}</p>
                          <p className="text-xs text-gray-500">{result.message}</p>
                        </div>
                      </div>
                      <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                        {result.status}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Export Results
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    View Error Log
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
