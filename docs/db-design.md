# TicketFlow DB設計書

## 1. データベース概要

TicketFlowでは、Google Spreadsheetをデータ保存先として使用する。

データは以下の4シートに分割して管理する。

- Tickets
- Comments
- History
- Members

チケット本体、コメント、変更履歴、メンバー情報を分離することで、
各データの役割を明確にし、チケットと関連データをIDで紐付ける。

---

## 2. ER構造

基本的なデータの関連は以下のとおりとする。

    Members
     ├────────→ Tickets
     │             │
     │             ├────→ Comments
     │             │
     │             └────→ History
     │
     ├────────→ Comments
     │
     └────────→ History

1人のMemberは複数のTicketを担当できる。

1人のMemberは複数のCommentを作成できる。

1人のMemberは複数のHistoryを作成できる。

1つのTicketには複数のCommentとHistoryが紐付く。

---

## 3. Tickets

チケット本体を管理する。

| 列名 | データ型 | 説明 | 必須 |
|---|---|---|---|
| Ticket ID | String | チケットを一意に識別するID | ○ |
| Title | String | チケットタイトル | ○ |
| Description | String | チケットの説明 | ○ |
| Type | String | Feature / Bug / Task | ○ |
| Priority | String | High / Medium / Low | ○ |
| Status | String | Open / In Progress / Review / Testing / Done / Blocked | ○ |
| Assignee ID | String | 担当者のMember ID | - |
| Reporter ID | String | 起票者のMember ID | ○ |
| Reviewer ID | String | レビュアーのMember ID | - |
| Acceptance Criteria | String | チケットの完了条件 | ○ |
| Due Date | Date | 期限 | - |
| GitHub Issue | Number | 関連するGitHub Issue番号 | - |
| GitHub PR | Number | 関連するPull Request番号 | - |
| Created At | DateTime | 作成日時 | ○ |
| Updated At | DateTime | 更新日時 | ○ |

### Ticketsの設計方針

Ticket IDを主キーとして使用する。

Assignee ID、Reporter ID、Reviewer IDにはMembersのMember IDを設定する。

---

## 4. Comments

チケットに対するコメントを管理する。

| 列名 | データ型 | 説明 | 必須 |
|---|---|---|---|
| Comment ID | String | コメントを一意に識別するID | ○ |
| Ticket ID | String | コメント対象のTicket ID | ○ |
| Author ID | String | コメント作成者のMember ID | ○ |
| Comment | String | コメント本文 | ○ |
| Created At | DateTime | コメント作成日時 | ○ |

### Commentsの設計方針

Comment IDを主キーとして使用する。

Ticket IDによってTicketsと関連付ける。

Author IDによってMembersと関連付ける。

1つのTicketに複数のCommentを登録できる。

---

## 5. History

チケットに対する主要な変更履歴を管理する。

| 列名 | データ型 | 説明 | 必須 |
|---|---|---|---|
| History ID | String | 履歴を一意に識別するID | ○ |
| Ticket ID | String | 対象のTicket ID | ○ |
| Action | String | 実行された操作 | ○ |
| Field | String | 変更された項目 | - |
| Old Value | String | 変更前の値 | - |
| New Value | String | 変更後の値 | - |
| Actor ID | String | 操作したMember ID | ○ |
| Created At | DateTime | 操作日時 | ○ |

### Historyの設計方針

History IDを主キーとして使用する。

Ticket IDによってTicketsと関連付ける。

Actor IDによってMembersと関連付ける。

Field、Old Value、New Valueを保存することで、
変更前後の状態を確認できるようにする。

---

## 6. Members

チームメンバーの情報を管理する。

| 列名 | データ型 | 説明 | 必須 |
|---|---|---|---|
| Member ID | String | メンバーを一意に識別するID | ○ |
| Name | String | メンバー名 | ○ |
| Role | String | チーム内の役割 | ○ |
| Created At | DateTime | メンバー登録日時 | ○ |

### Membersの設計方針

Member IDを主キーとして使用する。

Tickets、Comments、HistoryからMember IDを参照する。

認証情報やパスワードは保存しない。

---

## 7. ID設計

各データには一意のIDを付与する。

| データ | ID形式 | 例 |
|---|---|---|
| Ticket | T + 連番 | T001 |
| Comment | C + 連番 | C001 |
| History | H + 連番 | H001 |
| Member | U + 連番 | U001 |

IDは各シート内で重複しないようにする。

---

## 8. データの関連

### Members → Tickets

MembersのMember IDを使用して、
TicketsのAssignee ID、Reporter ID、Reviewer IDと関連付ける。

### Members → Comments

MembersのMember IDを使用して、
CommentsのAuthor IDと関連付ける。

### Members → History

MembersのMember IDを使用して、
HistoryのActor IDと関連付ける。

### Tickets → Comments

CommentsのTicket IDを使用して、
どのチケットに対するコメントかを識別する。

### Tickets → History

HistoryのTicket IDを使用して、
どのチケットに対する変更履歴かを識別する。

---

## 9. 設計上の判断

### 9.1 CommentsをTicketsから分離する

1つのTicketには複数のCommentが発生するため、
Commentsを独立したシートとして管理する。

これにより、コメント数が増えてもTicketsの構造を変更する必要がない。

### 9.2 HistoryをTicketsから分離する

1つのTicketには複数の変更履歴が発生するため、
Historyを独立したシートとして管理する。

### 9.3 Membersを独立して管理する

担当者、起票者、レビュアーなどのメンバー情報を
Membersシートで一元管理する。

Ticketsには名前ではなくMember IDを保存することで、
メンバー情報を変更する際の修正範囲を小さくする。

### 9.4 認証情報を保存しない

本システムのMVPでは認証機能を対象外としているため、
パスワードなどの認証情報は保存しない。

---

## 10. MVPにおけるデータ管理方針

Google Spreadsheetをデータストアとして使用する。

GASからSpreadsheetを読み書きすることで、
チケット、コメント、履歴、メンバーを管理する。

将来的にデータ量や利用者数が増加した場合は、
外部データベースへの移行を検討する。