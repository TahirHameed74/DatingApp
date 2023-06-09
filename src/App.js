// import logo from './logo.svg';
// import './App.css';
//
// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }
//
// export default App;

import './App.css';

import {Provider} from "react-redux";
import store from "./store";
import Routing from "./routes";
import {ApolloProvider} from "@apollo/client";
import {client} from "./utils/client";

function App() {

  return (
      <ApolloProvider client={client}>
          <Provider store={store}>
              <Routing/>
          </Provider>
      </ApolloProvider>
  );
}

export default App;
