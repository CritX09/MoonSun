import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AppTheme } from '../types';

interface NetworkChartProps {
  theme: AppTheme;
}

const generateData = () => {
  const data = [];
  for (let i = 0; i < 20; i++) {
    data.push({
      time: i,
      latency: Math.floor(Math.random() * 15) + 2, // 2-17ms
      bitrate: Math.floor(Math.random() * 20) + 80, // 80-100mbps
    });
  }
  return data;
};

export const NetworkChart: React.FC<NetworkChartProps> = ({ theme }) => {
  const [data, setData] = useState(generateData());

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const newData = [...prev.slice(1), {
          time: prev[prev.length - 1].time + 1,
          latency: Math.floor(Math.random() * (theme === AppTheme.MOONLIGHT ? 5 : 15)) + 2,
          bitrate: Math.floor(Math.random() * 20) + (theme === AppTheme.MOONLIGHT ? 120 : 50),
        }];
        return newData;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [theme]);

  const strokeColor = theme === AppTheme.SUNSHINE ? '#f97316' : '#818cf8';
  const secondaryColor = theme === AppTheme.SUNSHINE ? '#fbbf24' : '#c084fc';

  return (
    <div className={`p-4 rounded-xl border backdrop-blur-sm h-64 transition-colors duration-500 ${
      theme === AppTheme.SUNSHINE 
        ? 'bg-white/80 border-orange-200' 
        : 'bg-black/40 border-indigo-900'
    }`}>
      <h3 className={`text-sm font-bold mb-4 ${
        theme === AppTheme.SUNSHINE ? 'text-orange-800' : 'text-indigo-200'
      }`}>
        MONITEUR DE FLUX EN TEMPS RÉEL (SIMULATION)
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme === AppTheme.SUNSHINE ? '#eee' : '#333'} />
          <XAxis dataKey="time" hide />
          <YAxis yAxisId="left" stroke={strokeColor} fontSize={10} label={{ value: 'ms', angle: -90, position: 'insideLeft', fill: strokeColor }} />
          <YAxis yAxisId="right" orientation="right" stroke={secondaryColor} fontSize={10} label={{ value: 'Mbps', angle: 90, position: 'insideRight', fill: secondaryColor }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: theme === AppTheme.SUNSHINE ? '#fff' : '#111',
              borderColor: strokeColor
            }} 
          />
          <Line yAxisId="left" type="monotone" dataKey="latency" stroke={strokeColor} strokeWidth={2} dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="bitrate" stroke={secondaryColor} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
