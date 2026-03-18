import { useState, useCallback } from 'react';
import { GAS_URL } from './config';

// GAS APIへのGETリクエスト
export function useGASGet() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetch_ = useCallback(async (action) => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`${GAS_URL}?action=${action}`);
      const json = await res.json();
      setData(json);
      return json;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetch: fetch_ };
}

// GAS APIへのPOSTリクエスト
export async function gasPost(action, data) {
  const res = await fetch(GAS_URL, {
    method:  'POST',
    body:    JSON.stringify({ action, data }),
  });
  return res.json();
}
