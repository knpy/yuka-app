'use client';

import React from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

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

export default function GoogleCalendarDirect() {
  const { data: session, status } = useSession();
  const [events, setEvents] = React.useState<CalendarEvent[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Google Calendar APIから今日の予定を取得
  const fetchCalendarEvents = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(session as any)?.accessToken) {
      setError('Google認証が必要です');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📅 Calendar API呼び出し開始');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.log('Access token available:', !!(session as any)?.accessToken);

      // 今日の日付範囲を計算
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      // Google Calendar API エンドポイント
      const calendarUrl = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
      calendarUrl.searchParams.append('timeMin', startOfDay.toISOString());
      calendarUrl.searchParams.append('timeMax', endOfDay.toISOString());
      calendarUrl.searchParams.append('singleEvents', 'true');
      calendarUrl.searchParams.append('orderBy', 'startTime');
      calendarUrl.searchParams.append('maxResults', '50');

      console.log('📡 API URL:', calendarUrl.toString());

      const response = await fetch(calendarUrl.toString(), {
        headers: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          'Authorization': `Bearer ${(session as any).accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📬 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        throw new Error(`Calendar API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Calendar data:', data);

      setEvents(data.items || []);

    } catch (error) {
      console.error('❌ Error fetching calendar:', error);
      setError(error instanceof Error ? error.message : String(error));
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

  if (status === 'loading') {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 max-w-4xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">📅 Google Calendar連携</h2>
        
        {!session ? (
          <div className="space-y-2">
            <button
              onClick={() => signIn('google')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              📅 Googleカレンダーと連携
            </button>
            <p className="text-xs text-gray-500">
              ※ エラーが発生する場合は、ページを再読込してから再試行してください
            </p>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={fetchCalendarEvents}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-green-300"
            >
              {loading ? '取得中...' : '今日の予定を取得'}
            </button>
            <button
              onClick={() => signOut()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              連携解除
            </button>
          </div>
        )}
      </div>

      {session && (
        <div className="bg-green-50 p-3 rounded border border-green-200 mb-4">
          <p className="text-green-800 text-sm">
            ✅ <strong>{session.user?.name}</strong> ({session.user?.email}) と連携中
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-300 p-4 rounded mb-4">
          <h3 className="font-semibold text-red-800">エラーが発生しました</h3>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-gray-600">カレンダー情報を取得しています...</p>
        </div>
      )}

      {!loading && events.length === 0 && !error && session && (
        <div className="text-center py-8 text-gray-500">
          <p>今日の予定はありません。</p>
          <p className="text-sm mt-2">「今日の予定を取得」ボタンをクリックしてください。</p>
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
      {session && (
        <details className="mt-6">
          <summary className="text-sm text-gray-500 cursor-pointer">🔍 デバッグ情報</summary>
          <div className="mt-2 space-y-2">
            <div className="bg-gray-100 p-3 rounded text-xs">
              <p><strong>Session User:</strong> {session.user?.name} ({session.user?.email})</p>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <p><strong>Access Token:</strong> {(session as any).accessToken ? '✅ あり' : '❌ なし'}</p>
              <p><strong>Events Count:</strong> {events.length}</p>
            </div>
            {events.length > 0 && (
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(events, null, 2)}
              </pre>
            )}
          </div>
        </details>
      )}
    </div>
  );
}