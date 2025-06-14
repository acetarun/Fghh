// CTC Tea Manufacturing Record Web App - Clean Rebuild

// File: lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


// File: components/ui/Button.js
export function Button({ children, ...props }) {
  return (
    <button className="px-4 py-2 bg-blue-600 text-white rounded" {...props}>
      {children}
    </button>
  );
}


// File: components/ui/Input.js
export function Input({ ...props }) {
  return (
    <input
      className="p-2 border rounded w-full"
      {...props}
    />
  );
}


// File: components/ui/Card.js
export function Card({ children }) {
  return (
    <div className="bg-white rounded shadow p-4 mb-4">
      {children}
    </div>
  );
}

export function CardContent({ children }) {
  return <div>{children}</div>;
}


// File: components/ui/Table.js
export function Table({ children }) {
  return (
    <table className="min-w-full table-auto border-collapse">
      {children}
    </table>
  );
}

export function TableHeader({ children }) {
  return (
    <thead className="bg-gray-100">
      {children}
    </thead>
  );
}

export function TableBody({ children }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children }) {
  return <tr className="border-b last:border-0">{children}</tr>;
}

export function TableCell({ children }) {
  return <td className="p-2 text-center border">{children}</td>;
}


// File: pages/index.js
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../components/ui/Table';
import { supabase } from '../lib/supabaseClient';
import { format, isThisWeek, isThisMonth } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSession, Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

export default function TeaManufacturingApp() {
  const session = useSession();
  const user = session?.user;

  const [formData, setFormData] = useState({
    date: '',
    inputKg: '',
    teaMadeGL: '',
    teaMadeORS: '',
    ctcHours: '',
    dryerHours: '',
    heaterHours: '',
    coalKg: '',
    electricityUnits: '',
    mandays: '',
  });

  const [records, setRecords] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user) fetchRecords();
  }, [user]);

  const fetchRecords = async () => {
    const { data, error } = await supabase.from('tea_records').select('*').eq('user_id', user.id);
    if (data) setRecords(data);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const newRecord = { ...formData, user_id: user.id };
    const { data, error } = await supabase.from('tea_records').insert([newRecord]);
    if (!error) {
      setRecords([...records, newRecord]);
      setFormData({
        date: '', inputKg: '', teaMadeGL: '', teaMadeORS: '',
        ctcHours: '', dryerHours: '', heaterHours: '', coalKg: '', electricityUnits: '', mandays: ''
      });
    }
  };

  const filteredRecords = records.filter((record) => {
    if (filter === 'all') return true;
    const recordDate = new Date(record.date);
    if (filter === 'today') return format(recordDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    if (filter === 'week') return isThisWeek(recordDate);
    if (filter === 'month') return isThisMonth(recordDate);
    return true;
  });

  const calculateRecoveryGL = (record) => ((record.teaMadeGL / record.inputKg) * 100).toFixed(2);
  const calculateRecoveryORS = (record) => ((record.teaMadeORS / record.inputKg) * 100).toFixed(2);
  const calculateCoalRatio = (record) => (record.coalKg / record.teaMadeGL).toFixed(2);
  const calculateElectricRatio = (record) => (record.electricityUnits / record.teaMadeGL).toFixed(2);
  const calculateTotalHours = (record) => (
    parseFloat(record.ctcHours) + parseFloat(record.dryerHours) + parseFloat(record.heaterHours)
  ).toFixed(2);

  const chartData = filteredRecords.map((record) => ({
    date: record.date,
    RecoveryGL: parseFloat(calculateRecoveryGL(record)),
    RecoveryORS: parseFloat(calculateRecoveryORS(record)),
    CoalRatio: parseFloat(calculateCoalRatio(record)),
    ElectricRatio: parseFloat(calculateElectricRatio(record)),
  }));

  if (!user) {
    return (
      <div className="p-6 grid gap-6">
        <h1 className="text-2xl font-bold">CTC Tea Manufacturing Record</h1>
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
      </div>
    );
  }

  return (
    <div className="p-6 grid gap-6">
      <h1 className="text-2xl font-bold">CTC Tea Manufacturing Record</h1>
      <Button onClick={() => supabase.auth.signOut()}>Sign Out</Button>

      <Card>
        <CardContent className="grid grid-cols-2 gap-4 p-4">
          {['date', 'inputKg', 'teaMadeGL', 'teaMadeORS', 'ctcHours', 'dryerHours', 'heaterHours', 'coalKg', 'electricityUnits', 'mandays'].map((field) => (
            <Input
              key={field}
              placeholder={field}
              name={field}
              value={formData[field]}
              onChange={handleChange}
            />
          ))}
          <Button onClick={handleSubmit}>Add Record</Button>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button onClick={() => setFilter('all')}>All</Button>
        <Button onClick={() => setFilter('today')}>Today</Button>
        <Button onClick={() => setFilter('week')}>This Week</Button>
        <Button onClick={() => setFilter('month')}>This Month</Button>
      </div>

      <Card>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Input (Kg)</TableCell>
                <TableCell>Tea Made GL (Kg)</TableCell>
                <TableCell>Tea Made ORS (Kg)</TableCell>
                <TableCell>Recovery GL (%)</TableCell>
                <TableCell>Recovery ORS (%)</TableCell>
                <TableCell>CTC Hours</TableCell>
                <TableCell>Dryer Hours</TableCell>
                <TableCell>Heater Hours</TableCell>
                <TableCell>Total Hours</TableCell>
                <TableCell>Coal Ratio</TableCell>
                <TableCell>Electric Ratio</TableCell>
                <TableCell>Mandays</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record, index) => (
                <TableRow key={index}>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{record.inputKg}</TableCell>
                  <TableCell>{record.teaMadeGL}</TableCell>
                  <TableCell>{record.teaMadeORS}</TableCell>
                  <TableCell>{calculateRecoveryGL(record)}</TableCell>
                  <TableCell>{calculateRecoveryORS(record)}</TableCell>
                  <TableCell>{record.ctcHours}</TableCell>
                  <TableCell>{record.dryerHours}</TableCell>
                  <TableCell>{record.heaterHours}</TableCell>
                  <TableCell>{calculateTotalHours(record)}</TableCell>
                  <TableCell>{calculateCoalRatio(record)}</TableCell>
                  <TableCell>{calculateElectricRatio(record)}</TableCell>
                  <TableCell>{record.mandays}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-4">Monthly Metrics Chart</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="RecoveryGL" fill="#8884d8" />
              <Bar dataKey="RecoveryORS" fill="#82ca9d" />
              <Bar dataKey="CoalRatio" fill="#ffc658" />
              <Bar dataKey="ElectricRatio" fill="#ff8042" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
