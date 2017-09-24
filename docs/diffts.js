var DiffTS;
(function (DiffTS) {
    let DiffType;
    (function (DiffType) {
        DiffType[DiffType["DELETE"] = -1] = "DELETE";
        DiffType[DiffType["EQUAL"] = 0] = "EQUAL";
        DiffType[DiffType["INSERT"] = 1] = "INSERT";
    })(DiffType = DiffTS.DiffType || (DiffTS.DiffType = {}));
    class DiffItem {
        size() { return 0; }
        subItem(start, end) { return new DiffItem(); }
        get(index) { return null; }
        getAll() { return null; }
        indexOf(value) { return -1; }
    }
    DiffTS.DiffItem = DiffItem;
    class StringLines extends DiffItem {
        constructor(texts) {
            super();
            if (typeof texts === 'string') {
                this.lines = texts.split(/\r\n|\r|\n/);
            }
            else {
                this.lines = texts;
            }
        }
        size() { return this.lines.length; }
        subItem(start, end) {
            if (end === undefined) {
                end = this.size();
            }
            const lines = [];
            for (; start < end; ++start) {
                lines.push(this.lines[start]);
            }
            return new StringLines(lines);
        }
        get(index) { return this.lines[index]; }
        getAll() { return this.lines; }
        indexOf(value) {
            for (let i = 0; i < this.size(); ++i) {
                if (this.lines[i] === value) {
                    return i;
                }
            }
            return -1;
        }
    }
    DiffTS.StringLines = StringLines;
    class Diff {
        constructor() {
        }
        diff(item1, item2) {
            const diffs = [];
            const commonPrefixLength = this.commonPrefix(item1, item2);
            if (0 < commonPrefixLength) {
                diffs.push({ type: DiffType.EQUAL, data: item1.subItem(0, commonPrefixLength) });
                item1 = item1.subItem(commonPrefixLength);
                item2 = item2.subItem(commonPrefixLength);
            }
            const commonSuffixLength = this.commonSuffix(item1, item2);
            let suffix = null;
            if (0 < commonSuffixLength) {
                suffix = { type: DiffType.EQUAL, data: item1.subItem(item1.size() - commonSuffixLength) };
                item1 = item1.subItem(0, item1.size() - commonSuffixLength);
                item2 = item2.subItem(0, item2.size() - commonSuffixLength);
            }
            const list = this._diff(item1, item2);
            list.forEach((item) => {
                diffs.push(item);
            });
            if (suffix) {
                diffs.push(suffix);
            }
            return diffs;
        }
        commonPrefix(item1, item2) {
            let i = 0;
            const length = Math.min(item1.size(), item2.size());
            for (; i < length; ++i) {
                if (item1.get(i) !== item2.get(i)) {
                    break;
                }
            }
            return i;
        }
        commonSuffix(item1, item2) {
            let i = 0;
            const length = Math.min(item1.size(), item2.size());
            const max1 = item1.size() - 1;
            const max2 = item2.size() - 1;
            for (; i < length; ++i) {
                if (item1.get(max1 - i) !== item2.get(max2 - i)) {
                    break;
                }
            }
            return i;
        }
        _diff(item1, item2) {
            const diff = [];
            if (item1.size() === 0) {
                if (item2.size() == 0) {
                    return [];
                }
                return [{ type: DiffType.INSERT, data: item2 }];
            }
            if (item2.size() === 0) {
                return [{ type: DiffType.DELETE, data: item1 }];
            }
            for (let start = 0; start < item1.size(); ++start) {
                const index = item2.indexOf(item1.get(start));
                if (index < 0) {
                    continue;
                }
                const length = this.commonLength(item1, start, item2, index);
                diff.push({ type: DiffType.DELETE, data: item1.subItem(0, start) });
                diff.push({ type: DiffType.INSERT, data: item2.subItem(0, index) });
                diff.push({ type: DiffType.EQUAL, data: item1.subItem(start, start + length) });
                item1 = item1.subItem(start + length);
                item2 = item2.subItem(index + length);
                start = 0;
            }
            if (0 < item1.size()) {
                diff.push({ type: DiffType.DELETE, data: item1 });
            }
            if (0 < item2.size()) {
                diff.push({ type: DiffType.INSERT, data: item2 });
            }
            return diff;
        }
        commonLength(item1, i1, item2, i2) {
            let count = 0;
            const length = Math.min(item1.size() - i1, item2.size() - i2);
            for (; count < length; ++count) {
                if (item1.get(i1 + count) !== item2.get(i2 + count)) {
                    break;
                }
            }
            return count;
        }
    }
    DiffTS.Diff = Diff;
})(DiffTS || (DiffTS = {}));
