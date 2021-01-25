const url = "https://script.google.com/macros/s/AKfycbwodl2pprNYh1ICApuq6LSux5ExC62RchbDU5jB2AnqkMhCJJSH/exec";

const saveRank = async (alias, time, mistakes, dificulty) => {
    const res = await fetch(url, {
        method: "post",
        redirect: "follow",
        mode: "no-cors",
        body: JSON.stringify({ type: "set rank", alias, time, mistakes, dificulty })
    })
        .then(_ => _.json())
        .catch(_ => false);
    return res;
};

const getRanks = async () => {
    const res = await fetch(url + "?type=get memory ranks", {
        method: "get",
        redirect: "follow"
    })
        .then(_ => _.json())
        .catch(_ => false);
    return res;
};


const from = n0 => {
    return {
        to: n1 => {
            if (n1 - n0 > 0) {
                return " ".repeat(n1 - n0).split(" ").reduce((r, _, i) => {
                    r.push(n0 + i);
                    return r;
                }, []);
            }
            return " ".repeat(n0 - n1).split(" ").reduce((r, _, i) => {
                r.push(n0 - i);
                return r;
            }, []);
        }
    };
};

const _chars = [
    ...from(48).to(57).map(q => String.fromCharCode(q)),
    ...from(65).to(90).map(q => String.fromCharCode(q)),
];
const _colors = [
    "#000",
    "#a00",
    "#060",
    "#00a",
];
const rnda = a => {
    return a
        .map(q => [q, Math.random()])
        .sort((w, e) => (w[1] == e[1] ? 0 : w[1] > e[1] ? 1 : -1))
        .map(q => q[0]);
};
const rnds = (n, arr) => from(1).to(n).map(_ => rnda(arr)[0]);
const evenCombinations = (from = 2, to = 10) => {
    const serie = [];
    let mults = [];
    for (let i = from; i <= to; i++) {
        serie.push(i);
        mults = [
            ...mults,
            ...` ${i}`
                .repeat(to - from + 1)
                .split(" ")
                .slice(1)
                .map(_ => parseInt(_))
        ];
    }
    let i = 0;
    const result = [];
    while (i < mults.length) {
        const n1 = mults[i];
        const i2 = i % serie.length;
        const n2 = serie[i2];
        i++;
        const num = n1 * n2;
        if (num % 2 === 0 && num >= 6) {
            result.push(num);
            continue;
        }
    }
    return result
        .sort((a, b) => a === b ? 0 : (a > b ? 1 : -1))
        .filter((a, b, c) => b === 0 || a !== c[b - 1]);
};

const maxColsRows = (maxWidth, maxHeight, width = 50, height = 90) => {
    const maxCols = Math.floor(maxWidth / width);
    const maxRows = Math.floor(maxHeight / height);
    return maxCols > maxRows ? maxCols : maxRows;
};


const combinations = (arr1 = [], arr2 = []) => {
    let result = [];
    const join = (item, arr) => arr.map(_ => [item, _]);
    arr1.forEach(item => {
        result = [
            ...result,
            ...join(item, arr2)
        ];
    });
    return result;
};

