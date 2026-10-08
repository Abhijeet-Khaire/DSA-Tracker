import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useData } from '../../context/DataContext';

const COLORS = {
  Easy: '#10b981',
  Medium: '#f59e0b',
  Hard: '#f43f5e',
};

export default function DifficultyChart() {
  const { problems } = useData();

  const counts = { Easy: 0, Medium: 0, Hard: 0 };
  problems.forEach((p) => {
    if (p.status === 'solved' && counts[p.difficulty] !== undefined) {
      counts[p.difficulty] += 1;
    }
  });

  const data = [
    { name: 'Easy', value: counts.Easy },
    { name: 'Medium', value: counts.Medium },
    { name: 'Hard', value: counts.Hard },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
        Solve a problem to render difficulty distribution
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={75}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#090d16',
              borderColor: '#1e293b',
              borderRadius: '12px',
              padding: '8px 12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
            }}
            itemStyle={{ color: '#f8fafc', fontSize: '13px', fontWeight: 600 }}
            labelStyle={{ color: '#f8fafc', fontSize: '13px', fontWeight: 600 }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
