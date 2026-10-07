# PAMI — a small room on the internet

Pami のポートフォリオサイト。Astro による静的サイトで、**イベント情報だけ microCMS** から取得します。
Works・プロフィールはリポジトリ内のファイルで管理します。

- `/` — 深いグリーンの部屋。中央の細い列に作品サムネイルが漂う
- `/about` — ライムの部屋。日英プロフィール・ポートレート・活動履歴
- `/events`, `/events/[slug]` — 青い部屋。microCMS のイベント
- `/works/[slug]` — 外部 URL を持たない作品の詳細

画面の縦中央に固定された小さなバー（← 戻る / (C) / 次の部屋 →）が共通のフッター兼導線です。
部屋は `PAMI → ABOUT → EVENTS → PAMI` の順に循環します。

---

## 開発

Node.js **22.12 以上**が必要です（`.nvmrc` あり、`package.json` の `engines` にも明記）。古い Node で起動すると、Astro が `Node.js vXX is not supported by Astro!` と表示して止まります。その場合は `nvm use` を実行してください。

```sh
nvm use            # 22.23.2
npm install
npm run dev        # http://localhost:4321
```

microCMS の設定がなくても `src/data/events.ts` のモックイベントで動きます。

| command           | 内容                                  |
| ----------------- | ------------------------------------- |
| `npm run dev`     | 開発サーバー                          |
| `npm run build`   | `dist/` に静的ファイルを生成          |
| `npm run preview` | ビルド結果をローカルで確認            |
| `npm run check`   | `astro check`（TypeScript / Astro 型検査） |

---

## 環境変数

`.env.example` を `.env` にコピーして値を入れてください。`.env` は Git に含まれません。

| 変数                      | 必須         | 説明 |
| ------------------------- | ------------ | ---- |
| `MICROCMS_SERVICE_DOMAIN` | デプロイ時   | サービス ID（`https://xxxx.microcms.io` の `xxxx`） |
| `MICROCMS_API_KEY`        | デプロイ時   | `events` に GET 権限を持つ API キー |
| `SITE_URL`                | デプロイ時   | 公開 URL（canonical / OGP / sitemap / JSON-LD に使用）例: `https://pami.jp` |
| `MICROCMS_REQUIRED`       | 任意         | `true`: キー必須 / `false`: キーなしでもモックで続行 / 未設定: デプロイ時のみ必須 |

**API キーに `PUBLIC_` を付けないでください。** これらはビルド時にだけ読まれ、ブラウザには配信されません（クライアント JS は 0 本です）。

### デプロイ時の安全装置（`astro.config.mjs` の `deploymentGuards`）

ホスティング上のビルド（環境変数 `CI` / `VERCEL` / `NETLIFY` / `CF_PAGES` のいずれかがある）では、以下の場合に**ビルドを失敗**させます。仮 URL やモックイベントのまま公開される事故を防ぐためです。

- `SITE_URL` が未設定（未設定だと URL が仮の `https://pami.example` になる）
- microCMS のキーが未設定（`MICROCMS_REQUIRED=false` を明示した場合を除く）

ローカルの `npm run build` / `npm run dev` は、警告を出すだけでそのまま動きます。

データの取得元は次のとおりです。

- キーあり → microCMS
- キーなし → `src/data/events.ts` のモック（ビルドログに `[events]` の警告）

---

## microCMS 設定（非エンジニア向け）

### 1. API を作る

1. microCMS 管理画面で「API を作成」→「自分で決める」
2. **API 名**: `イベント`
3. **エンドポイント**: `events`
4. **API の型**: **リスト形式**
5. 下の表のとおりフィールドを追加（フィールド ID は**半角英字で表の通り正確に**）

### 2. フィールド（API スキーマ）

| フィールド ID | 表示名       | 種類                     | 必須 | メモ |
| ------------- | ------------ | ------------------------ | ---- | ---- |
| `title`       | タイトル     | テキストフィールド       | 必須 | 例: `PAMI NIGHT #01` |
| `slug`        | スラッグ     | テキストフィールド       | 必須 | URL になる。半角英小文字・数字・ハイフンのみ。例: `pami-night-01`。「重複を許可しない」を ON、「特定のパターンのみ入力を許可する」に `^[a-z0-9]+(-[a-z0-9]+)*$` を推奨 |
| `description` | 概要         | テキストエリア           | 任意 | 一覧・検索結果・SNS シェア用の 1〜2 文 |
| `content`     | 本文         | リッチエディタ           | 任意 | 見出し・リスト・リンク・画像・YouTube 埋め込み可 |
| `startAt`     | 開始日時     | 日時                     | 必須 | 日本時間で入力 |
| `endAt`       | 終了日時     | 日時                     | 任意 | 空なら開始日の終わりまで開催中とみなす |
| `venue`       | 会場名       | テキストフィールド       | 任意 | 例: `Room 2F` |
| `address`     | 会場住所     | テキストフィールド       | 任意 | Google マップへのリンクになる |
| `thumbnail`   | キービジュアル | 画像                   | 任意 | 縦長 4:5 推奨、幅 1200px 以上。画像の「代替テキスト」も入れてください |
| `externalUrl` | 外部リンク   | テキストフィールド       | 任意 | チケットページ等。`https://` から（それ以外は表示されません） |
| `organizer`   | 主催         | テキストフィールド       | 任意 | 空なら `PAMI` |

`id` / `createdAt` / `updatedAt` / `publishedAt` / `revisedAt` は microCMS が自動で付けます（詳細ページの「Posted」は `publishedAt`）。
**ステータス（upcoming / ongoing / past）は入力不要**です。開始・終了日時から自動で判定します（下記「ステータスとビルドのタイミング」参照）。

入力ミスがあっても、サイト全体は壊れないようにしています。

| 状況 | 動き |
| ---- | ---- |
| 任意フィールドが空・空白のみ | 表示しない |
| `slug` が規則外（大文字・空白・日本語など） | コンテンツ ID を URL に使い、ビルドログで警告 |
| `slug` が他のイベントと重複 | **ビルド失敗**（どちらかのページが消えるのを防ぐ） |
| `externalUrl` が `http(s)://` ではない | リンクを出さず、ビルドログで警告 |
| `endAt` が `startAt` より前 | `endAt` を無視 |
| `startAt` が不正 | そのイベントだけスキップし、ビルドログで警告 |

### 3. API キー

「サービス設定 → API キー」で `events` に **GET のみ**許可したキーを作成し、`MICROCMS_API_KEY` に設定します。

### 4. 公開したら自動で反映する（Webhook）

静的サイトなので、記事の公開・更新時にサイトを再ビルドする必要があります。

1. ホスティング側で Deploy Hook URL を発行（Vercel: Project → Settings → Git → Deploy Hooks）
2. microCMS「API 設定 → Webhook → カスタム通知」に、その URL を登録
3. 「コンテンツの公開時・更新時・削除時」にチェック

### 5. ステータスとビルドのタイミング（重要）

このサイトは静的 HTML です。**Upcoming / Now on / Past の表示と、一覧の並び（Now & Next / Archive）は、ビルドした瞬間の日時で固定されます。** 日付が変わっても、再ビルドするまで表示は変わりません。

判定は常に日本時間（Asia/Tokyo）で行います。ビルドするサーバーのタイムゾーンには依存しません。

| 現在時刻 | 表示 |
| -------- | ---- |
| `startAt` より前 | Upcoming |
| `startAt` 以上、`endAt` 以下 | Now on |
| `endAt` より後 | Past |
| `endAt` が空 | 開始日の 23:59:59（日本時間）まで Now on |

運用は次の 2 つを組み合わせる想定です。

1. microCMS Webhook → Deploy Hook（コンテンツの変更をすぐ反映する）
2. **毎日 1 回の定期デプロイ**（例: 毎日 0:05 JST に Deploy Hook を叩く。日付の変化を反映する）

定期デプロイには、GitHub Actions の `schedule` で `curl -X POST <Deploy Hook URL>` を実行する、または Vercel Cron などを使います。
ステータスを秒単位でリアルタイムに変える必要はないため、そのためのクライアント JS は入れていません。

本文 HTML はビルド時にサニタイズしています（`src/lib/sanitize.ts`）。`script` や `style`、イベント属性は除去されます。iframe は YouTube / Vimeo / Spotify / SoundCloud のみ許可しています。

---

## Works の追加

1. 画像を `src/assets/works/` に置く（正方形または 4:5、400px 程度で十分）
2. `src/data/works.ts` で import し、配列に 1 行追加する

```ts
import myWork from '../assets/works/my-work.png';

{ slug: 'my-work', title: 'My Work', year: 2026, category: 'Print', image: myWork, alt: '画像の説明' },
```

| key           | 必須 | 説明 |
| ------------- | ---- | ---- |
| `slug`        | ✓    | `/works/[slug]` の URL |
| `title`       | ✓    | hover 時・詳細ページに表示 |
| `year`        | ✓    | |
| `image`       | ✓    | ローカル画像（自動で WebP・2x に最適化） |
| `category`    |      | |
| `alt`         |      | 画像の説明（省略時はタイトル） |
| `altImage`    |      | 2 枚目の画像。設定すると GIF のように 2 コマで切り替わる |
| `url`         |      | 外部ページへ直接リンク（詳細ページは作られない） |
| `description` |      | 詳細ページの説明文 |

配列の並び順が、トップページの表示順です。
将来 CMS 化する場合は `src/lib/works.ts` の中身だけを差し替えれば、ページ側は変更不要です。

## プロフィールの変更

`src/data/profile.ts` **1 ファイルだけ**を編集します。名前、キャッチ、紹介文（日・英）、メール、リンク、経歴（Exhibition / Media / Award など見出しは自由）、Client を変更できます。
ポートレートは `src/assets/profile/portrait.png` を差し替えてください。

## デザインの調整

- 色・文字サイズ・余白・アニメーション時間: `src/styles/tokens.css`
- 書体: `--font-sans` を差し替えるだけで全体に反映（Web フォントを使う場合は `BaseLayout.astro` で読み込み）
- 部屋ごとの色は `[data-room='…']` ブロック。ブラウザのテーマ色は `BaseLayout.astro` の `THEME_COLOR`
- 星の配置: `Sky` の `seed` を変えると別の（ただし毎回同じ）配置になる

---

## 構成

```
src/
  assets/            画像（works / profile / events のモック）
  components/
    common/          Seo, SiteNav, RoomBar（中央固定バー）, Sky（ピクセル星）, PixelArrow
    home/            Intro, WorkColumn, WorkThumb
    about/           Bio, History, Clients
    events/          EventList, EventMeta, StatusMark, RichText, EventJsonLd
  config/site.ts     サイト名・タイムゾーン・部屋の順番
  data/              works.ts / profile.ts / events.ts（モック）
  layouts/BaseLayout.astro
  lib/               microcms.ts, events.ts, works.ts, sanitize.ts, format.ts, image.ts
  pages/             index, about, events/, works/, 404, robots.txt
  styles/            tokens.css, global.css
  types/             event.ts, work.ts, profile.ts, image.ts
```

- クライアント JS は **0**。hover やラベル、GIF 風の切り替え、星の瞬き、パララックス（CSS scroll-driven animations）、ページ遷移（ネイティブ View Transitions）はすべて CSS で実装しています。非対応のブラウザでは静止した状態で表示されます。
- `prefers-reduced-motion` のときは、すべてのアニメーションと遷移を止めます。
- URL は末尾スラッシュ付き（`/about/`）に統一しています（`trailingSlash: 'always'`）。内部リンクを追加するときも `/` で終えてください。
- SEO は title / description / canonical / OGP / Twitter card / sitemap / robots.txt に対応しています。イベント詳細には schema.org/Event の JSON-LD も入れています。

## デプロイ

完全な静的サイトなので、`npm run build` → `dist/` を任意の静的ホスティングに置けば動きます。

**Vercel の場合**

1. リポジトリを Import（Framework: Astro は自動検出）
2. Environment Variables に `MICROCMS_SERVICE_DOMAIN`, `MICROCMS_API_KEY`, `SITE_URL` を設定（Production と Preview の両方。未設定だとビルドが止まります）
3. Node.js バージョンを 22.x 以上に
4. Deploy Hook を作り、microCMS の Webhook に登録（上記）

Netlify / Cloudflare Pages も同様です（Build command: `npm run build`、Output: `dist`）。
