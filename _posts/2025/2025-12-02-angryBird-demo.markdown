---
layout:     post
title:      "《愤怒的小鸟》发射移动轨迹实现"
subtitle:   " "
date:       2025-12-02 12:00:00
author:     "ALQ"
header-img: "img/post-bg-2015.jpg"
catalog: true
tags:
    - 游戏开发
    - cocos creator
---

## 前言
《愤怒的小鸟》是一款非常经典的游戏，在游戏中，玩家需要控制小鸟发射出去，使它能够击中目标。在这篇文章中，我们将介绍如何实现小鸟的发射移动轨迹。

## 实现原理
当小鸟在移动的过程中，忽略空气阻力的影响，小鸟只会受到重力的影响。因此，我们将小鸟的运动分为x和y两个方向来分别讨论。

### x方向
在x方向上，小鸟的运动是匀速的，所以根据匀速运动的公式，我们可以得到小鸟在x方向上的位置为：
`const x = this.shootStartPos.x + v0x * this.elapsedTime;`
* `this.elapsedTime`为累计移动时间，写在帧逻辑里面。

### y方向
在y方向上，小鸟受重力加速度影响做匀加速直线运动，已知匀加速直线运动的公式：
$v = v0 + a * t$
匀加速直线运动的位移s，可由速度积分:
$s(t) = y0 + ∫ v_y dt = y0 + ∫(v0y + a t) dt = y0 + v0y t + 0.5 a t^2$
这便是小鸟在y分量上的位移计算公式，于是在代码中有：
`const y = this.shootStartPos.y + v0y * this.elapsedTime + 0.5 * this.acc * this.elapsedTime * this.elapsedTime`
* `this.acc`为重力加速度，根据实际游戏需要设置初始值。

## 移动轨迹
根据以上公式，我们可以分别得到小鸟在x和y方向上的位移，在帧逻辑里面每帧执行，即可得到小鸟的移动轨迹。
