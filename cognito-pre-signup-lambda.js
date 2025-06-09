// AWS Lambda Pre Sign-up Trigger
// 特定のメールアドレスのみサインアップを許可

exports.handler = async (event) => {
    console.log('Pre Sign-up event:', JSON.stringify(event, null, 2));
    
    // 許可されたメールアドレスのリスト
    const ALLOWED_EMAILS = [
        'taka.0717.ken@gmail.com',
        // 必要に応じて追加
    ];
    
    // ユーザーのメールアドレスを取得
    const userEmail = event.request.userAttributes.email;
    
    console.log('User email:', userEmail);
    console.log('Allowed emails:', ALLOWED_EMAILS);
    
    // メールアドレスチェック
    if (!ALLOWED_EMAILS.includes(userEmail)) {
        console.log('Email not allowed:', userEmail);
        throw new Error(`Access denied. Email ${userEmail} is not authorized to use this application.`);
    }
    
    console.log('Email authorized:', userEmail);
    
    // 許可されたユーザーの場合、サインアップを承認
    event.response.autoConfirmUser = true;
    event.response.autoVerifyEmail = true;
    
    return event;
};