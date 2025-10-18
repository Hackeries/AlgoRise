import { Card, CardContent } from '@/components/ui/card';

export function VisualizationLegend() {
  const items = [
    { color: 'bg-blue-500', label: 'Unsorted/Unvisited' },
    { color: 'bg-yellow-500', label: 'Comparing/Active' },
    { color: 'bg-red-500', label: 'Swapping' },
    { color: 'bg-purple-500', label: 'Current/Pivot' },
    { color: 'bg-green-500', label: 'Sorted/Visited' },
  ];

  return (
    <Card>
      <CardContent className='p-4'>
        <p className='text-sm font-semibold mb-3'>Color Legend</p>
        <div className='grid grid-cols-2 md:grid-cols-5 gap-3'>
          {items.map(item => (
            <div key={item.label} className='flex items-center gap-2'>
              <div className={`w-4 h-4 rounded ${item.color}`}></div>
              <span className='text-xs'>{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
