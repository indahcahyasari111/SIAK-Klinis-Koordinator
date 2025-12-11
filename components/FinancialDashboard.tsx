import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const data = [
  { name: 'Sen', pending: 4000, approved: 2400 },
  { name: 'Sel', pending: 3000, approved: 1398 },
  { name: 'Rab', pending: 2000, approved: 9800 },
  { name: 'Kam', pending: 2780, approved: 3908 },
  { name: 'Jum', pending: 1890, approved: 4800 },
  { name: 'Sab', pending: 2390, approved: 3800 },
  { name: 'Min', pending: 3490, approved: 4300 },
];

const crrData = [
  { name: 'Poli Dalam', crr: 85 },
  { name: 'Poli Bedah', crr: 110 },
  { name: 'IGD', crr: 65 },
  { name: 'Rawat Inap', crr: 95 },
];

const FinancialDashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
      <div className="h-64 w-full">
        <h3 className="text-sm font-semibold text-slate-500 mb-2">Status Klaim BPJS (Mingguan)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="pending" name="Menunggu BAV" fill="#fbbf24" />
            <Bar dataKey="approved" name="Terverifikasi" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="h-64 w-full">
        <h3 className="text-sm font-semibold text-slate-500 mb-2">Cost Recovery Rate (CRR) per Unit</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={crrData}
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 120]} />
            <YAxis dataKey="name" type="category" fontSize={12} width={80} />
            <Tooltip />
            <Bar dataKey="crr" name="CRR %" fill="#10b981" barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FinancialDashboard;