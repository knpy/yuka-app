# AWS Cognito 認証設定ガイド

## 🎯 設定目標
Google OAuthを使用したソーシャルログイン機能を実装

## 📋 設定手順

### 1. Google Cloud Console設定

1. **Google Cloud Consoleにアクセス**
   - https://console.cloud.google.com/

2. **新しいプロジェクト作成 or 既存プロジェクト選択**

3. **OAuth同意画面設定**
   - `APIs & Services` → `OAuth consent screen`
   - User Type: `External`
   - アプリ名: `Yuka App`
   - ユーザーサポートメール: あなたのメールアドレス
   - スコープ: `email`, `profile`, `openid`

4. **OAuth 2.0 クライアント作成**
   - `APIs & Services` → `Credentials`
   - `CREATE CREDENTIALS` → `OAuth client ID`
   - Application type: `Web application`
   - Name: `Yuka App - Cognito`
   - Authorized redirect URIs: 
     ```
     https://[your-cognito-domain].auth.us-east-1.amazoncognito.com/oauth2/idpresponse
     ```
   - **重要**: このURIは後でCognito設定後に更新

5. **クライアント情報を保存**
   - Client ID: `xxxxxxxx.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-xxxxxxxxxxxxxxxxxxxxx`

### 2. AWS Cognito ユーザープール作成

1. **AWS Cognitoコンソールにアクセス**
   - https://console.aws.amazon.com/cognito/

2. **ユーザープール作成**
   - `Create user pool`
   - Authentication providers: `Email`
   - Password policy: デフォルト
   - Multi-factor authentication: `Optional`

3. **ユーザープール設定**
   - Pool name: `yuka-app-user-pool`
   - Alias attributes: `Email`
   - Required attributes: `email`, `name`

4. **アプリクライアント作成**
   - App client name: `yuka-app-client`
   - Generate client secret: `No` (重要: SPAのため)
   - OAuth flows: `Authorization code grant`
   - OAuth scopes: `email`, `openid`, `profile`

### 3. Google OAuthプロバイダー追加

1. **Identity providers設定**
   - User pool → `Sign-in experience` → `Federated sign-in`
   - `Add an identity provider`
   - Provider type: `Google`
   - Google app ID: [Google Client ID]
   - Google app secret: [Google Client Secret]
   - Scopes: `email openid profile`

2. **App client設定**
   - `App integration` → [App client name]
   - Hosted UI settings:
     - Allowed callback URLs: 
       ```
       http://localhost:3000/
       https://dev.[app-id].amplifyapp.com/
       https://main.[app-id].amplifyapp.com/
       ```
     - Allowed sign-out URLs: (同上)
     - Identity providers: `Google`
     - OAuth grant types: `Authorization code grant`
     - OAuth scopes: `email`, `openid`, `profile`

### 4. Google Cloud Console URI更新

1. **Google Cloud Console** → `Credentials`
2. **作成したOAuth clientを編集**
3. **Authorized redirect URIs更新**:
   ```
   https://[cognito-domain].auth.us-east-1.amazoncognito.com/oauth2/idpresponse
   ```

### 5. amplifyconfiguration.json更新

```json
{
  "Auth": {
    "Cognito": {
      "userPoolId": "us-east-1_xxxxxxxxx",
      "userPoolClientId": "xxxxxxxxxxxxxxxxxxxxxxxxxx",
      "identityPoolId": "us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "loginWith": {
        "oauth": {
          "domain": "your-domain.auth.us-east-1.amazoncognito.com",
          "scopes": ["email", "openid", "profile"],
          "redirectSignIn": ["http://localhost:3000/", "https://dev.xxx.amplifyapp.com/", "https://main.xxx.amplifyapp.com/"],
          "redirectSignOut": ["http://localhost:3000/", "https://dev.xxx.amplifyapp.com/", "https://main.xxx.amplifyapp.com/"],
          "responseType": "code"
        }
      }
    }
  }
}
```

## 🔧 設定値の取得方法

### Cognito設定値
- **userPoolId**: Cognito User Pool → General settings → Pool Id
- **userPoolClientId**: Cognito User Pool → App integration → App client → Client ID
- **identityPoolId**: Cognito Identity Pool → Identity pool ID
- **domain**: Cognito User Pool → App integration → Domain

### 確認方法
```bash
# ローカルで動作確認
npm run dev

# 開発環境デプロイ後確認
# https://dev.[app-id].amplifyapp.com/
```

## 🚨 トラブルシューティング

### よくあるエラー
1. **redirect_uri_mismatch**: Google OAuthのリダイレクトURI設定確認
2. **Invalid client**: Cognitoアプリクライアント設定確認
3. **Scope error**: OAuth scopesがGoogle/Cognito両方で一致していることを確認

### デバッグ方法
```javascript
// ブラウザコンソールで確認
console.log(window.location.href); // リダイレクト先確認
```

## 📊 AWS無料枠での利用
- **Cognito**: MAU 50,000まで無料
- **Lambda**: 月100万リクエスト無料（認証関連の処理）

現在の設定は無料枠内で十分運用可能です。