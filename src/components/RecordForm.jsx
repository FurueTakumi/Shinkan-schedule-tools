import { useState, useEffect } from 'react';
import { TIME_SLOTS, LOCATIONS } from '../config';
import { useGASGet, gasPost } from '../useGAS';

export default function RecordForm() {
  const { data: members, fetch: fetchMembers } = useGASGet();
  const [form, setForm] = useState({
    date:            new Date().toISOString().slice(0, 10),
    time_slot:       TIME_SLOTS[0],
    location:        LOCATIONS[0],
    member_id:       '',
    called_count:    '',
    connected_count: '',
    notes:           '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]         = useState(null);

  useEffect(() => { fetchMembers('members'); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.member_id || !form.called_count || !form.connected_count) {
      alert('担当者・声かけ数・繋がり数は必須です');
      return;
    }
    setSubmitting(true);
    setResult(null);
    try {
      const res = await gasPost('addRecord', form);
      if (res.success) {
        setResult({ ok: true, msg: `記録しました（ID: ${res.record_id}）` });
        setForm(f => ({ ...f, called_count: '', connected_count: '', notes: '' }));
      } else {
        setResult({ ok: false, msg: 'エラーが発生しました' });
      }
    } catch {
      setResult({ ok: false, msg: '通信エラーが発生しました' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <h2 className="page-title">実績入力</h2>
      <div className="card">
        <div className="form-grid">

          <label className="form-label">日付</label>
          <input
            className="form-input"
            type="date"
            value={form.date}
            onChange={e => set('date', e.target.value)}
          />

          <label className="form-label">時間帯</label>
          <select className="form-input" value={form.time_slot} onChange={e => set('time_slot', e.target.value)}>
            {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
          </select>

          <label className="form-label">場所</label>
          <select className="form-input" value={form.location} onChange={e => set('location', e.target.value)}>
            {LOCATIONS.map(l => <option key={l}>{l}</option>)}
          </select>

          <label className="form-label">担当者</label>
          <select className="form-input" value={form.member_id} onChange={e => set('member_id', e.target.value)}>
            <option value="">選択してください</option>
            {(members || []).map(m => (
              <option key={m.member_id} value={m.member_id}>{m.name}</option>
            ))}
          </select>

          <label className="form-label">声かけ数</label>
          <input
            className="form-input"
            type="number"
            min="0"
            placeholder="例: 32"
            value={form.called_count}
            onChange={e => set('called_count', e.target.value)}
          />

          <label className="form-label">繋がり数</label>
          <input
            className="form-input"
            type="number"
            min="0"
            placeholder="例: 8"
            value={form.connected_count}
            onChange={e => set('connected_count', e.target.value)}
          />

          <label className="form-label">メモ</label>
          <input
            className="form-input"
            type="text"
            placeholder="任意"
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
          />
        </div>

        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? '送信中...' : '記録する'}
        </button>

        {result && (
          <p className={`result-msg ${result.ok ? 'ok' : 'err'}`}>
            {result.msg}
          </p>
        )}
      </div>
    </div>
  );
}
