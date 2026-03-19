import {
  React,
  PropTypes,
  Actions,
  TaskQueue,
  CategoryStore,
  ChangeFolderTask,
} from 'mailspring-exports';
import { RetinaImg } from 'mailspring-component-kit';

export default class UnthreadedMessageTrashButton extends React.Component {
  static displayName = 'UnthreadedMessageTrashButton';

  static propTypes = {
    message: PropTypes.object.isRequired,
  };

  static containerStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    marginLeft: 6,
    marginRight: 6,
  };

  state = {
    deleting: false,
  };

  _inTrashFolder() {
    const { message } = this.props;
    const trash = CategoryStore.getTrashCategory(message.accountId);
    if (!trash) {
      return false;
    }

    return !!message.folder && message.folder.id === trash.id;
  }

  _trashSingleMessage = async event => {
    if (event) {
      event.stopPropagation();
    }

    const { message } = this.props;
    const trash = CategoryStore.getTrashCategory(message.accountId);
    if (!trash || this._inTrashFolder() || this.state.deleting) {
      return;
    }

    this.setState({ deleting: true });

    try {
      const task = new ChangeFolderTask({
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

      Actions.queueTask(task);
      await TaskQueue.waitForPerformLocal(task);
      if (AppEnv && AppEnv.mailsyncBridge && AppEnv.mailsyncBridge.sendSyncMailNow) {
        AppEnv.mailsyncBridge.sendSyncMailNow();
      }
    } finally {
      this.setState({ deleting: false });
    }
  };

  render() {
    const inTrash = this._inTrashFolder();
    const { deleting } = this.state;

    return (
      <button
        className="btn btn-toolbar unthreaded-message-trash-btn"
        disabled={inTrash || deleting}
        onClick={this._trashSingleMessage}
        onMouseDown={event => event.stopPropagation()}
        title={inTrash ? 'Message is in Trash / Deleted Items' : 'Move this message to Trash'}
        type="button"
      >
        <RetinaImg name="toolbar-trash.png" mode={RetinaImg.Mode.ContentIsMask} />
      </button>
    );
  }
}
