'use client';

import React from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession } from 'aws-amplify/auth';

interface CalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  location?: string;
  description?: string;
}

export default function GoogleCalendar() {
  const { user } = useAuthenticator((context) => [context.user]);
  const [events, setEvents] = React.useState<CalendarEvent[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // 今日の日付を取得
  const getTodayDateRange = () => {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    return {
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString()
    };
  };

  // Google Calendar APIから今日の予定を取得
  const fetchTodayEvents = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      console.log('📅 カレンダー情報を取得中...');
      
      // 認証セッションからIDトークンを取得
      const session = await fetchAuthSession();
      console.log('🔑 セッション情報:', session);
      
      if (!session.tokens?.idToken) {
        throw new Error('IDトークンが見つかりません');
      }

      const idTokenPayload = session.tokens.idToken.payload;
      console.log('🏷️ IDトークンペイロード送信:', idTokenPayload);

      // Next.js API ルート経由でGoogle Calendar APIを呼び出し
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idTokenPayload
        }),
      });

      console.log('📬 API レスポンス ステータス:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Calendar API エラー:', errorData);
        throw new Error(errorData.error || `API エラー: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Calendar API レスポンス:', data);

      if (data.success) {
        setEvents(data.events || []);
      } else {
        throw new Error(data.error || 'カレンダー取得に失敗しました');
      }
      
    } catch (error) {
      console.error('❌ カレンダー取得エラー:', error);
      
      // エラーの場合、サンプルデータで動作確認
      if (error instanceof Error && error.message.includes('スコープ')) {
        console.log('⚠️ スコープエラーのため、サンプルデータを表示');
        const sampleEvents: CalendarEvent[] = [
          {
            id: 'sample-1',
            summary: '📅 サンプル会議（朝会）',
            start: { dateTime: new Date().toISOString().split('T')[0] + 'T09:00:00+09:00' },
            end: { dateTime: new Date().toISOString().split('T')[0] + 'T09:30:00+09:00' },
            location: 'Zoom会議室',
            description: 'チームの朝会です'
          },
          {
            id: 'sample-2', 
            summary: '💻 開発作業',
            start: { dateTime: new Date().toISOString().split('T')[0] + 'T10:00:00+09:00' },
            end: { dateTime: new Date().toISOString().split('T')[0] + 'T12:00:00+09:00' },
            description: 'ユーザー認証機能の実装'
          },
          {
            id: 'sample-3',
            summary: '🍽️ ランチタイム',
            start: { dateTime: new Date().toISOString().split('T')[0] + 'T12:00:00+09:00' },
            end: { dateTime: new Date().toISOString().split('T')[0] + 'T13:00:00+09:00' }
          }
        ];
        setEvents(sampleEvents);
        setError('⚠️ OAuth スコープ設定が不完全のため、サンプルデータを表示しています。Google Cloud Console でCalendar APIスコープを設定してください。');
      } else {
        setError(error instanceof Error ? error.message : String(error));
      }
    } finally {
      setLoading(false);
    }
  };

  // イベントの時間をフォーマット
  const formatEventTime = (event: CalendarEvent) => {
    if (event.start.dateTime) {
      const startTime = new Date(event.start.dateTime).toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit'
      });
      const endTime = new Date(event.end.dateTime || event.start.dateTime).toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit'
      });
      return `${startTime} - ${endTime}`;
    } else if (event.start.date) {
      return '終日';
    }
    return '時間未設定';
  };

  if (!user) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg">
        <p className="text-gray-600">カレンダー情報を表示するにはログインしてください。</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 max-w-4xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">📅 今日の予定</h2>
        <button
          onClick={fetchTodayEvents}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? '取得中...' : '予定を取得'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-300 p-4 rounded mb-4">
          <h3 className="font-semibold text-red-800">エラーが発生しました</h3>
          <p className="text-red-700 text-sm mt-1">{error}</p>
          <details className="mt-2">
            <summary className="text-red-600 cursor-pointer text-sm">詳細情報</summary>
            <div className="mt-2 text-xs bg-red-50 p-2 rounded">
              <p>• Google Calendar APIのスコープが設定されているか確認してください</p>
              <p>• OAuth同意画面でcalendar.readonlyスコープが有効か確認してください</p>
              <p>• 再ログインが必要な場合があります</p>
            </div>
          </details>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">カレンダー情報を取得しています...</p>
        </div>
      )}

      {!loading && events.length === 0 && !error && (
        <div className="text-center py-8 text-gray-500">
          <p>今日の予定はありません。</p>
          <p className="text-sm mt-2">「予定を取得」ボタンをクリックしてカレンダーを確認してください。</p>
        </div>
      )}

      {events.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            {new Date().toLocaleDateString('ja-JP')} の予定 ({events.length}件)
          </p>
          
          {events.map((event, index) => (
            <div key={event.id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">
                    {event.summary || '(タイトルなし)'}
                  </h3>
                  <p className="text-sm text-blue-600 mt-1">
                    {formatEventTime(event)}
                  </p>
                  {event.location && (
                    <p className="text-sm text-gray-600 mt-1">
                      📍 {event.location}
                    </p>
                  )}
                  {event.description && (
                    <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* デバッグ情報 */}
      {events.length > 0 && (
        <details className="mt-6">
          <summary className="text-sm text-gray-500 cursor-pointer">🔍 デバッグ情報</summary>
          <pre className="bg-gray-100 p-3 rounded mt-2 text-xs overflow-auto max-h-40">
            {JSON.stringify(events, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}