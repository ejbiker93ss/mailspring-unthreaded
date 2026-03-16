import MailspringStore from 'mailspring-store';

class UnthreadedState extends MailspringStore {
  constructor() {
    super();
    this._enabled = this._loadEnabled();
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

  enabled() {
    return this._enabled;
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
