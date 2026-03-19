"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mailspring_exports_1 = require("mailspring-exports");
const unthreaded_state_1 = __importDefault(require("./unthreaded-state"));
class UnthreadedToolbarToggle extends mailspring_exports_1.React.Component {
    constructor(props) {
        super(props);
        this._onChange = () => {
            this.setState({
                enabled: unthreaded_state_1.default.enabled(),
                layout: unthreaded_state_1.default.layout(),
            });
        };
        this._setEnabled = enabled => {
            unthreaded_state_1.default.setEnabled(enabled);
        };
        this._setLayout = layout => {
            unthreaded_state_1.default.setLayout(layout);
        };
        this.state = {
            enabled: unthreaded_state_1.default.enabled(),
            layout: unthreaded_state_1.default.layout(),
        };
    }
    componentDidMount() {
        this._unlisten = unthreaded_state_1.default.listen(this._onChange);
    }
    componentWillUnmount() {
        if (this._unlisten) {
            this._unlisten();
            this._unlisten = null;
        }
    }
    render() {
        return (mailspring_exports_1.React.createElement("div", { className: "unthreaded-toolbar-stack", "data-unthreaded-toolbar-toggle": true },
            mailspring_exports_1.React.createElement("div", { className: "unthreaded-toolbar-toggle" },
                mailspring_exports_1.React.createElement("button", { className: `unthreaded-toolbar-chip ${!this.state.enabled ? 'active' : ''}`, onClick: () => this._setEnabled(false), title: "Show threaded conversations" }, "Threaded"),
                mailspring_exports_1.React.createElement("button", { className: `unthreaded-toolbar-chip ${this.state.enabled ? 'active' : ''}`, onClick: () => this._setEnabled(true), title: "Show individual emails" }, "Unthreaded")),
            this.state.enabled ? (mailspring_exports_1.React.createElement("div", { className: "unthreaded-subtoggle" },
                mailspring_exports_1.React.createElement("button", { className: `unthreaded-toolbar-chip unthreaded-toolbar-chip-secondary ${this.state.layout === 'grouped' ? 'active' : ''}`, onClick: () => this._setLayout('grouped'), title: "Show messages grouped by thread" }, "Grouped"),
                mailspring_exports_1.React.createElement("button", { className: `unthreaded-toolbar-chip unthreaded-toolbar-chip-secondary ${this.state.layout === 'ungrouped' ? 'active' : ''}`, onClick: () => this._setLayout('ungrouped'), title: "Show every email as a flat list" }, "Ungrouped"))) : null));
    }
}
exports.default = UnthreadedToolbarToggle;
UnthreadedToolbarToggle.displayName = 'UnthreadedToolbarToggle';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW50aHJlYWRlZC10b29sYmFyLXRvZ2dsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy91bnRocmVhZGVkLXRvb2xiYXItdG9nZ2xlLmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJEQUEyQztBQUUzQywwRUFBaUQ7QUFFakQsTUFBcUIsdUJBQXdCLFNBQVEsMEJBQUssQ0FBQyxTQUFTO0lBR2xFLFlBQVksS0FBSztRQUNmLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQWtCZixjQUFTLEdBQUcsR0FBRyxFQUFFO1lBQ2YsSUFBSSxDQUFDLFFBQVEsQ0FBQztnQkFDWixPQUFPLEVBQUUsMEJBQWUsQ0FBQyxPQUFPLEVBQUU7Z0JBQ2xDLE1BQU0sRUFBRSwwQkFBZSxDQUFDLE1BQU0sRUFBRTthQUNqQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUM7UUFFRixnQkFBVyxHQUFHLE9BQU8sQ0FBQyxFQUFFO1lBQ3RCLDBCQUFlLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3RDLENBQUMsQ0FBQztRQUVGLGVBQVUsR0FBRyxNQUFNLENBQUMsRUFBRTtZQUNwQiwwQkFBZSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNwQyxDQUFDLENBQUM7UUE5QkEsSUFBSSxDQUFDLEtBQUssR0FBRztZQUNYLE9BQU8sRUFBRSwwQkFBZSxDQUFDLE9BQU8sRUFBRTtZQUNsQyxNQUFNLEVBQUUsMEJBQWUsQ0FBQyxNQUFNLEVBQUU7U0FDakMsQ0FBQztJQUNKLENBQUM7SUFFRCxpQkFBaUI7UUFDZixJQUFJLENBQUMsU0FBUyxHQUFHLDBCQUFlLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRUQsb0JBQW9CO1FBQ2xCLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNsQixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDakIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7U0FDdkI7SUFDSCxDQUFDO0lBaUJELE1BQU07UUFDSixPQUFPLENBQ0wsa0RBQUssU0FBUyxFQUFDLDBCQUEwQjtZQUN2QyxrREFBSyxTQUFTLEVBQUMsMkJBQTJCO2dCQUN4QyxxREFDRSxTQUFTLEVBQUUsMkJBQTJCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQzNFLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxFQUN0QyxLQUFLLEVBQUMsNkJBQTZCLGVBRzVCO2dCQUNULHFEQUNFLFNBQVMsRUFBRSwyQkFBMkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQzFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUNyQyxLQUFLLEVBQUMsd0JBQXdCLGlCQUd2QixDQUNMO1lBQ0wsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQ3BCLGtEQUFLLFNBQVMsRUFBQyxzQkFBc0I7Z0JBQ25DLHFEQUNFLFNBQVMsRUFBRSw2REFBNkQsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUN6SCxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFDekMsS0FBSyxFQUFDLGlDQUFpQyxjQUdoQztnQkFDVCxxREFDRSxTQUFTLEVBQUUsNkRBQTZELElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFDM0gsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLEVBQzNDLEtBQUssRUFBQyxpQ0FBaUMsZ0JBR2hDLENBQ0wsQ0FDUCxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQ0osQ0FDUCxDQUFDO0lBQ0osQ0FBQzs7QUE1RUgsMENBNkVDO0FBNUVRLG1DQUFXLEdBQUcseUJBQXlCLENBQUMifQ==