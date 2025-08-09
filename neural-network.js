let nodes = [];

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent(document.querySelector('.hero'));
  for (let i = 0; i < 30; i++) {
    nodes.push(createVector(random(width), random(height)));
  }
  stroke(100, 150, 255, 150);
  strokeWeight(2);
}

function draw() {
  clear();
  background(15, 23, 42, 50);
  fill(100, 150, 255);
  noStroke();

  // Draw nodes
  for (let node of nodes) {
    ellipse(node.x, node.y, 8);
  }

  // Draw connections (lines between close nodes)
  stroke(100, 150, 255, 100);
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      let d = dist(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
      if (d < 150) {
        line(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
      }
    }
  }
}
