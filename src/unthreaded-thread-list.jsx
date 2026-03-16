import { React, Rx, Utils, Actions, DatabaseStore, FocusedPerspectiveStore } from 'mailspring-exports';
import { Spinner } from 'mailspring-component-kit';
import MailspringStore from 'mailspring-store';

import UnthreadedState from './unthreaded-state';

const { Message } = require('mailspring-exports');

class VisibleMessagesStore extends MailspringStore {
  constructor() {
    super();
    this._items = [];
    this._loading = true;
    this._subscription = null;
    this._requestId = 0;
    this.listenTo(FocusedPerspectiveStore, this._reload);
    this.listenTo(DatabaseStore, this._onDatabaseChanged);
    this._reload();
  }

  items() {
    return this._items;
  }

  loading() {
    return this._loading;
  }

  _disposeSubscription() {
    if (this._subscription) {
      this._subscription.dispose();
      this._subscription = null;
    }
  }

  _onDatabaseChanged = change => {
    if (!change || !['Message', 'Thread'].includes(change.objectClass)) {
      return;
    }
    this._reload();
  };

  _reload = () => {
    this._disposeSubscription();
    this._requestId += 1;
    const requestId = this._requestId;
    const threadSubscription = FocusedPerspectiveStore.current().threads();
    if (!threadSubscription) {
      this._items = [];
      this._loading = false;
      UnthreadedState.ensureValidSelection([]);
      this.trigger();
      return;
    }

    this._loading = true;
    this.trigger();

    threadSubscription.replaceRange({ start: 0, end: 200 });

    this._subscription = Rx.Observable.fromNamedQuerySubscription(
      'unthreaded-visible-threads',
      threadSubscription
    ).subscribe(async resultSet => {
      if (requestId !== this._requestId) {
        return;
      }
      const threads = resultSet.models ? resultSet.models() : [];
      const ids = threads.map(thread => thread.id);
      if (ids.length === 0) {
        this._items = [];
        this._loading = false;
        UnthreadedState.ensureValidSelection([]);
        this.trigger();
        return;
      }

      const threadMap = {};
      threads.forEach(thread => {
        threadMap[thread.id] = thread;
      });

      const messages = (await DatabaseStore.findAll(Message, { threadId: ids }))
        .filter(message => !message.isHidden())
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map(message => ({
          id: message.id,
          message,
          thread: threadMap[message.threadId],
        }))
        .filter(item => !!item.thread);

      if (requestId !== this._requestId) {
        return;
      }

      this._items = messages;
      this._loading = false;
      UnthreadedState.ensureValidSelection(messages);
      this.trigger();
    });
  };
}

const visibleMessagesStore = new VisibleMessagesStore();

export default class UnthreadedThreadList extends React.Component {
  static displayName = 'UnthreadedThreadList';

  static CoreComponent = null;

  static containerStyles = {
    minWidth: 220,
    maxWidth: 3000,
  };

  constructor(props) {
    super(props);
    this.state = this._getState();
  }

  componentDidMount() {
    this._unsubscribers = [
      visibleMessagesStore.listen(this._onChange),
      UnthreadedState.listen(this._onChange),
    ];
  }

  componentWillUnmount() {
    (this._unsubscribers || []).forEach(unsub => unsub());
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !Utils.isEqualReact(nextProps, this.props) || !Utils.isEqualReact(nextState, this.state);
  }

  _getState = () => ({
    enabled: UnthreadedState.enabled(),
    items: visibleMessagesStore.items(),
    loading: visibleMessagesStore.loading(),
    selected: UnthreadedState.selected(),
    expandedThreads: this.state && this.state.expandedThreads ? this.state.expandedThreads : {},
  });

  _onChange = () => {
    this.setState(this._getState());
  };

  _onToggle = () => {
    UnthreadedState.toggleEnabled();
  };

  _onSelect = item => {
    UnthreadedState.setSelected(item);
    if (item && item.thread) {
      this.setState(prevState => ({
        expandedThreads: {
          ...prevState.expandedThreads,
          [item.thread.id]: true,
        },
      }));
      Actions.setFocus({ collection: 'thread', item: item.thread });
    }
  };

  _onToggleThread = threadId => {
    this.setState(prevState => ({
      expandedThreads: {
        ...prevState.expandedThreads,
        [threadId]: !prevState.expandedThreads[threadId],
      },
    }));
  };

  _onGroupHeaderClick = group => {
    const leadItem = group && group.items && group.items[0];
    if (!leadItem) {
      return;
    }

    if (group.items.length > 1) {
      this.setState(prevState => ({
        expandedThreads: {
          ...prevState.expandedThreads,
          [group.id]: true,
        },
      }));
    }

    this._onSelect(leadItem);
  };

  _renderCore() {
    const Core = UnthreadedThreadList.CoreComponent;
    return Core ? <Core {...this.props} /> : <div />;
  }

  _groupedItems() {
    const groups = [];
    const groupsByThreadId = {};

    this.state.items.forEach(item => {
      const threadId = item.thread && item.thread.id;
      if (!threadId) {
        return;
      }

      if (!groupsByThreadId[threadId]) {
        groupsByThreadId[threadId] = {
          id: threadId,
          thread: item.thread,
          items: [],
          latestDate: item.message.date,
        };
        groups.push(groupsByThreadId[threadId]);
      }

      groupsByThreadId[threadId].items.push(item);
      if (new Date(item.message.date).getTime() > new Date(groupsByThreadId[threadId].latestDate).getTime()) {
        groupsByThreadId[threadId].latestDate = item.message.date;
      }
    });

    groups.forEach(group => {
      group.items.sort((a, b) => new Date(a.message.date).getTime() - new Date(b.message.date).getTime());
    });

    groups.sort((a, b) => new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime());

    return groups;
  }

  _renderItem(item, { nested = false, isLast = false, onClick = null } = {}) {
    const selectedId = this.state.selected && this.state.selected.message && this.state.selected.message.id;
    const selected = selectedId === item.message.id;
    const from = item.message.from && item.message.from[0];
    const fromName = from ? from.displayName({ compact: true }) : '';
    const subject = item.message.subject || '(No Subject)';
    const date = item.message.date ? new Date(item.message.date).toLocaleString() : '';

    return (
      <div
        key={item.message.id}
        className={`unthreaded-row ${nested ? 'nested' : ''} ${isLast ? 'last' : ''} ${selected ? 'selected' : ''} ${item.message.unread ? 'unread' : ''}`}
        onClick={event => {
          event.stopPropagation();
          if (onClick) {
            onClick(item);
            return;
          }
          this._onSelect(item);
        }}
      >
        <div className="unthreaded-row-top">
          <div className="unthreaded-from">{fromName}</div>
          <div className="unthreaded-date">{date}</div>
        </div>
        <div className="unthreaded-subject">{subject}</div>
        <div className="unthreaded-snippet">{item.message.snippet || ''}</div>
      </div>
    );
  }

  _renderGroup(group) {
    const selectedId = this.state.selected && this.state.selected.message && this.state.selected.message.id;
    const expandable = group.items.length > 1;
    const expanded = group.items.length <= 1 || !!this.state.expandedThreads[group.id];
    const visibleItems = expanded ? group.items : [group.items[0]];

    return (
      <div key={group.id} className={`unthreaded-group ${expanded ? 'expanded' : ''}`}>
        <div
          className={`unthreaded-group-header ${expandable ? 'clickable' : 'single'}`}
          onClick={() => this._onGroupHeaderClick(group)}
        >
          {expandable ? (
            <div className={`unthreaded-group-caret ${expanded ? 'expanded' : 'collapsed'}`} />
          ) : null}
          <div className="unthreaded-group-body">
            {this._renderItem(group.items[0], {
              isLast: expanded && visibleItems.length === 1,
              onClick: () => this._onGroupHeaderClick(group),
            })}
          </div>
        </div>
        {visibleItems.slice(1).map((item, index) => {
          const nested = true;
          const isLast = index === visibleItems.slice(1).length - 1;
          const row = this._renderItem(item, { nested, isLast });

          return (
            <div
              key={item.message.id}
              className={`unthreaded-tree-row ${selectedId === item.message.id ? 'selected' : ''}`}
            >
              <div className={`unthreaded-tree-rail ${isLast ? 'last' : ''}`}>
                <div className="unthreaded-tree-vertical" />
                <div className="unthreaded-tree-horizontal" />
              </div>
              <div className="unthreaded-tree-content">{row}</div>
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    return (
      <div className="unthreaded-thread-list-wrap">
        <div className="unthreaded-toolbar">
          <button className="btn btn-toolbar" onClick={this._onToggle}>
            {this.state.enabled ? 'Switch to Threaded' : 'Switch to Unthreaded'}
          </button>
        </div>
        <div className="unthreaded-thread-list-stage">
          <div
            className="unthreaded-core-thread-list"
            style={{ visibility: this.state.enabled ? 'hidden' : 'visible' }}
          >
            {this._renderCore()}
          </div>
          <div
            className="unthreaded-thread-list"
            style={{
              opacity: this.state.enabled ? 1 : 0,
              pointerEvents: this.state.enabled ? 'auto' : 'none',
            }}
          >
            {this.state.loading ? <Spinner visible={true} /> : null}
            {this._groupedItems().map(group => this._renderGroup(group))}
          </div>
        </div>
      </div>
    );
  }
}
