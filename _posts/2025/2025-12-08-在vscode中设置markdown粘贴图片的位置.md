---
layout:     post
title:      "在vscode中设置markdown粘贴图片的位置"
subtitle:   " "
date:       2025-12-09 12:00:00
author:     "ALQ"
header-img: "img/post-bg-2015.jpg"
catalog: true
mathjax: true
tags:
    - vscode
---

1. 在vscode中，按下`ctrl + ,`,打开设置界面。
2. 在搜索框中输入`markdown.copy`, 找到`Markdown> Copy Files:Destination`
3. 新增配置项 key 为 `**/*.md `, value 为 你的目标路径。比如我想将图片放在 img/ALQ 目录下 markdown文件同名的目录下，那么我就可以设置为 `/img/ALQ/${documentBaseName}/${fileName}`， 其中 `${documentBaseName}` 代表markdown文件的文件名，`${fileName}` 代表图片的文件名。
![alt text](/img/ALQ/2025-12-08-在vscode中设置markdown粘贴图片的位置/image.png)

**由于vscode中的原生粘贴功能有一个限制：它总是会计算并生成 相对路径 （例如 ../../img/... ），无法强制生成以 / 开头的绝对路径。**

**因此如果需要生成以 / 开头的绝对路径，我们需要另外安装插件，这里以PasteImage为例**

1. 安装PasteImage插件
2. 打开.vscode/settings.json
3. 新增配置项：
```json
    "pasteImage.path": "${projectRoot}/img/ALQ/${currentFileNameWithoutExt}",
    "pasteImage.basePath": "${projectRoot}",
    "pasteImage.forceUnixStyleSeparator": true,
    "pasteImage.prefix": "/"
```
![](/img/ALQ/2025-12-08-在vscode中设置markdown粘贴图片的位置/2025-12-09-11-28-45.png)

*配置完成之后，使用`ctrl + alt + v`就可以愉快的使用粘贴功能了*
