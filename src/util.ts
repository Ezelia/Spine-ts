module spine {
    export function binarySearch (values, target, step) {
        var low = 0;
        var high = Math.floor(values.length / step) - 2;
        if (high == 0) return step;
        var current = high >>> 1;
        while (true) {
            if (values[(current + 1) * step] <= target)
                low = current + 1;
            else
                high = current;
            if (low == high) return (low + 1) * step;
            current = (low + high) >>> 1;
        }
    };
    export function linearSearch (values, target, step) {
        for (var i = 0, last = values.length - step; i <= last; i += step)
            if (values[i] > target) return i;
        return -1;
    };
}