# AWS Cognito Attribute Mapping 設定ガイド

## 問題
Google OAuthでログイン成功しているが、メールアドレスなどの属性情報が取得できていない（N/A表示）

## 解決手順

### 1. AWS Cognitoコンソールにアクセス
- https://console.aws.amazon.com/cognito/
- User Pool: `ap-northeast-1_MvXXrt5uB` を選択

### 2. Sign-in experience タブ
- **Federated identity provider sign-in** の設定を確認

### 3. Identity providers タブ → Google
- **Attribute mapping** を設定

### 4. 必要なattribute mapping設定:
```
Google attribute    →  User pool attribute
email              →  Email
name               →  Name  
given_name         →  Given name
family_name        →  Family name
picture            →  Picture
```

### 5. User pool properties → Attributes
- **Required attributes** に `email` が含まれているか確認
- **Mutable attributes** に必要な属性が含まれているか確認

### 6. App integration → App clients → Settings
- **Read attributes** に以下が含まれているか確認:
  - email
  - name
  - given_name
  - family_name
  - picture

## 設定後の確認
1. Cognitoの設定を保存
2. アプリケーションで再度ログインテスト
3. 属性情報が正しく表示されるか確認