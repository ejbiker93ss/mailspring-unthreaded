import MailspringStore from 'mailspring-store';

class UnthreadedState extends MailspringStore {
  constructor() {
    super();
    this._enabled = this._loadEnabled();
    this._layout = this._loadLayout();
    this._selected = null;
  }

  _loadEnabled() {
    try {
      const value = window.localStorage.getItem('mailspring-unthreaded:enabled');
      return value === null ? true : value === 'true';
    } catch (err) {
      return true;
    }
  }

  _loadLayout() {
    try {
      const value = window.localStorage.getItem('mailspring-unthreaded:layout');
      return value === 'ungrouped' ? 'ungrouped' : 'grouped';
    } catch (err) {
      return 'grouped';
    }
  }

  enabled() {
    return this._enabled;
  }

  layout() {
    return this._layout;
  }

  isGrouped() {
    return this._layout !== 'ungrouped';
  }

  selected() {
    return this._selected;
  }

  setEnabled = enabled => {
    if (this._enabled === enabled) {
      return;
    }
    this._enabled = enabled;
    try {
      window.localStorage.setItem('mailspring-unthreaded:enabled', String(enabled));
    } catch (err) {}
    this.trigger();
  };

  toggleEnabled = () => {
    this.setEnabled(!this._enabled);
  };

  setLayout = layout => {
    const nextLayout = layout === 'ungrouped' ? 'ungrouped' : 'grouped';
    if (this._layout === nextLayout) {
      return;
    }
    this._layout = nextLayout;
    try {
      window.localStorage.setItem('mailspring-unthreaded:layout', nextLayout);
    } catch (err) {}
    this.trigger();
  };

  setSelected = selected => {
    const currentId = this._selected && this._selected.message && this._selected.message.id;
    const nextId = selected && selected.message && selected.message.id;
    if (currentId === nextId) {
      return;
    }
    this._selected = selected;
    this.trigger();
  };

  ensureValidSelection = items => {
    const selectedId = this._selected && this._selected.message && this._selected.message.id;
    if (selectedId && items.find(item => item.message.id === selectedId)) {
      return;
    }
    this._selected = items[0] || null;
    this.trigger();
  };
}

export default new UnthreadedState();
