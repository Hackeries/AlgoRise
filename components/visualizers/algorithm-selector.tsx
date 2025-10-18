'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AlgorithmSelectorProps {
  categories: Record<string, { name: string; algorithms: string[] }>;
  selectedCategory: string;
  selectedAlgorithm: string;
  onCategoryChange: (category: string) => void;
  onAlgorithmChange: (algorithm: string) => void;
  disabled?: boolean;
}

export function AlgorithmSelector({
  categories,
  selectedCategory,
  selectedAlgorithm,
  onCategoryChange,
  onAlgorithmChange,
  disabled = false,
}: AlgorithmSelectorProps) {
  const currentCategory = categories[selectedCategory];

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>Select Algorithm</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <label className='text-sm font-medium'>Category</label>
          <Select
            value={selectedCategory}
            onValueChange={onCategoryChange}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categories).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className='text-sm font-medium'>Algorithm</label>
          <Select
            value={selectedAlgorithm}
            onValueChange={onAlgorithmChange}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currentCategory?.algorithms.map(algo => (
                <SelectItem key={algo} value={algo}>
                  {algo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
