import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../components/ui/Table';
import { supabase } from '../lib/supabaseClient';
import { format, isThisWeek, isThisMonth } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useUser, SignInButton, SignOutButton } from '@supabase/auth-ui-react';

export default function TeaManufacturingApp() {
  const { user } = useUser();
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
        <SignInButton />
      </div>
    );
  }

  return (
    <div className="p-6 grid gap-6">
      <h1 className="text-2xl font-bold">CTC Tea Manufacturing Record</h1>
      <SignOutButton />

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
              <Bar dataKey="ElectricRatio" fill="#ff8043" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
