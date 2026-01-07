---
layout:     post
title:      "CocosCreator性能优化：DrawCall（全面！）"
subtitle:   " "
date:       2026-01-07 12:00:00
author:     "ALQ"
header-img: "img/post-bg-2015.jpg"
catalog: true
mathjax: true
tags:
    - CocosCreator
---

https://forum.cocos.org/t/topic/95043

## 前言

在游戏开发中，DrawCall 作为一个非常重要的性能指标，直接影响游戏的整体性能表现。

无论是 Cocos Creator、Unity、Unreal 还是其他游戏引擎，只要说到游戏性能优化，DrawCall 都是绝对少不了的一项。

本文将会介绍什么是 DrawCall，为什么要减少 DrawCall 以及在 Cocos Creator 项目中如何减少 DrawCall 来提升游戏性能。

## 正文

## 什么是 DrawCall？

DrawCall 中文译为“绘制调用”或“绘图指令”。

DrawCall 是一种行为（指令），即 CPU 调用图形 API，命令 GPU 进行图形绘制。

## 为什么要减少 DrawCall？

### 发生了什么

当我们在讨论减少 DrawCall 时我们在讨论什么？

其实我们真正需要减少的并不是 DrawCall 这个行为本身，而是减少每个 DrawCall 前置的一些消耗性能和时间的行为。

### 举个栗子

问：尝试在两个硬盘之间传输文件，**传输 1 个 1MB 的文件和传输 1024 个 1KB 的文件**，同样是传输了共 1MB 的文件，**哪个更快？**

答：**传输 1 个 1MB 的文件要比传输 1024 个 1KB 的文件要快得多得多**。因为在每一个文件传输前，CPU 都需要做许多额外的工作来保证文件能够正确地被传输，而这些额外工作造成了大量额外的性能和时间开销，导致传输速度下降。

### 回到渲染

图形渲染管线的大致流程如下：

![](/img/ALQ/2026-01-07-CocosCreator性能优化：DrawCall/2026-01-07-16-34-18.png)

<aside>
💡 上图只是对渲染管线的部分概括，方便大家理解，实际的图形渲染管线比较复杂，不在本文讨论范围内。

</aside>

**从图中可以看到在渲染管线中，在每一次 DrawCall 前，CPU 都需要做一系列准备工作，才能让 GPU 正确渲染出图像。**

**而 CPU 的每一次内存显存读写、数据处理和渲染状态切换都会带来一定的性能和时间消耗。**

### 到底是谁的锅？

一般来说 GPU 渲染图像的速度其实是非常快的，绘制 100 个三角形和绘制 1000 个三角形所消耗的时间没差多少。

但是 CPU 的内存显存读写、数据处理和渲染状态切换相对于 GPU 渲染来说是 **非常非常慢** 的。

实际的瓶颈在于 CPU 这边，大量的 DrawCall 会让 CPU 忙到焦头烂额晕头转向不可开交，而 GPU 大部分时间都在摸鱼，是导致游戏性能下降的主要原因。

<aside>
💡 所以 DrawCall 这玩意越少越好~

</aside>

## 如何减少 DrawCall？

在游戏运行时引擎是按照节点层级顺序从上往下由浅到深进行渲染的，理论上每渲染一张图像（文本最终也是图像）都需要一次 DrawCall。

既然如此，只要我们想办法将尽可能多的图像在一次 DrawCall 中渲染出来（也就是“渲染合批”），就可以尽量少去调用 CPU，从而减少 DrawCall。

<aside>
💡 简单点，就是减少让 CPU 工作的次数，但是每次都多给点活，不就可以省去一些“CPU 准备工具然后工作”和“工作结束叫 GPU 加工”的步骤了嘛，代价就是每次工作的时间会变长~

</aside>

明白了这个原理之后，下面让我们看看在实际游戏开发中应该如何操作吧。

### 静态合图

静态合图就是在开发时 **将一系列碎图整合成一张大图**。

图集对于 DrawCall 优化来说非常重要，但是并不是说我们把所有图片统统打成图集就万事大吉了，这里面也有它的门道，胡乱打图集的话说不定还会变成负优化。

最重要的是 **尽量将处于同一界面（UI）下的相邻且渲染状态相同的碎图打包成图集**，才能达到减少 DrawCall 的目的。

<aside>
💡 还记得游戏渲染时是按顺序渲染的吗，所以“相邻”很关键！要考，做笔记！

改变渲染状态会打断渲染合批，例如改变纹理状态（预乘、循环模式和过滤模式）或改变 Material（材质）、Blend（混合模式）等等，所以使用自定义 Shader 也会打断合批。

</aside>

举个栗子，我这里有一个由 10 张碎图和 1 个文本所组成的弹窗（假设都使用同样的渲染方式）：

1. 在不做任何优化且未开启动态合图的情况下，渲染这个弹窗需要 11 个 DrawCall。
2. 将所有碎图打成一个图集，文本节点夹在精灵节点之间的情况下需要 3 个 DrawCall，在顶部最外层或者底部最外层的情况下需要 2 个 DrawCall。
3. 文本使用 BMFont，将所有碎图和 BMFont 打成一个图集的话只需要 1 个 DrawCall，如果碎图不和 BMFont 打成一个图集的情况则参考第 2 项。
4. 碎图不打包图集，开启动态合图，在理想情况下，文本使用 BMFont 最少只需要 1 个 DrawCall，不使用 BMFont 的情况同样参考第 2 项。

<aside>
💡 如果上面的例子你不太能理解的话，那请接着看下面的内容，相信你阅读完本篇文章的全部内容后再来看这个例子将会茅塞顿开哈哈哈~

动态合图和 BMFont 会在后面说到。

</aside>

当然上面这个例子算是比较理想的情况，实际上的情况可能会比例子更为复杂，精灵和文本可能会更多，也不一定能将所有图像资源都打包进一个图集。所以我们只能是尽量合理地去优化，避免出现“捡了芝麻，丢了西瓜”的情况。

<aside>
💡 不建议任何图像资源的尺寸超过 2048 * 2048，否则在小游戏和原生平台可能会出现问题；

而且图像尺寸越大，加载的时间也越长，而且是非线性的那种增长，例如加载一张图像比加载两张图像所消耗的时间还长，得不偿失。

</aside>

下面介绍两种打包静态图集的方式：

### 自动图集资源（Auto Atlas）

利用 Cocos Creator 内置的自动图集资源来将碎图打包成图集。

在项目构建时，编辑器会将所有自动图集资源所在文件夹下的所有符合要求的图像分别根据配置打包成一个或多个图集。

自动图集资源使用起来很灵活，编辑器在打包图集时会自动递归子目录，若子目录下也有自动图集资源（即 `.pac` 文件）则会跳过该目录，所以我们可以对同一目录下的不同部分的碎图配置不同的参数。

### 创建自动图集配置

在 **资源管理器** 中右键，点击 [ 新建 -> 自动图集配置 ] 就会新建一个名为 `AutoAtlas.pac` 的资源。

![](/img/ALQ/2026-01-07-CocosCreator性能优化：DrawCall/2026-01-07-16-35-47.png)

### 配置属性

在 **资源管理器** 中点击自动图集资源文件就可以在 **属性检查器** 面板中看到自动图集资源可配置的属性，点击 Preview 按钮即可预览图集。

![](/img/ALQ/2026-01-07-CocosCreator性能优化：DrawCall/2026-01-07-16-36-13.png)

### 关于自动图集的几点建议

1. 合理控制图集最大尺寸，避免单个图像加载时间过长。
2. 尺寸太大的图像没有必要打进图集（如背景图）。
3. 善用九宫格（Sliced）可以节省很多空间（这一点需要美术大佬配合）。
4. 间距保持默认的 2 并保持勾选**扩边**选项，避免图像裁剪错误和出现黑边的情况。
5. 勾选不包含未被引用资源选项，自动排除没有用到的图像以节省空间（该选项预览时无效）。
6. 开发时预览图集，根据结果进行调整，以达到最好的优化效果。

关于每个属性具体的作用请参考官方文档。

自动图集资源官方文档：[http://docs.cocos.com/creator/manual/zh/asset-workflow/auto-atlas.html#配置自动图集资源 389](http://docs.cocos.com/creator/manual/zh/asset-workflow/auto-atlas.html#%E9%85%8D%E7%BD%AE%E8%87%AA%E5%8A%A8%E5%9B%BE%E9%9B%86%E8%B5%84%E6%BA%90)

### TexturePacker

我们也可以使用第三方软件 TexturePacker 来预先将图像打包成图集再导入项目中。

TexturePacker 是收费软件，但是一般情况下免费功能就已经够用了。

另外使用 TexturePacker 打包图集时需要注意配置 **形状填充（Shape Padding，对应 Auto Atlas 中的间距）**，避免某张图像出现相邻图像的像素的情况。

![](/img/ALQ/2026-01-07-CocosCreator性能优化：DrawCall/2026-01-07-16-37-58.png)

TexturePacker 官网地址：[https://www.codeandweb.com/texturepacker 53](https://www.codeandweb.com/texturepacker)

### Auto Atlas 和 TexturePacker 的对比

### Auto Atlas

- Cocos Creator 内置，方便到家了
- 功能不多但是该有的都有，免费
- 项目构建时才生成图集，开发时任意修改无压力
- 图集尺寸在生成时自适应，节省空间
- 支持自动纹理压缩

### TexturePacker

- 第三方软件需自行安装，不够方便
- 收费功能很多很专业但是用不着，免费功能也够用
- 先生成图集再使用，更换图像又要重新生成图集
- 尺寸固定需要自己设置
- 自己压缩去

<aside>
💡 总结：Auto Atlas 真香！

</aside>

### 动态合图（Dynamic Atlas）

这里引用官方文档中对于动态合图的介绍：

> Cocos Creator 提供了在项目构建时的静态合图方法 —— **自动合图**（Auto Atlas）。但是当项目日益壮大的时候贴图会变得非常多，很难将贴图打包到一张大贴图中，这时静态合图就比较难以满足降低 DrawCall 的需求。所以 Cocos Creator 在 v2.0 中加入了 **动态合图**（Dynamic Atlas）的功能，它能在项目运行时动态的将贴图合并到一张大贴图中。当渲染一张贴图的时候，动态合图系统会自动检测这张贴图是否已经被合并到了图集（图片集合）中，如果没有，并且此贴图又符合动态合图的条件，就会将此贴图合并到图集中。

动态合图官方文档：[https://docs.cocos.com/creator/manual/zh/advanced-topics/dynamic-atlas.html 519](https://docs.cocos.com/creator/manual/zh/advanced-topics/dynamic-atlas.html)
> 

简单来说，开启动态合图之后，引擎会在运行时帮我们对符合条件（即尺寸小于碎图限制的最大尺寸）的精灵进行合图，达到和提前打包图集一样的效果。

引擎的 **动态图集尺寸最大是 2048 * 2048**，可合并的 **碎图限制的最大尺寸是 512**，用户可以通过下面的 API 进行修改：

```
cc.dynamicAtlasManager.maxFrameSize = 512;
```

**启用动态合图会占用额外的内存**，不同平台占用的内存大小不一样。小游戏和原生平台上默认会禁用动态合图，但如果你的项目内存空间仍有富余的话建议强制开启：

```
cc.macro.CLEANUP_IMAGE_CACHE = false;
cc.dynamicAtlasManager.enabled = true;
```

另外还需要保证纹理的 Premulyiply Alpha（预乘）、Wrap Mode（循环模式） 和 Filter Mode（过滤模式） 等信息与动态图集一致才能够动态合批。

![](/img/ALQ/2026-01-07-CocosCreator性能优化：DrawCall/2026-01-07-16-39-20.png)

### 静态图集也可以参与动态合图

在动态合图的官方文档中有提到：

<aside>
💡 当渲染一张贴图的时候，动态合图系统会自动检测这张贴图是否已经被合并到了图集（图片集合）中，如果没有，并且此贴图又符合动态合图的条件，就会将此贴图合并到图集中。

</aside>

但其实 **只要静态图集满足动态合图的要求（即尺寸小于碎图限制的最大尺寸），也是可以参与动态合图的**。

注意：自动图集资源（Auto Atlas）需要在其属性检查器面板中开启 **Texture** 栏下的 **Packable** 选项，该选项默认是禁用的。

![](/img/ALQ/2026-01-07-CocosCreator性能优化：DrawCall/2026-01-07-16-39-43.png)

### 额外补充

**只有纹理开启了 Packable 选项的精灵才能够参与动态合图**，该选项默认开启。

![](/img/ALQ/2026-01-07-CocosCreator性能优化：DrawCall/2026-01-07-16-39-59.png)

纹理参与动态合图后会修改原始贴图的 UV 坐标，所以在 Shader 中的无法正确计算 UV 坐标，导致 Shader 无效。

**如果需要对精灵使用自定义 Shader，需要禁用其纹理的 Packable 选项。**

也可以在代码中禁用该选项：

```
let sprite = this.node.getComponent(cc.Sprite);
let texture = sprite.spriteFrame.getTexture();
texture.packable = false;
```

<aside>
💡 Packable 官方文档：[https://docs.cocos.com/creator/manual/zh/asset-workflow/sprite.html?h=packable 140](https://docs.cocos.com/creator/manual/zh/asset-workflow/sprite.html?h=packable)

</aside>

### 位图字体（BMFont）

在场景中使用系统字体或 TTF 字体的 Label 会打断渲染合批，特别是 Label 和 Sprite 层叠交错的情况，每一个 Label 都会打断合批增加一个 DrawCall，文本多的场景下轻轻松松 100+。

对于游戏中的文本，特别是数字、字母和符号，都建议 **使用 BMFont 来代替 TTF 或系统字体**，并且 **将 BMFont 与 UI 碎图打包到同一图集中**（或 **开启动态合图**），可以免除大部分文本导致的 DrawCall。

### 举个栗子

例如一个场景中有 80 张精灵和 80 个文本（系统字体）相互交错，节点层级如下图：

![](/img/ALQ/2026-01-07-CocosCreator性能优化：DrawCall/2026-01-07-16-40-20.png)

运行起来之后可以看到左下角的 Profile 显示 DrawCall 已经高达 161 个，也就是说每一个精灵和文本都增加一个 DrawCall，这种情况即使精灵打了图集也一样无济于事。

<aside>
💡 不要问明明只有 80 张精灵和 80 个文本不应该是 160 个 DrawCall 吗为什么是 161 个…
因为左下角的 Profile 也要占一个 : (

</aside>

![](/img/ALQ/2026-01-07-CocosCreator性能优化：DrawCall/2026-01-07-16-40-40.png)

### 对比栗子

还是上面的场景，尝试将 Label 的系统字体换成 BMFont 并且与精灵打包到同一个图集之后，同样是 80 个精灵和 80 个文本。

但是 DrawCall 只有 2 个，同时帧时间降低到了 1ms，帧率提升了 10 FPS，渲染耗时降低到了 0.6ms。

<aside>
💡 实际上场景只占了 1 个 DrawCall，另一个 DrawCall 是左下角的 Profile 占的…

</aside>

![](/img/ALQ/2026-01-07-CocosCreator性能优化：DrawCall/2026-01-07-16-40-59.png)

另外，对于汉字可以尝试使用 Label 组件的 **Cache Mode** 来优化。

### 文本缓存模式（Cache Mode）

Cocos Creator 2.0.9 版本在 Label 组件上增加了 **Cache Mode** 选项，来解决系统字体和 TTF 字体带来的性能问题。

> Cache Mode 官方文档：[https://docs.cocos.com/creator/manual/zh/components/label.html#文本缓存类型（cache-mode） 247](https://docs.cocos.com/creator/manual/zh/components/label.html#%E6%96%87%E6%9C%AC%E7%BC%93%E5%AD%98%E7%B1%BB%E5%9E%8B%EF%BC%88cache-mode%EF%BC%89)
> 

Cache Mode 有以下3 种选择：

### NONE（默认）

每一个 Label 都会生成为一张单独的位图，且不会参与动态合图，所以每一个 Label 都会打断渲染合批。

### BITMAP

当 Label 组件开启 BITMAP 模式后，文本同样会生成为一张位图，但是 **只要符合动态合图要求就可以参与动态合图，和周围的精灵合并 DrawCall**。

**一定要注意 BITMAP 模式只适用于不频繁更改的文本，否则内存爆炸了后果自负！**

### 举个栗子

同样是上文提到的 **精灵和文本相互交错** 的例子，**文本使用 BITMAP 模式，精灵不打包成图集，开启动态合图**。

结果是所有精灵（包括背景）和文本都成功动态合图，实际 DrawCall 降至 1 个。

<aside>
💡 如果精灵打包成了图集则会变成 160 个，因为图集默认不参与动态合图。
所以当前这种情况（少精灵多文本）不打图集反而是比较好的选择。

</aside>

![](/img/ALQ/2026-01-07-CocosCreator性能优化：DrawCall/2026-01-07-16-41-36.png)

### CHAR

当 Label 组件开启 CHAR 模式后，引擎会将该 Label 中出现的所有字符缓存到一张全局共享的位图中，相当于是生成了一个 BMFont。

**适用于文本频繁更改的情况，对性能和内存最友好。**

注意：**该模式只能用于字体样式和字号固定，并且不会频繁出现巨量未使用过的字符的 Label。因为共享位图的最大尺寸为 2048*2048，占满了之后就没办法再渲染新的字符，需要切换场景才会清除共享位图。**

开启了 CHAR 模式的 Label 无法参与动态合图，但是可以和**相邻的**同样是 CHAR 模式的 Label 合并 DrawCall（相当于是一张未打包进图集的 BMFont）。

### 举个栗子

还是是上文提到的 **精灵和文本相互交错** 的例子，为了更好体现 CHAR 模式的优势，我更改了场景节点的结构，将精灵和文本进行 **分离**（关于这点可以看下面的 **UI层级调整**）。

![](/img/ALQ/2026-01-07-CocosCreator性能优化：DrawCall/2026-01-07-16-41-56.png)

所有 Label 开启 CHAR 模式，并在脚本中每过 0.2 秒就将文本更改成新的随机数。

在这个例子中，引擎会在运行时生成一张包含数字 0 到 9 的 BMFont 存在内存中，另外由于我将所有 Label 都聚合在一起，所以所有 Label 的渲染合并成了 1 个 DrawCall，**另外请特别关注左下角的帧时间、帧率和渲染耗时**。

![](/img/ALQ/2026-01-07-CocosCreator性能优化：DrawCall/example-4.gif)

光看上面的图似乎看不出个所以然来，那我们增加一个对照组，**将所有文本的 Cache Mode 选项设为默认的 NONE 模式**。

此时可以发现 **帧时间最高达到了 2 ms，平均帧率下降了大概 6 FPS，渲染耗时更是翻了 4 倍最高达到了 1.8 ms。**

![](/img/ALQ/2026-01-07-CocosCreator性能优化：DrawCall/example-5.gif)

### 总结

结论已经很明显了，对于大量**频繁更改**的文本，使用 CHAR 模式带来的性能提升是非常明显的。

同时 CHAR 模式的局限也很明显，一般用于场景中出现大量数字文本，类似于经验值增加、血量减少之类的特效的情况。

### UI 层级调整

> 除了以上的优化方案，我们还可以在游戏场景中下功夫，将性能优化做到极致。
> 

其实上文也有提到，我们可以通过 **优化节点层级，分离图像节点和文本节点，文本使用 BMFont 或 Cache Mode 选项，尽量出现避免文本打断渲染合批的情况**。

![](/img/ALQ/2026-01-07-CocosCreator性能优化：DrawCall/2026-01-07-16-51-07.png)

特别是对于战斗场景中大量的文本提示（伤害值、血量值和法力值等等）或合成游戏中大量的经验值文本，因为这些文本基本都是数字，使用这种方式即使再多文本也只需要 1 个 DrawCall 就可以全部渲染出来。

### 举个栗子

下面的场景中，文本开启 CHAR 模式，使用脚本每秒生成 50 个左右的随机数字，文本节点统一放在 labelLayer 节点下，让所有文本可以共享 1 个 DrawCall，另外背景的椰子头占 1 个，左下角 Profile 占 1 个。

可以看到即使场景中瞬间出现这么多文本，整体性能也还是比较可观的。

> 在这个例子中，引擎在运行时为我们生成了一份包含数字 0 到 9 的全局共享位图（BMFont）。

当然如果可以在 Label 中直接使用 BMFont 的话那就更好了。
> 

![](/img/ALQ/2026-01-07-CocosCreator性能优化：DrawCall/example-6.gif)

### 补充

### 再次提醒

1. 改变渲染状态会打断渲染合批，例如改变纹理状态（预乘、循环模式和过滤模式）或改变 Material（材质）、Blend（混合模式）等等，所以使用自定义 Shader 也会打断合批。
2. 图集默认不参与动态合图，手动开启自动图集资源的 Packable 选项后如果最终图集符合动态合图要求也可以参与动态合图。
3. 纹理开启 Packable 选项参与动态合图后无法使用自定义 Shader，因为动态合图会修改原始贴图的 UV 坐标。
4. 使用 Cache Mode 的 BITMAP 模式需要注意内存情况，CHAR 模式需要注意文本内容是否多且不重复。

## 相关资料

- **Cocos Creator 用户手册**  [https://docs.cocos.com/creator/manual/zh/ 144](https://docs.cocos.com/creator/manual/zh/)
- **扩展**  https://www.cnblogs.com/gamedaybyday/p/18985571#t1