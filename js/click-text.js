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

        for (var i = 0; i < CONFIG.particleCount; i++) {
            createParticle(x, y);
        }
    });
})();