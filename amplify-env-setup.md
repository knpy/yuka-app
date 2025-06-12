# AWS Amplify環境変数設定手順

## 開発環境 (develop branch)

以下の環境変数をAWS Amplifyのコンソールで設定してください：

### 必須環境変数

```
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://develop.d3pqwcrqokah2b.amplifyapp.com
GOOGLE_CLIENT_ID=847935144046-jsmodsk3bg5i4er2gaufchod8937n7bb.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-6J9t_your_secret_here
NODE_ENV=development
```

## 本番環境 (main branch)

```
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://main.d3pqwcrqokah2b.amplifyapp.com
GOOGLE_CLIENT_ID=847935144046-jsmodsk3bg5i4er2gaufchod8937n7bb.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-6J9t_your_secret_here
NODE_ENV=production
```

## 設定手順

1. AWS Amplifyコンソールにアクセス
2. アプリを選択
3. 「環境変数」セクションに移動
4. 上記の変数を追加
5. デプロイを再実行

## 確認方法

デプロイ後、ログで以下が表示されることを確認：
- `使用するNEXTAUTH_URL: https://develop.d3pqwcrqokah2b.amplifyapp.com`