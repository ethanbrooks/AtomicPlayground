'atomic component';

// Inspector fields will show up in the Atomic Editor scene view to allow editing
const inspectorFields = {
    speed: 100,
};

class Star extends Atomic.JSComponent {

    // Start will be called when component is instantiated
    start() {
        console.log(this.speed);
    }

    // Update will be called every cycle
    update(timeStep) {
        this.node.roll(timeStep * this.speed);
    }
}

module.exports = Star;
