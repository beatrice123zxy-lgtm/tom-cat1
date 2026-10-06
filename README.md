# Tom 猫 · 你的 AI 小伙伴

一个可以和汤姆猫语音对话的网页，使用 OpenRouter 提供对话能力，语音识别与朗读使用浏览器自带的 Web Speech API。

## 打开网址

**https://beatrice123zxy-lgtm.github.io/tom-cat1/**

直接复制上面这行，粘贴到浏览器地址栏打开即可。手机、电脑都可以。

> 必须用这个 HTTPS 网址打开，麦克风才能工作。直接双击本地的 index.html 无法使用语音功能。

## 使用步骤

1. 打开上面的网址。
2. 在「OpenRouter API Key」输入框填入你的 Key（还没有？点「前往获取 ↗」到 openrouter.ai/settings/keys 免费申请）。
3. 点「测试连接」，显示成功后点「保存并进入 Tom 猫」。
4. 点「开始语音陪聊」，浏览器会询问麦克风权限，选择「允许」。
5. 对着麦克风说话，说完稍等几秒，Tom 会回答并朗读出来。
6. 勾选「Tom 回答后继续听我说」可以连续轮流聊天；点「打断 Tom」可以打断它的朗读。

## 文件说明

| 文件 | 作用 |
| --- | --- |
| `index.html` | 页面结构（设置页 + 聊天页） |
| `style.css` | 样式与猫咪动画 |
| `app.js` | 逻辑：OpenRouter 对话、语音识别、语音朗读、嘴型动画 |
| `使用说明.txt` | 原始中文使用说明 |

## 关于 API Key

- Key 只在运行时由你自己输入，**不会以任何形式保存在本仓库的代码里**。
- Key 仅存放在当前浏览器的 `sessionStorage` 中，界面只显示 `sk-or-****1234` 形式的掩码，关闭标签页即自动清除。
- 请勿在公用电脑上输入你的 Key。

## 浏览器要求

- 建议使用 Chrome、Edge 或 Safari。
- 需支持中文语音识别与语音朗读，部分安卓浏览器、微信内置浏览器支持不佳。
- 语音识别由浏览器服务处理（Chrome 系会上传到 Google），识别出的文字才会发送给 OpenRouter。
- 测试与聊天会消耗你的 OpenRouter 额度。

## 本地运行（可选）

```bash
python3 -m http.server 4173
# 然后访问 http://localhost:4173
```

`localhost` 被视为安全环境，同样可以使用麦克风。
