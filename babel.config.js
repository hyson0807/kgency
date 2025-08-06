module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            ["babel-preset-expo", { jsxImportSource: "nativewind" }],
            "nativewind/babel",
        ],
        plugins: [
            // import.meta를 빈 객체로 변환 (Zustand devtools 호환성)
            function() {
                return {
                    visitor: {
                        MetaProperty(path) {
                            if (path.node.meta.name === 'import' && path.node.property.name === 'meta') {
                                path.replaceWithSourceString('({})');
                            }
                        }
                    }
                };
            }
        ],
    };
};