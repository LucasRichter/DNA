/*
 * nodes.js is a nodes/particles animation useable for backgrounds
 *
 * http://oguzhaneroglu.com/projects/nodes.js/
 * https://github.com/rohanrhu/nodes.js
 *
 * Copyright (C) 2018, Oğuzhan Eroğlu <rohanrhu2@gmail.com>
 * Licensed under MIT
 */

const NodesJs = (function (parameters) {
  t_NodesJs = this;
  t_NodesJs.id = parameters.id;
  t_NodesJs.width = parameters.width;
  t_NodesJs.height = parameters.height;
  t_NodesJs.particleSize = parameters.particleSize ? parameters.particleSize : 2;
  t_NodesJs.lineSize = parameters.lineSize ? parameters.lineSize : 1;
  t_NodesJs.particleColor = parameters.particleColor ? `rgba(${parameters.particleColor.join(',')})` : 'rgba(255,255,255,0.3)';
  t_NodesJs.lineColor = parameters.lineColor ? parameters.lineColor : '255,255,255';
  t_NodesJs.backgroundFrom = parameters.backgroundFrom;
  t_NodesJs.backgroundTo = parameters.backgroundTo;
  t_NodesJs.backgroundDuration = parameters.backgroundDuration;
  t_NodesJs.number = parameters.number ? parameters.number : 100;
  t_NodesJs.speed = parameters.speed ? parameters.speed : 20;
  t_NodesJs.nobg = parameters.nobg ? parameters.nobg : false;
  t_NodesJs.pointerCircleRadius = parameters.pointerCircleRadius ? parameters.pointerCircleRadius : 150;

  let canvas;
  let ctx;
  let cw;
  let ch;

  let t0 = Date.now();
  let dt = 0;

  t_NodesJs.nodes = [];

  t_NodesJs.setWidth = function (width) {
    canvas.width = width;
    cw = width;
  };

  t_NodesJs.setHeight = function (height) {
    canvas.height = height;
    ch = height;
  };

  t_NodesJs.placeNodes = function (number) {
    t_NodesJs.nodes = [];

    for (let i = 0; i < number; i++) {
      t_NodesJs.nodes.push([
        Math.floor(Math.random() * (cw - 0 + 1)) + 0,
        Math.floor(Math.random() * (ch - 0 + 1)) + 0,
        Math.random() * (Math.PI * 2 - 0 + 1) + 0,
        [],
      ]);
    }
  };

  const isPositive = function (num) {
    return num >= 0;
  };

  const isNetagive = function (num) {
    return num <= -1;
  };

  t_NodesJs.pointerCircleRadius
    && window.addEventListener('mousemove', (event) => {
      if (!t_NodesJs.nodes.length) {
        return;
      }

      const mx = event.clientX;
      const my = event.clientY;

      t_NodesJs.nodes.forEach((_node, _node_i) => {
        const nx = _node[0];
        const ny = _node[1];

        const xsig = nx - mx;
        const ysig = ny - my;

        const ndx = Math.abs(xsig);
        const ndy = Math.abs(ysig);

        const nh = Math.sqrt(ndx ** 2 + ndy ** 2);

        let angle = Math.acos(ndx / nh);
        if (isPositive(xsig) && isNetagive(ysig)) {
        } else if (isNetagive(xsig) && isNetagive(ysig)) {
          angle = ((Math.PI / 2) - angle) + (Math.PI / 2);
        } else if (isNetagive(xsig) && isPositive(ysig)) {
          angle += Math.PI;
        } else if (isPositive(xsig) && isPositive(ysig)) {
          angle = ((Math.PI / 2) - angle) + (Math.PI * (3 / 2));
        }

        angle = (Math.PI * 2) - angle;

        const rx = mx + Math.cos(angle) * t_NodesJs.pointerCircleRadius;
        const ry = my + Math.sin(angle) * t_NodesJs.pointerCircleRadius;

        const mdx = Math.abs(rx - mx);
        const mdy = Math.abs(ry - my);

        const mh = Math.sqrt(mdx ** 2 + mdy ** 2);

        if (nh < mh) {
          _node[0] = Math.floor(rx);
          _node[1] = Math.floor(ry);
        }
      });
    });

  window[window.addEventListener ? 'addEventListener' : 'attachEvent'](window.addEventListener ? 'load' : 'onload', () => {
    canvas = document.getElementById(t_NodesJs.id);
    ctx = canvas.getContext('2d');

    canvas.width = t_NodesJs.width;
    canvas.height = t_NodesJs.height;

    cw = canvas.width;
    ch = canvas.height;

    t_NodesJs.placeNodes(t_NodesJs.number);

    var step = function () {
      window.requestAnimationFrame(step);

      ctx.clearRect(0, 0, cw, ch);

      if (!t_NodesJs.nobg) {
        const r = Math.floor(((Math.sin(Math.PI * 2 * Date.now() / t_NodesJs.backgroundDuration - Math.PI / 2) + 1) / 2) * (t_NodesJs.backgroundFrom[0] - t_NodesJs.backgroundTo[0] + 1) + t_NodesJs.backgroundTo[0]);
        const g = Math.floor(((Math.sin(Math.PI * 2 * Date.now() / t_NodesJs.backgroundDuration - Math.PI / 2) + 1) / 2) * (t_NodesJs.backgroundFrom[1] - t_NodesJs.backgroundTo[1] + 1) + t_NodesJs.backgroundTo[1]);
        const b = Math.floor(((Math.sin(Math.PI * 2 * Date.now() / t_NodesJs.backgroundDuration - Math.PI / 2) + 1) / 2) * (t_NodesJs.backgroundFrom[2] - t_NodesJs.backgroundTo[2] + 1) + t_NodesJs.backgroundTo[2]);

        ctx.beginPath();
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(0, 0, cw, ch);
        ctx.fill();
      }

      t_NodesJs.nodes.forEach((_node, _node_i) => {
        _node[0] += Math.cos(_node[2]) * t_NodesJs.speed * (dt / 1000.0);
        _node[1] += Math.sin(_node[2]) * t_NodesJs.speed * (dt / 1000.0);

        if (_node[0] < 0) {
          _node[0] = cw + (_node[0] % cw);
        }

        if (_node[0] > cw) {
          _node[0] %= cw;
        }

        if (_node[1] < 0) {
          _node[1] = ch + (_node[1] % ch);
        }

        if (_node[1] > ch) {
          _node[1] %= ch;
        }

        ctx.fillStyle = t_NodesJs.particleColor;

        ctx.beginPath();
        ctx.arc(
          _node[0],
          _node[1],
          t_NodesJs.particleSize,
          0,
          Math.PI * 2,
          true,
        );
        ctx.fill();

        _node[3] = [];

        t_NodesJs.nodes.forEach((_node2, _node2_i) => {
          if (_node_i == _node2_i) {
            return true;
          }

          if (_node[3].indexOf(_node2_i) > -1) {
            return true;
          }

          const dx = Math.abs(_node[0] - _node2[0]);
          const dy = Math.abs(_node[1] - _node2[1]);
          const d = Math.sqrt(dx ** 2 + dy ** 2);

          let alpha = 0;

          if (d <= 300) {
            alpha = 0.3 - ((0.3 * d) / 200);
          }

          if (alpha == 0) {
            return true;
          }

          _node2[3].push(_node_i);

          ctx.strokeStyle = `rgba(${t_NodesJs.lineColor},${alpha})`;
          ctx.lineWidth = t_NodesJs.lineSize;

          ctx.beginPath();
          ctx.moveTo(_node[0], _node[1]);
          ctx.lineTo(_node2[0], _node2[1]);
          ctx.stroke();
        });
      });

      dt = Date.now() - t0;
      t0 = Date.now();
    };

    step();
  });
});
