"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mailspring_exports_1 = require("mailspring-exports");
const unthreaded_message_list_1 = __importDefault(require("./unthreaded-message-list"));
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
        location: mailspring_exports_1.WorkspaceStore.Sheet.Global.Toolbar.Left,
        modes: ['split', 'list'],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMkRBQXVFO0FBRXZFLHdGQUE4RDtBQUM5RCxzRkFBNEQ7QUFDNUQsNEZBQWtFO0FBRWxFLDRFQUE0RTtBQUM1RSxnREFBZ0Q7QUFDaEQsRUFBRTtBQUNGLElBQUksY0FBYyxHQUFHLElBQUksQ0FBQztBQUMxQixJQUFJLGVBQWUsR0FBRyxJQUFJLENBQUM7QUFFM0IsU0FBZ0IsUUFBUTtJQUN0QixjQUFjLEdBQUcsc0NBQWlCLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDckUsZUFBZSxHQUFHLHNDQUFpQixDQUFDLG1CQUFtQixDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBRXZFLGdDQUFvQixDQUFDLGFBQWEsR0FBRyxjQUFjLENBQUM7SUFDcEQsaUNBQXFCLENBQUMsYUFBYSxHQUFHLGVBQWUsQ0FBQztJQUV0RCxJQUFJLGNBQWMsRUFBRTtRQUNsQixzQ0FBaUIsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUM7S0FDOUM7SUFFRCxJQUFJLGVBQWUsRUFBRTtRQUNuQixzQ0FBaUIsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUM7S0FDL0M7SUFFRCxzQ0FBaUIsQ0FBQyxRQUFRLENBQUMsZ0NBQW9CLEVBQUU7UUFDL0MsUUFBUSxFQUFFLG1DQUFjLENBQUMsUUFBUSxDQUFDLFVBQVU7UUFDNUMsSUFBSSxFQUFFLFlBQVk7UUFDbEIsS0FBSyxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQztLQUN6QixDQUFDLENBQUM7SUFFSCxzQ0FBaUIsQ0FBQyxRQUFRLENBQUMsaUNBQXFCLEVBQUU7UUFDaEQsUUFBUSxFQUFFLG1DQUFjLENBQUMsUUFBUSxDQUFDLFdBQVc7S0FDOUMsQ0FBQyxDQUFDO0lBRUgsc0NBQWlCLENBQUMsUUFBUSxDQUFDLG1DQUF1QixFQUFFO1FBQ2xELFFBQVEsRUFBRSxtQ0FBYyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUk7UUFDbEQsS0FBSyxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQztLQUN6QixDQUFDLENBQUM7QUFDTCxDQUFDO0FBN0JELDRCQTZCQztBQUVELGtFQUFrRTtBQUNsRSx5RUFBeUU7QUFDekUsMkJBQTJCO0FBQzNCLEVBQUU7QUFDRixTQUFnQixTQUFTLEtBQUksQ0FBQztBQUE5Qiw4QkFBOEI7QUFFOUIsdUVBQXVFO0FBQ3ZFLHdFQUF3RTtBQUN4RSx3RUFBd0U7QUFDeEUsNENBQTRDO0FBQzVDLEVBQUU7QUFDRixTQUFnQixVQUFVO0lBQ3hCLHNDQUFpQixDQUFDLFVBQVUsQ0FBQyxnQ0FBb0IsQ0FBQyxDQUFDO0lBQ25ELHNDQUFpQixDQUFDLFVBQVUsQ0FBQyxpQ0FBcUIsQ0FBQyxDQUFDO0lBQ3BELHNDQUFpQixDQUFDLFVBQVUsQ0FBQyxtQ0FBdUIsQ0FBQyxDQUFDO0lBRXRELElBQUksY0FBYyxFQUFFO1FBQ2xCLHNDQUFpQixDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUU7WUFDekMsUUFBUSxFQUFFLG1DQUFjLENBQUMsUUFBUSxDQUFDLFVBQVU7WUFDNUMsSUFBSSxFQUFFLFlBQVk7WUFDbEIsS0FBSyxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQztTQUN6QixDQUFDLENBQUM7S0FDSjtJQUVELElBQUksZUFBZSxFQUFFO1FBQ25CLHNDQUFpQixDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUU7WUFDMUMsUUFBUSxFQUFFLG1DQUFjLENBQUMsUUFBUSxDQUFDLFdBQVc7U0FDOUMsQ0FBQyxDQUFDO0tBQ0o7SUFFRCxjQUFjLEdBQUcsSUFBSSxDQUFDO0lBQ3RCLGVBQWUsR0FBRyxJQUFJLENBQUM7QUFDekIsQ0FBQztBQXJCRCxnQ0FxQkMifQ==