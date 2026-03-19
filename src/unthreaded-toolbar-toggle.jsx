import { React } from 'mailspring-exports';

import UnthreadedState from './unthreaded-state';

export default class UnthreadedToolbarToggle extends React.Component {
  static displayName = 'UnthreadedToolbarToggle';

  constructor(props) {
    super(props);
    this.state = {
      enabled: UnthreadedState.enabled(),
      layout: UnthreadedState.layout(),
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
    this.setState({
      enabled: UnthreadedState.enabled(),
      layout: UnthreadedState.layout(),
    });
  };

  _setEnabled = enabled => {
    UnthreadedState.setEnabled(enabled);
  };

  _setLayout = layout => {
    UnthreadedState.setLayout(layout);
  };

  render() {
    return (
      <div className="unthreaded-toolbar-stack" data-unthreaded-toolbar-toggle>
        <div className="unthreaded-toolbar-toggle">
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
        {this.state.enabled ? (
          <div className="unthreaded-subtoggle">
            <button
              className={`unthreaded-toolbar-chip unthreaded-toolbar-chip-secondary ${this.state.layout === 'grouped' ? 'active' : ''}`}
              onClick={() => this._setLayout('grouped')}
              title="Show messages grouped by thread"
            >
              Grouped
            </button>
            <button
              className={`unthreaded-toolbar-chip unthreaded-toolbar-chip-secondary ${this.state.layout === 'ungrouped' ? 'active' : ''}`}
              onClick={() => this._setLayout('ungrouped')}
              title="Show every email as a flat list"
            >
              Ungrouped
            </button>
          </div>
        ) : null}
      </div>
    );
  }
}
