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
                    .filter(message => this._shouldIncludeMessage(message))
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
        this.listenTo(unthreaded_state_1.default, this._reload);
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
}
const visibleMessagesStore = new VisibleMessagesStore();
class UnthreadedThreadList extends mailspring_exports_1.React.Component {
    constructor(props) {
        super(props);
        this._getState = () => ({
            enabled: unthreaded_state_1.default.enabled(),
            layout: unthreaded_state_1.default.layout(),
            items: visibleMessagesStore.items(),
            loading: visibleMessagesStore.loading(),
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
        return (mailspring_exports_1.React.createElement("div", { className: "unthreaded-thread-list-wrap" },
            mailspring_exports_1.React.createElement("div", { className: "unthreaded-thread-list-stage" },
                mailspring_exports_1.React.createElement("div", { className: "unthreaded-core-thread-list", style: { visibility: this.state.enabled ? 'hidden' : 'visible' } }, this._renderCore()),
                mailspring_exports_1.React.createElement(mailspring_component_kit_1.ScrollRegion, { className: "unthreaded-thread-list", style: {
                        opacity: this.state.enabled ? 1 : 0,
                        pointerEvents: this.state.enabled ? 'auto' : 'none',
                    } },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW50aHJlYWRlZC10aHJlYWQtbGlzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy91bnRocmVhZGVkLXRocmVhZC1saXN0LmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJEQUFzSDtBQUN0SCx1RUFBaUU7QUFDakUsd0VBQStDO0FBRS9DLDBFQUFpRDtBQUVqRCxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFFbEQsTUFBTSxvQkFBcUIsU0FBUSwwQkFBZTtJQUNoRDtRQUNFLEtBQUssRUFBRSxDQUFDO1FBMEJWLHVCQUFrQixHQUFHLE1BQU0sQ0FBQyxFQUFFO1lBQzVCLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFO2dCQUNsRSxPQUFPO2FBQ1I7WUFDRCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDakIsQ0FBQyxDQUFDO1FBd0JGLFlBQU8sR0FBRyxHQUFHLEVBQUU7WUFDYixJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUM1QixJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQztZQUNyQixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1lBQ2xDLE1BQU0sa0JBQWtCLEdBQUcsNENBQXVCLENBQUMsT0FBTyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDdkUsSUFBSSxDQUFDLGtCQUFrQixFQUFFO2dCQUN2QixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztnQkFDakIsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7Z0JBQ3RCLDBCQUFlLENBQUMsb0JBQW9CLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3pDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDZixPQUFPO2FBQ1I7WUFFRCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztZQUNyQixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFZixrQkFBa0IsQ0FBQyxZQUFZLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBRXhELElBQUksQ0FBQyxhQUFhLEdBQUcsdUJBQUUsQ0FBQyxVQUFVLENBQUMsMEJBQTBCLENBQzNELDRCQUE0QixFQUM1QixrQkFBa0IsQ0FDbkIsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFDLFNBQVMsRUFBQyxFQUFFO2dCQUM1QixJQUFJLFNBQVMsS0FBSyxJQUFJLENBQUMsVUFBVSxFQUFFO29CQUNqQyxPQUFPO2lCQUNSO2dCQUNELE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUMzRCxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUM3QyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO29CQUNwQixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztvQkFDakIsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7b0JBQ3RCLDBCQUFlLENBQUMsb0JBQW9CLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3pDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDZixPQUFPO2lCQUNSO2dCQUVELE1BQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQztnQkFDckIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtvQkFDdkIsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUM7Z0JBQ2hDLENBQUMsQ0FBQyxDQUFDO2dCQUVILE1BQU0sUUFBUSxHQUFHLENBQUMsTUFBTSxrQ0FBYSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztxQkFDdkUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxDQUFDO3FCQUN0RCxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO3FCQUN2RSxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUNmLEVBQUUsRUFBRSxPQUFPLENBQUMsRUFBRTtvQkFDZCxPQUFPO29CQUNQLE1BQU0sRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztpQkFDcEMsQ0FBQyxDQUFDO3FCQUNGLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBRWpDLElBQUksU0FBUyxLQUFLLElBQUksQ0FBQyxVQUFVLEVBQUU7b0JBQ2pDLE9BQU87aUJBQ1I7Z0JBRUQsSUFBSSxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUM7Z0JBQ3ZCLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO2dCQUN0QiwwQkFBZSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUMvQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDakIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUM7UUFqSEEsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDakIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDckIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7UUFDMUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDcEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyw0Q0FBdUIsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDckQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQ0FBYSxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxRQUFRLENBQUMsMEJBQWUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUFFRCxLQUFLO1FBQ0gsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3JCLENBQUM7SUFFRCxPQUFPO1FBQ0wsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxvQkFBb0I7UUFDbEIsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ3RCLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDN0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7U0FDM0I7SUFDSCxDQUFDO0lBU0QscUJBQXFCLENBQUMsT0FBTztRQUMzQixJQUFJLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRTtZQUNsQyxPQUFPLEtBQUssQ0FBQztTQUNkO1FBRUQsTUFBTSxZQUFZLEdBQUcsNENBQXVCLENBQUMsT0FBTyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsS0FBSyxPQUFPLENBQUM7UUFDMUYsSUFBSSxZQUFZLEVBQUU7WUFDaEIsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELElBQUksMEJBQWUsQ0FBQyxPQUFPLEVBQUUsSUFBSSwwQkFBZSxDQUFDLFNBQVMsRUFBRSxFQUFFO1lBQzVELE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxNQUFNLEtBQUssR0FBRyxrQ0FBYSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNoRSxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ1YsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxLQUFLLEtBQUssQ0FBQyxFQUFFLENBQUM7SUFDM0QsQ0FBQztDQThERjtBQUVELE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxvQkFBb0IsRUFBRSxDQUFDO0FBRXhELE1BQXFCLG9CQUFxQixTQUFRLDBCQUFLLENBQUMsU0FBUztJQVUvRCxZQUFZLEtBQUs7UUFDZixLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFtQmYsY0FBUyxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDakIsT0FBTyxFQUFFLDBCQUFlLENBQUMsT0FBTyxFQUFFO1lBQ2xDLE1BQU0sRUFBRSwwQkFBZSxDQUFDLE1BQU0sRUFBRTtZQUNoQyxLQUFLLEVBQUUsb0JBQW9CLENBQUMsS0FBSyxFQUFFO1lBQ25DLE9BQU8sRUFBRSxvQkFBb0IsQ0FBQyxPQUFPLEVBQUU7WUFDdkMsUUFBUSxFQUFFLDBCQUFlLENBQUMsUUFBUSxFQUFFO1lBQ3BDLGVBQWUsRUFBRSxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsRUFBRTtTQUM1RixDQUFDLENBQUM7UUFFSCxjQUFTLEdBQUcsR0FBRyxFQUFFO1lBQ2YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztRQUNsQyxDQUFDLENBQUM7UUFFRixjQUFTLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBRSxZQUFZLEdBQUcsSUFBSSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUU7WUFDakQsMEJBQWUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEMsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDdkIsSUFBSSxZQUFZLElBQUksMEJBQWUsQ0FBQyxTQUFTLEVBQUUsRUFBRTtvQkFDL0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBQzFCLGVBQWUsa0NBQ1YsU0FBUyxDQUFDLGVBQWUsS0FDNUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksR0FDdkI7cUJBQ0YsQ0FBQyxDQUFDLENBQUM7aUJBQ0w7Z0JBQ0QsNEJBQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQzthQUMvRDtRQUNILENBQUMsQ0FBQztRQUVGLG9CQUFlLEdBQUcsUUFBUSxDQUFDLEVBQUU7WUFDM0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQzFCLGVBQWUsa0NBQ1YsU0FBUyxDQUFDLGVBQWUsS0FDNUIsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLEdBQ2pEO2FBQ0YsQ0FBQyxDQUFDLENBQUM7UUFDTixDQUFDLENBQUM7UUFFRix3QkFBbUIsR0FBRyxLQUFLLENBQUMsRUFBRTtZQUM1QixNQUFNLFFBQVEsR0FBRyxLQUFLLElBQUksS0FBSyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hELElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2IsT0FBTzthQUNSO1lBRUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUVsRCxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDMUIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDaEM7UUFDSCxDQUFDLENBQUM7UUFsRUEsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDaEMsQ0FBQztJQUVELGlCQUFpQjtRQUNmLElBQUksQ0FBQyxjQUFjLEdBQUc7WUFDcEIsb0JBQW9CLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDM0MsMEJBQWUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztTQUN2QyxDQUFDO0lBQ0osQ0FBQztJQUVELG9CQUFvQjtRQUNsQixDQUFDLElBQUksQ0FBQyxjQUFjLElBQUksRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRUQscUJBQXFCLENBQUMsU0FBUyxFQUFFLFNBQVM7UUFDeEMsT0FBTyxDQUFDLDBCQUFLLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQywwQkFBSyxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2xHLENBQUM7SUFvREQsV0FBVztRQUNULE1BQU0sSUFBSSxHQUFHLG9CQUFvQixDQUFDLGFBQWEsQ0FBQztRQUNoRCxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMseUNBQUMsSUFBSSxvQkFBSyxJQUFJLENBQUMsS0FBSyxFQUFJLENBQUMsQ0FBQyxDQUFDLHFEQUFPLENBQUM7SUFDbkQsQ0FBQztJQUVELGFBQWE7UUFDWCxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDbEIsTUFBTSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7UUFFNUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzlCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7WUFDL0MsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDYixPQUFPO2FBQ1I7WUFFRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQy9CLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxHQUFHO29CQUMzQixFQUFFLEVBQUUsUUFBUTtvQkFDWixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07b0JBQ25CLEtBQUssRUFBRSxFQUFFO29CQUNULFVBQVUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUk7aUJBQzlCLENBQUM7Z0JBQ0YsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2FBQ3pDO1lBRUQsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM1QyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQ3JHLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQzthQUMzRDtRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNyQixLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ3RHLENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUUzRixPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBRUQsb0JBQW9CO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQzFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFO1lBQ3JCLE1BQU0sRUFBRSxLQUFLLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUM7U0FDOUMsQ0FBQyxDQUNILENBQUM7SUFDSixDQUFDO0lBRUQsVUFBVSxDQUFDLElBQUk7UUFDYixJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUMxQixPQUFPLEtBQUssQ0FBQztTQUNkO1FBRUQsTUFBTSxLQUFLLEdBQUcsa0NBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3JFLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDVixPQUFPLEtBQUssQ0FBQztTQUNkO1FBRUQsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxLQUFLLEtBQUssQ0FBQyxFQUFFLENBQUM7SUFDdEUsQ0FBQztJQUVELFdBQVcsQ0FBQyxJQUFJLEVBQUUsRUFBRSxNQUFNLEdBQUcsS0FBSyxFQUFFLE1BQU0sR0FBRyxLQUFLLEVBQUUsT0FBTyxHQUFHLElBQUksRUFBRSxHQUFHLEVBQUU7UUFDdkUsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDeEcsTUFBTSxRQUFRLEdBQUcsVUFBVSxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1FBQ2hELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNqRSxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sSUFBSSxjQUFjLENBQUM7UUFDdkQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUVuRixPQUFPLENBQ0wsa0RBQ0UsR0FBRyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUNwQixTQUFTLEVBQUUsa0JBQWtCLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQy9LLE9BQU8sRUFBRSxLQUFLLENBQUMsRUFBRTtnQkFDZixLQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7Z0JBQ3hCLElBQUksT0FBTyxFQUFFO29CQUNYLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDZCxPQUFPO2lCQUNSO2dCQUNELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkIsQ0FBQztZQUVELGtEQUFLLFNBQVMsRUFBQyxvQkFBb0I7Z0JBQ2pDLGtEQUFLLFNBQVMsRUFBRSxtQkFBbUIsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFHLFFBQVEsQ0FBTztnQkFDL0Usa0RBQUssU0FBUyxFQUFFLHVCQUF1QixPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO29CQUMvRCxrREFBSyxTQUFTLEVBQUMsaUJBQWlCLElBQUUsSUFBSSxDQUFPLENBQ3pDLENBQ0Y7WUFDTixrREFBSyxTQUFTLEVBQUUsc0JBQXNCLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBRyxPQUFPLENBQU87WUFDakYsa0RBQUssU0FBUyxFQUFDLG9CQUFvQixJQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBTyxDQUNsRSxDQUNQLENBQUM7SUFDSixDQUFDO0lBRUQsWUFBWSxDQUFDLEtBQUs7UUFDaEIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDeEcsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQzFDLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ25GLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFL0QsT0FBTyxDQUNMLGtEQUFLLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFLFNBQVMsRUFBRSxvQkFBb0IsUUFBUSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUM3RSxrREFDRSxTQUFTLEVBQUUsMkJBQTJCLFVBQVUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFDM0UsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUM7Z0JBRTdDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FDWixrREFBSyxTQUFTLEVBQUUsMEJBQTBCLFFBQVEsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FBSSxDQUNwRixDQUFDLENBQUMsQ0FBQyxJQUFJO2dCQUNSLGtEQUFLLFNBQVMsRUFBQyx1QkFBdUIsSUFDbkMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFO29CQUNoQyxNQUFNLEVBQUUsUUFBUSxJQUFJLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQztvQkFDN0MsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUM7aUJBQy9DLENBQUMsQ0FDRSxDQUNGO1lBQ0wsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUU7Z0JBQ3pDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQztnQkFDcEIsTUFBTSxNQUFNLEdBQUcsS0FBSyxLQUFLLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztnQkFDMUQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztnQkFFdkQsT0FBTyxDQUNMLGtEQUNFLEdBQUcsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFDcEIsU0FBUyxFQUFFLHVCQUF1QixVQUFVLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO29CQUVwRixrREFBSyxTQUFTLEVBQUUsd0JBQXdCLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7d0JBQzVELGtEQUFLLFNBQVMsRUFBQywwQkFBMEIsR0FBRzt3QkFDNUMsa0RBQUssU0FBUyxFQUFDLDRCQUE0QixHQUFHLENBQzFDO29CQUNOLGtEQUFLLFNBQVMsRUFBQyx5QkFBeUIsSUFBRSxHQUFHLENBQU8sQ0FDaEQsQ0FDUCxDQUFDO1lBQ0osQ0FBQyxDQUFDLENBQ0UsQ0FDUCxDQUFDO0lBQ0osQ0FBQztJQUVELE1BQU07UUFDSixPQUFPLENBQ0wsa0RBQUssU0FBUyxFQUFDLDZCQUE2QjtZQUMxQyxrREFBSyxTQUFTLEVBQUMsOEJBQThCO2dCQUMzQyxrREFDRSxTQUFTLEVBQUMsNkJBQTZCLEVBQ3ZDLEtBQUssRUFBRSxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsSUFFL0QsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUNmO2dCQUNOLHlDQUFDLHVDQUFZLElBQ1gsU0FBUyxFQUFDLHdCQUF3QixFQUNsQyxLQUFLLEVBQUU7d0JBQ0wsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ25DLGFBQWEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNO3FCQUNwRDtvQkFFQSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMseUNBQUMsa0NBQU8sSUFBQyxPQUFPLEVBQUUsSUFBSSxHQUFJLENBQUMsQ0FBQyxDQUFDLElBQUk7b0JBQ3RELElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLFdBQVc7d0JBQ2hDLENBQUMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUU7d0JBQzdCLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUNsRCxDQUNYLENBQ0YsQ0FDUCxDQUFDO0lBQ0osQ0FBQzs7QUFwUEgsdUNBcVBDO0FBcFBRLGdDQUFXLEdBQUcsc0JBQXNCLENBQUM7QUFFckMsa0NBQWEsR0FBRyxJQUFJLENBQUM7QUFFckIsb0NBQWUsR0FBRztJQUN2QixRQUFRLEVBQUUsR0FBRztJQUNiLFFBQVEsRUFBRSxJQUFJO0NBQ2YsQ0FBQyJ9