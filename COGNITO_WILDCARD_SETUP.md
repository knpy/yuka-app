# AWS Cognito ワイルドカード設定ガイド

## 問題
AWS AmplifyはデプロイごとにURLが変わるため、事前にCognitoに登録することができない。

## 解決策
AWS Cognitoのリダイレクトキープに、ワイルドカードまたは正規表現パターンを設定する。

## 設定手順

### 1. AWS Cognito コンソールにアクセス
- https://console.aws.amazon.com/cognito/
- User Pool: `ap-northeast-1_MvXXrt5uB` を選択

### 2. App Integration タブ > App clients
- App client: `1gujltpeo30a92aogcsv8os2fb` を選択

### 3. Callback URLs (redirectSignIn) を更新
**現在の設定:**
```
http://localhost:3000/
https://dev.d3s3wf0vy6h32k.amplifyapp.com/
https://main.d3s3wf0vy6h32k.amplifyapp.com/
```

**新しい設定（ワイルドカード対応）:**
```
http://localhost:3000/
https://*.d3s3wf0vy6h32k.amplifyapp.com/
```

### 4. Sign out URLs (redirectSignOut) を更新
**新しい設定:**
```
http://localhost:3000/
https://*.d3s3wf0vy6h32k.amplifyapp.com/
```

### 5. Google Cloud Console側も更新
- https://console.cloud.google.com/apis/credentials
- OAuth 2.0 Client ID を選択
- 承認済みのリダイレクト URI に追加:
```
https://ap-northeast-1mvxxrt5ub.auth.ap-northeast-1.amazoncognito.com/oauth2/idpresponse
```

## 注意事項
- ワイルドカード（*）は一部のAWSサービスでサポートされていない場合があります
- 代替案として、カスタムドメインの使用を検討してください

## カスタムドメイン設定（推奨）
1. Route53でドメイン取得
2. AWS Certificate Managerで証明書発行
3. Amplifyでカスタムドメイン設定
4. 固定URLで運用