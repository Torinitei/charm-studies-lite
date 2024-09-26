export function round25(num) {
    return Math.round(num / 25) * 25;
}

export function nthRoot(n, expression) {
    if (expression < 0 && n % 2 != 1) return NaN; // Not well defined
    return (expression < 0 ? -1 : 1) * Math.pow(Math.abs(expression), 1 / n);
}

export function romanize(num) {
    if (isNaN(num))
        return NaN;
    if (num == 0)
        return "-";
    let digits = String(+num).split(""),
        key = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM",
            "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC",
            "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"
        ],
        roman = "",
        i = 3;
    while (i--)
        roman = (key[+digits.pop() + (i * 10)] || "") + roman;
    return Array(+digits.join("") + 1).join("M") + roman;
}

export function nFormatter(num, digits = 1) {
    const lookup = [{
            value: 1,
            symbol: ""
        },
        {
            value: 1e3,
            symbol: "k"
        },
        {
            value: 1e6,
            symbol: "M"
        },
        {
            value: 1e9,
            symbol: "B"
        },
        {
            value: 1e12,
            symbol: "T"
        },
        {
            value: 1e15,
            symbol: "Qd"
        },
    ];
    const regexp = /\.0+$|(?<=\.[0-9]*[1-9])0+$/;
    const item = lookup.findLast(item => num >= item.value);
    return item ? (num / item.value).toFixed(digits).replace(regexp, "").concat(item.symbol) : "0";
}