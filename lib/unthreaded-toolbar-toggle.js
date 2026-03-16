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
            this.setState({ enabled: unthreaded_state_1.default.enabled() });
        };
        this._setEnabled = enabled => {
            unthreaded_state_1.default.setEnabled(enabled);
        };
        this.state = {
            enabled: unthreaded_state_1.default.enabled(),
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
        return (mailspring_exports_1.React.createElement("div", { className: "unthreaded-toolbar-toggle", "data-unthreaded-toolbar-toggle": true },
            mailspring_exports_1.React.createElement("button", { className: `unthreaded-toolbar-chip ${!this.state.enabled ? 'active' : ''}`, onClick: () => this._setEnabled(false), title: "Show threaded conversations" }, "Threaded"),
            mailspring_exports_1.React.createElement("button", { className: `unthreaded-toolbar-chip ${this.state.enabled ? 'active' : ''}`, onClick: () => this._setEnabled(true), title: "Show individual emails" }, "Unthreaded")));
    }
}
exports.default = UnthreadedToolbarToggle;
UnthreadedToolbarToggle.displayName = 'UnthreadedToolbarToggle';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW50aHJlYWRlZC10b29sYmFyLXRvZ2dsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy91bnRocmVhZGVkLXRvb2xiYXItdG9nZ2xlLmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJEQUEyQztBQUUzQywwRUFBaUQ7QUFFakQsTUFBcUIsdUJBQXdCLFNBQVEsMEJBQUssQ0FBQyxTQUFTO0lBR2xFLFlBQVksS0FBSztRQUNmLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQWlCZixjQUFTLEdBQUcsR0FBRyxFQUFFO1lBQ2YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLE9BQU8sRUFBRSwwQkFBZSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN4RCxDQUFDLENBQUM7UUFFRixnQkFBVyxHQUFHLE9BQU8sQ0FBQyxFQUFFO1lBQ3RCLDBCQUFlLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3RDLENBQUMsQ0FBQztRQXRCQSxJQUFJLENBQUMsS0FBSyxHQUFHO1lBQ1gsT0FBTyxFQUFFLDBCQUFlLENBQUMsT0FBTyxFQUFFO1NBQ25DLENBQUM7SUFDSixDQUFDO0lBRUQsaUJBQWlCO1FBQ2YsSUFBSSxDQUFDLFNBQVMsR0FBRywwQkFBZSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVELG9CQUFvQjtRQUNsQixJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDbEIsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ2pCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1NBQ3ZCO0lBQ0gsQ0FBQztJQVVELE1BQU07UUFDSixPQUFPLENBQ0wsa0RBQUssU0FBUyxFQUFDLDJCQUEyQjtZQUN4QyxxREFDRSxTQUFTLEVBQUUsMkJBQTJCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQzNFLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxFQUN0QyxLQUFLLEVBQUMsNkJBQTZCLGVBRzVCO1lBQ1QscURBQ0UsU0FBUyxFQUFFLDJCQUEyQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFDMUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQ3JDLEtBQUssRUFBQyx3QkFBd0IsaUJBR3ZCLENBQ0wsQ0FDUCxDQUFDO0lBQ0osQ0FBQzs7QUFoREgsMENBaURDO0FBaERRLG1DQUFXLEdBQUcseUJBQXlCLENBQUMifQ==