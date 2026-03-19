"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mailspring_store_1 = __importDefault(require("mailspring-store"));
class UnthreadedState extends mailspring_store_1.default {
    constructor() {
        super();
        this.setEnabled = enabled => {
            if (this._enabled === enabled) {
                return;
            }
            this._enabled = enabled;
            try {
                window.localStorage.setItem('mailspring-unthreaded:enabled', String(enabled));
            }
            catch (err) { }
            this.trigger();
        };
        this.toggleEnabled = () => {
            this.setEnabled(!this._enabled);
        };
        this.setLayout = layout => {
            const nextLayout = layout === 'ungrouped' ? 'ungrouped' : 'grouped';
            if (this._layout === nextLayout) {
                return;
            }
            this._layout = nextLayout;
            try {
                window.localStorage.setItem('mailspring-unthreaded:layout', nextLayout);
            }
            catch (err) { }
            this.trigger();
        };
        this.setSelected = selected => {
            const currentId = this._selected && this._selected.message && this._selected.message.id;
            const nextId = selected && selected.message && selected.message.id;
            if (currentId === nextId) {
                return;
            }
            this._selected = selected;
            this.trigger();
        };
        this.ensureValidSelection = items => {
            const selectedId = this._selected && this._selected.message && this._selected.message.id;
            if (selectedId && items.find(item => item.message.id === selectedId)) {
                return;
            }
            this._selected = items[0] || null;
            this.trigger();
        };
        this._enabled = this._loadEnabled();
        this._layout = this._loadLayout();
        this._selected = null;
    }
    _loadEnabled() {
        try {
            const value = window.localStorage.getItem('mailspring-unthreaded:enabled');
            return value === null ? true : value === 'true';
        }
        catch (err) {
            return true;
        }
    }
    _loadLayout() {
        try {
            const value = window.localStorage.getItem('mailspring-unthreaded:layout');
            return value === 'ungrouped' ? 'ungrouped' : 'grouped';
        }
        catch (err) {
            return 'grouped';
        }
    }
    enabled() {
        return this._enabled;
    }
    layout() {
        return this._layout;
    }
    isGrouped() {
        return this._layout !== 'ungrouped';
    }
    selected() {
        return this._selected;
    }
}
exports.default = new UnthreadedState();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW50aHJlYWRlZC1zdGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy91bnRocmVhZGVkLXN0YXRlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsd0VBQStDO0FBRS9DLE1BQU0sZUFBZ0IsU0FBUSwwQkFBZTtJQUMzQztRQUNFLEtBQUssRUFBRSxDQUFDO1FBd0NWLGVBQVUsR0FBRyxPQUFPLENBQUMsRUFBRTtZQUNyQixJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssT0FBTyxFQUFFO2dCQUM3QixPQUFPO2FBQ1I7WUFDRCxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztZQUN4QixJQUFJO2dCQUNGLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLCtCQUErQixFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2FBQy9FO1lBQUMsT0FBTyxHQUFHLEVBQUUsR0FBRTtZQUNoQixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDakIsQ0FBQyxDQUFDO1FBRUYsa0JBQWEsR0FBRyxHQUFHLEVBQUU7WUFDbkIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNsQyxDQUFDLENBQUM7UUFFRixjQUFTLEdBQUcsTUFBTSxDQUFDLEVBQUU7WUFDbkIsTUFBTSxVQUFVLEdBQUcsTUFBTSxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFDcEUsSUFBSSxJQUFJLENBQUMsT0FBTyxLQUFLLFVBQVUsRUFBRTtnQkFDL0IsT0FBTzthQUNSO1lBQ0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUM7WUFDMUIsSUFBSTtnQkFDRixNQUFNLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyw4QkFBOEIsRUFBRSxVQUFVLENBQUMsQ0FBQzthQUN6RTtZQUFDLE9BQU8sR0FBRyxFQUFFLEdBQUU7WUFDaEIsSUFB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