import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowLeft, Save, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface IntibakGenerationProps {
  onBack: () => void;
}

const PREVIOUS_COURSES = [
  { code: 'CS101', name: 'Introduction to Programming', credits: 4, grade: 'A', suggestedMatch: 'COMP 101' },
  { code: 'CS201', name: 'Data Structures', credits: 4, grade: 'B+', suggestedMatch: 'COMP 201' },
  { code: 'MATH101', name: 'Calculus I', credits: 4, grade: 'A-', suggestedMatch: 'MATH 101' },
  { code: 'PHYS101', name: 'Physics I', credits: 3, grade: 'B', suggestedMatch: 'PHYS 101' },
];

const TARGET_COURSES = [
  { code: 'COMP 101', name: 'Programming Fundamentals', credits: 4 },
  { code: 'COMP 201', name: 'Data Structures & Algorithms', credits: 4 },
  { code: 'MATH 101', name: 'Calculus I', credits: 4 },
  { code: 'COMP 150', name: 'Digital Systems', credits: 4 },
  { code: 'PHYS 101', name: 'Physics I', credits: 3 },
];

export function IntibakGeneration({ onBack }: IntibakGenerationProps) {
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [isManual, setIsManual] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Initial suggested matches
    const initialMappings: Record<string, string> = {};
    PREVIOUS_COURSES.forEach(c => {
      if (c.suggestedMatch) initialMappings[c.code] = c.suggestedMatch;
    });
    setMappings(initialMappings);
  }, []);

  const handleMappingChange = (prevCode: string, targetCode: string) => {
    setMappings(prev => ({ ...prev, [prevCode]: targetCode }));
    const originalSuggested = PREVIOUS_COURSES.find(c => c.code === prevCode)?.suggestedMatch;
    if (targetCode !== originalSuggested) {
      setIsManual(prev => ({ ...prev, [prevCode]: true }));
      toast.info(`Manual override applied for ${prevCode}`);
    } else {
      setIsManual(prev => ({ ...prev, [prevCode]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2 font-bold">Course Equivalence (İntibak) Generation</h1>
          <p className="text-gray-600">APP-2025-001234 - Ahmet Yılmaz • 5th Semester Entry</p>
        </div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-xs text-blue-800">
            <strong>Smart Matcher Active:</strong> System has automatically suggested equivalents based on course codes and descriptions. Review carefully before saving.
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-lg flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="text-xs text-yellow-800">
            <strong>Credit Mismatch Alert:</strong> Ensure transferred credits are at least equal to target course credits.
          </div>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="grid grid-cols-2 bg-gray-100 border-b text-xs font-bold uppercase tracking-wider">
          <div className="p-3 border-r">Previous Institution (Old Courses)</div>
          <div className="p-3">Target Curriculum (New Equivalents)</div>
        </div>

        <div className="divide-y">
          {PREVIOUS_COURSES.map((prev, index) => (
            <div key={index} className="grid grid-cols-2 group">
              {/* Left Column: Old Course */}
              <div className="p-4 border-r bg-white group-hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-bold text-gray-900">{prev.code}</div>
                    <div className="text-xs text-gray-600 mb-2">{prev.name}</div>
                    <div className="flex space-x-2">
                       <Badge variant="outline" className="text-[10px] h-4">Cr: {prev.credits}</Badge>
                       <Badge variant="outline" className="text-[10px] h-4">Grade: {prev.grade}</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Target Mapping */}
              <div className="p-4 bg-white group-hover:bg-gray-50 transition-colors">
                <div className="space-y-3">
                  <Select value={mappings[prev.code]} onValueChange={(val) => handleMappingChange(prev.code, val)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select equivalent course..." />
                    </SelectTrigger>
                    <SelectContent>
                      {TARGET_COURSES.map((target) => (
                        <SelectItem key={target.code} value={target.code} className="text-xs">
                          {target.code} - {target.name} ({target.credits} cr)
                        </SelectItem>
                      ))}
                      <SelectItem value="no-equivalent" className="text-xs">No Equivalent</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center justify-between">
                    {mappings[prev.code] && mappings[prev.code] !== 'no-equivalent' ? (
                      <div className="flex items-center space-x-2">
                        {isManual[prev.code] ? (
                          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200 text-[10px] h-5">
                            Manual Override
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 text-[10px] h-5">
                            Suggested Match
                          </Badge>
                        )}
                        <span className="text-[10px] text-gray-400 italic">Verified for 2024-25 Curriculum</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-red-500 font-medium">Equivalence required for transfer</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-gray-50 border-t flex items-center justify-between">
          <div className="space-y-1">
             <div className="text-sm font-bold text-gray-900">Summary</div>
             <div className="text-xs text-gray-600">
               Transferred: <span className="font-bold text-green-600">15.00000 ECTS</span> | Remaining: <span className="font-bold text-[#C00000]">125.00000 ECTS</span>
             </div>
          </div>
          <div className="flex space-x-3">
             <Button variant="outline">Preview Report</Button>
             <Button style={{ backgroundColor: '#C00000' }} className="shadow-lg shadow-red-200">
               <Save className="w-4 h-4 mr-2" />
               Finalize İntibak Table
             </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
