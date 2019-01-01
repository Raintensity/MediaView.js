# MediaView.js
WEBサイト上の画像を拡大表示させるJavascriptプラグイン。

(A javascript plugin to expand the images on the Web site.)

## 機能
* 画像の拡大表示
* フルスクリーン表示
* グループ化

## 動作確認済み環境
* Chrome 71
* FireFox 64
* Edge (フルスクリーン非対応)

## 使い方
以下のタグのいずれかを `<head>` タグの一番下もしくは `<body>` タグのどこかに配置してください。ファイルパスは各環境に合わせて適宜変更してください。
```html
<script src="mediaview.js"></script>
<script src="mediaview.min.js"></script>
```
上記のスクリプトが読み込まれると、imgタグのクリック時は自動でMediaView.jsを用いた拡大表示画面になります。

## 高度な使い方
### 画像のグループ化
```html
<img data-media-view="グループ名">
```
`data-media-view` 属性の文字列でグループ化を行います。空の場合や `data-media-view` 属性が指定されていない場合は、自動でデフォルトのグループ `[default]` とみなされます。

### 別画像の拡大表示
```html
<img data-media-view-src="test.png">
```
`data-media-view-src` 属性が指定されている場合、 `data-media-view-src` 属性のファイルパスで画像が表示されます。

### グループ化しないで表示
```html
<img data-media-view="[null]">
```
`data-media-view` 属性に `[null]` が指定されている場合、グループ化しないで表示されます。前後の画像への矢印は表示されません。

### MediaView.jsの無効化
```html
<img data-media-view="[false]">
```
`data-media-view` 属性に `[false]` が指定されている場合、その画像ではMediaView.js表示が無効になります。

## 開発者向け
`npm run build` でビルド。

## 更新履歴
### 1.1.0
* \[Add\] グループ化した画像の左右矢印キーでの遷移機能
### 1.0.0
* 初版

## ライセンス
Copyright &copy; 2018 [Raintensity](https://blog.usx.jp/) <small>([Twitter](https://twitter.com/Raintensity)</small>). All rights reserved.

Licensed under the MIT License.
