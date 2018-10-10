import React, { Component } from 'react';
import axios from 'axios';
import { FlexyFlipCard } from 'flexy-flipcards';
import Tokenizer from 'sentence-tokenizer';
import interleave from 'interleave-array';


import logo from './News_Flya_full_for_light.svg';
import './App.css';
// import '@kennethormandy/react-flipcard/src/Flipcard.css';


const ARTICLE = './article.json';
const TOPICS = ["climate change", "energy", "science", "arts", "travel", "gaming", "pop music","fashion", "history"];

const ENTITIES = './mango.json';

const INTERESTING = [
  { url: 'https://www.bbc.com/mundo/noticias-45771979', title: 'Una obra de Banksy se autodestruye' },
  { url: 'https://www.bbc.com/mundo/vert-fut-45711840', title: 'Cómo se le quita la cafeína al café' },
  { url: 'https://www.bbc.com/mundo/noticias-45707019', title: 'Cómo las baterías de zinc pueden solucionar el problema del almacenamiento de energía' },
  { url: 'https://www.bbc.com/mundo/noticias-45795634', title: 'Las 20 ciudades con más multimillonarios en el mundo' },
  { url: 'https://www.bbc.com/mundo/noticias-45797953', title: 'Por qué el cambio climático también afecta negativamente la salud mental' },
];


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      article: null,
      entities: null,
    };

    // this.showBack = this.showBack.bind(this);
  }

  async componentDidMount() {
    const { data } = await axios.get(ARTICLE);
    console.log(data);
    const entities = await axios.get(ENTITIES);
    console.log(entities.data);
    this.setState({ article: data, entities: entities.data });
  }

  wrapEntities(sentence) {
    let lsentance = sentence.toLowerCase();
    const entities = [... new Set(this.state.entities.results.reduce((acc, r) => [...acc, ...r.surface_form.split(' ')], []))];
    console.log(entities);

    entities.forEach((entity) => {
          const lentitiy = entity.toLowerCase(),
            entityLen = entity.length,
            sentenceEntityLoc = lsentance.indexOf(` ${lentitiy}`);
        if (sentenceEntityLoc >= 0) {
          console.log(sentence, entity, sentenceEntityLoc);
            sentence = sentence.substring(0, sentenceEntityLoc)
                + ` <a href="http://www.wikipedia.com/wiki/${entity}" title="http://www.wikipedia.com/wiki/${entity}">`
                + entity
                + '</a>'
                + sentence.substring(sentenceEntityLoc + entityLen + 1, sentence.length);
        }
        lsentance = sentence.toLowerCase();
    });
    return sentence;
  }

  getSentencesPairs() {
    if (!this.state.article) return [];

    const tokenizerA = new Tokenizer('');
    const tokenizerB = new Tokenizer('');
    tokenizerA.setEntry(this.state.article.engMainText);
    tokenizerB.setEntry(this.state.article.sourceItemMainText);

    const parasA = tokenizerA.getSentences().reduce((acc, segment, i) => (i % 5 ? acc[acc.length - 1].push(` ${segment}`) : acc.push([ segment ])) && acc, []);
    const parasB = tokenizerB.getSentences().reduce((acc, segment, i) => (i % 5 ? acc[acc.length - 1].push(` ${segment}`) : acc.push([ segment ])) && acc, []);

    return interleave(parasA, parasB).map(p => p.join(' '));
  }

  renderParas(paras) {
    return (
      <>
        {
          paras.reduce((acc, segment, i) => (i % 2 ? acc[acc.length - 1].push(` ${segment}`) : acc.push([ segment ])) && acc, []).map(p => this.renderPara(p))
        }
      </>
    );
  }

  renderPara(p) {
    return (
      <FlexyFlipCard
        frontBackgroundColor="white"
        backBackgroundColor="lightyellow"
      >
        <div ref="flipper">
          <p dangerouslySetInnerHTML={{__html: this.wrapEntities(p[0])}}>
          </p>
        </div>
        <div ref="flipper">
          <p>
            { p[1] }
          </p>
        </div>
      </FlexyFlipCard>
    );
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
        </header>
        <nav>
          <fieldset>
            <legend>Topics</legend>
            <select>
              { TOPICS.map(t => (<option>{t}</option>)) }
            </select>
          </fieldset>
          <div>
            <ol>
              <li><a>Article 1</a></li>
              <li><a>Article 2</a></li>
              <li><a>Article 3</a></li>
              <li><a>Article 4</a></li>
              <li><a>Article 5</a></li>
            </ol>
          </div>
        </nav>
        <article>
        <h3>{ this.state.article ? this.state.article.engTitle : null }</h3>

        { this.renderParas(this.getSentencesPairs()) }

        </article>

        <div>
          <fieldset>
          <legend>More of the same topic</legend>
          <ol>
            <li><a>Article 1</a></li>
            <li><a>Article 2</a></li>
            <li><a>Article 3</a></li>
            <li><a>Article 4</a></li>
            <li><a>Article 5</a></li>
          </ol>
          </fieldset>
        </div>

        <div>
          <fieldset>
          <legend>Interesting articles</legend>
          <ol>
            { INTERESTING.map(i => (<li><a href={i.url}>{i.title}</a></li>)) }
          </ol>
          </fieldset>
        </div>

      </div>
    );
  }
}

export default App;
