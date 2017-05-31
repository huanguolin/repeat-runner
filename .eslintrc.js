
module.exports = {
    root: true,
    parser: 'babel-eslint',
    parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module'
    },
    env: {
        browser: true,
        node: true,
        es6: true,
        mocha: true
    },
    extends: 'standard',
    rules: {     
        // My rules, override standard   
        'indent': [ 2, 4 ],
        'semi': [ 2, 'always' ],
        'no-var': 2,
        'no-unused-expressions': 0
    }
};
