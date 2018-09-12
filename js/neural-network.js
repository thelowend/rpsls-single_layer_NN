// Single-Layer Neural Network

const inputLayer = new synaptic.Layer(5); // 5 possible input categories (Rock, Paper, Scissors, Lizard, Spock)
const outputLayer = new synaptic.Layer(5); // 5 possible output categories (Rock, Paper, Scissors, Lizard, Spock)

inputLayer.project(outputLayer); // Input to output

const neuralNetwork = new synaptic.Network({
    input: inputLayer,
    output: outputLayer
});

const train = (dataset) => {
    for (let i = 0; i < dataset.length; i++) {
        inputLayer.activate(dataset[i]['input']);
        outputLayer.activate();
        outputLayer.propagate(0.4, dataset[i]['output']); // 0.4 is the learning rate
    }
}