import { React, ReactDOM, Utils, Actions, MessageStore } from 'mailspring-exports';

import UnthreadedState from './unthreaded-state';

export default class UnthreadedMessageList extends React.Component {
  static displayName = 'UnthreadedMessageList';

  static containerStyles = {
    minWidth: 480,
    maxWidth: 999999,
  };

  static CoreComponent = null;

  constructor(props) {
    super(props);
    this.state = this._getState();
    this._quotedExpandedForMessageId = null;
  }

  componentDidMount() {
    this._unsubscribers = [UnthreadedState.listen(this._onStateChange), MessageStore.listen(this._onStateChange)];
    this._syncSelectedMessageView();
  }

  componentDidUpdate(prevProps, prevState) {
    if (!Utils.isEqualReact(prevState, this.state) || !Utils.isEqualReact(prevProps, this.props)) {
      this._syncSelectedMessageView();
    }
  }

  componentWillUnmount() {
    this._restoreMessageVisibility();
    (this._unsubscribers || []).forEach(unsub => unsub());
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !Utils.isEqualReact(nextProps, this.props) || !Utils.isEqualReact(nextState, this.state);
  }

  _getState = () => ({
    enabled: UnthreadedState.enabled(),
    layout: UnthreadedState.layout(),
    selected: UnthreadedState.selected(),
    threadId: MessageStore.threadId(),
    itemIds: MessageStore.itemIds(),
  });

  _onStateChange = () => {
    this.setState(this._getState());
  };

  _syncSelectedMessageView() {
    this._ensureExpanded();
    window.requestAnimationFrame(() => {
      this._applySingleMessageView();
      this._scrollSelectedIntoView();
      this._expandSelectedQuotedText();

      window.requestAnimationFrame(() => {
        this._applySingleMessageView();
      });
    });
  }

  _ensureExpanded() {
    if (!this.state.enabled) {
      return;
    }

    if (!this.state.selected || !this.state.selected.thread) {
      return;
    }

    if (MessageStore.threadId() !== this.state.selected.thread.id) {
      return;
    }

    if (MessageStore.hasCollapsedItems()) {
      Actions.toggleAllMessagesExpanded();
    }
  }

  _scrollSelectedIntoView() {
    if (!this.state.enabled) {
      return;
    }

    const selected = this.state.selected && this.state.selected.message;
    if (!selected || MessageStore.threadId() !== (this.state.selected.thread || {}).id) {
      return;
    }

    window.requestAnimationFrame(() => {
      const node = ReactDOM.findDOMNode(this);
      if (!node || !(node instanceof HTMLElement)) {
        return;
      }

      const items = MessageStore.items() || [];
      const visibleIndex = items.findIndex(message => message.id === selected.id);
      if (visibleIndex === -1) {
        return;
      }

      const renderedItems = node.querySelectorAll('.message-item-wrap');
      const target = renderedItems[visibleIndex];
      if (!target || !(target instanceof HTMLElement)) {
        return;
      }

      target.scrollIntoView({ block: 'center', inline: 'nearest' });
    });
  }

  _restoreMessageVisibility() {
    const node = ReactDOM.findDOMNode(this);
    if (!node || !(node instanceof HTMLElement)) {
      return;
    }

    node.querySelectorAll('.message-item-wrap').forEach(item => {
      item.style.display = '';
    });

    node.querySelectorAll('.footer-reply-area-wrap').forEach(item => {
      item.style.display = '';
    });
  }

  _applySingleMessageView() {
    const node = ReactDOM.findDOMNode(this);
    if (!node || !(node instanceof HTMLElement)) {
      return;
    }

    if (!this.state.enabled) {
      this._restoreMessageVisibility();
      return;
    }

    const selected = this.state.selected && this.state.selected.message;
    if (!selected || MessageStore.threadId() !== (this.state.selected.thread || {}).id) {
      return;
    }

    const items = MessageStore.items() || [];
    const visibleIndex = items.findIndex(message => message.id === selected.id);
    if (visibleIndex === -1) {
      return;
    }

    const renderedItems = node.querySelectorAll('.message-item-wrap');
    renderedItems.forEach((item, index) => {
      item.style.display = index === visibleIndex ? '' : 'none';
    });

    node.querySelectorAll('.footer-reply-area-wrap').forEach(item => {
      item.style.display = 'none';
    });
  }

  _expandSelectedQuotedText() {
    if (!this.state.enabled) {
      this._quotedExpandedForMessageId = null;
      return;
    }

    const selected = this.state.selected && this.state.selected.message;
    if (!selected || MessageStore.threadId() !== (this.state.selected.thread || {}).id) {
      return;
    }

    if (this._quotedExpandedForMessageId === selected.id) {
      return;
    }

    window.requestAnimationFrame(() => {
      const node = ReactDOM.findDOMNode(this);
      if (!node || !(node instanceof HTMLElement)) {
        return;
      }

      const items = MessageStore.items() || [];
      const visibleIndex = items.findIndex(message => message.id === selected.id);
      if (visibleIndex === -1) {
        return;
      }

      const renderedItems = node.querySelectorAll('.message-item-wrap');
      const target = renderedItems[visibleIndex];
      if (!target || !(target instanceof HTMLElement)) {
        return;
      }

      const quotedToggle = target.querySelector('.quoted-text-control');
      if (quotedToggle && typeof quotedToggle.click === 'function') {
        quotedToggle.click();
      }

      this._quotedExpandedForMessageId = selected.id;
    });
  }

  _renderCore() {
    const Core = UnthreadedMessageList.CoreComponent;
    return Core ? <Core {...this.props} /> : <span />;
  }

  render() {
    if (!this.state.enabled) {
      return this._renderCore();
    }

    if (!this.state.selected || !this.state.selected.thread) {
      return <div className="unthreaded-message-empty">Select an email</div>;
    }

    return this._renderCore();
  }
}
