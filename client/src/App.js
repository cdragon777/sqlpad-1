import React from 'react'
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch
} from 'react-router-dom'
import message from 'antd/lib/message'
import fetchJson from './utilities/fetch-json.js'
import UsersView from './users/UsersView'
import ConnectionsView from './connections/ConnectionsView.js'
import ConfigurationView from './configuration/ConfigurationView'
import QueriesView from './queries/QueriesView'
import QueryEditorContainer from './queryEditor/QueryEditorContainer.js'
import SignIn from './SignIn.js'
import SignUp from './SignUp.js'
import ForgotPassword from './ForgotPassword.js'
import PasswordReset from './PasswordReset.js'
import PasswordResetRequested from './PasswordResetRequested.js'
import QueryTableOnly from './QueryTableOnly.js'
import QueryChartOnly from './QueryChartOnly.js'
import NotFound from './NotFound.js'
import Authenticated from './Authenticated'

// Configure message notification globally
message.config({
  top: 60,
  duration: 2,
  maxCount: 3
})

class App extends React.Component {
  state = {}

  refreshAppContext = () => {
    return fetchJson('GET', 'api/app').then(json => {
      // Assign config.baseUrl to global
      // It doesn't change and is needed for fetch requests
      // This allows us to simplify the fetch() call
      if (!json.config) {
        return
      }
      window.BASE_URL = json.config.baseUrl
      this.setState({
        config: json.config,
        smtpConfigured: json.smtpConfigured,
        googleAuthConfigured: json.googleAuthConfigured,
        currentUser: json.currentUser,
        passport: json.passport,
        adminRegistrationOpen: json.adminRegistrationOpen,
        version: json.version
      })
    })
  }

  componentDidMount() {
    this.refreshAppContext()
  }

  render() {
    const {
      adminRegistrationOpen,
      config,
      currentUser,
      smtpConfigured,
      passport
    } = this.state

    if (!config) {
      return <div className="flex w-100" />
    }

    return (
      <Router basename={config.baseUrl}>
        <div className="flex w-100">
          <Switch>
            <Route exact path="/" render={() => <Redirect to={'/queries'} />} />
            <Route
              exact
              path="/queries"
              render={props => <Authenticated component={QueriesView} />}
            />
            <Route
              exact
              path="/queries/:queryId"
              render={({ match }) => (
                <Authenticated
                  queryId={match.params.queryId}
                  component={QueryEditorContainer}
                />
              )}
            />
            <Route
              exact
              path="/users"
              render={() => (
                <Authenticated admin={true} component={UsersView} />
              )}
            />
            <Route
              exact
              path="/connections"
              render={() => (
                <Authenticated admin={true} component={ConnectionsView} />
              )}
            />
            <Route
              exact
              path="/config-values"
              render={() => (
                <Authenticated admin={true} component={ConfigurationView} />
              )}
            />
            <Route
              exact
              path="/query-table/:queryId"
              render={({ match }) => (
                <QueryTableOnly
                  config={config}
                  queryId={match.params.queryId}
                />
              )}
            />
            <Route
              exact
              path="/query-chart/:queryId"
              render={({ match }) => (
                <QueryChartOnly
                  config={config}
                  queryId={match.params.queryId}
                />
              )}
            />
            <Route
              exact
              path="/signin"
              render={() => (
                <SignIn
                  config={config}
                  smtpConfigured={smtpConfigured}
                  passport={passport}
                />
              )}
            />
            <Route
              exact
              path="/signup"
              render={() => (
                <SignUp
                  config={config}
                  adminRegistrationOpen={adminRegistrationOpen}
                />
              )}
            />
            <Route
              exact
              path="/forgot-password"
              render={() => <ForgotPassword config={config} />}
            />
            <Route
              exact
              path="/password-reset/:passwordResetId"
              render={({ match }) => (
                <PasswordReset
                  passwordResetId={match.params.passwordResetId}
                  config={config}
                  adminRegistrationOpen={adminRegistrationOpen}
                />
              )}
            />
            <Route
              exact
              path="/password-reset"
              render={() => <PasswordResetRequested />}
            />
            <Route
              render={() => (
                <NotFound config={config} currentUser={currentUser} />
              )}
            />
          </Switch>
        </div>
      </Router>
    )
  }
}

export default App
