function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent(select('.hero-canvas'));
}

function draw() {
    background(255);
    let nodes = [];
    let numNodes = 20;
    let connections = [];

    // Create nodes
    for (let i = 0; i < numNodes; i++) {
        nodes.push({
            x: random(width),
            y: random(height),
            size: random(5, 15),
            pulse: random(TWO_PI)
        });
    }

    // Create connections
    for (let i = 0; i < numNodes; i++) {
        for (let j = i + 1; j < numNodes; j++) {
            if (random() < 0.1) {
                connections.push([i, j]);
            }
        }
    }

    // Draw connections
    stroke(59, 130, 246, 100); // Using --accent color with transparency
    strokeWeight(1);
    for (let [i, j] of connections) {
        let n1 = nodes[i];
        let n2 = nodes[j];
        line(n1.x, n1.y, n2.x, n2.y);
    }

    // Draw nodes with pulsing effect
    noStroke();
    fill(15, 23, 42, 150); // Using --primary color with transparency
    for (let node of nodes) {
        let pulse = sin(frameCount * 0.05 + node.pulse) * 0.5 + 0.5;
        let size = node.size * (0.8 + 0.4 * pulse);
        ellipse(node.x, node.y, size, size);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
