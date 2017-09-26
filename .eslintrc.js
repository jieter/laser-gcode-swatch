module.exports = {
    "extends": "eslint:recommended",
    "env": {
        "browser": true
    },
    "globals": {
        "L": true,
        "module": true,
        "define": true,
        "require": true,

        "it": true,
        "describe": true,
        "chai": true,

        "Pinpoint": true,
    },
    "parserOptions": {
        "ecmaVersion": 6,
        "sourceType": "module"
    },
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};
