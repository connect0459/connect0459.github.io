omu_site
====
大阪公立大学支部の予約サイト

## 説明

## インストール

## Resources
### composer
SETUP内のzipファイルを`/assets/`配下に展開する。Google関連のファイルサイズが大きいため、展開するzipファイルの種類は次の2つから選択する。また、`assets/composer/composer.json`を以下に示すjsonに書き換える。

* composer.zip: omuサイトに必要なgoogle-api-clientのみ残した縮小版。
```
{
  "require": {
    "phpmailer/phpmailer": "^6.8",
    "google/apiclient": "^2.12.1",
    "michelf/php-markdown": "^2.0"
  },
    "scripts": {
    "pre-autoload-dump": "Google\\Task\\Composer::cleanup"
  },
  "extra": {
    "google/apiclient-services": [
      "Analytics",
      "AnalyticsData",
      "AnalyticsReporting",
      "ApiKeysService",
      "Books",
      "Calendar",
      "Docs",
      "Document",
      "Drive",
      "DriveActivity",
      "DriveLabels",
      "Forms",
      "Gmail",
      "Oauth2",
      "Script",
      "Sheets"
    ]
  }
}
```
* composer-master.zip: 全てのgoogle-api-clientが入ったzipファイル。サイズが特大。
```
{
  "require": {
    "phpmailer/phpmailer": "^6.8",
    "google/apiclient": "^2.12.1",
    "michelf/php-markdown": "^2.0"
  }
}
```
コマンドプロンプトでcomposerディレクトリまで移動し、`composer update`を入力することでパッケージのアップデートが可能。`"google/apiclient-services"`で指定する名称は、`composer-master.zip\composer\vendor\google\apiclient-services\src`のサービス一覧から確認できる。
### css
* reset.cssには[destyle.css](https://github.com/nicolas-cusan/destyle.css)（v4.0.0）を使用。
### vendor
* [flatpickr](https://flatpickr.js.org/)
* [holidays-jp](https://github.com/holidays-jp/)

## 著者
[connect0459](https://github.com/connect0459)
