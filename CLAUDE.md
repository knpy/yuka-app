# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供します。

## ⚠️ 重要事項：MVP開発原則

### MVP（Minimum Viable Product）を常に意識すること

**Claude Codeは常にMVP原則に従って開発してください：**

1. **シンプル第一** - 複雑な実装よりもシンプルで動作する解決策を優先
2. **実用性重視** - 理論的な完璧さより、実際に使える機能を重視
3. **段階的改善** - 小さな改善を積み重ね、大きなリファクタリングは避ける
4. **コスト効率** - AWS無料利用枠内での開発を絶対条件とする
5. **迅速な検証** - 動作するプロトタイプを早期に作成し、検証・改善

### 実装時の判断基準
- ✅ **単純で効果的** - 10行で解決できることを100行で実装しない
- ✅ **即座に価値提供** - ユーザーがすぐに恩恵を受けられる
- ✅ **保守しやすい** - 他の開発者が理解・修正しやすい
- ✅ **コスト意識** - AWS無料利用枠を超えない設計
- ❌ **過度な最適化** - 現在不要な高度な機能
- ❌ **完璧主義** - すべてのエッジケースに対応
- ❌ **技術的負債** - 将来の拡張性のみを考慮した複雑な設計

## プロジェクト概要

**日報作成支援アプリ** - Googleカレンダーの予定を基に、AIが自動で日報を生成するWebアプリケーション

### ターゲットユーザー
プロジェクトオーナー自身（個人利用）

### 技術スタック
- **フロントエンド**: Next.js + TypeScript
- **バックエンド/ホスティング**: AWS Amplify
- **認証**: AWS Amplify Auth (Google OAuth)
- **外部API**: Google Calendar API
- **AI/LLM**: OpenAI API または AWS Bedrock
- **デプロイ**: AWS Amplify Hosting

### ゴール（MVP）
- Googleアカウントでログインできる
- Googleカレンダーの情報を基に、AIが日報を生成できる
- 月額0円での運用（AWS無料利用枠内）

## 🔒 型安全性とコード品質の強制ルール

### TypeScript型安全性の絶対原則
**Claude Codeは以下の型安全性ルールを絶対に遵守してください：**

1. **型エラーゼロ原則** - `npm run type-check`でエラーが出ない状態を維持
2. **`any`型の禁止** - 明示的な型定義を必須とする
3. **外部ライブラリ設定時の型安全性** - 設定ファイルでも適切な型を使用
4. **テストファイルの型安全性** - Jest関連の型定義を適切に設定

### 型エラー対応の優先順位
1. **設定ファイルの型安全性** - JSONファイルもTypeScriptで型チェック
2. **外部ライブラリの型定義** - `@types/`パッケージの適切なインストール
3. **テスト環境の型設定** - Jest, Testing Libraryの型定義統合
4. **constアサーション** - リテラル型が必要な場合の適切な使用

### 型エラー解決の標準手順
```typescript
// ❌ 悪い例：any型を使用
const config: any = { ... }

// ✅ 良い例：適切な型定義
interface ConfigType {
  responseType: 'code' | 'token';
}
const config: ConfigType = {
  responseType: 'code' as const
}

// ❌ 悪い例：型定義なしのテスト
expect(element).toBeInTheDocument() // 型エラー

// ✅ 良い例：適切な型定義
import '@testing-library/jest-dom'
expect(element).toBeInTheDocument() // 型安全
```

### 必須デベロッパー依存関係
```json
{
  "@types/jest": "^29.0.0",
  "@types/testing-library__jest-dom": "^5.14.0"
}
```

## 🧪 テスト駆動開発（TDD）原則

### TDD サイクルの徹底
**Claude Codeは必ずTDDサイクルに従って開発してください：**

1. **Red** → 失敗するテストを書く
2. **Green** → テストが通る最小限のコードを書く  
3. **Refactor** → コードを改善する

### テスト実装の優先順位
1. **Unit Tests** - 個別の関数・コンポーネントのテスト
2. **Integration Tests** - API連携、コンポーネント間のテスト
3. **E2E Tests** - ユーザーワークフローのテスト

### テストツール構成
```bash
# テストフレームワーク
- Jest + React Testing Library (フロントエンド)
- Vitest (高速なユニットテスト)
- Playwright (E2Eテスト)

# テスト実行コマンド
npm test              # 全テスト実行
npm run test:unit     # ユニットテスト
npm run test:e2e      # E2Eテスト
npm run test:watch    # ウォッチモード
```

### テスト命名規則
```javascript
// ファイル命名
ComponentName.test.tsx     // コンポーネントテスト
utils.test.ts             // ユーティリティテスト
api.integration.test.ts   // 統合テスト
app.e2e.test.ts          // E2Eテスト

// テストケース命名
describe('ComponentName', () => {
  it('should render correctly when valid props are provided', () => {
    // テストロジック
  })
  
  it('should handle error when API call fails', () => {
    // エラーハンドリングテスト
  })
})
```

## 開発コマンド

### Next.js アプリケーション

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm run start

# リント実行
npm run lint

# 型チェック
npm run type-check

# テスト実行
npm test
npm run test:unit
npm run test:e2e
npm run test:watch
```

### AWS Amplify

```bash
# Amplify CLI初期化
amplify init

# バックエンド環境設定
amplify configure project

# 認証追加
amplify add auth

# 関数追加（Lambda）
amplify add function

# ローカル環境起動
amplify mock

# デプロイ
amplify push

# 環境確認
amplify status
```

## アーキテクチャ概要

### システム構成図
```
[ユーザー] 
    ↓
[Next.js Frontend (Amplify Hosting)]
    ↓
[Amplify Auth (Google OAuth)]
    ↓
[Google Calendar API] → [Lambda Function] → [AI/LLM API]
    ↓
[日報生成結果]
```

### フロントエンド構造
```
src/
├── components/          # 再利用可能なUIコンポーネント
│   ├── auth/           # 認証関連コンポーネント
│   ├── calendar/       # カレンダー関連コンポーネント
│   └── report/         # 日報関連コンポーネント
├── pages/              # Next.js ページ
│   ├── index.tsx       # ホームページ
│   ├── login.tsx       # ログインページ
│   └── report.tsx      # 日報生成ページ
├── hooks/              # カスタムReactフック
├── services/           # API呼び出しロジック
├── types/              # TypeScript型定義
├── utils/              # ユーティリティ関数
└── __tests__/          # テストファイル
```

### バックエンド構造（Lambda Functions）
```
amplify/backend/function/
├── generateReport/     # 日報生成Lambda関数
│   ├── src/index.js   # メイン処理
│   └── package.json   # 依存関係
└── calendarSync/      # カレンダー同期Lambda関数
    ├── src/index.js
    └── package.json
```

## データフロー

### 日報生成フロー
1. **認証** → Google OAuth でログイン
2. **権限確認** → Googleカレンダーアクセス許可
3. **データ取得** → 当日の予定一覧を取得
4. **AI処理** → Lambda経由でAIに日報生成依頼
5. **結果表示** → 生成された日報をフロントエンドに表示
6. **コピー** → ユーザーがテキストをコピー

### セッション管理
- AWS Amplify Authによる認証状態管理
- Google Calendar APIアクセストークンの安全な保存
- フロントエンドでの一時的な状態管理（React State）

## 主要な依存関係

### フロントエンド
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@aws-amplify/ui-react": "^6.0.0",
    "aws-amplify": "^6.0.0",
    "googleapis": "^128.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "playwright": "^1.40.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

### バックエンド（Lambda）
- `axios` - HTTP リクエスト
- `google-auth-library` - Google API認証
- `googleapis` - Google Calendar API
- `openai` または `@aws-sdk/client-bedrock` - AI/LLM API

## セキュリティとコスト管理

### セキュリティベストプラクティス
- 環境変数でAPIキー管理（`.env.local`）
- HTTPSのみの通信
- OAuth認証によるセキュアなログイン
- AWSリソースの最小権限設定

### AWS無料利用枠の管理
- **Lambda**: 月100万リクエスト（十分）
- **Amplify Hosting**: 月5GB転送量（個人利用で十分）
- **API Gateway**: 月100万APIコール（十分）
- **AWS Budgets**でコストアラート設定

### モニタリング設定
```bash
# AWSコストアラート設定
aws budgets create-budget --account-id YOUR_ACCOUNT_ID \
  --budget file://budget.json

# CloudWatchログ監視
aws logs describe-log-groups
```

## 開発プロセスとGit運用ルール

### ⚠️ **絶対禁止事項**
- **mainブランチでの直接作業・コミット**
- **mainブランチへの直接プッシュ**
- **テストが通らない状態でのコミット**

### ✅ **必須手順（TDD適用）**
1. **機能ブランチ作成**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/機能名
   ```

2. **TDDサイクル実行**
   ```bash
   # Red: 失敗するテストを書く
   npm test
   
   # Green: テストが通るコードを書く
   npm test
   
   # Refactor: コードを改善
   npm test
   ```

3. **コミット前チェック（必須）**
   ```bash
   npm run lint      # リント通過
   npm run type-check # 型チェック通過
   npm test          # 全テスト通過
   npm run build     # ビルド成功
   ```

### 🚨 **CI/CD失敗時の対応ルール**

**Claude Codeは以下の手順でCI/CD失敗を即座に修正します：**

1. **CI失敗検知時**
   ```bash
   gh run list --limit 5           # 最新のrun確認
   gh run view [RUN_ID]            # 失敗詳細確認
   gh run view [RUN_ID] --log-failed # 失敗ログ確認
   ```

2. **失敗箇所の修正**
   - **型エラー**: TypeScript型定義を適切に修正
   - **テストエラー**: テストコードまたは実装コードを修正
   - **リントエラー**: ESLintルールに従って修正
   - **ビルドエラー**: 依存関係やインポートを修正

3. **修正後の検証**
   ```bash
   npm run lint && npm run type-check && npm test && npm run build
   ```

4. **修正コミット**
   ```bash
   git add .
   git commit -m "fix: CI/CD失敗修正 - [具体的な修正内容]"
   git push origin ブランチ名
   ```

### ⚠️ **CI/CD通過の絶対条件**
- **全てのジョブが緑色**: lint/type-check/test/buildが全て成功
- **型エラーゼロ**: TypeScriptコンパイルエラーなし  
- **テスト通過率100%**: 全テストケースが成功
- **リント違反ゼロ**: ESLintエラー・警告なし
- **ビルド成功**: Next.js本番ビルドが正常完了

### 🤖 **Claude Code自動実行ルール**
Claude Codeは以下を**自動的に実行**します：

1. **作業開始時**
   ```bash
   git fetch origin
   git status
   git checkout main
   git pull origin main
   ```

2. **TDDサイクルでの開発**
   - テストファースト開発の徹底
   - 各サイクルでのテスト実行確認
   - 全テスト通過後のコミット

3. **コミット前検証**
   ```bash
   npm run lint && npm run type-check && npm test && npm run build
   ```

4. **プルリクエスト作成前**
   ```bash
   git fetch origin
   git push -u origin ブランチ名
   gh pr create --title "タイトル" --body "詳細"
   ```

### ブランチ命名規則
- **main**: 本番相当のコード（直接編集禁止）
- **feature/機能名**: 新機能開発
- **fix/問題名**: バグ修正
- **test/テスト内容**: テスト追加・改善
- **docs/内容**: ドキュメント更新
- **chore/作業内容**: 設定変更・メンテナンス

### 自動コミット・プルリクエストのタイミング

Claude Codeは以下のタイミングで**自動的に**gitコミットとプルリクエストを実行します：

#### 必須コミットタイミング
1. **新機能の実装完了時**
   - 新しいコンポーネント、API、または機能の追加が完了した時
   - 関連するテストとドキュメントも含めてコミット

2. **テスト追加・修正時**
   - TDDサイクルに従ったテストの追加・更新
   - テストが通ることを確認してからコミット

3. **バグ修正完了時**
   - 問題の修正とテストが完了した時
   - 修正内容を説明するコミットメッセージ

4. **設定変更時**
   - package.json、amplify設定、環境変数の変更
   - プロジェクト構成に影響する変更

#### プルリクエスト作成タイミング
1. **機能ブランチでの作業完了時**
   - フィーチャーブランチでの開発が完了した時
   - 全テストが通ることを確認済み

2. **レビュー可能な単位での変更完了時**
   - 関連する複数の変更をまとめてレビュー依頼

### コミットメッセージ形式
```
[カテゴリ] 簡潔な変更内容

詳細な説明（必要に応じて）
- 変更点1
- 変更点2
- テスト内容

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

#### カテゴリ例
- `feat:` 新機能追加
- `fix:` バグ修正
- `test:` テスト追加・修正
- `docs:` ドキュメント更新
- `style:` フォーマット、リント修正
- `refactor:` リファクタリング
- `chore:` 設定ファイル、依存関係更新
- `ci:` CI/CD設定変更

### ブランチ運用ルール

#### ⚠️ **絶対禁止事項**
- **mainブランチでの直接作業・コミット**
- **mainブランチへの直接プッシュ**
- **テストが通らない状態でのコミット**

#### ✅ **必須手順（TDD適用）**
1. **機能ブランチ作成**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/機能名
   ```

2. **TDDサイクル実行**
   ```bash
   # Red: 失敗するテストを書く
   npm test
   
   # Green: テストが通るコードを書く
   npm test
   
   # Refactor: コードを改善
   npm test
   ```

3. **コミット前チェック**
   ```bash
   npm run lint      # リント通過
   npm run type-check # 型チェック通過
   npm test          # 全テスト通過
   npm run build     # ビルド成功
   ```

#### 🤖 **Claude Code自動実行ルール**
Claude Codeは以下を**自動的に実行**します：

1. **作業開始時**
   ```bash
   git fetch origin
   git status
   git checkout main
   git pull origin main
   ```

2. **TDDサイクルでの開発**
   - テストファースト開発の徹底
   - 各サイクルでのテスト実行確認
   - 全テスト通過後のコミット

3. **コミット前検証**
   ```bash
   npm run lint && npm run type-check && npm test && npm run build
   ```

4. **プルリクエスト作成前**
   ```bash
   git fetch origin
   git push -u origin ブランチ名
   gh pr create --title "タイトル" --body "詳細"
   ```

### ブランチ命名規則
- **main**: 本番相当のコード（直接編集禁止）
- **feature/機能名**: 新機能開発
- **fix/問題名**: バグ修正
- **test/テスト内容**: テスト追加・改善
- **docs/内容**: ドキュメント更新
- **chore/作業内容**: 設定変更・メンテナンス

## CI/CD Pipeline

### GitHub Actions 構成

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint check
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Unit tests
        run: npm run test:unit
      
      - name: E2E tests
        run: npm run test:e2e
      
      - name: Build check
        run: npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Amplify
        run: amplify push --yes
```

### 開発ワークフロー

1. **ローカル開発**
   ```bash
   npm run dev          # 開発サーバー起動
   npm run test:watch   # テストウォッチモード
   ```

2. **機能開発完了時**
   ```bash
   npm test             # 全テスト実行
   npm run build        # ビルド確認
   git add .
   git commit -m "feat: 新機能追加"
   ```

3. **プルリクエスト**
   ```bash
   git push -u origin feature/機能名
   gh pr create
   ```

## 注意事項とベストプラクティス

### 必須チェック項目
- ✅ AWS無料利用枠を超えない設計
- ✅ 全テストが通ること
- ✅ TypeScript型安全性の確保
- ✅ セキュリティベストプラクティスの遵守
- ✅ パフォーマンスの考慮（必要最小限）

### 禁止事項
- ❌ APIキーのハードコーディング
- ❌ mainブランチへの直接プッシュ
- ❌ テスト未実装での機能追加
- ❌ AWS無料枠を超える可能性のある実装

### 推奨事項
- 🔄 短いイテレーションでの開発
- 📝 わかりやすいコミットメッセージ
- 🧪 テストファーストの開発
- 📊 AWS コストの定期的な確認
- 🔍 コードレビューの活用