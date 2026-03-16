"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mailspring_exports_1 = require("mailspring-exports");
const mailspring_component_kit_1 = require("mailspring-component-kit");
const mailspring_store_1 = __importDefault(require("mailspring-store"));
const unthreaded_state_1 = __importDefault(require("./unthreaded-state"));
const { Message } = require('mailspring-exports');
class VisibleMessagesStore extends mailspring_store_1.default {
    constructor() {
        super();
        this._onDatabaseChanged = change => {
            if (!change || !['Message', 'Thread'].includes(change.objectClass)) {
                return;
            }
            this._reload();
        };
        this._reload = () => {
            this._disposeSubscription();
            this._requestId += 1;
            const requestId = this._requestId;
            const threadSubscription = mailspring_exports_1.FocusedPerspectiveStore.current().threads();
            if (!threadSubscription) {
                this._items = [];
                this._loading = false;
                unthreaded_state_1.default.ensureValidSelection([]);
                this.trigger();
                return;
            }
            this._loading = true;
            this.trigger();
            threadSubscription.replaceRange({ start: 0, end: 200 });
            this._subscription = mailspring_exports_1.Rx.Observable.fromNamedQuerySubscription('unthreaded-visible-threads', threadSubscription).subscribe(async (resultSet) => {
                if (requestId !== this._requestId) {
                    return;
                }
                const threads = resultSet.models ? resultSet.models() : [];
                const ids = threads.map(thread => thread.id);
                if (ids.length === 0) {
                    this._items = [];
                    this._loading = false;
                    unthreaded_state_1.default.ensureValidSelection([]);
                    this.trigger();
                    return;
                }
                const threadMap = {};
                threads.forEach(thread => {
                    threadMap[thread.id] = thread;
                });
                const messages = (await mailspring_exports_1.DatabaseStore.findAll(Message, { threadId: ids }))
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
                unthreaded_state_1.default.ensureValidSelection(messages);
                this.trigger();
            });
        };
        this._items = [];
        this._loading = true;
        this._subscription = null;
        this._requestId = 0;
        this.listenTo(mailspring_exports_1.FocusedPerspectiveStore, this._reload);
        this.listenTo(mailspring_exports_1.DatabaseStore, this._onDatabaseChanged);
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
}
const visibleMessagesStore = new VisibleMessagesStore();
class UnthreadedThreadList extends mailspring_exports_1.React.Component {
    constructor(props) {
        super(props);
        this._getState = () => ({
            enabled: unthreaded_state_1.default.enabled(),
            items: visibleMessagesStore.items(),
            loading: visibleMessagesStore.loading(),
            selected: unthreaded_state_1.default.selected(),
            expandedThreads: this.state && this.state.expandedThreads ? this.state.expandedThreads : {},
        });
        this._onChange = () => {
            this.setState(this._getState());
        };
        this._onToggle = () => {
            unthreaded_state_1.default.toggleEnabled();
        };
        this._onSelect = item => {
            unthreaded_state_1.default.setSelected(item);
            if (item && item.thread) {
                this.setState(prevState => ({
                    expandedThreads: Object.assign(Object.assign({}, prevState.expandedThreads), { [item.thread.id]: true }),
                }));
                mailspring_exports_1.Actions.setFocus({ collection: 'thread', item: item.thread });
            }
        };
        this._onToggleThread = threadId => {
            this.setState(prevState => ({
                expandedThreads: Object.assign(Object.assign({}, prevState.expandedThreads), { [threadId]: !prevState.expandedThreads[threadId] }),
            }));
        };
        this._onGroupHeaderClick = group => {
            const leadItem = group && group.items && group.items[0];
            if (!leadItem) {
                return;
            }
            if (group.items.length > 1) {
                this.setState(prevState => ({
                    expandedThreads: Object.assign(Object.assign({}, prevState.expandedThreads), { [group.id]: true }),
                }));
            }
            this._onSelect(leadItem);
        };
        this.state = this._getState();
    }
    componentDidMount() {
        this._unsubscribers = [
            visibleMessagesStore.listen(this._onChange),
            unthreaded_state_1.default.listen(this._onChange),
        ];
    }
    componentWillUnmount() {
        (this._unsubscribers || []).forEach(unsub => unsub());
    }
    shouldComponentUpdate(nextProps, nextState) {
        return !mailspring_exports_1.Utils.isEqualReact(nextProps, this.props) || !mailspring_exports_1.Utils.isEqualReact(nextState, this.state);
    }
    _renderCore() {
        const Core = UnthreadedThreadList.CoreComponent;
        return Core ? mailspring_exports_1.React.createElement(Core, Object.assign({}, this.props)) : mailspring_exports_1.React.createElement("div", null);
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
        return (mailspring_exports_1.React.createElement("div", { key: item.message.id, className: `unthreaded-row ${nested ? 'nested' : ''} ${isLast ? 'last' : ''} ${selected ? 'selected' : ''} ${item.message.unread ? 'unread' : ''}`, onClick: event => {
                event.stopPropagation();
                if (onClick) {
                    onClick(item);
                    return;
                }
                this._onSelect(item);
            } },
            mailspring_exports_1.React.createElement("div", { className: "unthreaded-row-top" },
                mailspring_exports_1.React.createElement("div", { className: "unthreaded-from" }, fromName),
                mailspring_exports_1.React.createElement("div", { className: "unthreaded-date" }, date)),
            mailspring_exports_1.React.createElement("div", { className: "unthreaded-subject" }, subject),
            mailspring_exports_1.React.createElement("div", { className: "unthreaded-snippet" }, item.message.snippet || '')));
    }
    _renderGroup(group) {
        const selectedId = this.state.selected && this.state.selected.message && this.state.selected.message.id;
        const expandable = group.items.length > 1;
        const expanded = group.items.length <= 1 || !!this.state.expandedThreads[group.id];
        const visibleItems = expanded ? group.items : [group.items[0]];
        return (mailspring_exports_1.React.createElement("div", { key: group.id, className: `unthreaded-group ${expanded ? 'expanded' : ''}` },
            mailspring_exports_1.React.createElement("div", { className: `unthreaded-group-header ${expandable ? 'clickable' : 'single'}`, onClick: () => this._onGroupHeaderClick(group) },
                expandable ? (mailspring_exports_1.React.createElement("div", { className: `unthreaded-group-caret ${expanded ? 'expanded' : 'collapsed'}` })) : null,
                mailspring_exports_1.React.createElement("div", { className: "unthreaded-group-body" }, this._renderItem(group.items[0], {
                    isLast: expanded && visibleItems.length === 1,
                    onClick: () => this._onGroupHeaderClick(group),
                }))),
            visibleItems.slice(1).map((item, index) => {
                const nested = true;
                const isLast = index === visibleItems.slice(1).length - 1;
                const row = this._renderItem(item, { nested, isLast });
                return (mailspring_exports_1.React.createElement("div", { key: item.message.id, className: `unthreaded-tree-row ${selectedId === item.message.id ? 'selected' : ''}` },
                    mailspring_exports_1.React.createElement("div", { className: `unthreaded-tree-rail ${isLast ? 'last' : ''}` },
                        mailspring_exports_1.React.createElement("div", { className: "unthreaded-tree-vertical" }),
                        mailspring_exports_1.React.createElement("div", { className: "unthreaded-tree-horizontal" })),
                    mailspring_exports_1.React.createElement("div", { className: "unthreaded-tree-content" }, row)));
            })));
    }
    render() {
        return (mailspring_exports_1.React.createElement("div", { className: "unthreaded-thread-list-wrap" },
            mailspring_exports_1.React.createElement("div", { className: "unthreaded-toolbar" },
                mailspring_exports_1.React.createElement("button", { className: "btn btn-toolbar", onClick: this._onToggle }, this.state.enabled ? 'Switch to Threaded' : 'Switch to Unthreaded')),
            mailspring_exports_1.React.createElement("div", { className: "unthreaded-thread-list-stage" },
                mailspring_exports_1.React.createElement("div", { className: "unthreaded-core-thread-list", style: { visibility: this.state.enabled ? 'hidden' : 'visible' } }, this._renderCore()),
                mailspring_exports_1.React.createElement("div", { className: "unthreaded-thread-list", style: {
                        opacity: this.state.enabled ? 1 : 0,
                        pointerEvents: this.state.enabled ? 'auto' : 'none',
                    } },
                    this.state.loading ? mailspring_exports_1.React.createElement(mailspring_component_kit_1.Spinner, { visible: true }) : null,
                    this._groupedItems().map(group => this._renderGroup(group))))));
    }
}
exports.default = UnthreadedThreadList;
UnthreadedThreadList.displayName = 'UnthreadedThreadList';
UnthreadedThreadList.CoreComponent = null;
UnthreadedThreadList.containerStyles = {
    minWidth: 220,
    maxWidth: 3000,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW50aHJlYWRlZC10aHJlYWQtbGlzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy91bnRocmVhZGVkLXRocmVhZC1saXN0LmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJEQUF1RztBQUN2Ryx1RUFBbUQ7QUFDbkQsd0VBQStDO0FBRS9DLDBFQUFpRDtBQUVqRCxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFFbEQsTUFBTSxvQkFBcUIsU0FBUSwwQkFBZTtJQUNoRDtRQUNFLEtBQUssRUFBRSxDQUFDO1FBeUJWLHVCQUFrQixHQUFHLE1BQU0sQ0FBQyxFQUFFO1lBQzVCLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFO2dCQUNsRSxPQUFPO2FBQ1I7WUFDRCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDakIsQ0FBQyxDQUFDO1FBRUYsWUFBTyxHQUFHLEdBQUcsRUFBRTtZQUNiLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1lBQzVCLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxDQUFDO1lBQ3JCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7WUFDbEMsTUFBTSxrQkFBa0IsR0FBRyw0Q0FBdUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUN2RSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7Z0JBQ3ZCLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO2dCQUNqQixJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDdEIsMEJBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDekMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNmLE9BQU87YUFDUjtZQUVELElBQUks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