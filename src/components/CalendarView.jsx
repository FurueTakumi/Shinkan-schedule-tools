import { useState, useEffect } from 'react';
import { TIME_SLOTS, LOCATIONS } from '../config';
import { useGASGet, gasPost } from '../useGAS';

export default function CalendarView() {
  const { data: schedules, fetch: fetchSchedule } = useGASGet();
  const { data: members,   fetch: fetchMembers   } = useGASGet();

  const [form, setForm] = useState({
    date:               new Date().toISOString().slice(0, 10),
    time_slot:          TIME_SLOTS[0],
    location:           LOCATIONS[0],
    assigned_member_id: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]         = useState(null);
  const [showForm, setShowForm]     = useState(false);

  useEffect(() => {
    fetchSchedule('schedule');
    fetchMembers('members');
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAdd = async () => {
    if (!form.assigned_member_id) { alert('担当者を選択してください'); return; }
    setSubmitting(true);
    try {
      const res = await gasPost('addSchedule', form);
      if (res.success) {
        setResult({ ok: true, msg: '予定を追加しました' });
        fetchSchedule('schedule');
        setShowForm(false);
      }
    } catch { setResult({ ok: false, msg: '通信エラー' }); }
    finally  { setSubmitting(false); }
  };

  // 日付ごとにグルーピング
  const grouped = (schedules || []).reduce((acc, s) => {
    acc[s.date] = acc[s.date] || [];
    acc[s.date].push(s);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort();

  // メンバーカラーマップ
  const colors = ['#378ADD','#1D9E75','#EF9F27','#D85A30','#7F77DD','#D4537E'];
  const memberColors = {};
  (members || []).forEach((m, i) => { memberColors[m.member_id] = colors[i % colors.length]; });

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">担当カレンダー</h2>
        <button className="btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? 'キャンセル' : '＋ 予定追加'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="form-grid">
            <label className="form-label">日付</label>
            <input className="form-input" type="date" value={form.date} onChange={e => set('date', e.target.value)}/>

            <label className="form-label">時間帯</label>
            <select className="form-input" value={form.time_slot} onChange={e => set('time_slot', e.target.value)}>
              {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
            </select>

            <label className="form-label">場所</label>
            <select className="form-input" value={form.location} onChange={e => set('location', e.target.value)}>
              {LOCATIONS.map(l => <option key={l}>{l}</option>)}
            </select>

            <label className="form-label">担当者</label>
            <select className="form-input" value={form.assigned_member_id} onChange={e => set('assigned_member_id', e.target.value)}>
              <option value="">選択してください</option>
              {(members || []).map(m => <option key={m.member_id} value={m.member_id}>{m.name}</option>)}
            </select>
          </div>
          <button className="btn-primary" onClick={handleAdd} disabled={submitting}>
            {submitting ? '追加中...' : '追加する'}
          </button>
          {result && <p className={`result-msg ${result.ok ? 'ok' : 'err'}`}>{result.msg}</p>}
        </div>
      )}

      {sortedDates.length === 0 && (
        <div className="card empty-state">予定がまだありません。「＋ 予定追加」から追加してください。</div>
      )}

      {sortedDates.map(date => (
        <div key={date} className="card date-block">
          <div className="date-header">{date}</div>
          <div className="slot-list">
            {grouped[date].map(s => (
              <div key={s.schedule_id} className="slot-item">
                <span className="slot-time">{s.time_slot}</span>
                <span className="slot-location">{s.location}</span>
                <span
                  className="slot-name"
                  style={{ background: memberColors[s.assigned_member_id] + '22', color: memberColors[s.assigned_member_id] }}
                >
                  {s.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
