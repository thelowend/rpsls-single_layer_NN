(() => {

    const btnHumanActions = document.querySelectorAll('.human-action');
    const btnNNActions = document.querySelectorAll('.nn-action');

    // Training set where the NN stores what it has learned about the rules so far.
    let trainingSet = [];

    // Possible plays normalized to NN inputs.
    const plays = {
        'rock': [1, 0, 0, 0, 0],
        'paper': [0, 1, 0, 0, 0],
        'scissors': [0, 0, 1, 0, 0],
        'lizard': [0, 0, 0, 1, 0],
        'spock': [0, 0, 0, 0, 1]
    };
    const playKeys = Object.keys(plays);

    // Who beats whom:
    const ruleset = {
        'rock': ['scissors', 'lizard'],
        'paper': ['rock', 'spock'],
        'scissors': ['paper','lizard'],
        'lizard': ['spock', 'paper'],
        'spock': ['rock', 'scissors'],
    };

    // Highlights the chosen play button on the screen:
    const hightlight = (play, player) => {
        const buttonGroup = player === 'human' ? btnHumanActions : btnNNActions;
        buttonGroup.forEach(btn => {
            btn.classList.remove('activo');
            if (btn.classList.contains(play)) {
                setTimeout(() => btn.classList.add('activo'), 10);
            }
        });
    }

    // Single play logic
    const play = (humanPlay) => {
        return () => {

            // Highlights the human play on the screen
            hightlight(humanPlay, 'human');

            // Triggers the NN input layer using the human play as input.
            inputLayer.activate(plays[humanPlay]);

            // After the input layer has been activated, we trigger the following layer, which in this case is the output layer and store the result.
            // This results in a set of values bounded by 0 and 1, one for each possible output, that expresses the confidence on that value being the proper answer.
            let nnOutput = outputLayer.activate();

            // This is used to store the resulting output but spread on a 0-100 base.
            let parts = [];

            // We then use a reducer to add up all the values into a total
            let total = _.reduce(nnOutput, (memo, num, i) => {
                let value = parseInt((memo + num * 100).toFixed(0), 10);
                parts.push({ value: value, playname: playKeys[i] });
                return value;
            }, 0);

            // Where we store the NN play
            let NNPlay = null,
                NNPlayRoll = Math.floor(Math.random() * total), // Simple die roll
                NNPlayFound = false;

            // Assigns the play corresponding to the die roll
            for (let p = 0; !NNPlayFound && p < parts.length; p++) {
                if (NNPlayRoll <= parts[p].value) {
                    NNPlay = parts[p].playname;
                    NNPlayFound = true;
                }
            }

            // Stores the percentage values corresponding to each possible play
            let resultPercentages = _.map(parts, part => { part.value = part.value * 100 / total; return part.value.toFixed(0) });

            // Highlight the NN selected play on the screen
            hightlight(NNPlay, 'neuronal');

            // Filling up the table values
            displayConfidence(nnOutput);
            displayRollPercentage(resultPercentages, parseInt((NNPlayRoll * 100 / total).toFixed(0), 10));

            // Evaluating and showcasing the match result
            displayWinner(evaluateWinner(humanPlay, NNPlay));
            
            // We run a single training sesion for each element of the trainingSet
            train(trainingSet);
        }
    };

    const evaluateWinner = (humanPlay, NNPlay) => {
        if (_.contains(ruleset[NNPlay], humanPlay)) {
            addToTrainingSet({ input: plays[humanPlay], output: plays[NNPlay] });
            return 1; // NN Won
        } else if (_.contains(ruleset[humanPlay], NNPlay)) {
            addToTrainingSet({ input: plays[NNPlay], output: plays[humanPlay] });
            return -1; // Human Won
        }
        return 0; // Tie
    }

    const displayConfidence = (nnOutput) => {
        let confidence = _.map(nnOutput, num => `${(num * 100).toFixed(2)}%`);
        document.getElementById('rockConfidence').textContent = confidence[0];
        document.getElementById('paperConfidence').textContent = confidence[1];
        document.getElementById('scissorsConfidence').textContent = confidence[2];
        document.getElementById('lizardConfidence').textContent = confidence[3];
        document.getElementById('spockConfidence').textContent = confidence[4];
    }

    const displayRollPercentage = (resultPercentages, dieroll) => {
        document.getElementById('rockRoll').textContent = resultPercentages[0];
        document.getElementById('paperRoll').textContent = resultPercentages[1];
        document.getElementById('scissorsRoll').textContent = resultPercentages[2];
        document.getElementById('lizardRoll').textContent = resultPercentages[3];
        document.getElementById('spockRoll').textContent = resultPercentages[4];
        document.getElementById('dieroll').textContent = dieroll;
    }

    const displayWinner = (valor) => {
        clearResults();
        if (valor === 1) {
            document.querySelector('.loser').classList.add('show');
        } else if(valor === -1) {
            document.querySelector('.winner').classList.add('show');
        } else {
            document.querySelector('.tie').classList.add('show');
        }
    };

    const clearResults = () => document.querySelectorAll('.result p').forEach(p => p.classList.remove('show'));

    const addToTrainingSet = (entr) => {
        if (!trainingSet.filter(item => (item.input === entr.input && item.output === entr.output)).length) {
            trainingSet.push(entr);
        }
    }

    const init = () => {
        document.getElementById('btnRock').addEventListener('click', play('rock'));
        document.getElementById('btnPaper').addEventListener('click', play('paper'));
        document.getElementById('btnScissors').addEventListener('click', play('scissors'));
        document.getElementById('btnLizard').addEventListener('click', play('lizard'));
        document.getElementById('btnSpock').addEventListener('click', play('spock'));
    }

    init();

})();