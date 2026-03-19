"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mailspring_exports_1 = require("mailspring-exports");
const mailspring_component_kit_1 = require("mailspring-component-kit");
class UnthreadedMessageTrashButton extends mailspring_exports_1.React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            deleting: false,
        };
        this._trashSingleMessage = async (event) => {
            if (event) {
                event.stopPropagation();
            }
            const { message } = this.props;
            const trash = mailspring_exports_1.CategoryStore.getTrashCategory(message.accountId);
            if (!trash || this._inTrashFolder() || this.state.deleting) {
                return;
            }
            this.setState({ deleting: true });
            try {
                const task = new mailspring_exports_1.ChangeFolderTask({
                    folder: trash,
                    messages: [message],
                    source: 'mailspring-unthreaded: Message Trash Button',
                });
                const baseToJSON = task.toJSON.bind(task);
                task.toJSON = () => {
                    const json = baseToJSON();
                    if (Array.isArray(json.threadIds) && json.threadIds.length === 0) {
                        delete json.threadIds;
                    }
                    if (Array.isArray(json.messageIds) && json.messageIds.length === 0) {
                        delete json.messageIds;
                    }
                    return json;
                };
                mailspring_exports_1.Actions.queueTask(task);
                await mailspring_exports_1.TaskQueue.waitForPerformLocal(task);
                if (AppEnv && AppEnv.mailsyncBridge && AppEnv.mailsyncBridge.sendSyncMailNow) {
                    AppEnv.mailsyncBridge.sendSyncMailNow();
                }
            }
            finally {
                this.setState({ deleting: false });
            }
        };
    }
    _inTrashFolder() {
        const { message } = this.props;
        const trash = mailspring_exports_1.CategoryStore.getTrashCategory(message.accountId);
        if (!trash) {
            return false;
        }
        return !!message.folder && message.folder.id === trash.id;
    }
    render() {
        const inTrash = this._inTrashFolder();
        const { deleting } = this.state;
        return (mailspring_exports_1.React.createElement("button", { className: "btn btn-toolbar unthreaded-message-trash-btn", disabled: inTrash || deleting, onClick: this._trashSingleMessage, onMouseDown: event => event.stopPropagation(), title: inTrash ? 'Message is in Trash / Deleted Items' : 'Move this message to Trash', type: "button" },
            mailspring_exports_1.React.createElement(mailspring_component_kit_1.RetinaImg, { name: "toolbar-trash.png", mode: mailspring_component_kit_1.RetinaImg.Mode.ContentIsMask })));
    }
}
exports.default = UnthreadedMessageTrashButton;
UnthreadedMessageTrashButton.displayName = 'UnthreadedMessageTrashButton';
UnthreadedMessageTrashButton.propTypes = {
    message: mailspring_exports_1.PropTypes.object.isRequired,
};
UnthreadedMessageTrashButton.containerStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    marginLeft: 6,
    marginRight: 6,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW50aHJlYWRlZC1tZXNzYWdlLXRyYXNoLWJ1dHRvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy91bnRocmVhZGVkLW1lc3NhZ2UtdHJhc2gtYnV0dG9uLmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJEQU80QjtBQUM1Qix1RUFBcUQ7QUFFckQsTUFBcUIsNEJBQTZCLFNBQVEsMEJBQUssQ0FBQyxTQUFTO0lBQXpFOztRQWNFLFVBQUssR0FBRztZQUNOLFFBQVEsRUFBRSxLQUFLO1NBQ2hCLENBQUM7UUFZRix3QkFBbUIsR0FBRyxLQUFLLEVBQUMsS0FBSyxFQUFDLEVBQUU7WUFDbEMsSUFBSSxLQUFLLEVBQUU7Z0JBQ1QsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO2FBQ3pCO1lBRUQsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDL0IsTUFBTSxLQUFLLEdBQUcsa0NBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDaEUsSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUU7Z0JBQzFELE9BQU87YUFDUjtZQUVELElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUVsQyxJQUFJO2dCQUNGLE1BQU0sSUFBSSxHQUFHLElBQUkscUNBQWdCLENBQUM7b0JBQ2hDLE1BQU0sRUFBRSxLQUFLO29CQUNiLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQztvQkFDbkIsTUFBTSxFQUFFLDZDQUE2QztpQkFDdEQsQ0FBQyxDQUFDO2dCQUVILE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUMxQyxJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRTtvQkFD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