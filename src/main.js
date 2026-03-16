import { ComponentRegistry, WorkspaceStore } from 'mailspring-exports';

import UnthreadedMessageList from './unthreaded-message-list';
import UnthreadedThreadList from './unthreaded-thread-list';

// Activate is called when the package is loaded. If your package previously
// saved state using `serialize` it is provided.
//
let CoreThreadList = null;
let CoreMessageList = null;

export function activate() {
  CoreThreadList = ComponentRegistry.findComponentByName('ThreadList');
  CoreMessageList = ComponentRegistry.findComponentByName('MessageList');

  UnthreadedThreadList.CoreComponent = CoreThreadList;
  UnthreadedMessageList.CoreComponent = CoreMessageList;

  if (CoreThreadList) {
    ComponentRegistry.unregister(CoreThreadList);
  }

  if (CoreMessageList) {
    ComponentRegistry.unregister(CoreMessageList);
  }

  ComponentRegistry.register(UnthreadedThreadList, {
    location: WorkspaceStore.Location.ThreadList,
    role: 'ThreadList',
    modes: ['split', 'list'],
  });

  ComponentRegistry.register(UnthreadedMessageList, {
    location: WorkspaceStore.Location.MessageList,
  });
}

// Serialize is called when your package is about to be unmounted.
// You can return a state object that will be passed back to your package
// when it is re-activated.
//
export function serialize() {}

// This **optional** method is called when the window is shutting down,
// or when your package is being updated or disabled. If your package is
// watching any files, holding external resources, providing commands or
// subscribing to events, release them here.
//
export function deactivate() {
  ComponentRegistry.unregister(UnthreadedThreadList);
  ComponentRegistry.unregister(UnthreadedMessageList);

  if (CoreThreadList) {
    ComponentRegistry.register(CoreThreadList, {
      location: WorkspaceStore.Location.ThreadList,
      role: 'ThreadList',
      modes: ['split', 'list'],
    });
  }

  if (CoreMessageList) {
    ComponentRegistry.register(CoreMessageList, {
      location: WorkspaceStore.Location.MessageList,
    });
  }

  CoreThreadList = null;
  CoreMessageList = null;
}
