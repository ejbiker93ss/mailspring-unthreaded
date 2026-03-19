"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mailspring_exports_1 = require("mailspring-exports");
const unthreaded_message_list_1 = __importDefault(require("./unthreaded-message-list"));
const unthreaded_message_trash_button_1 = __importDefault(require("./unthreaded-message-trash-button"));
const unthreaded_thread_list_1 = __importDefault(require("./unthreaded-thread-list"));
const unthreaded_toolbar_toggle_1 = __importDefault(require("./unthreaded-toolbar-toggle"));
// Activate is called when the package is loaded. If your package previously
// saved state using `serialize` it is provided.
//
let CoreThreadList = null;
let CoreMessageList = null;
function activate() {
    CoreThreadList = mailspring_exports_1.ComponentRegistry.findComponentByName('ThreadList');
    CoreMessageList = mailspring_exports_1.ComponentRegistry.findComponentByName('MessageList');
    unthreaded_thread_list_1.default.CoreComponent = CoreThreadList;
    unthreaded_message_list_1.default.CoreComponent = CoreMessageList;
    if (CoreThreadList) {
        mailspring_exports_1.ComponentRegistry.unregister(CoreThreadList);
    }
    if (CoreMessageList) {
        mailspring_exports_1.ComponentRegistry.unregister(CoreMessageList);
    }
    mailspring_exports_1.ComponentRegistry.register(unthreaded_thread_list_1.default, {
        location: mailspring_exports_1.WorkspaceStore.Location.ThreadList,
        role: 'ThreadList',
        modes: ['split', 'list'],
    });
    mailspring_exports_1.ComponentRegistry.register(unthreaded_message_list_1.default, {
        location: mailspring_exports_1.WorkspaceStore.Location.MessageList,
    });
    mailspring_exports_1.ComponentRegistry.register(unthreaded_toolbar_toggle_1.default, {
        location: mailspring_exports_1.WorkspaceStore.Sheet.Global.Toolbar.Right,
        modes: ['split', 'list'],
    });
    mailspring_exports_1.ComponentRegistry.register(unthreaded_message_trash_button_1.default, {
        role: 'MessageHeaderStatus',
    });
}
exports.activate = activate;
// Serialize is called when your package is about to be unmounted.
// You can return a state object that will be passed back to your package
// when it is re-activated.
//
function serialize() { }
exports.serialize = serialize;
// This **optional** method is called when the window is shutting down,
// or when your package is being updated or disabled. If your package is
// watching any files, holding external resources, providing commands or
// subscribing to events, release them here.
//
function deactivate() {
    mailspring_exports_1.ComponentRegistry.unregister(unthreaded_thread_list_1.default);
    mailspring_exports_1.ComponentRegistry.unregister(unthreaded_message_list_1.default);
    mailspring_exports_1.ComponentRegistry.unregister(unthreaded_message_trash_button_1.default);
    mailspring_exports_1.ComponentRegistry.unregister(unthreaded_toolbar_toggle_1.default);
    if (CoreThreadList) {
        mailspring_exports_1.ComponentRegistry.register(CoreThreadList, {
            location: mailspring_exports_1.WorkspaceStore.Location.ThreadList,
            role: 'ThreadList',
            modes: ['split', 'list'],
        });
    }
    if (CoreMessageList) {
        mailspring_exports_1.ComponentRegistry.register(CoreMessageList, {
            location: mailspring_exports_1.WorkspaceStore.Location.MessageList,
        });
    }
    CoreThreadList = null;
    CoreMessageList = null;
}
exports.deactivate = deactivate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMkRBQXVFO0FBSXZFLHdGQUE4RDtBQUU5RCx3R0FBNkU7QUFFN0Usc0ZBQTREO0FBRTVELDRGQUFrRTtBQUlsRSw0RUFBNEU7QUFFNUUsZ0RBQWdEO0FBRWhELEVBQUU7QUFFRixJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUM7QUFFMUIsSUFBSSxlQUFlLEdBQUcsSUFBSSxDQUFDO0FBSTNCLFNBQWdCLFFBQVE7SUFFdEIsY0FBYyxHQUFHLHNDQUFpQixDQUFDLG1CQUFtQixDQUFDLFlBQVksQ0FBQyxDQUFDO0lBRXJFLGVBQWUsR0FBRyxzQ0FBaUIsQ0FBQyxtQkFBbUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUl2RSxnQ0FBb0IsQ0FBQyxhQUFhLEdBQUcsY0FBYyxDQUFDO0lBRXBELGlDQUFxQixDQUFDLGFBQWEsR0FBRyxlQUFlLENBQUM7SUFJdEQsSUFBSSxjQUFjLEVBQUU7UUFFbEIsc0NBQWlCLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0tBRTlDO0lBSUQsSUFBSSxlQUFlLEVBQUU7UUFFbkIsc0NBQWlCLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0tBRS9DO0lBSUQsc0NBQWlCLENBQUMsUUFBUSxDQUFDLGdDQUFvQixFQUFFO1FBRS9DLFFBQVEsRUFBRSxtQ0FBYyxDQUFDLFFBQVEsQ0FBQyxVQUFVO1FBRTVDLElBQUksRUFBRSxZQUFZO1FBRWxCLEtBQUssRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUM7S0FFekIsQ0FBQyxDQUFDO0lBSUgsc0NBQWlCLENBQUMsUUFBUSxDQUFDLGlDQUFxQixFQUFFO1FBRWhELFFBQVEsRUFBRSxtQ0FBYyxDQUFDLFFBQVEsQ0FBQyxXQUFXO0tBRTlDLENBQUMsQ0FBQztJQUlILHNDQUFpQixDQUFDLFFBQVEsQ0FBQyxtQ0FBdUIsRUFBRTtRQUVsRCxRQUFRLEVBQUUsbUNBQWMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLO1FBRW5ELEtBQUssRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUM7S0FFekIsQ0FBQyxDQUFDO0lBSUgsc0NBQWlCLENBQUMsUUFBUSxDQUFDLHlDQUE0QixFQUFFO1FBRXZELElBQUksRUFBRSxxQkFBcUI7S0FFNUIsQ0FBQyxDQUFDO0FBRUwsQ0FBQztBQWxFRCw0QkFrRUM7QUFJRCxrRUFBa0U7QUFFbEUseUVBQXlFO0FBRXpFLDJCQUEyQjtBQUUzQixFQUFFO0FBRUYsU0FBZ0IsU0FBUyxLQUFJLENBQUM7QUFBOUIsOEJBQThCO0FBSTlCLHVFQUF1RTtBQUV2RSx3RUFBd0U7QUFFeEUsd0VBQXdFO0FBRXhFLDRDQUE0QztBQUU1QyxFQUFFO0FBRUYsU0FBZ0IsVUFBVTtJQUV4QixzQ0FBaUIsQ0FBQyxVQUFVLENBQUMsZ0NBQW9CLENBQUMsQ0FBQztJQUVuRCxzQ0FBaUIsQ0FBQyxVQUFVLENBQUMsaUNBQXFCLENBQUMsQ0FBQztJQUVwRCxzQ0FBaUIsQ0FBQyxVQUFVLENBQUMseUNBQTRCLENBQUMsQ0FBQztJQUUzRCxzQ0FBaUIsQ0FBQyxVQUFVLENBQUMsbUNBQXVCLENBQUMsQ0FBQztJQUl0RCxJQUFJLGNBQWMsRUFBRTtRQUVsQixzQ0FBaUIsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFO1lBRXpDLFFBQVEsRUFBRSxtQ0FBYyxDQUFDLFFBQVEsQ0FBQyxVQUFVO1lBRTVDLElBQUksRUFBRSxZQUFZO1lBRWxCLEtBQUssRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUM7U0FFekIsQ0FBQyxDQUFDO0tBRUo7SUFJRCxJQUFJLGVBQWUsRUFBRTtRQUVuQixzQ0FBaUIsQ0FBQyxRQUFRLENBQUMsZUFBZSxFQUFFO1lBRTFDLFFBQVEsRUFBRSxtQ0FBYyxDQUFDLFFBQVEsQ0FBQyxXQUFXO1NBRTlDLENBQUMsQ0FBQztLQUVKO0lBSUQsY0FBYyxHQUFHLElBQUksQ0FBQztJQUV0QixlQUFlLEdBQUcsSUFBSSxDQUFDO0FBRXpCLENBQUM7QUE1Q0QsZ0NBNENDIn0=