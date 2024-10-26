// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import LandingPage from './components/LandingPage';
import DebuggingPage from './components/DebuggingPage';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage'; // Importă DashboardPage

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route exact path="/" component={LandingPage} />
          <Route path="/debugging" component={DebuggingPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/dashboard" component={DashboardPage} /> {/* Ruta pentru Dashboard */}
        </Switch>
      </div>
    </Router>
  );
}

export default App;
