/* 鼠标点击粒子爆炸特效 */
(function () {
    // 动画配置
    var CONFIG = {
        particleCount: 20, // 每次点击产生的粒子数量
        gravity: 0.5,      // 重力
        friction: 0.9,     // 摩擦力（减速）
        size: 8,           // 粒子基本大小
        spread: 10,        // 扩散范围
        fade: 0.03         // 消失速度
    };

    // 颜色库
    var COLORS = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
        '#FF9F43', '#54A0FF', '#5F27CD', '#FF9FF3', '#FCA5A5'
    ];

    function createHeart(x, y) {
        var heart = document.createElement('span');
        heart.innerHTML = '❤';
        heart.style.position = 'absolute';
        heart.style.color = '#FF6B6B'; // 爱心固定为红色
        heart.style.fontSize = (Math.random() * 10 + 15) + 'px'; // 随机大小 15-25px
        heart.style.left = x + 'px';
        heart.style.top = y + 'px';
        heart.style.pointerEvents = 'none';
        heart.style.zIndex = '9999';
        heart.style.userSelect = 'none';
        heart.style.transform = 'translate(-50%, -50%)'; // 居中
        heart.style.fontWeight = 'bold'; // 加粗，更明显
        heart.style.textShadow = '0 0 5px rgba(255, 107, 107, 0.5)'; // 增加发光效果

        document.body.appendChild(heart);

        // 爱心初始向上速度
        var angle = (Math.random() * Math.PI) + Math.PI; // 只向下半圆随机，配合反重力看起来是向上飘
        var velocity = Math.random() * 2 + 1;
        var vx = (Math.random() - 0.5) * 4; // 水平随机漂移
        var vy = - (Math.random() * 3 + 2); // 初始向上的速度
        var life = 1.0;

        function updateHeart() {
            vx *= 0.98; // 水平阻力
            vy -= 0.05; // 持续向上的浮力

            var currentLeft = parseFloat(heart.style.left);
            var currentTop = parseFloat(heart.style.top);

            heart.style.left = (currentLeft + vx) + 'px';
            heart.style.top = (currentTop + vy) + 'px';

            life -= 0.015; // 消失得慢一点
            heart.style.opacity = life;
            heart.style.transform = 'translate(-50%, -50%) scale(' + (1 + (1 - life) * 0.5) + ')'; // 慢慢变大

            if (life > 0) {
                requestAnimationFrame(updateHeart);
            } else {
                if (heart.parentNode) {
                    heart.parentNode.removeChild(heart);
                }
            }
        }
        requestAnimationFrame(updateHeart);
    }

    function createParticle(x, y) {
        var element = document.createElement('span');
        element.style.position = 'absolute';
        element.style.width = (Math.random() * CONFIG.size + 4) + 'px';
        element.style.height = element.style.width;
        element.style.borderRadius = '50%';
        element.style.backgroundColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        element.style.left = x + 'px';
        element.style.top = y + 'px';
        element.style.pointerEvents = 'none'; // 确保不阻挡点击
        element.style.zIndex = '9999';

        document.body.appendChild(element);

        // 随机速度和角度
        var angle = Math.random() * Math.PI * 2;
        var velocity = Math.random() * CONFIG.spread + 2;
        var vx = Math.cos(angle) * velocity;
        var vy = Math.sin(angle) * velocity;
        var life = 1.0;

        function update() {
            // 更新位置
            vx *= CONFIG.friction;
            vy *= CONFIG.friction;
            vy += CONFIG.gravity;

            var currentLeft = parseFloat(element.style.left);
            var currentTop = parseFloat(element.style.top);

            element.style.left = (currentLeft + vx) + 'px';
            element.style.top = (currentTop + vy) + 'px';

            // 更新透明度
            life -= CONFIG.fade;
            element.style.opacity = life;

            // 缩小
            element.style.transform = 'scale(' + life + ')';

            if (life > 0) {
                requestAnimationFrame(update);
            } else {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }
        }

        requestAnimationFrame(update);
    }

    // 绑定点击事件 - 使用 document 确保全局捕获
    document.addEventListener('click', function (e) {
        var x = e.clientX + window.scrollX;
        var y = e.clientY + window.scrollY;

        // 产生粒子爆炸
        for (var i = 0; i < CONFIG.particleCount; i++) {
            createParticle(x, y);
        }

        // 产生 1-3 个爱心
        var heartCount = Math.floor(Math.random() * 3) + 1;
        for (var j = 0; j < heartCount; j++) {
            createHeart(x, y);
        }
    });
})();