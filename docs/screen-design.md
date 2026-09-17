# TicketFlow 画面設計書

## 1. 画面設計概要

TicketFlowは、Google Apps Script（GAS）を使用した
小規模な開発チーム向けのチケット管理Webアプリケーションである。

本設計書では、MVPで実装する画面構成、画面遷移、
各画面の表示項目、操作、および入力ルールを定義する。

---

## 2. 画面一覧

MVPでは以下の4画面を実装する。

| 画面ID | 画面名 | 役割 |
|---|---|---|
| SCR-01 | チケット一覧 | チケットを一覧表示・絞り込みする |
| SCR-02 | チケット詳細 | チケットの詳細、コメント、履歴を確認する |
| SCR-03 | チケット作成 | 新しいチケットを作成する |
| SCR-04 | チケット編集 | 既存チケットの情報を編集する |

---

## 3. 画面遷移

基本的な画面遷移は以下のとおりとする。

    チケット一覧
       │
       ├── Ticket IDをクリック
       │
       ↓
    チケット詳細
       │
       ├── 編集
       │      ↓
       │   チケット編集
       │      │
       │      └── 保存
       │             ↓
       │          チケット詳細
       │
       ├── Status変更
       │
       └── コメント追加

    チケット一覧
       │
       └── チケット作成
              ↓
          チケット作成
              │
              └── 作成
                    ↓
                 チケット詳細

---

## 4. SCR-01 チケット一覧

### 4.1 目的

登録されているチケットを一覧で確認し、
Status、Priority、Assigneeによって絞り込みを行う。

### 4.2 表示項目

| 項目 | 内容 |
|---|---|
| Ticket ID | チケットID。クリックすると詳細画面へ移動する |
| Title | チケットタイトル |
| Type | Feature / Bug / Task |
| Priority | High / Medium / Low |
| Status | Open / In Progress / Review / Testing / Done / Blocked |
| Assignee | 担当者名 |
| Due Date | 期限 |

### 4.3 絞り込み

以下の項目でチケットを絞り込める。

| 項目 | 選択肢 |
|---|---|
| Status | すべて / Open / In Progress / Review / Testing / Done / Blocked |
| Priority | すべて / High / Medium / Low |
| Assignee | すべて / Membersに登録されているメンバー |

絞り込み条件を変更すると、条件に一致するチケットを一覧に表示する。

### 4.4 操作

- Ticket IDをクリックするとチケット詳細画面へ移動する。
- 「チケット作成」ボタンからチケット作成画面へ移動する。
- Status、Priority、Assigneeの条件を変更して一覧を絞り込む。

### 4.5 表示例

| Ticket ID | Title | Type | Priority | Status | Assignee | Due Date |
|---|---|---|---|---|---|---|
| T001 | ログイン機能を実装 | Feature | High | In Progress | 山田 | 2026/09/30 |
| T002 | 表示崩れを修正 | Bug | Medium | Review | 佐藤 | 2026/09/25 |
| T003 | READMEを更新 | Task | Low | Done | 山田 | 2026/09/20 |

---

## 5. SCR-02 チケット詳細

### 5.1 目的

選択したチケットの詳細情報、
コメント、変更履歴を確認する。

また、詳細画面からStatus変更とコメント追加を行う。

### 5.2 チケット情報

以下の情報を表示する。

| 項目 | 表示内容 |
|---|---|
| Ticket ID | チケットID |
| Title | タイトル |
| Description | 説明 |
| Type | Feature / Bug / Task |
| Priority | High / Medium / Low |
| Status | 現在のStatus |
| Assignee | 担当者名 |
| Reporter | 起票者名 |
| Reviewer | レビュアー名 |
| Acceptance Criteria | 完了条件 |
| Due Date | 期限 |
| GitHub Issue | 関連Issue番号 |
| GitHub PR | 関連PR番号 |
| Created At | 作成日時 |
| Updated At | 更新日時 |

### 5.3 Status変更

詳細画面からStatusを直接変更できる。

Statusの選択肢は以下とする。

- Open
- In Progress
- Review
- Testing
- Done
- Blocked

Status変更時にはHistoryを1件作成する。

Historyには以下を記録する。

- Action
- Field = Status
- Old Value
- New Value
- Actor ID
- Created At

### 5.4 編集

「編集」ボタンを押すと、チケット編集画面へ移動する。

Statusは編集画面では変更せず、
詳細画面から直接変更する。

### 5.5 コメント

詳細画面にCommentsを表示する。

各コメントについて以下を表示する。

- 作成者
- コメント本文
- 作成日時

コメント入力欄と「追加」ボタンを配置する。

コメント追加時には、

1. Commentsにコメントを登録する。
2. Historyに `Comment Added` を登録する。

Historyには以下を記録する。

- Action = Comment Added
- Actor ID
- Created At

### 5.6 History

チケットに紐付くHistoryを時系列で表示する。

表示項目は以下とする。

- Action
- Field
- Old Value
- New Value
- Actor
- Created At

---

## 6. SCR-03 チケット作成

### 6.1 目的

新しいチケットを作成する。

### 6.2 入力項目

| 項目 | 入力方法 | 必須 |
|---|---|---|
| Title | テキスト入力 | ○ |
| Description | テキストエリア | ○ |
| Type | プルダウン | ○ |
| Priority | プルダウン | ○ |
| Assignee | Membersから選択 | - |
| Reviewer | Membersから選択 | - |
| Acceptance Criteria | テキストエリア | ○ |
| Due Date | 日付入力 | - |
| GitHub Issue | 数値入力 | - |

### 6.3 システムによる自動設定

チケット作成時に以下を自動設定する。

| 項目 | 設定値 |
|---|---|
| Ticket ID | 自動採番 |
| Status | Open |
| Reporter ID | 現在の操作ユーザー |
| Created At | 現在日時 |
| Updated At | 現在日時 |

### 6.4 作成処理

「作成」ボタンを押すと、入力内容をTicketsに登録する。

チケット作成成功後、Historyに以下を記録する。

- Action = Created
- Ticket ID
- Actor ID
- Created At

作成完了後はチケット詳細画面へ移動する。

### 6.5 入力チェック

以下の入力チェックを行う。

- Titleが未入力の場合はエラーとする。
- Descriptionが未入力の場合はエラーとする。
- Typeが指定された選択肢以外の場合はエラーとする。
- Priorityが指定された選択肢以外の場合はエラーとする。
- Acceptance Criteriaが未入力の場合はエラーとする。
- Due Dateが入力されている場合は有効な日付であることを確認する。
- GitHub Issueが入力されている場合は数値であることを確認する。

エラーがある場合はTicketsへの登録を行わず、
入力画面にエラーメッセージを表示する。

---

## 7. SCR-04 チケット編集

### 7.1 目的

既存チケットの情報を編集する。

### 7.2 編集項目

| 項目 | 編集 |
|---|---|
| Title | 可 |
| Description | 可 |
| Type | 可 |
| Priority | 可 |
| Status | 不可 |
| Assignee | 可 |
| Reporter | 不可 |
| Reviewer | 可 |
| Acceptance Criteria | 可 |
| Due Date | 可 |
| GitHub Issue | 可 |
| GitHub PR | 可 |

Statusはチケット詳細画面から変更する。

Reporterは作成後に変更しない。

### 7.3 保存処理

「保存」ボタンを押すと、変更内容をTicketsに反映する。

変更された項目ごとにHistoryを1件作成する。

例えばTitleとPriorityを変更した場合、

    History 1
    Field = Title
    Old Value = 旧タイトル
    New Value = 新タイトル

    History 2
    Field = Priority
    Old Value = Medium
    New Value = High

のように記録する。

各Historyには以下を記録する。

- Ticket ID
- Action = Updated
- Field
- Old Value
- New Value
- Actor ID
- Created At

Updated Atは保存時に現在日時へ更新する。

### 7.4 入力チェック

チケット作成画面と同様に、
各入力項目について必要なバリデーションを行う。

---

## 8. チケット削除

MVPではチケット削除機能を実装しない。

作成されたチケットは基本的に保持し、
Statusによって現在の状態を管理する。

将来的に削除の代替として、
アーカイブ機能の導入を検討する。

---

## 9. エラー表示

システムエラーや入力エラーが発生した場合は、
ユーザーに内容が分かるメッセージを表示する。

例：

- 「Titleを入力してください」
- 「指定されたStatusは使用できません」
- 「チケットの保存に失敗しました」

データ更新に失敗した場合は、
入力内容を可能な限り保持した状態で再操作できるようにする。

---

## 10. 画面共通仕様

### 10.1 ナビゲーション

各画面からチケット一覧へ戻れるようにする。

### 10.2 データ保存

画面からのデータ操作はGASを介して
Google Spreadsheetに保存する。

### 10.3 ID

Ticket ID、Comment ID、History ID、Member IDは
DB設計書で定義した形式に従う。

### 10.4 履歴

主要なデータ操作についてHistoryを記録する。

以下の操作を履歴対象とする。

- チケット作成
- Status変更
- チケット情報変更
- コメント追加

---

## 11. MVPの対象範囲

MVPでは以下の機能を実装する。

- チケット一覧表示
- Status / Priority / Assigneeによる絞り込み
- チケット詳細表示
- チケット作成
- チケット編集
- Status変更
- コメント追加
- History表示
- Google Spreadsheetへのデータ保存
- GitHub Issue番号の関連付け

以下はMVPの対象外とする。

- ユーザー認証
- 詳細な権限管理
- メール通知
- Slack通知
- GitHub APIとの自動連携
- チケット削除
- AI機能
- 外部データベース

---

## 12. 設計方針

TicketFlowでは、一覧画面でチケット全体を把握し、
詳細画面で個別チケットの情報と活動履歴を確認できる構成とする。

頻繁に変更するStatusは詳細画面から直接変更できるようにし、
その他の情報は編集画面で変更する。

コメントはCommentsに保存し、
コメント追加という活動をHistoryにも記録する。

チケット情報の変更は変更項目ごとにHistoryを作成することで、
誰が、いつ、何を変更したかを追跡できるようにする。

画面設計とDB設計の整合性を保ち、
実装時に各画面からどのデータを読み書きするかを明確にする。