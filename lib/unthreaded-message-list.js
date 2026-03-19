"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mailspring_exports_1 = require("mailspring-exports");
const unthreaded_state_1 = __importDefault(require("./unthreaded-state"));
class UnthreadedMessageList extends mailspring_exports_1.React.Component {
    constructor(props) {
        super(props);
        this._getState = () => ({
            enabled: unthreaded_state_1.default.enabled(),
            layout: unthreaded_state_1.default.layout(),
            selected: unthreaded_state_1.default.selected(),
            threadId: mailspring_exports_1.MessageStore.threadId(),
            itemIds: mailspring_exports_1.MessageStore.itemIds(),
        });
        this._onStateChange = () => {
            this.setState(this._getState());
        };
        this.state = this._getState();
        this._quotedExpandedForMessageId = null;
    }
    componentDidMount() {
        this._unsubscribers = [unthreaded_state_1.default.listen(this._onStateChange), mailspring_exports_1.MessageStore.listen(this._onStateChange)];
        this._syncSelectedMessageView();
    }
    componentDidUpdate(prevProps, prevState) {
        if (!mailspring_exports_1.Utils.isEqualReact(prevState, this.state) || !mailspring_exports_1.Utils.isEqualReact(prevProps, this.props)) {
            this._syncSelectedMessageView();
        }
    }
    componentWillUnmount() {
        this._restoreMessageVisibility();
        (this._unsubscribers || []).forEach(unsub => unsub());
    }
    shouldComponentUpdate(nextProps, nextState) {
        return !mailspring_exports_1.Utils.isEqualReact(nextProps, this.props) || !mailspring_exports_1.Utils.isEqualReact(nextState, this.state);
    }
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
        if (mailspring_exports_1.MessageStore.threadId() !== this.state.selected.thread.id) {
            return;
        }
        if (mailspring_exports_1.MessageStore.hasCollapsedItems()) {
            mailspring_exports_1.Actions.toggleAllMessagesExpanded();
        }
    }
    _scrollSelectedIntoView() {
        if (!this.state.enabled) {
            return;
        }
        const selected = this.state.selected && this.state.selected.message;
        if (!selected || mailspring_exports_1.MessageStore.threadId() !== (this.state.selected.thread || {}).id) {
            return;
        }
        window.requestAnimationFrame(() => {
            const node = mailspring_exports_1.ReactDOM.findDOMNode(this);
            if (!node || !(node instanceof HTMLElement)) {
                return;
            }
            const items = mailspring_exports_1.MessageStore.items() || [];
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
        const node = mailspring_exports_1.ReactDOM.findDOMNode(this);
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
        const node = mailspring_exports_1.ReactDOM.findDOMNode(this);
        if (!node || !(node instanceof HTMLElement)) {
            return;
        }
        if (!this.state.enabled) {
            this._restoreMessageVisibility();
            return;
        }
        const selected = this.state.selected && this.state.selected.message;
        if (!selected || mailspring_exports_1.MessageStore.threadId() !== (this.state.selected.thread || {}).id) {
            return;
        }
        const items = mailspring_exports_1.MessageStore.items() || [];
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
        if (!selected || mailspring_exports_1.MessageStore.threadId() !== (this.state.selected.thread || {}).id) {
            return;
        }
        if (this._quotedExpandedForMessageId === selected.id) {
            return;
        }
        window.requestAnimationFrame(() => {
            const node = mailspring_exports_1.ReactDOM.findDOMNode(this);
            if (!node || !(node instanceof HTMLElement)) {
                return;
            }
            const items = mailspring_exports_1.MessageStore.items() || [];
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
        return Core ? mailspring_exports_1.React.createElement(Core, Object.assign({}, this.props)) : mailspring_exports_1.React.createElement("span", null);
    }
    render() {
        if (!this.state.enabled) {
            return this._renderCore();
        }
        if (!this.state.selected || !this.state.selected.thread) {
            return mailspring_exports_1.React.createElement("div", { className: "unthreaded-message-empty" }, "Select an email");
        }
        return this._renderCore();
    }
}
exports.default = UnthreadedMessageList;
UnthreadedMessageList.displayName = 'UnthreadedMessageList';
UnthreadedMessageList.containerStyles = {
    minWidth: 480,
    maxWidth: 999999,
};
UnthreadedMessageList.CoreComponent = null;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW50aHJlYWRlZC1tZXNzYWdlLWxpc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdW50aHJlYWRlZC1tZXNzYWdlLWxpc3QuanN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMkRBQW1GO0FBRW5GLDBFQUFpRDtBQUVqRCxNQUFxQixxQkFBc0IsU0FBUSwwQkFBSyxDQUFDLFNBQVM7SUFVaEUsWUFBWSxLQUFLO1FBQ2YsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBeUJmLGNBQVMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQ2pCLE9BQU8sRUFBRSwwQkFBZSxDQUFDLE9BQU8sRUFBRTtZQUNsQyxNQUFNLEVBQUUsMEJBQWUsQ0FBQyxNQUFNLEVBQUU7WUFDaEMsUUFBUSxFQUFFLDBCQUFlLENBQUMsUUFBUSxFQUFFO1lBQ3BDLFFBQVEsRUFBRSxpQ0FBWSxDQUFDLFFBQVEsRUFBRTtZQUNqQyxPQUFPLEVBQUUsaUNBQVksQ0FBQyxPQUFPLEVBQUU7U0FDaEMsQ0FBQyxDQUFDO1FBRUgsbUJBQWMsR0FBRyxHQUFHLEVBQUU7WUFDcEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztRQUNsQyxDQUFDLENBQUM7UUFsQ0EsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDOUIsSUFBSSxDQUFDLDJCQUEyQixHQUFHLElBQUksQ0FBQztJQUMxQyxDQUFDO0lBRUQsaUJBQWlCO1FBQ2YsSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLDBCQUFlLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRSxpQ0FBWSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztRQUM5RyxJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztJQUNsQyxDQUFDO0lBRUQsa0JBQWtCLENBQUMsU0FBUyxFQUFFLFNB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