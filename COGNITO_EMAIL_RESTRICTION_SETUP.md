# AWS Cognito メール制限設定ガイド

## 目的
特定のメールアドレス（taka.0717.ken@gmail.com）のみがアプリケーションにログインできるように制限する

## 設定手順

### 1. Lambda関数の作成

#### AWS Lambda コンソール
- https://console.aws.amazon.com/lambda/
- **関数の作成** をクリック
- **一から作成** を選択
- 関数名: `cognito-pre-signup-email-restriction`
- ランタイム: `Node.js 18.x` または `Node.js 20.x`
- **関数の作成** をクリック

#### Lambda関数コード
```javascript
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
```

### 2. Cognito User Pool設定

#### AWS Cognito コンソール
- https://console.aws.amazon.com/cognito/
- User pools → `yuka-app` (ap-northeast-1_MvXXrt5uB)

#### Lambda triggers設定
1. **User pool properties** タブをクリック
2. **Lambda triggers** セクションを見つける
3. **Add Lambda trigger** をクリック
4. トリガータイプ: **Pre sign-up**
5. Lambda関数: `cognito-pre-signup-email-restriction` を選択
6. **Add Lambda trigger** をクリック

### 3. Lambda実行ロールの設定

#### IAM コンソール
- https://console.aws.amazon.com/iam/
- **ロール** → Lambda関数の実行ロールを検索
- **許可を追加** → **ポリシーをアタッチ**
- 以下のカスタムポリシーを作成・アタッチ:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:*:*:*"
        }
    ]
}
```

### 4. テスト手順

1. **別のGoogleアカウント**でログインを試行
2. **アクセス拒否エラー**が表示されることを確認
3. **taka.0717.ken@gmail.com**でログインして正常動作を確認

### 5. ログ確認

- **CloudWatch Logs** でLambda関数のログを確認
- `/aws/lambda/cognito-pre-signup-email-restriction` ロググループ

## 注意事項

- この設定により、許可されていないメールアドレスではサインアップ自体ができなくなります
- 既存のユーザーには影響しません（新規サインアップ時のみ適用）
- メールアドレスを追加したい場合は、Lambda関数の `ALLOWED_EMAILS` 配列を更新してください

## トラブルシューティング

- Lambda関数のログをCloudWatch Logsで確認
- Cognito User Pool → Monitoring → Triggersでエラーを確認
- IAM ロールの権限を確認