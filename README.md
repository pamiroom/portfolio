# PAMI — a small room on the internet

Pami のポートフォリオサイト。Astro による静的サイトで、**イベント情報だけ microCMS** から取得します。
Works・プロフィールはリポジトリ内のファイルで管理します。

- `/` — 深いグリーンの部屋。中央の細い列に作品サムネイルが漂う
- `/about` — ライムの部屋。日英プロフィール・ポートレート・活動履歴
- `/events`, `/events/[slug]` — 青い部屋。microCMS のイベント
- `/works/[slug]` — 外部 URL を持たない作品の詳細

画面の縦中央に固定された小さなバー（← 戻る / (C) / 次の部屋 →）が共通のフッター兼導線です。
部屋は `PAMI → ABOUT → EVENTS → PAMI` の順に循環します。

### ホスティング構成

|            | 本番                         | プレビュー（編集者専用）                     |
| ---------- | ---------------------------- | -------------------------------------------- |
| URL        | https://pami.ooo             | https://preview.pami.ooo                     |
| ホスティング | XServer レンタルサーバー       | Cloudflare Workers（Worker 名 `pami-preview`） |
| 中身       | Astro の静的 HTML（`dist/client/`） | 同じ静的 HTML ＋ `/preview/events/[contentId]/` だけをリクエスト時に生成 |
| microCMS   | ビルド時に公開済みイベントを取得 | リクエスト時に下書き（draftKey）を取得          |

Astro は `output: 'static'` のままで、全ページを事前生成します。`@astrojs/cloudflare` アダプタは、`prerender = false` のプレビュー用ルート 1 つのためだけに入れています。

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
| `npm run build`   | `dist/client/` に静的サイト（XServer 用）、`dist/server/` にプレビュー Worker を生成 |
| `npm run preview` | ビルド結果を Cloudflare のランタイム（workerd）でローカル実行。プレビュールートも動く |
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

**API キーに `PUBLIC_` を付けないでください。** microCMS の 2 つは `astro:env` のサーバー専用シークレット（`astro.config.mjs` の `env.schema`）として読み込みます。バンドルに値が埋め込まれることはなく、ブラウザにも配信されません（クライアント JS は 0 本です）。

| いつ読むか | どこから | 用途 |
| ---------- | -------- | ---- |
| ビルド時   | `.env` / ビルド環境の変数 | 静的なイベントページの生成 |
| リクエスト時（プレビュー Worker） | Cloudflare の **Runtime Secrets**（ローカルでは `.dev.vars`、なければ `.env`） | `/preview/events/…` での下書き取得 |

ローカルで Worker を動かすときは、`.dev.vars.example` を `.dev.vars` にコピーします（`.dev.vars` は Git に含まれません）。`.env` があれば省略できます。
なお、`npm run build` のたびに Cloudflare の Vite プラグインがローカル用の `dist/server/.dev.vars`（`.env` の値のコピー）を作ります。`dist/` は Git 対象外で、`wrangler deploy` もこのファイルをアップロードしません。それでも、`dist/server/` を手作業でどこかへコピーしないでください。

### デプロイ時の安全装置（`astro.config.mjs` の `deploymentGuards`）

ホスティング上のビルド（環境変数 `CI` / `WORKERS_CI` / `VERCEL` / `NETLIFY` / `CF_PAGES` のいずれかがある。Cloudflare Workers Builds もこれに該当）では、以下の場合に**ビルドを失敗**させます。仮 URL やモックイベントのまま公開される事故を防ぐためです。

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

静的サイトなので、記事の公開・更新時にサイトを再ビルドする必要があります。本番は GitHub Actions がビルドして XServer へ配置します（下記「デプロイ」参照）。microCMS からは `repository_dispatch` で起動します。

1. GitHub で **fine-grained personal access token** を作成します
   - Repository access: `pamiroom/portfolio` のみ
   - Permissions: **Contents: Read and write**（`repository_dispatch` の送信に必要。ほかの権限は付けません）
   - 有効期限を付け、期限前に作り直します
2. microCMS「API 設定 → Webhook → GitHub Actions」を追加
   - ユーザー名 / リポジトリ名: `pamiroom` / `portfolio`
   - トークン: 1 のトークン
   - トリガーイベント（`event_type`）: **`microcms_build`**
3. 「コンテンツの公開時・更新時・削除時」にチェック

Webhook から起動した場合も、常に `main` の最新コミットをビルドします。

### 5. 画面プレビュー（下書きの確認）

「API 設定 → 画面プレビュー」に、次の URL を**そのまま**入力します。

```
https://preview.pami.ooo/preview/events/{CONTENT_ID}/?draftKey={DRAFT_KEY}
```

- `{CONTENT_ID}` と `{DRAFT_KEY}` は microCMS が置き換えます。プレビューは **slug ではなくコンテンツ ID** で取得するため、slug が未入力・変更中でも確認できます。
- 表示は公開ページと同じ部品（`EventDetail`）で描画し、上部に `✦ UNPUBLISHED PREVIEW` が付きます。
- プレビューのページには `noindex,nofollow`、`Cache-Control: private, no-store`、`Referrer-Policy: no-referrer` が付きます。canonical と JSON-LD は出さず、sitemap にも含めません。`preview.pami.ooo` 上の全レスポンスにも `X-Robots-Tag: noindex, nofollow` が付きます。
- draftKey は microCMS への API リクエストにしか使いません。HTML・リンク・ログには出しません（Workers Logs もこのために無効にしています）。
- リンクの不備は 400、存在しない（または期限切れの）下書きは 404、microCMS や通信の障害は 503 を返します。エラー詳細や API キーは表示しません。モックに切り替わることもありません。
- 公開済みのコンテンツを開いた場合は、公開中の内容がそのまま表示されます（microCMS の仕様）。

### 6. ステータスとビルドのタイミング（重要）

このサイトは静的 HTML です。**Upcoming / Now on / Past の表示と、一覧の並び（Now & Next / Archive）は、ビルドした瞬間の日時で固定されます。** 日付が変わっても、再ビルドするまで表示は変わりません。

判定は常に日本時間（Asia/Tokyo）で行います。ビルドするサーバーのタイムゾーンには依存しません。

| 現在時刻 | 表示 |
| -------- | ---- |
| `startAt` より前 | Upcoming |
| `startAt` 以上、`endAt` 以下 | Now on |
| `endAt` より後 | Past |
| `endAt` が空 | 開始日の 23:59:59（日本時間）まで Now on |

運用は次の 2 つを組み合わせています（どちらも `.github/workflows/deploy-xserver.yml`）。

1. microCMS Webhook → `repository_dispatch`（コンテンツの変更をすぐ反映する）
2. **毎時 5 分の定期デプロイ**（`cron: '5 * * * *'`。時間の経過によるステータスの変化を反映する）

毎時にしているのは、イベントの開始・終了が時刻単位だからです（例: 18:00〜21:00）。1 日 1 回（0:05）では、夜のイベントは当日ずっと Upcoming のままで、翌日には Past になり、Now on が一度も表示されません。
リポジトリは public なので Actions の実行時間はかかりません。rsync は `--checksum` で内容が同じファイルを書き換えないため、変化のない回は XServer にほぼ何も書き込みません。
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
    events/          EventDetail（公開ページとプレビューで共有）, EventList, EventMeta, StatusMark, RichText, EventJsonLd
  config/site.ts     サイト名・タイムゾーン・部屋の順番
  data/              works.ts / profile.ts / events.ts（モック）
  layouts/BaseLayout.astro
  lib/               microcms.ts, events.ts, works.ts, sanitize.ts, format.ts, image.ts
  pages/             index, about, events/, works/, 404, robots.txt
                     preview/events/[contentId].astro（Cloudflare 上でだけ動くプレビュー）
  worker.ts          プレビュー Worker の入口（静的ファイル配信、noindex、末尾スラッシュ）
  styles/            tokens.css, global.css
  types/             event.ts, work.ts, profile.ts, image.ts
scripts/xserver/     本番デプロイ用の検査スクリプト（成果物の監査・配置先の検査・smoke test）
.github/workflows/   deploy-xserver.yml（GitHub Actions → XServer）
```

- クライアント JS は **0**。hover やラベル、GIF 風の切り替え、星の瞬き、パララックス（CSS scroll-driven animations）、ページ遷移（ネイティブ View Transitions）はすべて CSS で実装しています。非対応のブラウザでは静止した状態で表示されます。
- `prefers-reduced-motion` のときは、すべてのアニメーションと遷移を止めます。
- URL は末尾スラッシュ付き（`/about/`）に統一しています（`trailingSlash: 'always'`）。内部リンクを追加するときも `/` で終えてください。
- SEO は title / description / canonical / OGP / Twitter card / sitemap / robots.txt に対応しています。イベント詳細には schema.org/Event の JSON-LD も入れています。

## デプロイ

### 本番: pami.ooo（GitHub Actions → XServer）

`.github/workflows/deploy-xserver.yml` が、ビルドから XServer への配置、公開サイトの確認までを自動で行います。

```
main への push / microCMS Webhook / 手動実行 / 毎時 5 分
  → npm ci → npm run check → npm run build（microCMS 実データ）
  → 成果物の監査 → SSH 疎通確認（読み取りのみ）
  → rsync で dist/client/ の中身 → public_html/
  → https://pami.ooo の動作確認（smoke test） → Summary
```

**起動条件**

| トリガー | 用途 |
| -------- | ---- |
| `push`（`main` のみ） | コードの変更 |
| `repository_dispatch`（`microcms_build`） | microCMS の公開・更新・削除 |
| `workflow_dispatch` | 手動実行（Actions → *Deploy pami.ooo (XServer)* → Run workflow、ブランチは `main`） |
| `schedule`（`5 * * * *`） | イベントのステータスの更新 |

- PR ではデプロイしません。`main` 以外のブランチで手動実行しても、ジョブはスキップされます。
- `concurrency: pami-production-deploy` によって、本番デプロイは常に 1 つずつ実行されます。実行中の同期は中断されず、後から来た実行が待ちます。
- 権限は `contents: read` だけです。

**GitHub Secrets（Settings → Secrets and variables → Actions）**

| Secret | 内容 |
| ------ | ---- |
| `MICROCMS_SERVICE_DOMAIN` | microCMS のサービス ID |
| `MICROCMS_API_KEY` | GET のみの API キー |
| `XSERVER_SSH_HOST` | XServer の SSH ホスト名 |
| `XSERVER_SSH_USER` | XServer のアカウント名 |
| `XSERVER_SSH_PRIVATE_KEY` | デプロイ専用の SSH 秘密鍵（公開鍵を XServer に登録） |
| `XSERVER_SSH_KNOWN_HOSTS` | XServer のホスト鍵（known_hosts 形式、`[ホスト名]:10022 ssh-ed25519 …`）。XServer 管理画面のフィンガープリントと照合済みのもの |
| `XSERVER_DEPLOY_PATH` | `/home/<アカウント>/pami.ooo/public_html` |

`SITE_URL=https://pami.ooo` と `MICROCMS_REQUIRED=true` はワークフローに固定で書いてあります。SSH のポートは XServer 固定の **10022** です。

**配置するもの**: **`dist/client/` の中身**を `public_html/` 直下に置きます（`dist/client/index.html` → `public_html/index.html`）。`dist/server/`（プレビュー Worker）は配置しません。

**安全装置**

- 本番デプロイは `main` 以外からは実行されません。
- ビルドでは、`SITE_URL` や microCMS のキーがない場合、または microCMS の取得に失敗した場合にビルドを止めます。モックで公開されることはありません。
- 成果物の監査（`scripts/xserver/check-artifact.sh`）: 必須ページと `_astro/` があること、`pami.example`・API キーの値・`.env`・`.dev.vars`・`wrangler.json`・`preview/` が含まれないことを確認します。1 つでも引っかかれば配置しません。
- 配置先の検査（`scripts/xserver/guard-deploy-path.sh`）: `/home/<アカウント>/pami.ooo/public_html` の形以外は拒否します（空文字、`/`、`/home`、`..`、別ドメインなど）。
- SSH は `BatchMode yes`・`StrictHostKeyChecking yes`・`UpdateHostKeys no` で接続します。ホスト鍵は実行時に取得せず、Secret `XSERVER_SSH_KNOWN_HOSTS` に**固定**した鍵だけを信頼します。Secret が空・形式が不正・`[ホスト]:10022` の行がない場合は、接続せずに失敗します。秘密鍵・ホスト鍵・ホスト・ユーザー・パスは、権限 600 のファイルと ssh_config にだけ書きます。ログには出しません。
- rsync はサーバー上の `.well-known/`・`.htaccess`・`.user.ini` を**更新も削除もしません**。Cloudflare 専用の `_headers`・`.assetsignore` は送りません。`public_html` を消す操作（`rm -rf` など）は一切しません。
- `--delete-after` を使うので、ビルドから消えたファイルは、すべてを配置し終えた後に本番からも消えます。同期前に dry-run で、追加と削除の件数をログに出します。

**smoke test**（`scripts/xserver/smoke.sh`）: `/`、`/about/`、`/events/` と、最初のイベント詳細ページについて、次を確認します。

- HTTP 200 と HTML が返ること
- サイト固有のマークアップがあること
- `X-Robots-Tag: noindex` が**付いていない**こと（付いていれば、それはプレビュー Worker の応答）

ビルドした HTML と完全に一致しない場合は、警告だけを出します（キャッシュが残っている可能性があるため）。smoke test が失敗しても、配置は完了していて巻き戻しません。実行が赤くなって、知らせるだけです。DNS の切り替え中など、`pami.ooo` がまだ XServer を向いていないときは、手動実行の **`skip_smoke`** にチェックを入れてください。

**トラブルシューティング**

| 症状 | 確認すること |
| ---- | ------------ |
| Build で `[deployment-guards]` | GitHub Secrets の `MICROCMS_*` が空ではないか |
| Build で microCMS の `fetch API response status` | API キーの権限・期限、microCMS の障害 |
| `XSERVER_SSH_KNOWN_HOSTS is empty` / `not a valid known_hosts entry` | Secret が登録されているか、known_hosts の 1 行がそのまま入っているか |
| `…has no key for the SSH host on port 10022` | 行の先頭が `[ホスト名]:10022` か（ポートなしの形は 22 番用で、一致しません）。ホスト名が `XSERVER_SSH_HOST` と同じか |
| `Host key verification failed` | XServer のホスト鍵が変わった可能性があります。管理画面のフィンガープリントを確認し、照合できた場合だけ Secret を更新してください |
| `Permission denied (publickey)` | 公開鍵が XServer に登録されているか、秘密鍵が改行も含めて正しく登録されているか |
| `Deploy path guard: …` | `XSERVER_DEPLOY_PATH` が `/home/<アカウント>/pami.ooo/public_html` の形か |
| SSH 疎通確認で失敗 | 配置先のディレクトリが XServer 上に存在し、書き込めるか |
| smoke test が `noindex` で失敗 | `pami.ooo` がプレビュー Worker（Cloudflare）を向いていないか |
| smoke test が 404 で失敗 | DNS が XServer を向いているか、ドメイン設定が正しいか |
| 定期実行が止まった | public リポジトリでは、60 日間コミットがないと `schedule` が自動で無効になります。Actions 画面から再度有効にしてください |

### プレビュー: preview.pami.ooo（Cloudflare Workers）

設定は `wrangler.jsonc` にすべて書いてあり、Dashboard の自動設定には頼りません。

- Worker 名 `pami-preview`、`compatibility_date: 2026-10-06`、`nodejs_compat`
- 入口は `src/worker.ts`（`@astrojs/cloudflare/handler` を包む薄いラッパー）
- `assets.run_worker_first: true`（全レスポンスに noindex を付けるため）
- KV（セッション）と Images のバインディングは使いません（`session: false`、`imageService: 'compile'`）
- compatibility_date は、同梱の workerd が対応する最新日付にしています（ローカルと本番の挙動をそろえるため）

**Workers Builds（Settings → Build）**

| 項目 | 値 |
| ---- | -- |
| Git repository | `pamiroom/portfolio` |
| Root directory | `/` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Non-production branch deploy command（Preview） | `npx wrangler preview` |

**Build variables（ビルド時。静的ページの生成用）**

| 変数 | 値 |
| ---- | -- |
| `MICROCMS_SERVICE_DOMAIN` | サービス ID |
| `MICROCMS_API_KEY` | GET のみの API キー（Secret として登録） |
| `MICROCMS_REQUIRED` | `true` |
| `SITE_URL` | `https://pami.ooo`（canonical は本番を指す） |
| `NODE_VERSION` | `22.23.2` |

**Runtime secrets（Worker 実行時。プレビューでの下書き取得用）**

Settings → Variables and Secrets に **Secret** 型で登録します（`npx wrangler secret put <NAME>` でも可）。

| 変数 | 値 |
| ---- | -- |
| `MICROCMS_SERVICE_DOMAIN` | サービス ID |
| `MICROCMS_API_KEY` | ビルドと同じ GET のみのキーで可 |

ブランチごとの Preview（`npx wrangler preview`）は、本番 Worker とは別に secret を持ちます。Preview でもプレビュールートを動かす場合は、同じ 2 つを `npx wrangler preview secret` か、Dashboard の Preview 用設定（base config）にも登録してください。

ビルド変数とランタイム secret は**別物**です。ビルド変数はビルド中にだけ存在し、Worker の実行時には渡りません。そのため、同じ値を両方に登録します。Secret 型は `wrangler deploy` で上書きされません。

**ドメイン**: Worker の Settings → Domains & Routes で、Custom Domain に `preview.pami.ooo` を追加します（pami.ooo の DNS が Cloudflare にある必要があります）。
