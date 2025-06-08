# AWS Amplify デプロイガイド

## 🚀 AWS Amplifyホスティング設定手順

### 1. 本番環境（main ブランチ）

1. **AWS Amplifyコンソールにアクセス**
   - https://console.aws.amazon.com/amplify/

2. **新しいアプリを作成** ✅完了済み
   - 「New app」→ 「Host web app」をクリック
   - GitHub リポジトリを選択
   - リポジトリ: `knpy/yuka-app`
   - ブランチ: `main`

### 2. 開発環境（develop ブランチ）

1. **Connected branchesタブで環境追加**
   - 「Connect branch」をクリック
   - ブランチ: `develop`を選択
   - 環境名: `dev`

2. **環境別設定**
   ```
   main   → 本番環境 (prod)
   develop → 開発環境 (dev)
   ```

3. **ビルド設定の確認**
   - amplify.yml ファイルが自動検出される
   - Next.js設定が適用される

4. **環境変数の設定**
   ```
   NEXT_PUBLIC_AWS_PROJECT_REGION=us-east-1
   ```

### 2. AWS Cognito設定（認証機能用）

1. **Cognitoコンソールでユーザープール作成**
   - https://console.aws.amazon.com/cognito/
   - 「User pools」→ 「Create user pool」

2. **Google OAuth設定**
   - Identity providers → Google
   - Google Client ID/Secret設定
   - OAuth redirect URIsに本番URL追加

3. **アプリクライアント設定**
   - OAuth 2.0 grant types: Authorization code grant
   - OAuth scopes: email, openid, profile

### 3. amplifyconfiguration.json更新

実際のCognito設定値で更新:

```json
{
  "Auth": {
    "Cognito": {
      "userPoolId": "実際のUser Pool ID",
      "userPoolClientId": "実際のApp Client ID", 
      "identityPoolId": "実際のIdentity Pool ID",
      "loginWith": {
        "oauth": {
          "domain": "実際のCognito Domain",
          "scopes": ["email", "openid", "profile"],
          "redirectSignIn": ["https://your-app.amplifyapp.com/"],
          "redirectSignOut": ["https://your-app.amplifyapp.com/"],
          "responseType": "code"
        }
      }
    }
  }
}
```

### 4. デプロイ後の確認事項

- [ ] アプリがhttpsでアクセス可能
- [ ] 認証フローが正常動作
- [ ] AWS無料枠使用量の確認
- [ ] CI/CDパイプラインの動作確認

## 📊 AWS無料枠での運用

- **Amplify Hosting**: 月5GB転送量まで無料
- **Cognito**: MAU 50,000まで無料
- **Lambda**: 月100万リクエスト無料

## 🔧 トラブルシューティング

### ビルドエラーの場合
1. amplify.ymlの設定確認
2. package.jsonのbuildスクリプト確認
3. 環境変数の設定確認

### 認証エラーの場合
1. Cognito設定の確認
2. OAuth redirect URI設定
3. amplifyconfiguration.jsonの値確認