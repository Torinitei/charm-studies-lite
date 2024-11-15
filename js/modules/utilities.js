/**
 * Rounds a number to the nearest multiple of 25. Used in experience functions for stylistic purposes.
 * @param {Number} num The number to round.
 * @returns The 25-rounded number.
 */
export function round25(num) {
    return Math.round(num / 25) * 25;
}

/**
 * Takes the nth root of any expression given.
 * @param {Number} n The root index to use.
 * @param {Number} expression The expression to root.
 * @returns The rooted result.
 */
export function nthRoot(n, expression) {
    if (expression < 0 && n % 2 != 1) return NaN; // Not well defined
    return (expression < 0 ? -1 : 1) * Math.pow(Math.abs(expression), 1 / n);
}

/**
 * Converts a number to its Roman Numeral form.
 * @param {Number} num The number to romanise.
 * @returns The roman numeral equivalent.
 */
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

/**
 * Formats a number to its shorthand notation, e.g. 1k, 3.7M, 9.8B.
 * @param {Number} num The number to round.
 * @param {Number} digits The amount of digits to leave after the decimal point. 2 by default.
 * @returns 
 */
export function nFormatter(num, digits = 2) {
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