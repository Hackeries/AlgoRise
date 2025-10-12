'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, AlertCircle, Search, Plus } from 'lucide-react';
import { CFVerificationCompilation } from '@/components/auth/cf-verification-compilation';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type ProfileStatus = 'student' | 'working' | null;

interface College {
  id: string;
  name: string;
  country: string;
}

interface Company {
  id: string;
  name: string;
}

// Degree types with their typical duration
const DEGREE_TYPES = [
  { value: 'btech', label: 'B.Tech / B.E.', years: 4 },
  { value: 'mtech', label: 'M.Tech / M.E.', years: 2 },
  { value: 'bsc', label: 'B.Sc.', years: 3 },
  { value: 'msc', label: 'M.Sc.', years: 2 },
  { value: 'bca', label: 'BCA', years: 3 },
  { value: 'mca', label: 'MCA', years: 2 },
  { value: 'mba', label: 'MBA', years: 2 },
  { value: 'phd', label: 'Ph.D.', years: 5 },
  { value: 'other', label: 'Other', years: 4 },
];

export default function ProfilePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cfVerified, setCfVerified] = useState(false);
  const [cfHandle, setCfHandle] = useState('');
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);

  // Profile fields
  const [status, setStatus] = useState<ProfileStatus>(null);
  const [degreeType, setDegreeType] = useState<string>('');
  const [selectedCollege, setSelectedCollege] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [customCompany, setCustomCompany] = useState<string>('');

  // College/Company search
  const [colleges, setColleges] = useState<College[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingColleges, setLoadingColleges] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [collegeSearch, setCollegeSearch] = useState('');
  const [companySearch, setCompanySearch] = useState('');
  const [collegeOpen, setCollegeOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);

  // Custom entry dialogs
  const [showAddCollege, setShowAddCollege] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [newCollegeName, setNewCollegeName] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [addingCollege, setAddingCollege] = useState(false);
  const [addingCompany, setAddingCompany] = useState(false);

  // Load profile data on mount
  useEffect(() => {
    loadProfile();
  }, []);

  // Load colleges when status is student
  useEffect(() => {
    if (status === 'student') {
      loadColleges();
    }
  }, [status]);

  // Load companies when status is working
  useEffect(() => {
    if (status === 'working') {
      loadCompanies();
    }
  }, [status]);

  useEffect(() => {
    if (degreeType && status === 'student') {
      // Reset year when degree type changes
      setYear('');
    }
  }, [degreeType]);

  async function loadProfile() {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setCfVerified(data.cf_verified || false);
        setCfHandle(data.cf_handle || '');
        setStatus(data.status || null);
        setDegreeType(data.degree_type || '');
        setSelectedCollege(data.college_id || '');
        setYear(data.year || '');
        setSelectedCompany(data.company_id || '');
        setCustomCompany(data.custom_company || '');
      }
    } catch (error) {
      console.error('Failed to load profile data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadColleges(search?: string) {
    setLoadingColleges(true);
    try {
      const url = search
        ? `/api/colleges?q=${encodeURIComponent(search)}`
        : '/api/colleges';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setColleges(data.colleges || []);
      }
    } catch (error) {
      console.error('Failed to load colleges:', error);
    } finally {
      setLoadingColleges(false);
    }
  }

  async function loadCompanies(search?: string) {
    setLoadingCompanies(true);
    try {
      const url = search
        ? `/api/companies?q=${encodeURIComponent(search)}`
        : '/api/companies';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCompanies(data.companies || []);
      }
    } catch (error) {
      console.error('Failed to load companies:', error);
    } finally {
      setLoadingCompanies(false);
    }
  }

  async function addNewCollege() {
    if (!newCollegeName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a college name',
        variant: 'destructive',
      });
      return;
    }

    setAddingCollege(true);
    try {
      const res = await fetch('/api/colleges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCollegeName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add college');
      }

      toast({
        title: 'Success',
        description: data.message || 'College added successfully',
      });

      // Select the newly added college
      setSelectedCollege(data.college.id);
      setShowAddCollege(false);
      setNewCollegeName('');

      // Reload colleges list
      await loadColleges();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setAddingCollege(false);
    }
  }

  async function addNewCompany() {
    if (!newCompanyName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a company name',
        variant: 'destructive',
      });
      return;
    }

    setAddingCompany(true);
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCompanyName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add company');
      }

      toast({
        title: 'Success',
        description: data.message || 'Company added successfully',
      });

      // Select the newly added company
      setSelectedCompany(data.company.id);
      setShowAddCompany(false);
      setNewCompanyName('');

      // Reload companies list
      await loadCompanies();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setAddingCompany(false);
    }
  }

  async function saveProfile() {
    // Validate required fields
    if (!status) {
      toast({
        title: 'Missing information',
        description:
          'Please select whether you are a student or working professional.',
        variant: 'destructive',
      });
      return;
    }

    if (status === 'student') {
      if (!degreeType) {
        toast({
          title: 'Missing information',
          description: 'Please select your degree type.',
          variant: 'destructive',
        });
        return;
      }
      if (!selectedCollege) {
        toast({
          title: 'Missing information',
          description: 'Please select your college.',
          variant: 'destructive',
        });
        return;
      }
      if (!year) {
        toast({
          title: 'Missing information',
          description: 'Please select your year of study.',
          variant: 'destructive',
        });
        return;
      }
    }

    if (status === 'working') {
      const isOtherCompany =
        companies.find(c => c.id === selectedCompany)?.name ===
        'Other (Please specify)';
      if (!selectedCompany || (isOtherCompany && !customCompany.trim())) {
        toast({
          title: 'Missing information',
          description: 'Please select or enter your company name.',
          variant: 'destructive',
        });
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          degree_type: status === 'student' ? degreeType : null,
          college_id: status === 'student' ? selectedCollege : null,
          year: status === 'student' ? year : null,
          company_id: status === 'working' ? selectedCompany : null,
          custom_company: status === 'working' ? customCompany : null,
        }),
      });

      if (!res.ok) {
        let errorMsg = 'Failed to save profile';
        try {
          const data = await res.json();
          if (data?.error) errorMsg = data.error;
        } catch {}
        throw new Error(errorMsg);
      }

      toast({
        title: 'Profile saved',
        description: 'Your profile has been updated successfully.',
      });

      sessionStorage.setItem('profileCompleted', 'true');
      sessionStorage.setItem('profile_just_completed', 'true');
      window.location.href = '/train';
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }

  function handleVerificationComplete(data: { handle?: string }) {
    setCfVerified(true);
    setCfHandle(data?.handle || '');
    setShowVerificationDialog(false);
    toast({
      title: 'Verification complete!',
      description: 'Your Codeforces handle has been verified.',
    });
  }

  function handleChangeCFHandle() {
    setCfVerified(false);
    setCfHandle('');
    setShowVerificationDialog(true);
  }

  function getAvailableYears() {
    if (!degreeType) return [];
    const degree = DEGREE_TYPES.find(d => d.value === degreeType);
    if (!degree) return [];

    return Array.from({ length: degree.years }, (_, i) => ({
      value: String(i + 1),
      label: `${i + 1}${
        i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'
      } Year`,
    }));
  }

  if (loading) {
    return (
      <main className='min-h-screen w-full flex items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </main>
    );
  }

  const selectedCollegeName =
    colleges.find(c => c.id === selectedCollege)?.name || 'Select college...';
  const selectedCompanyName =
    companies.find(c => c.id === selectedCompany)?.name || 'Select company...';
  const isOtherCompany =
    companies.find(c => c.id === selectedCompany)?.name ===
    'Other (Please specify)';

  return (
    <main className='min-h-screen w-full bg-gradient-to-b from-background to-muted/20'>
      <div className='mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8'>
        {/* Header Section */}
        <header className='mb-8 animate-in fade-in slide-in-from-top-4 duration-500'>
          <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>
            Complete Your Profile
          </h1>
          <p className='mt-3 text-base text-muted-foreground max-w-2xl'>
            {!cfVerified
              ? 'Verify your Codeforces handle to unlock all features and complete your profile setup.'
              : 'Complete your profile information to get personalized recommendations.'}
          </p>
        </header>

        <div className='grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100'>
          {/* CF Verification Card */}
          {!cfVerified ? (
            <Card className='border-2 border-primary/20 transition-all hover:shadow-lg'>
              <CardHeader className='space-y-1'>
                <CardTitle className='text-2xl flex items-center gap-2'>
                  <AlertCircle className='h-6 w-6 text-primary' />
                  Codeforces Verification Required
                </CardTitle>
                <CardDescription className='text-base'>
                  Verify your Codeforces handle to access all features of
                  AlgoRise.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CFVerificationCompilation
                  onVerificationComplete={handleVerificationComplete}
                />
              </CardContent>
            </Card>
          ) : (
            <Card className='border-2 border-green-500/20 bg-green-500/5 transition-all'>
              <CardHeader className='space-y-1'>
                <CardTitle className='text-2xl flex items-center gap-2'>
                  <CheckCircle2 className='h-6 w-6 text-green-600' />
                  Codeforces Verified
                </CardTitle>
                <CardDescription className='text-base'>
                  Your handle{' '}
                  <span className='font-semibold text-foreground'>
                    {cfHandle}
                  </span>{' '}
                  is verified.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant='outline'
                  onClick={handleChangeCFHandle}
                  className='w-full sm:w-auto bg-transparent'
                >
                  Change Codeforces Handle
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Profile Information Card - Only show if CF verified */}
          {cfVerified && (
            <Card className='border-2 transition-all hover:shadow-lg'>
              <CardHeader className='space-y-1'>
                <CardTitle className='text-2xl'>Profile Information</CardTitle>
                <CardDescription className='text-base'>
                  Tell us about yourself to get personalized recommendations.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Status Selection */}
                <div className='space-y-3'>
                  <Label htmlFor='status' className='text-base font-medium'>
                    I am a <span className='text-red-500'>*</span>
                  </Label>
                  <Select
                    value={status || ''}
                    onValueChange={val => setStatus(val as ProfileStatus)}
                  >
                    <SelectTrigger id='status' className='h-11'>
                      <SelectValue placeholder='Select your status' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='student'>Student</SelectItem>
                      <SelectItem value='working'>
                        Working Professional
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Student Fields */}
                {status === 'student' && (
                  <>
                    {/* Degree Type */}
                    <div className='space-y-3'>
                      <Label htmlFor='degree' className='text-base font-medium'>
                        Degree Type <span className='text-red-500'>*</span>
                      </Label>
                      <Select value={degreeType} onValueChange={setDegreeType}>
                        <SelectTrigger id='degree' className='h-11'>
                          <SelectValue placeholder='Select your degree' />
                        </SelectTrigger>
                        <SelectContent>
                          {DEGREE_TYPES.map(degree => (
                            <SelectItem key={degree.value} value={degree.value}>
                              {degree.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* College Selection with Search */}
                    <div className='space-y-3'>
                      <Label
                        htmlFor='college'
                        className='text-base font-medium'
                      >
                        College/University{' '}
                        <span className='text-red-500'>*</span>
                      </Label>
                      <Popover open={collegeOpen} onOpenChange={setCollegeOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant='outline'
                            role='combobox'
                            aria-expanded={collegeOpen}
                            className='w-full h-11 justify-between font-normal bg-transparent'
                          >
                            <span className='truncate'>
                              {selectedCollegeName}
                            </span>
                            <Search className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className='w-[var(--radix-popover-trigger-width)] p-0'
                          align='start'
                        >
                          <Command>
                            <CommandInput
                              placeholder='Search colleges...'
                              value={collegeSearch}
                              onValueChange={val => {
                                setCollegeSearch(val);
                                loadColleges(val);
                              }}
                            />
                            <CommandList>
                              <CommandEmpty>
                                <div className='p-4 text-center space-y-3'>
                                  <p className='text-sm text-muted-foreground'>
                                    No college found
                                  </p>
                                  <Button
                                    size='sm'
                                    onClick={() => {
                                      setShowAddCollege(true);
                                      setCollegeOpen(false);
                                    }}
                                    className='w-full'
                                  >
                                    <Plus className='mr-2 h-4 w-4' />
                                    Add New College
                                  </Button>
                                </div>
                              </CommandEmpty>
                              <CommandGroup>
                                {colleges.map(college => (
                                  <CommandItem
                                    key={college.id}
                                    value={college.name}
                                    onSelect={() => {
                                      setSelectedCollege(college.id);
                                      setCollegeOpen(false);
                                    }}
                                  >
                                    {college.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <div className='flex items-center justify-between'>
                        <p className='text-sm text-muted-foreground'>
                          Can't find your college?
                        </p>
                        <Button
                          variant='link'
                          size='sm'
                          onClick={() => setShowAddCollege(true)}
                          className='h-auto p-0 text-sm'
                        >
                          <Plus className='mr-1 h-3 w-3' />
                          Add it here
                        </Button>
                      </div>
                    </div>

                    {/* Year Selection - Smart based on degree */}
                    <div className='space-y-3'>
                      <Label htmlFor='year' className='text-base font-medium'>
                        Year of Study <span className='text-red-500'>*</span>
                      </Label>
                      <Select
                        value={year}
                        onValueChange={setYear}
                        disabled={!degreeType}
                      >
                        <SelectTrigger id='year' className='h-11'>
                          <SelectValue
                            placeholder={
                              degreeType
                                ? 'Select your year'
                                : 'Select degree first'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableYears().map(yearOption => (
                            <SelectItem
                              key={yearOption.value}
                              value={yearOption.value}
                            >
                              {yearOption.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {degreeType && (
                        <p className='text-sm text-muted-foreground'>
                          {
                            DEGREE_TYPES.find(d => d.value === degreeType)
                              ?.label
                          }{' '}
                          typically has{' '}
                          {
                            DEGREE_TYPES.find(d => d.value === degreeType)
                              ?.years
                          }{' '}
                          years
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Working Professional Fields */}
                {status === 'working' && (
                  <>
                    <div className='space-y-3'>
                      <Label
                        htmlFor='company'
                        className='text-base font-medium'
                      >
                        Company <span className='text-red-500'>*</span>
                      </Label>
                      <Popover open={companyOpen} onOpenChange={setCompanyOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant='outline'
                            role='combobox'
                            aria-expanded={companyOpen}
                            className='w-full h-11 justify-between font-normal bg-transparent'
                          >
                            <span className='truncate'>
                              {selectedCompanyName}
                            </span>
                            <Search className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className='w-(--radix-popover-trigger-width) p-0'
                          align='start'
                        >
                          <Command>
                            <CommandInput
                              placeholder='Search companies...'
                              value={companySearch}
                              onValueChange={val => {
                                setCompanySearch(val);
                                loadCompanies(val);
                              }}
                            />
                            <CommandList>
                              <CommandEmpty>
                                <div className='p-4 text-center space-y-3'>
                                  <p className='text-sm text-muted-foreground'>
                                    No company found
                                  </p>
                                  <Button
                                    size='sm'
                                    onClick={() => {
                                      setShowAddCompany(true);
                                      setCompanyOpen(false);
                                    }}
                                    className='w-full'
                                  >
                                    <Plus className='mr-2 h-4 w-4' />
                                    Add New Company
                                  </Button>
                                </div>
                              </CommandEmpty>
                              <CommandGroup>
                                {companies.map(company => (
                                  <CommandItem
                                    key={company.id}
                                    value={company.name}
                                    onSelect={() => {
                                      setSelectedCompany(company.id);
                                      setCompanyOpen(false);
                                    }}
                                  >
                                    {company.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <div className='flex items-center justify-between'>
                        <p className='text-sm text-muted-foreground'>
                          Can't find your company?
                        </p>
                        <Button
                          variant='link'
                          size='sm'
                          onClick={() => setShowAddCompany(true)}
                          className='h-auto p-0 text-sm'
                        >
                          <Plus className='mr-1 h-3 w-3' />
                          Add it here
                        </Button>
                      </div>
                    </div>

                    {/* Custom Company Input - Show if "Other" is selected */}
                    {isOtherCompany && (
                      <div className='space-y-3'>
                        <Label
                          htmlFor='custom-company'
                          className='text-base font-medium'
                        >
                          Company Name <span className='text-red-500'>*</span>
                        </Label>
                        <Input
                          id='custom-company'
                          placeholder='Enter your company name'
                          value={customCompany}
                          onChange={e => setCustomCompany(e.target.value)}
                          className='h-11 text-base'
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Save Button */}
                <Button
                  onClick={saveProfile}
                  disabled={saving}
                  className='w-full h-11 text-base'
                  size='lg'
                >
                  {saving ? (
                    <>
                      <Loader2
                        className='mr-2 h-4 w-4 animate-spin'
                        aria-label='Loading'
                      />
                      Saving...
                    </>
                  ) : (
                    'Save Profile & Continue'
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add College Dialog */}
      <Dialog open={showAddCollege} onOpenChange={setShowAddCollege}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New College</DialogTitle>
            <DialogDescription>
              Enter the name of your college. It will be added to our database
              for future users.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='new-college'>College Name</Label>
              <Input
                id='new-college'
                placeholder='e.g. ABC Institute of Technology'
                value={newCollegeName}
                onChange={e => setNewCollegeName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addNewCollege();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setShowAddCollege(false)}>
              Cancel
            </Button>
            <Button onClick={addNewCollege} disabled={addingCollege}>
              {addingCollege ? (
                <>
                  <Loader2
                    className='mr-2 h-4 w-4 animate-spin'
                    aria-label='Loading'
                  />
                  Adding...
                </>
              ) : (
                'Add College'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Company Dialog */}
      <Dialog open={showAddCompany} onOpenChange={setShowAddCompany}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Company</DialogTitle>
            <DialogDescription>
              Enter the name of your company. It will be added to our database
              for future users.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='new-company'>Company Name</Label>
              <Input
                id='new-company'
                placeholder='e.g. Tech Startup Inc.'
                value={newCompanyName}
                onChange={e => setNewCompanyName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    addNewCompany();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setShowAddCompany(false)}>
              Cancel
            </Button>
            <Button onClick={addNewCompany} disabled={addingCompany}>
              {addingCompany ? (
                <>
                  <Loader2
                    className='mr-2 h-4 w-4 animate-spin'
                    aria-label='Loading'
                  />
                  Adding...
                </>
              ) : (
                'Add Company'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}