import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useData } from '../../context/DataContext';

export default function TopicProgressChart() {
  const { problems } = useData();

  // Aggregate problems by topic
  const topicCounts = {};
  problems.forEach((p) => {
    if (p.topics && p.topics.length) {
      p.topics.forEach((t) => {
        if (!topicCounts[t]) topicCounts[t] = { topic: t, solved: 0, total: 0 };
        topicCounts[t].total += 1;
        if (p.status === 'solved') topicCounts[t].solved += 1;
      });
    }
  });

  const data = Object.values(topicCounts).sort((a, b) => b.total - a.total).slice(0, 8);

  if (data.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-slate-400 text-xs">
        No topic data available yet
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 15, left: -15, bottom: 55 }}>
          <XAxis 
            dataKey="topic" 
            stroke="#334155" 
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            interval={0} 
            angle={-30} 
            textAnchor="end"
            height={60}
            dx={-4}
            dy={6}
          />
          <YAxis 
            stroke="#334155" 
            tick={{ fill: '#94a3b8', fontSize: 11 }} 
            allowDecimals={false} 
          />
          <Tooltip
            cursor={false}
            contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '12px', padding: '8px 12px' }}
            labelStyle={{ color: '#f8fafc', fontWeight: 600, fontSize: '13px' }}
            itemStyle={{ color: '#06b6d4', fontSize: '12px' }}
          />
          <Bar dataKey="solved" name="Solved" fill="#06b6d4" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#06b6d4' : '#a855f7'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
