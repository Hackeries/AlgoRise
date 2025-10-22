// Test Suite Manager Component
'use client';

import { useState, useEffect } from 'react';
import { TestSuiteManager, TestSuite, TestSuiteCollection } from '@/lib/problem-generator/test-suite-manager';
import { TestCase } from '@/lib/problem-generator/problem-templates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { MoreHorizontal, Plus, Download, Upload, Edit, Trash } from 'lucide-react';

export function TestSuiteManagerComponent() {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [collections, setCollections] = useState<TestSuiteCollection[]>([]);
  const [selectedTestSuite, setSelectedTestSuite] = useState<TestSuite | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newTestSuite, setNewTestSuite] = useState({
    name: '',
    description: '',
    tags: [] as string[],
    isPublic: false
  });
  const [newTestCase, setNewTestCase] = useState({
    input: '',
    output: '',
    type: 'sample' as 'sample' | 'edge' | 'random' | 'stress'
  });
  const [tagInput, setTagInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const manager = TestSuiteManager;

  // Load test suites on component mount
  useEffect(() => {
    loadTestSuites();
    loadCollections();
  }, []);

  const loadTestSuites = () => {
    const suites = manager.listTestSuites();
    setTestSuites(suites);
  };

  const loadCollections = () => {
    // In a real implementation, we would load collections from the manager
    setCollections([]);
  };

  const handleCreateTestSuite = () => {
    if (!newTestSuite.name.trim()) return;
    
    const suite = manager.createTestSuite(
      newTestSuite.name,
      newTestSuite.description,
      [], // Empty test cases initially
      newTestSuite.tags,
      newTestSuite.isPublic
    );
    
    setTestSuites([...testSuites, suite]);
    setNewTestSuite({
      name: '',
      description: '',
      tags: [],
      isPublic: false
    });
    setIsCreateDialogOpen(false);
  };

  const handleDeleteTestSuite = (id: string) => {
    manager.deleteTestSuite(id);
    setTestSuites(testSuites.filter(suite => suite.id !== id));
    if (selectedTestSuite?.id === id) {
      setSelectedTestSuite(null);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !newTestSuite.tags.includes(tagInput.trim())) {
      setNewTestSuite({
        ...newTestSuite,
        tags: [...newTestSuite.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewTestSuite({
      ...newTestSuite,
      tags: newTestSuite.tags.filter(t => t !== tag)
    });
  };

  const handleAddTestCase = () => {
    if (!selectedTestSuite || !newTestCase.input.trim() || !newTestCase.output.trim()) return;
    
    const updatedTestCases = [...selectedTestSuite.testCases, {
      input: newTestCase.input,
      output: newTestCase.output,
      type: newTestCase.type
    }];
    
    const updated = manager.updateTestSuite(selectedTestSuite.id, {
      testCases: updatedTestCases
    });
    
    if (updated) {
      setSelectedTestSuite(updated);
      setTestSuites(testSuites.map(suite => 
        suite.id === selectedTestSuite.id ? updated : suite
      ));
      setNewTestCase({
        input: '',
        output: '',
        type: 'sample'
      });
    }
  };

  const handleDeleteTestCase = (index: number) => {
    if (!selectedTestSuite) return;
    
    const updatedTestCases = [...selectedTestSuite.testCases];
    updatedTestCases.splice(index, 1);
    
    const updated = manager.updateTestSuite(selectedTestSuite.id, {
      testCases: updatedTestCases
    });
    
    if (updated) {
      setSelectedTestSuite(updated);
      setTestSuites(testSuites.map(suite => 
        suite.id === selectedTestSuite.id ? updated : suite
      ));
    }
  };

  const handleExportTestSuite = (suite: TestSuite) => {
    const json = manager.exportTestSuite(suite);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${suite.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredTestSuites = testSuites.filter(suite => 
    suite.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    suite.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    suite.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Test Suite Manager</h1>
          <p className="text-muted-foreground">
            Create, manage, and organize test suites for algorithmic problems
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Test Suite
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Test Suite</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newTestSuite.name}
                  onChange={(e) => setNewTestSuite({...newTestSuite, name: e.target.value})}
                  placeholder="Enter test suite name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTestSuite.description}
                  onChange={(e) => setNewTestSuite({...newTestSuite, description: e.target.value})}
                  placeholder="Enter test suite description"
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <Button onClick={handleAddTag}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {newTestSuite.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button 
                        onClick={() => handleRemoveTag(tag)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={newTestSuite.isPublic}
                  onChange={(e) => setNewTestSuite({...newTestSuite, isPublic: e.target.checked})}
                />
                <Label htmlFor="isPublic">Make public</Label>
              </div>
              <Button onClick={handleCreateTestSuite} className="w-full">
                Create Test Suite
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search test suites..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Tabs defaultValue="suites">
        <TabsList>
          <TabsTrigger value="suites">Test Suites</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
        </TabsList>
        
        <TabsContent value="suites">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTestSuites.map(suite => (
              <Card key={suite.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{suite.name}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => {
                          setSelectedTestSuite(suite);
                          setIsEditDialogOpen(true);
                        }}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportTestSuite(suite)}>
                          <Download className="mr-2 h-4 w-4" />
                          Export
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteTestSuite(suite.id)}
                          className="text-destructive"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-3">
                    {suite.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {suite.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{suite.testCases.length} test cases</span>
                    <span>{suite.isPublic ? 'Public' : 'Private'}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-3"
                    onClick={() => setSelectedTestSuite(suite)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="collections">
          <div className="text-center py-10 text-muted-foreground">
            <p>Collections feature coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>

      {selectedTestSuite && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{selectedTestSuite.name}</CardTitle>
              <Button variant="outline" onClick={() => setSelectedTestSuite(null)}>
                Close
              </Button>
            </div>
            <p className="text-muted-foreground">{selectedTestSuite.description}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Add Test Case</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="testCaseInput">Input</Label>
                    <Textarea
                      id="testCaseInput"
                      value={newTestCase.input}
                      onChange={(e) => setNewTestCase({...newTestCase, input: e.target.value})}
                      placeholder="Test case input"
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <Label htmlFor="testCaseOutput">Expected Output</Label>
                    <Textarea
                      id="testCaseOutput"
                      value={newTestCase.output}
                      onChange={(e) => setNewTestCase({...newTestCase, output: e.target.value})}
                      placeholder="Expected output"
                      className="font-mono"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Select 
                    value={newTestCase.type} 
                    onValueChange={(value) => setNewTestCase({...newTestCase, type: value as any})}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Test case type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sample">Sample</SelectItem>
                      <SelectItem value="edge">Edge Case</SelectItem>
                      <SelectItem value="random">Random</SelectItem>
                      <SelectItem value="stress">Stress Test</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddTestCase}>
                    Add Test Case
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Test Cases ({selectedTestSuite.testCases.length})
                </h3>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Input</TableHead>
                        <TableHead>Output</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedTestSuite.testCases.map((testCase, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Badge variant="secondary">{testCase.type}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm max-w-xs truncate">
                            {testCase.input}
                          </TableCell>
                          <TableCell className="font-mono text-sm max-w-xs truncate">
                            {testCase.output}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteTestCase(index)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}