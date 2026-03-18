import { useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts';
import { useGASGet } from '../useGAS';

export default function Dashboard() {
  const { data: records, loading, fetch: fetchRecords } = useGASGet();

  useEffect(() => { fetchRecords('records'); }, []);

  if (loading) return <div className="page"><p className="loading">読み込み中...</p></div>;
  if (!records || records.length === 0) {
    return <div className="page"><div className="card empty-state">実績データがまだありません。</div></div>;
  }

  // ---- 集計: 時間帯別 ----
  const bySlot = {};
  records.forEach(r => {
    if (!bySlot[r.time_slot]) bySlot[r.time_slot] = { time_slot: r.time_slot, called: 0, connected: 0 };
    bySlot[r.time_slot].called    += r.called_count;
    bySlot[r.time_slot].connected += r.connected_count;
  });
  const slotData = Object.values(bySlot).map(d => ({
    ...d,
    rate: d.called > 0 ? Math.round(d.connected / d.called * 1000) / 10 : 0,
  })).sort((a, b) => a.time_slot.localeCompare(b.time_slot));

  // ---- 集計: 場所別 ----
  const byLocation = {};
  records.forEach(r => {
    if (!byLocation[r.location]) byLocation[r.location] = { location: r.location, called: 0, connected: 0 };
    byLocation[r.location].called    += r.called_count;
    byLocation[r.location].connected += r.connected_count;
  });
  const locationData = Object.values(byLocation).map(d => ({
    ...d,
    rate: d.called > 0 ? Math.round(d.connected / d.called * 1000) / 10 : 0,
  }));

  // ---- サマリー ----
  const totalCalled     = records.reduce((s, r) => s + r.called_count, 0);
  const totalConnected  = records.reduce((s, r) => s + r.connected_count, 0);
  const totalRate       = totalCalled > 0 ? Math.round(totalConnected / totalCalled * 1000) / 10 : 0;

  return (
    <div className="page">
      <h2 className="page-title">分析ダッシュボード</h2>

      {/* サマリーカード */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-label">総声かけ数</div>
          <div className="summary-value">{totalCalled.toLocaleString()}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">総繋がり数</div>
          <div className="summary-value">{totalConnected.toLocaleString()}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">全体繋がり率</div>
          <div className="summary-value">{totalRate}%</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">活動回数</div>
          <div className="summary-value">{records.length}</div>
        </div>
      </div>

      {/* 時間帯別 繋がり率 */}
      <div className="card">
        <h3 className="chart-title">時間帯別 繋がり率（%）</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={slotData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <XAxis dataKey="time_slot" tick={{ fontSize: 11 }}/>
            <YAxis unit="%" tick={{ fontSize: 11 }}/>
            <Tooltip formatter={(v) => `${v}%`}/>
            <Bar dataKey="rate" name="繋がり率" fill="#378ADD" radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 時間帯別 声かけ数 vs 繋がり数 */}
      <div className="card">
        <h3 className="chart-title">時間帯別 声かけ数 vs 繋がり数</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={slotData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <XAxis dataKey="time_slot" tick={{ fontSize: 11 }}/>
            <YAxis tick={{ fontSize: 11 }}/>
            <Tooltip/>
            <Legend/>
            <Bar dataKey="called"    name="声かけ数" fill="#B5D4F4" radius={[4,4,0,0]}/>
            <Bar dataKey="connected" name="繋がり数" fill="#378ADD" radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 場所別 繋がり率 */}
      <div className="card">
        <h3 className="chart-title">場所別 繋がり率（%）</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={locationData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <XAxis dataKey="location" tick={{ fontSize: 12 }}/>
            <YAxis unit="%" tick={{ fontSize: 11 }}/>
            <Tooltip formatter={(v) => `${v}%`}/>
            <Bar dataKey="rate" name="繋がり率" fill="#1D9E75" radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
