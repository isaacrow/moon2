import React, { useState, useEffect } from 'react';
import { useJCricket } from '../contexts/JCricketContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import { Languages, CheckCircle2, Globe } from 'lucide-react';

interface LanguagePreferencesProps {
  onClose: () => void;
}

const availableLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
];

export function LanguagePreferences({ onClose }: LanguagePreferencesProps) {
  const { userProfile, updateLanguagePreferences } = useJCricket();
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [showAllLanguages, setShowAllLanguages] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setSelectedLanguages(userProfile.proficientLanguages || ['en']);
      setShowAllLanguages(userProfile.preferences.showAllLanguages);
    }
  }, [userProfile]);

  const toggleLanguage = (code: string) => {
    setSelectedLanguages(prev => {
      if (prev.includes(code)) {
        // Don't allow deselecting all languages
        if (prev.length === 1) {
          toast.error('At least one language must be selected');
          return prev;
        }
        return prev.filter(l => l !== code);
      } else {
        return [...prev, code];
      }
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateLanguagePreferences(selectedLanguages);
      toast.success('Language preferences updated successfully');
      onClose();
    } catch (error) {
      console.error('Failed to update language preferences:', error);
      toast.error('Failed to update language preferences');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Languages className="h-8 w-8 text-blue-600" />
              Language Preferences
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Set your proficient cataloging languages
            </p>
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>How Language Preferences Work</CardTitle>
            <CardDescription>
              JCricket uses your language preferences to optimize your cataloging workflow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">Automatic Field Display</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  When creating or editing entities, empty fields for your selected languages will be automatically displayed for data entry
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">Field-by-Field Entry</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You can choose to see entries only in your proficient languages or view all language entries
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Your Proficient Languages</CardTitle>
            <CardDescription>
              Choose the languages you are comfortable cataloging in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div>
                  <h4 className="font-medium">Currently Selected</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedLanguages.map(code => {
                      const lang = availableLanguages.find(l => l.code === code);
                      return lang ? (
                        <Badge key={code} variant="default">
                          {lang.nativeName} ({lang.name})
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableLanguages.map(language => (
                  <Card
                    key={language.code}
                    className={`cursor-pointer transition-all ${
                      selectedLanguages.includes(language.code)
                        ? 'ring-2 ring-blue-600 bg-blue-50 dark:bg-blue-950'
                        : 'hover:ring-1 hover:ring-gray-300'
                    }`}
                    onClick={() => toggleLanguage(language.code)}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <Checkbox
                        checked={selectedLanguages.includes(language.code)}
                        onCheckedChange={() => toggleLanguage(language.code)}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{language.nativeName}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {language.name}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Display Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Show All Languages</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Display entries in all languages, not just your proficient ones
                </p>
              </div>
              <Checkbox
                checked={showAllLanguages}
                onCheckedChange={(checked) => setShowAllLanguages(!!checked)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-end gap-4">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </div>
  );
}
