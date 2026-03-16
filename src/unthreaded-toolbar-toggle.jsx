import { React } from 'mailspring-exports';

import UnthreadedState from './unthreaded-state';

export default class UnthreadedToolbarToggle extends React.Component {
  static displayName = 'UnthreadedToolbarToggle';

  constructor(props) {
    super(props);
    this.state = {
      enabled: UnthreadedState.enabled(),
    };
  }

  componentDidMount() {
    this._unlisten = UnthreadedState.listen(this._onChange);
  }

  componentWillUnmount() {
    if (this._unlisten) {
      this._unlisten();
      this._unlisten = null;
    }
  }

  _onChange = () => {
    this.setState({ enabled: UnthreadedState.enabled() });
  };

  _setEnabled = enabled => {
    UnthreadedState.setEnabled(enabled);
  };

  render() {
    return (
      <div className="unthreaded-toolbar-toggle" data-unthreaded-toolbar-toggle>
        <button
          className={`unthreaded-toolbar-chip ${!this.state.enabled ? 'active' : ''}`}
          onClick={() => this._setEnabled(false)}
          title="Show threaded conversations"
        >
          Threaded
        </button>
        <button
          className={`unthreaded-toolbar-chip ${this.state.enabled ? 'active' : ''}`}
          onClick={() => this._setEnabled(true)}
          title="Show individual emails"
        >
          Unthreaded
        </button>
      </div>
    );
  }
}
