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
    enabled() {
        return this._enabled;
    }
    selected() {
        return this._selected;
    }
}
exports.default = new UnthreadedState();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW50aHJlYWRlZC1zdGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy91bnRocmVhZGVkLXN0YXRlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsd0VBQStDO0FBRS9DLE1BQU0sZUFBZ0IsU0FBUSwwQkFBZTtJQUMzQztRQUNFLEtBQUssRUFBRSxDQUFDO1FBc0JWLGVBQVUsR0FBRyxPQUFPLENBQUMsRUFBRTtZQUNyQixJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssT0FBTyxFQUFFO2dCQUM3QixPQUFPO2FBQ1I7WUFDRCxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztZQUN4QixJQUFJO2dCQUNGLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLCtCQUErQixFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2FBQy9FO1lBQUMsT0FBTyxHQUFHLEVBQUUsR0FBRTtZQUNoQixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDakIsQ0FBQyxDQUFDO1FBRUYsa0JBQWEsR0FBRyxHQUFHLEVBQUU7WUFDbkIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNsQyxDQUFDLENBQUM7UUFFRixnQkFBVyxHQUFHLFFBQVEsQ0FBQyxFQUFFO1lBQ3ZCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ3hGLE1BQU0sTUFBTSxHQUFHLFFBQVEsSUFBSSxRQUFRLENBQUMsT0FBTyxJQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ25FLElBQUksU0FBUyxLQUFLLE1BQU0sRUFBRTtnQkFDeEIsT0FBTzthQUNSO1lBQ0QsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7WUFDMUIsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUMsQ0FBQztRQUVGLHlCQUFvQixHQUFHLEtBQUssQ0FBQyxFQUFFO1lBQzdCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ3pGLElBQUksVUFBVSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsS0FBSyxVQUFVLENBQUMsRUFBRTtnQkFDcEUsT0FBTzthQUNSO1lBQ0QsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDO1lBQ2xDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNqQixDQUFDLENBQUM7UUFyREEsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDcEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7SUFDeEIsQ0FBQztJQUVELFlBQVk7UUFDVixJQUFJO1lBQ0YsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsK0JBQStCLENBQUMsQ0FBQztZQUMzRSxPQUFPLEtBQUssS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLE1BQU0sQ0FBQztTQUNqRDtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ1osT0FBTyxJQUFJLENBQUM7U0FDYjtJQUNILENBQUM7SUFFRCxPQUFPO1FBQ0wsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxRQUFRO1FBQ04sT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQ3hCLENBQUM7Q0FtQ0Y7QUFFRCxrQkFBZSxJQUFJLGVBQWUsRUFBRSxDQUFDIn0=