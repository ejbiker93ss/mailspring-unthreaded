"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mailspring_exports_1 = require("mailspring-exports");
const unthreaded_message_list_1 = __importDefault(require("./unthreaded-message-list"));
const unthreaded_message_trash_button_1 = __importDefault(require("./unthreaded-message-trash-button"));
const unthreaded_thread_list_1 = __importStar(require("./unthreaded-thread-list"));
const unthreaded_toolbar_toggle_1 = __importDefault(require("./unthreaded-toolbar-toggle"));
// Activate is called when the package is loaded. If your package previously
// saved state using `serialize` it is provided.
//
let CoreThreadList = null;
let CoreMessageList = null;
function activate() {
    unthreaded_thread_list_1.visibleMessagesStore.start();
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
    unthreaded_thread_list_1.visibleMessagesStore.stop();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLDJEQUF1RTtBQUl2RSx3RkFBOEQ7QUFFOUQsd0dBQTZFO0FBRTdFLG1GQUFzRjtBQUV0Riw0RkFBa0U7QUFJbEUsNEVBQTRFO0FBRTVFLGdEQUFnRDtBQUVoRCxFQUFFO0FBRUYsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDO0FBRTFCLElBQUksZUFBZSxHQUFHLElBQUksQ0FBQztBQUkzQixTQUFnQixRQUFRO0lBRXRCLDZDQUFvQixDQUFDLEtBQUssRUFBRSxDQUFDO0lBRTdCLGNBQWMsR0FBRyxzQ0FBaUIsQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUVyRSxlQUFlLEdBQUcsc0NBQWlCLENBQUMsbUJBQW1CLENBQUMsYUFBYSxDQUFDLENBQUM7SUFJdkUsZ0NBQW9CLENBQUMsYUFBYSxHQUFHLGNBQWMsQ0FBQztJQUVwRCxpQ0FBcUIsQ0FBQyxhQUFhLEdBQUcsZUFBZSxDQUFDO0lBSXRELElBQUksY0FBYyxFQUFFO1FBRWxCLHNDQUFpQixDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQztLQUU5QztJQUlELElBQUksZUFBZSxFQUFFO1FBRW5CLHNDQUFpQixDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQztLQUUvQztJQUlELHNDQUFpQixDQUFDLFFBQVEsQ0FBQyxnQ0FBb0IsRUFBRTtRQUUvQyxRQUFRLEVBQUUsbUNBQWMsQ0FBQyxRQUFRLENBQUMsVUFBVTtRQUU1QyxJQUFJLEVBQUUsWUFBWTtRQUVsQixLQUFLLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDO0tBRXpCLENBQUMsQ0FBQztJQUlILHNDQUFpQixDQUFDLFFBQVEsQ0FBQyxpQ0FBcUIsRUFBRTtRQUVoRCxRQUFRLEVBQUUsbUNBQWMsQ0FBQyxRQUFRLENBQUMsV0FBVztLQUU5QyxDQUFDLENBQUM7SUFJSCxzQ0FBaUIsQ0FBQyxRQUFRLENBQUMsbUNBQXVCLEVBQUU7UUFFbEQsUUFBUSxFQUFFLG1DQUFjLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSztRQUVuRCxLQUFLLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDO0tBRXpCLENBQUMsQ0FBQztJQUlILHNDQUFpQixDQUFDLFFBQVEsQ0FBQyx5Q0FBNEIsRUFBRTtRQUV2RCxJQUFJLEVBQUUscUJBQXFCO0tBRTVCLENBQUMsQ0FBQztBQUVMLENBQUM7QUFwRUQsNEJBb0VDO0FBSUQsa0VBQWtFO0FBRWxFLHlFQUF5RTtBQUV6RSwyQkFBMkI7QUFFM0IsRUFBRTtBQUVGLFNBQWdCLFNBQVMsS0FBSSxDQUFDO0FBQTlCLDhCQUE4QjtBQUk5Qix1RUFBdUU7QUFFdkUsd0VBQXdFO0FBRXhFLHdFQUF3RTtBQUV4RSw0Q0FBNEM7QUFFNUMsRUFBRTtBQUVGLFNBQWdCLFVBQVU7SUFFeEIsNkNBQW9CLENBQUMsSUFBSSxFQUFFLENBQUM7SUFFNUIsc0NBQWlCLENBQUMsVUFBVSxDQUFDLGdDQUFvQixDQUFDLENBQUM7SUFFbkQsc0NBQWlCLENBQUMsVUFBVSxDQUFDLGlDQUFxQixDQUFDLENBQUM7SUFFcEQsc0NBQWlCLENBQUMsVUFBVSxDQUFDLHlDQUE0QixDQUFDLENBQUM7SUFFM0Qsc0NBQWlCLENBQUMsVUFBVSxDQUFDLG1DQUF1QixDQUFDLENBQUM7SUFJdEQsSUFBSSxjQUFjLEVBQUU7UUFFbEIsc0NBQWlCLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRTtZQUV6QyxRQUFRLEVBQUUsbUNBQWMsQ0FBQyxRQUFRLENBQUMsVUFBVTtZQUU1QyxJQUFJLEVBQUUsWUFBWTtZQUVsQixLQUFLLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDO1NBRXpCLENBQUMsQ0FBQztLQUVKO0lBSUQsSUFBSSxlQUFlLEVBQUU7UUFFbkIsc0NBQWlCLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFBRTtZQUUxQyxRQUFRLEVBQUUsbUNBQWMsQ0FBQyxRQUFRLENBQUMsV0FBVztTQUU5QyxDQUFDLENBQUM7S0FFSjtJQUlELGNBQWMsR0FBRyxJQUFJLENBQUM7SUFFdEIsZUFBZSxHQUFHLElBQUksQ0FBQztBQUV6QixDQUFDO0FBOUNELGdDQThDQyJ9