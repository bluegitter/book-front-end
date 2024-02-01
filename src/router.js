import React, { useEffect } from 'react';
import { Router, Route, Switch, useHistory } from 'dva/router';
import IndexPage from './routes/IndexPage';

const RedirectToBackend = ({ path }) => {
  const history = useHistory();

  useEffect(() => {
    if (window.location.pathname.startsWith(path)) {
      window.location.href = window.location.href; // 这会触发浏览器重载，发送请求到服务器
    }
  }, [path]);

  return null; // 不渲染任何东西
};

function RouterConfig({ history }) {
  return (
    <Router history={history}>
      <Switch>
        <Route path="/" exact component={IndexPage} />
        <Route path="/count" component={RedirectToBackend} />
        <Route path="/:slug" component={IndexPage} />
      </Switch>
    </Router>
  );
}

export default RouterConfig;
