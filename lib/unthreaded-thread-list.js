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
        this._onPerspectiveChanged = () => {
            if (unthreaded_state_1.default.enabled()) {
                this._reloadPerspective();
            }
        };
        this._onUnthreadedStateChanged = () => {
            const enabled = unthreaded_state_1.default.enabled();
            const layout = unthreaded_state_1.default.layout();
            if (enabled !== this._lastEnabled) {
                this._lastEnabled = enabled;
                this._lastLayout = layout;
                if (enabled) {
                    this._reloadPerspective();
                }
                else {
                    this._requestId += 1;
                    this._messageRequestId += 1;
                    this._disposeSubscription();
                    this._cancelMessageReload();
                    this._threads = [];
                    this._items = [];
                    this._loading = false;
                    this.trigger();
                }
                return;
            }
            if (enabled && layout !== this._lastLayout) {
                this._lastLayout = layout;
                this._scheduleMessageReload(0);
            }
        };
        this._onDatabaseChanged = change => {
            if (!unthreaded_state_1.default.enabled() || !change || change.objectClass !== 'Message') {
                return;
            }
            const visibleThreadIds = new Set(this._threads.map(thread => thread.id));
            const affectsVisibleThread = (change.objects || []).some(message => visibleThreadIds.has(message.threadId));
            if (affectsVisibleThread) {
                this._scheduleMessageReload();
            }
        };
        this._reloadPerspective = () => {
            this._disposeSubscription();
            this._cancelMessageReload();
            this._requestId += 1;
            this._messageRequestId += 1;
            const requestId = this._requestId;
            const threadSubscription = mailspring_exports_1.FocusedPerspectiveStore.current().threads();
            if (!threadSubscription) {
                this._threads = [];
                this._items = [];
                this._loading = false;
                unthreaded_state_1.default.ensureValidSelection([]);
                this.trigger();
                return;
            }
            this._loading = true;
            this.trigger();
            threadSubscription.replaceRange({ start: 0, end: 200 });
            this._subscription = mailspring_exports_1.Rx.Observable.fromNamedQuerySubscription('unthreaded-visible-threads', threadSubscription).subscribe(resultSet => {
                if (!this._started || !unthreaded_state_1.default.enabled() || requestId !== this._requestId) {
                    return;
                }
                const threads = resultSet.models ? resultSet.models() : [];
                this._threads = threads;
                this._scheduleMessageReload();
            });
        };
        this._items = [];
        this._loading = false;
        this._subscription = null;
        this._requestId = 0;
        this._messageRequestId = 0;
        this._messageReloadTimer = null;
        this._threads = [];
        this._started = false;
        this._lastEnabled = unthreaded_state_1.default.enabled();
        this._lastLayout = unthreaded_state_1.default.layout();
    }
    start() {
        if (this._started) {
            return;
        }
        this._started = true;
        this._lastEnabled = unthreaded_state_1.default.enabled();
        this._lastLayout = unthreaded_state_1.default.layout();
        this.listenTo(mailspring_exports_1.FocusedPerspectiveStore, this._onPerspectiveChanged);
        this.listenTo(mailspring_exports_1.DatabaseStore, this._onDatabaseChanged);
        this.listenTo(unthreaded_state_1.default, this._onUnthreadedStateChanged);
        if (this._lastEnabled) {
            this._reloadPerspective();
        }
    }
    stop() {
        if (!this._started) {
            return;
        }
        this._started = false;
        this._requestId += 1;
        this._messageRequestId += 1;
        this._disposeSubscription();
        this._cancelMessageReload();
        this.stopListeningToAll();
        this._threads = [];
        this._items = [];
        this._loading = false;
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
    _cancelMessageReload() {
        if (this._messageReloadTimer) {
            clearTimeout(this._messageReloadTimer);
            this._messageReloadTimer = null;
        }
    }
    _shouldIncludeMessage(message) {
        if (!message || message.isHidden()) {
            return false;
        }
        const viewingTrash = mailspring_exports_1.FocusedPerspectiveStore.current().categoriesSharedRole() === 'trash';
        if (viewingTrash) {
            return true;
        }
        if (unthreaded_state_1.default.enabled() && unthreaded_state_1.default.isGrouped()) {
            return true;
        }
        const trash = mailspring_exports_1.CategoryStore.getTrashCategory(message.accountId);
        if (!trash) {
            return true;
        }
        return !message.folder || message.folder.id !== trash.id;
    }
    _scheduleMessageReload(delay = 100) {
        this._cancelMessageReload();
        this._messageReloadTimer = setTimeout(() => {
            this._messageReloadTimer = null;
            this._loadMessagesForThreads(this._requestId, this._threads);
        }, delay);
    }
    async _loadMessagesForThreads(requestId, threads) {
        const messageRequestId = ++this._messageRequestId;
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
        try {
            const messages = (await mailspring_exports_1.DatabaseStore.findAll(Message, { threadId: ids }))
                .filter(message => this._shouldIncludeMessage(message))
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(message => ({
                id: message.id,
                message,
                thread: threadMap[message.threadId],
            }))
                .filter(item => !!item.thread);
            if (!this._started ||
                !unthreaded_state_1.default.enabled() ||
                requestId !== this._requestId ||
                messageRequestId !== this._messageRequestId) {
                return;
            }
            this._items = messages;
            this._loading = false;
            unthreaded_state_1.default.ensureValidSelection(messages);
            this.trigger();
        }
        catch (err) {
            if (requestId === this._requestId && messageRequestId === this._messageRequestId) {
                this._loading = false;
                this.trigger();
            }
            console.error('mailspring-unthreaded: Unable to load visible messages', err);
        }
    }
}
exports.visibleMessagesStore = new VisibleMessagesStore();
class UnthreadedThreadList extends mailspring_exports_1.React.Component {
    constructor(props) {
        super(props);
        this._getState = () => ({
            enabled: unthreaded_state_1.default.enabled(),
            layout: unthreaded_state_1.default.layout(),
            items: exports.visibleMessagesStore.items(),
            loading: exports.visibleMessagesStore.loading(),
            selected: unthreaded_state_1.default.selected(),
            expandedThreads: this.state && this.state.expandedThreads ? this.state.expandedThreads : {},
        });
        this._onChange = () => {
            this.setState(this._getState());
        };
        this._onSelect = (item, { expandThread = true } = {}) => {
            unthreaded_state_1.default.setSelected(item);
            if (item && item.thread) {
                if (expandThread && unthreaded_state_1.default.isGrouped()) {
                    this.setState(prevState => ({
                        expandedThreads: Object.assign(Object.assign({}, prevState.expandedThreads), { [item.thread.id]: true }),
                    }));
                }
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
            this._onSelect(leadItem, { expandThread: false });
            if (group.items.length > 1) {
                this._onToggleThread(group.id);
            }
        };
        this.state = this._getState();
    }
    componentDidMount() {
        this._unsubscribers = [
            exports.visibleMessagesStore.listen(this._onChange),
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
    _renderUngroupedList() {
        return this.state.items.map((item, index) => this._renderItem(item, {
            isLast: index === this.state.items.length - 1,
        }));
    }
    _isInTrash(item) {
        if (!item || !item.message) {
            return false;
        }
        const trash = mailspring_exports_1.CategoryStore.getTrashCategory(item.message.accountId);
        if (!trash) {
            return false;
        }
        return !!item.message.folder && item.message.folder.id === trash.id;
    }
    _renderItem(item, { nested = false, isLast = false, onClick = null } = {}) {
        const selectedId = this.state.selected && this.state.selected.message && this.state.selected.message.id;
        const selected = selectedId === item.message.id;
        const inTrash = this._isInTrash(item);
        const from = item.message.from && item.message.from[0];
        const fromName = from ? from.displayName({ compact: true }) : '';
        const subject = item.message.subject || '(No Subject)';
        const date = item.message.date ? new Date(item.message.date).toLocaleString() : '';
        return (mailspring_exports_1.React.createElement("div", { key: item.message.id, className: `unthreaded-row ${nested ? 'nested' : ''} ${isLast ? 'last' : ''} ${selected ? 'selected' : ''} ${item.message.unread ? 'unread' : ''} ${inTrash ? 'in-trash' : ''}`, onClick: event => {
                event.stopPropagation();
                if (onClick) {
                    onClick(item);
                    return;
                }
                this._onSelect(item);
            } },
            mailspring_exports_1.React.createElement("div", { className: "unthreaded-row-top" },
                mailspring_exports_1.React.createElement("div", { className: `unthreaded-from ${inTrash ? 'trashed' : ''}` }, fromName),
                mailspring_exports_1.React.createElement("div", { className: `unthreaded-row-meta ${inTrash ? 'trashed' : ''}` },
                    mailspring_exports_1.React.createElement("div", { className: "unthreaded-date" }, date))),
            mailspring_exports_1.React.createElement("div", { className: `unthreaded-subject ${inTrash ? 'trashed' : ''}` }, subject),
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
        if (!this.state.enabled) {
            return this._renderCore();
        }
        return (mailspring_exports_1.React.createElement("div", { className: "unthreaded-thread-list-wrap" },
            mailspring_exports_1.React.createElement("div", { className: "unthreaded-thread-list-stage" },
                mailspring_exports_1.React.createElement(mailspring_component_kit_1.ScrollRegion, { className: "unthreaded-thread-list" },
                    this.state.loading ? mailspring_exports_1.React.createElement(mailspring_component_kit_1.Spinner, { visible: true }) : null,
                    this.state.layout === 'ungrouped'
                        ? this._renderUngroupedList()
                        : this._groupedItems().map(group => this._renderGroup(group))))));
    }
}
exports.default = UnthreadedThreadList;
UnthreadedThreadList.displayName = 'UnthreadedThreadList';
UnthreadedThreadList.CoreComponent = null;
UnthreadedThreadList.containerStyles = {
    minWidth: 220,
    maxWidth: 3000,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW50aHJlYWRlZC10aHJlYWQtbGlzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy91bnRocmVhZGVkLXRocmVhZC1saXN0LmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJEQUFzSDtBQUN0SCx1RUFBaUU7QUFDakUsd0VBQStDO0FBRS9DLDBFQUFpRDtBQUVqRCxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFFbEQsTUFBTSxvQkFBcUIsU0FBUSwwQkFBZTtJQUNoRDtRQUNFLEtBQUssRUFBRSxDQUFDO1FBb0VWLDBCQUFxQixHQUFHLEdBQUcsRUFBRTtZQUMzQixJQUFJLDBCQUFlLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQzdCLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO2FBQzNCO1FBQ0gsQ0FBQyxDQUFDO1FBRUYsOEJBQXlCLEdBQUcsR0FBRyxFQUFFO1lBQy9CLE1BQU0sT0FBTyxHQUFHLDBCQUFlLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDMUMsTUFBTSxNQUFNLEdBQUcsMEJBQWUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUV4QyxJQUFJLE9BQU8sS0FBSyxJQUFJLENBQUMsWUFBWSxFQUFFO2dCQUNqQyxJQUFJLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQztnQkFDNUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUM7Z0JBQzFCLElBQUksT0FBTyxFQUFFO29CQUNYLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO2lCQUMzQjtxQkFBTTtvQkFDTCxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQztvQkFDckIsSUFBSSxDQUFDLGlCQUFpQixJQUFJLENBQUMsQ0FBQztvQkFDNUIsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7b0JBQzVCLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO29CQUM1QixJQUFJLENBQUMsUUFBUSxHQUFHLEVB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Q0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3JFLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDVixPQUFPLEtBQUssQ0FBQztTQUNkO1FBRUQsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxLQUFLLEtBQUssQ0FBQyxFQUFFLENBQUM7SUFDdEUsQ0FBQztJQUVELFdBQVcsQ0FBQyxJQUFJLEVBQUUsRUFBRSxNQUFNLEdBQUcsS0FBSyxFQUFFLE1BQU0sR0FBRyxLQUFLLEVBQUUsT0FBTyxHQUFHLElBQUksRUFBRSxHQUFHLEVBQUU7UUFDdkUsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDeEcsTUFBTSxRQUFRLEdBQUcsVUFBVSxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1FBQ2hELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNqRSxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sSUFBSSxjQUFjLENBQUM7UUFDdkQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxD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