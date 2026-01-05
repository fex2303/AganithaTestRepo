export default class BaseController {
    constructor() {
        this.__doBind(this);
    }

    __doBind(self, options) {
        options = { ...options };

        const filter = key => {
            const match = pattern => (typeof pattern === "string" ? key === pattern : pattern.test(key));

            if (options.include) {
                return options.include.some(match);
            }

            if (options.exclude) {
                return !options.exclude.some(match);
            }

            return true;
        };

        for (const [object, key] of this.getAllProperties(self.constructor.prototype)) {
            if (key === "constructor" || !filter(key)) {
                continue;
            }

            const descriptor = Reflect.getOwnPropertyDescriptor(object, key);

            if (descriptor && typeof descriptor.value === "function") {
                self[key] = self[key].bind(self);
            }
        }

        return self;
    }

    getAllProperties(object) {
        const props = new Set();

        do {
            for (const key of Reflect.ownKeys(object)) {
                props.add([object, key]);
            }
        } while ((object = Reflect.getPrototypeOf(object)) && object !== Object.prototype);

        return props;
    }
}