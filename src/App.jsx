import { useState } from 'react';
import CalendarView from './components/CalendarView';
import RecordForm   from './components/RecordForm';
import Dashboard    from './components/Dashboard';
import './App.css';

const TABS = [
  { id: 'calendar',  label: '📅 カレンダー' },
  { id: 'record',    label: '✏️ 実績入力'   },
  { id: 'dashboard', label: '📊 分析'        },
];

export default function App() {
  const [tab, setTab] = useState('calendar');

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <span className="header-title">🌸 新歓スケジュール管理</span>
        </div>
        <nav className="tab-nav">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`tab-btn ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="main">
        {tab === 'calendar'  && <CalendarView />}
        {tab === 'record'    && <RecordForm   />}
        {tab === 'dashboard' && <Dashboard    />}
      </main>
    </div>
  );
}
