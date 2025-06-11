import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('📅 Calendar API endpoint called');
    
    const body = await request.json();
    const { idTokenPayload } = body;
    
    if (!idTokenPayload) {
      return NextResponse.json(
        { error: 'IDトークンペイロードが必要です' },
        { status: 400 }
      );
    }
    
    console.log('🏷️ Received ID token payload:', JSON.stringify(idTokenPayload, null, 2));
    
    // まず、IDトークンの構造を詳しく調べる
    const debugInfo = {
      hasIdentities: !!idTokenPayload.identities,
      identitiesType: typeof idTokenPayload.identities,
      identitiesLength: Array.isArray(idTokenPayload.identities) ? idTokenPayload.identities.length : 'not array',
      allKeys: Object.keys(idTokenPayload),
      cognitoUsername: idTokenPayload['cognito:username']
    };
    
    console.log('🔍 Token structure debug:', debugInfo);
    
    // identities からGoogleのアクセストークンを抽出
    if (!idTokenPayload.identities || !Array.isArray(idTokenPayload.identities)) {
      return NextResponse.json(
        { 
          error: 'Googleアイデンティティ情報が見つかりません', 
          debug: { 
            ...debugInfo,
            identities: idTokenPayload.identities,
            suggestion: 'OAuth設定でCalendar APIスコープが不足している可能性があります'
          }
        },
        { status: 400 }
      );
    }
    
    const googleIdentity = idTokenPayload.identities.find((id: any) => 
      id.providerName === 'Google' || id.provider === 'google'
    );
    
    if (!googleIdentity) {
      return NextResponse.json(
        { 
          error: 'Googleプロバイダーが見つかりません',
          debug: { 
            identities: idTokenPayload.identities,
            availableProviders: idTokenPayload.identities.map((id: any) => id.providerName || id.provider)
          }
        },
        { status: 400 }
      );
    }
    
    console.log('🔍 Google identity found:', googleIdentity);
    
    // Googleアクセストークンの抽出（複数のフィールドをチェック）
    const accessToken = googleIdentity.accessToken || 
                       googleIdentity.access_token || 
                       googleIdentity.token;
    
    if (!accessToken) {
      return NextResponse.json(
        { 
          error: 'Googleアクセストークンが見つかりません',
          debug: { 
            googleIdentity,
            availableFields: Object.keys(googleIdentity)
          }
        },
        { status: 400 }
      );
    }
    
    console.log('✅ Google access token found');
    
    // 今日の日付範囲を計算
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Google Calendar API リクエスト
    const calendarUrl = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
    calendarUrl.searchParams.append('timeMin', startOfDay.toISOString());
    calendarUrl.searchParams.append('timeMax', endOfDay.toISOString());
    calendarUrl.searchParams.append('singleEvents', 'true');
    calendarUrl.searchParams.append('orderBy', 'startTime');
    calendarUrl.searchParams.append('maxResults', '50');
    
    console.log('📡 Calling Google Calendar API:', calendarUrl.toString());
    
    const calendarResponse = await fetch(calendarUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📬 Calendar API response status:', calendarResponse.status);
    
    if (!calendarResponse.ok) {
      const errorText = await calendarResponse.text();
      console.error('❌ Calendar API error:', errorText);
      
      return NextResponse.json(
        { 
          error: `Calendar API エラー: ${calendarResponse.status}`,
          details: errorText,
          tokenInfo: {
            hasToken: !!accessToken,
            tokenPrefix: accessToken ? `${accessToken.substring(0, 10)}...` : 'none'
          }
        },
        { status: calendarResponse.status }
      );
    }
    
    const calendarData = await calendarResponse.json();
    console.log('✅ Calendar API success, events count:', calendarData.items?.length || 0);
    
    return NextResponse.json({
      success: true,
      events: calendarData.items || [],
      totalEvents: calendarData.items?.length || 0,
      date: today.toISOString().split('T')[0]
    });
    
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json(
      { 
        error: 'サーバーエラーが発生しました',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}