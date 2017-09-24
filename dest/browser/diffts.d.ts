declare module DiffTS {
    enum DiffType {
        DELETE = -1,
        EQUAL = 0,
        INSERT = 1,
    }
    interface DiffData {
        type: DiffType;
        data: DiffItem;
    }
    class DiffItem {
        size(): number;
        subItem(start: number, end?: number): DiffItem;
        get(index: number): any;
        getAll(): any;
        indexOf(value: any): number;
    }
    class StringLines extends DiffItem {
        private lines;
        constructor(texts: string | string[]);
        size(): number;
        subItem(start: number, end?: number): StringLines;
        get(index: number): string;
        getAll(): string[];
        indexOf(value: any): number;
    }
    class Diff {
        constructor();
        diff(item1: DiffItem, item2: DiffItem): DiffData[];
        private commonPrefix(item1, item2);
        private commonSuffix(item1, item2);
        private _diff(item1, item2);
        private commonLength(item1, i1, item2, i2);
    }
}
