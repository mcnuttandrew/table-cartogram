let ctx = null;
addEventListener('message', event => {
  const {
    data: {nodes, links, noOffscreen, update},
  } = event;

  if (noOffscreen) {
    return;
  }

  if (!update) {
    ctx = event.data.canvas.getContext('2d');
    ctx.globalAlpha = 0.3;
  }
  setTimeout(() => {
    // ctx.clearRect(0, 0, WAFFLE_WIDTH, WAFFLE_HEIGHT);
    // links.forEach(link => {
    //   ctx.beginPath();
    //   ctx.moveTo(xScale(link.source.x), yScale(link.source.y));
    //   ctx.lineTo(xScale(link.target.x), yScale(link.target.y));
    //   ctx.stroke();
    //   ctx.strokeStyle = link.color;
    //   ctx.closePath();
    // });
  }, 750);
});
