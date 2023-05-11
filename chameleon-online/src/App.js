import React from 'react';
import Chat from './components/Chat/Chat';
import Join from './components/Join/Join';
import NotFoundPage from './components/NotFoundPage/NotFoundPage';

import { BrowserRouter as Router, Redirect, Route, Switch } from "react-router-dom";

const App = () => {
  return (
    <Router>
        <Switch>
            <Route path="/" exact component={Join} />
            <Route path="/chat" component={Chat} />
            <Route path="/404" component={NotFoundPage} />
            <Redirect to="/404" />
        </Switch>
    </Router>
  );
}

export default App;
