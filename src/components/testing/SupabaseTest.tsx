import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAppContext } from '@/context/AppContext';

export function SupabaseTest() {
  const { jobs, staff, machines, schedule } = useAppContext();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Testing Supabase connection...');

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test if we can read from Supabase
        const { data, error } = await supabase.from('app_data').select('*');
        
        if (error) {
          throw new Error(`Supabase connection error: ${error.message}`);
        }
        
        // Check if data loaded successfully
        if (jobs.length > 0) {
          setMessage(`Success! Connected to Supabase. Found ${jobs.length} jobs, ${staff.length} staff members, ${machines.length} machines, and ${schedule.length} scheduled events.`);
          setStatus('success');
        } else {
          setMessage('Connected to Supabase but no data was loaded. This might be expected for a fresh installation.');
          setStatus('success');
        }
      } catch (error) {
        console.error('Supabase test error:', error);
        setMessage(`Error connecting to Supabase: ${error instanceof Error ? error.message : String(error)}`);
        setStatus('error');
      }
    };
    
    testConnection();
  }, [jobs, staff, machines, schedule]);

  return (
    <div className="p-4 rounded-lg border">
      <h2 className="text-xl font-bold mb-4">Supabase Integration Test</h2>
      <div 
        className={`p-3 rounded ${
          status === 'loading' ? 'bg-yellow-100 border-yellow-300' : 
          status === 'success' ? 'bg-green-100 border-green-300' : 
          'bg-red-100 border-red-300'
        }`}
      >
        <p>{message}</p>
      </div>
      <div className="mt-4">
        <h3 className="font-medium mb-2">Data Summary:</h3>
        <ul className="list-disc pl-5">
          <li>Jobs: {jobs.length}</li>
          <li>Staff: {staff.length}</li>
          <li>Machines: {machines.length}</li>
          <li>Schedule Events: {schedule.length}</li>
        </ul>
      </div>
    </div>
  );
} 