import React, { Component } from 'react';
import './App.css';
import Header from './components/Header';
import Posts from './components/Posts';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from "react-apollo";
import registerServiceWorker from './registerServiceWorker';
// import pusher module
import Pusher from 'pusher-js';

const client = new ApolloClient({
    uri : "ancient-gorge-15218.herokuapp.com"
});

registerServiceWorker();

class App extends Component {
  constructor(){
    super();
    // connect to pusher
    this.pusher = new Pusher("58a73227ab27a1a98328", {
     cluster: 'ap2',
     encrypted: true
    });
  }

  componentDidMount(){
    Notification.requestPermission();
  }

  render() {
    return (
      <ApolloProvider client={client}>
        <div className="App">
          <Header />
          <section className="App-main">
              <Posts  pusher={this.pusher} apollo_client={client} />
          </section>
        </div>
      </ApolloProvider>
    );
  }
}
export default App;
