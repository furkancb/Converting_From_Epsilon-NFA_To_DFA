var cCc = "";
class NFAtoDFAConverter {
  
  constructor(nfa) {
    this.nfa = nfa;
    this.alphabet = nfa.alphabet;
    this.dfaStates = [];
    this.dfaTransitions = {};
    this.dfaAcceptingStates = [];

    // Dönüşüm işlemini başlat
    this.convert();
  }

  // NFA'yı DFA'ya dönüştür
  convert() {
    const initialState = this.epsilonClosure([this.nfa.initialState]);
    this.dfaStates.push(initialState);

    let unprocessedStates = [initialState];

    // Durumları işleyerek DFA durumlarını ve geçişlerini oluştur
    while (unprocessedStates.length > 0) {
      const currentState = unprocessedStates.pop();
      const currentStateKey = this.stateKey(currentState);
      this.dfaTransitions[currentStateKey] = {};

      for (let symbol of this.alphabet) {
        const nextState = this.epsilonClosure(this.move(currentState, symbol));
        if (nextState.length > 0) {
          const nextStateKey = this.stateKey(nextState);
          if (!this.dfaStates.some(state => this.areSetsEqual(state, nextState))) {
            this.dfaStates.push(nextState);
            unprocessedStates.push(nextState);
          }
          this.dfaTransitions[currentStateKey][symbol] = nextStateKey;
        }
      }

      // Durumun NFA'nın kabul durumlarından herhangi birini içerip içermediğini kontrol et
      const isAcceptingState = currentState.some(state => this.nfa.acceptingStates.includes(state));
      if (isAcceptingState) {
        this.dfaAcceptingStates.push(currentStateKey);
      }
    }
  }

  // Bir dizi durumun epsilon kapanışını al
  epsilonClosure(states) {
    let closure = [...states];
    let stack = [...states];

    while (stack.length > 0) {
      const currentState = stack.pop();
      const currentStateTransitions = this.nfa.transitions[currentState];
      const epsilonTransitions = (currentStateTransitions && currentStateTransitions['ε']) || [];

      for (let nextState of epsilonTransitions) {
        if (!closure.includes(nextState)) {
          closure.push(nextState);
          stack.push(nextState);
        }
      }
    }

    return closure;
  }

  // Bir dizi durumdan belirli bir sembolle ulaşılabilecek durumları al
  move(states, symbol) {
    let moveResult = [];
    for (let state of states) {
      const stateTransitions = this.nfa.transitions[state];
      if (stateTransitions && stateTransitions[symbol]) {
        moveResult = moveResult.concat(stateTransitions[symbol]);
      }
    }
    return moveResult;
  }

  // İki durum kümesinin eşit olup olmadığını kontrol et
  areSetsEqual(set1, set2) {
    return set1.length === set2.length && set1.every(state => set2.includes(state));
  }

  // Durumları anahtar olarak kullanmak için stringe dönüştür
  stateKey(state) {
    return state.sort().join(',');
  }

  // Ortaya çıkan DFA'yı tablo formatında göster
  displayDFATable() {
    cCc += 'DFA Geçiş Tablosu:' + '\n';
    cCc += 'Durum'.padEnd(20) + this.alphabet.join(' '.padEnd(18)) + '\n';
    for (let state of this.dfaStates) {
      const stateKey = this.stateKey(state);
      const transitions = this.dfaTransitions[stateKey];
      const transitionStrs = this.alphabet.map(symbol => (transitions[symbol] || '{}').padEnd(20)).join('');
      cCc += stateKey.padEnd(20) + transitionStrs + '\n';
    }
  }

  // Ortaya çıkan DFA'yı grafik formatında göster
  displayDFAGraph() {
    cCc += 'DFA Grafiği:' + '\n';
    for (let state of this.dfaStates) {
      const stateKey = this.stateKey(state);
      for (let symbol of this.alphabet) {
        const nextState = this.dfaTransitions[stateKey][symbol];
        if (nextState) {
          cCc += `${stateKey} --${symbol}--> ${nextState}` + '\n';
        }
      }
    }
  }

  // Ortaya çıkan DFA'yı formal dil tanımı olarak göster
  displayDFAFormal() {
    cCc += 'DFA\'nın Formal Tanımı:' + '\n';
    cCc += `Durumlar: { ${this.dfaStates.map(state => `{${this.stateKey(state)}}`).join(', ')} }` + '\n';
    cCc += `Alfabe: { ${this.alphabet.join(', ')} }` + '\n';
    cCc += `Geçişler: {` + '\n';
    for (let state of this.dfaStates) {
      const stateKey = `{${this.stateKey(state)}}`;
      for (let symbol of this.alphabet) {
        const nextState = this.dfaTransitions[this.stateKey(state)][symbol];
        const nextStateStr = `{${nextState}}` || '{}';
        cCc += `  ${stateKey} --${symbol}--> ${nextStateStr}` + '\n';
      }
    }
    cCc += `}` + '\n';
    cCc += `Başlangıç Durumu: {${this.stateKey(this.dfaStates[0])}}` + '\n';
    cCc += `Kabul Durumları: { ${this.dfaAcceptingStates.map(state => `{${state}}`).join(', ')} }` + '\n';
  }

  // Ortaya çıkan DFA'yı göster
  displayDFA() {
    this.displayDFATable();
    cCc += '\n';
    this.displayDFAGraph();
    cCc += '\n';
    this.displayDFAFormal();
    return cCc;
  }
}
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('input, textarea').forEach((element) => {
    element.addEventListener('keydown', (e) => {
        if (e.key === ' ') {
            e.preventDefault();
        }
    });
    element.addEventListener('input', (e) => {
      element.value = element.value.replace(/\s+/g, '');
  });

});

  document.getElementById('nfa_dfa').addEventListener('submit', function(event) {
      event.preventDefault();
         var status = event.target.elements['status'].value,
              alphabet = event.target.elements['alphabet'].value,
              transition = event.target.elements['transition'].value,
              first_status = event.target.elements['first_status'].value,
              accept_status = event.target.elements['accept_status'].value;


              var statusArray = status.split(','),
                  alphabetArray = alphabet.split(','),
                  transitionArray = [],
                  firstStatusArray = first_status.split(','),
                  acceptStatusArray = accept_status.split(',');
              
              transitionArray = processData(transition);
                  
              const nfa = {
                states: statusArray,
                alphabet: alphabetArray,
                transitions: transitionArray,
                initialState: firstStatusArray,
                acceptingStates: acceptStatusArray
                };
                const converter = new NFAtoDFAConverter(nfa);
                document.getElementById("output").innerHTML = (converter.displayDFA());
                cCc = "";
      
  });
});

function processData(data) {
  var inputs = data.split(",");
  var results = {};

  inputs.forEach(function(input) {
      var parts = input.split("->");
      var key = parts[0].split(":")[0];
      var valueKey = parts[0].split(":")[1];
      var value = parts[1];
      
      if (!results.hasOwnProperty(key)) {
          results[key] = {};
      }
      
      if (!results[key].hasOwnProperty(valueKey)) {
          results[key][valueKey] = [];
      }

      results[key][valueKey].push(value);
  });

  return results;
}