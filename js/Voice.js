"use strict";

const Oscillators = (audioContext, voiceConfig) => {

    let oscillators = [];

    let masterVca = audioContext.createGain();

    masterVca.gain.value = voiceConfig.gain  / 100;

    const me = {
        getOscillatorConfig(oscNumber)
        {
            return voiceConfig.oscillators[oscNumber];
        },

        createOscillatorById(oscNumber)
        {
            let oscConfig = me.getOscillatorConfig(oscNumber);

            me.createOscillator(oscConfig)
        },

        applyTuning(vco, tuning)
        {
            if(tuning !== 0)
            {
                vco.detune.value = tuning;
            }

            return vco;
        },

        setPipeLengthOnOscillator(vco, pipeLength)
        {
            if(pipeLength !== 0)
            {
                vco.pipeLength = pipeLength;
            }

            return vco;

        },

        createOscillator(oscConfig)
        {
            let vco = audioContext.createOscillator();
            vco.type = oscConfig.type;
            vco = me.applyTuning(vco, oscConfig.tuning);
            vco = me.setPipeLengthOnOscillator(vco, oscConfig.pipeLength);


            me.connectInputToVca(me.addOscillatorGain(vco, oscConfig.gain));

            return vco;
        },

        connectInputToVca: (node) => {
            node.connect(masterVca);
        },

        connectVcaToOutput: (node) => {
            masterVca.connect(node);
        },

        addOscillatorGain(vco, vcoGain) {

            var vcoGainControl = audioContext.createGain();
            vcoGainControl.gain.value = vcoGain / 100;
            vco.connect(vcoGainControl);

            return vcoGainControl;
        },

        playVoice: () => {

            oscillators.forEach(osc => {
                me.start(osc, 0, 3, 440);
            })
        },

        start: (vco, time, noteLength, frequency) => {

            vco.frequency.value = me.applyPipeLength(frequency, vco.pipeLength);

            vco.start(time);
            vco.stop(time + noteLength);
        },

        applyPipeLength: (frequency, pipeLength) => {
            return frequency / (parseInt(pipeLength, 10) / 8);
        },

        setupOscillators()
        {
            voiceConfig.oscillators.forEach(osc => {
                oscillators.push(me.createOscillator(osc));
            })

            //me.connectVcaToOutput(output);
            return masterVca;
        }
    }
    return me

};

const Filters = (audioContext, voiceConfig) => {

    let filters = [];

    const me = {
        setUpFilters: (filterConfigs, input, output) => {

            var filter;
            let previousFilter;

            filterConfigs.forEach((filterConfig, key) => {

                if(filterConfig.tunaType !== undefined)
                {
                    filter = me.createTunaFilter(filterConfig);
                }
                else
                {
                    filter = me.createFilter(filterConfig)
                }

                filters.push(filter);

            });

            input.connect(filters[0]);

            filters.forEach((filter) => {

                if(typeof previousFilter !== "undefined")
                {
                    previousFilter.connect(filter);
                }

                previousFilter = filter;
            });

            filters[filterConfigs.length - 1].connect(output);

        },

        createFilter: (filterConfig) => {
            var filter = audioContext.createBiquadFilter();

            filter.type = filterConfig.props.type;
            filter.frequency.value = filterConfig.props.value;

            return filter;
        },

        createTunaFilter: (filterConfig) => {
            var tuna = new Tuna(audioContext);

            return new tuna[filterConfig.tunaType](filterConfig.props);

        }
    }
    return me
};

const Voice = (audioContext, voiceConfig)  => {

    return Object.assign(
        {},
        Oscillators(audioContext, voiceConfig),

        Filters(audioContext, voiceConfig)/*,
        audioNodes(audioContext, voiceConfig)*/

        /*,
        vca(audioContext, voiceConfig)*/
    )
}

const octave = () => ({
    applyPipeLength: (frequency, pipeLength) => {
        return frequency / (parseInt(pipeLength, 10) / 8);
    }
});

/*

 const vca = (audioContext, voiceConfig) => {

 let masterVca = audioContext.createGain();
 masterVca.gain.value = voiceConfig.gain  / 100;

 const me = {
 connectInputToVca: (node) => {
 node.connect(masterVca);
 },
 connectVcaToOutput: (node) => {
 vca.connect(node);
 }
 }
 return me

 };
 */

/*const audioNodes = (audioContext, voiceConfig) => {

 let masterVca = audioContext.createGain();
 masterVca.gain.value = voiceConfig.gain  / 100;

 const me = {

 createNodes(nodeConfigs)
 {
 let nodes = [];
 let oscillators = nodeConfigs.filter(nodeConfig => {
 return nodeConfig.type == 'oscillator';
 });

 oscillators.forEach(() => {
 nodes = createOscillator(nodeConfig);
 });

 debugger

 /*
 audioNodesConfigs.forEach(nodeConfig => {
 if(nodeConfig.type == 'oscillator')
 {
 nodes.push(me.createOscillator(nodeConfig));
 }
 else if()

 })
 * /
//me.connectVcaToOutput(output);
return masterVca;
},

connectInputToVca: (node) => {
    node.connect(masterVca);
},
    connectVcaToOutput: (node) => {
    vca.connect(node);
}
}
return me

};
*/